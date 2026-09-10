import { Inject, Injectable, Logger } from '@nestjs/common';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { ISalpyeoFacilityRepository, SALPYEO_FACILITY_REPOSITORY } from '@/salpyeo/facility/domain/repository/salpyeo-facility.repository.interface';
import { SalpyeoFacilityImage } from '@/salpyeo/facility/domain/entity/salpyeo-facility.entity';
import { fetchExternalImage, isOurBucketUrl, salpyeoImageKeyPath } from '@/salpyeo/facility/infrastructure/service/salpyeo-image-fetch';
import { SalpyeoFacilityNotFound, SalpyeoRehostAlreadyRunning } from '@/salpyeo/facility/domain/exception/salpyeo-facility.exception';

export interface SalpyeoRehostResult {
  /** 이번 호출에서 처리한 시설 수 */
  facilities: number;
  /** 우리 S3 로 옮긴 사진 수 */
  moved: number;
  /** 내려받지 못해 원래 URL 로 남긴 사진 수 */
  failed: number;
  /** 아직 외부 URL 사진이 남은 시설 수 (이번 처리 후 기준) */
  remaining: number;
}

/**
 * 한 번의 요청에서 처리할 최대 시설 수.
 * 운영 컨테이너가 `--cpus=0.8 --memory=768m` 에 네 서비스(artinfo·온기·아재요·온처치)를 함께 돌리므로
 * 요청이 길어지거나 버퍼가 쌓이지 않도록 작게 끊는다. 한 시설에 사진이 20장 넘는 곳도 있다.
 */
export const SALPYEO_REHOST_MAX_LIMIT = 5;
export const SALPYEO_REHOST_DEFAULT_LIMIT = 2;

/** 사진 한 장을 옮긴 뒤 쉬는 시간 — 0.8 코어를 독점하지 않도록 (다른 서비스 응답 지연 방지) */
const PAUSE_BETWEEN_IMAGES_MS = 150;

/**
 * 조리원 홈페이지에 있는 시설 사진을 우리 S3 로 옮긴다 — **운영 서버에서 실행**하는 판.
 *
 * 같은 일을 하는 `scripts/rehost-facility-images.ts` 는 로컬에서 운영 DB·S3 자격증명을 들고 돌려야 하는데,
 * 운영 서버는 이미 둘 다 갖고 있으므로 관리자 화면에서 눌러 조금씩 진행할 수 있게 했다.
 *
 * - 한 번에 limit 개 시설만 처리하고 남은 수를 돌려준다 → 화면이 0 이 될 때까지 반복 호출
 * - slug 를 주면 그 시설만 처리한다 (내려받기에 실패했던 시설을 다시 시도할 때)
 * - 몇 번을 다시 호출해도 안전하다 (이미 우리 버킷인 사진은 건너뛴다)
 * - **동시에 두 번 돌지 않는다** — 관리자가 탭을 두 개 열어도 한 번에 하나만 (컨테이너 자원이 빠듯하다)
 * - **내려받지 못한 사진은 원래 URL 그대로 남긴다** — 지우면 복구할 방법이 없다
 */
@Injectable()
export class SalpyeoAdminRehostImagesUseCase {
  private readonly logger = new Logger(SalpyeoAdminRehostImagesUseCase.name);

  /** 이 컨테이너에서 이미 이전이 돌고 있는지 */
  private running = false;

  constructor(
    @Inject(SALPYEO_FACILITY_REPOSITORY)
    private readonly facilityRepository: ISalpyeoFacilityRepository,

    private readonly awsS3Service: AwsS3Service,
  ) {}

  async execute(limit = SALPYEO_REHOST_DEFAULT_LIMIT, slug?: string): Promise<SalpyeoRehostResult> {
    // 관리자가 탭을 두 개 열어도 한 번에 하나만 — 컨테이너 자원이 빠듯하다
    if (this.running) throw new SalpyeoRehostAlreadyRunning();
    this.running = true;

    try {
      return await this.rehost(limit, slug);
    } finally {
      this.running = false;
    }
  }

  private async rehost(limit: number, slug?: string): Promise<SalpyeoRehostResult> {
    const targets = slug
      ? await this.findOne(slug)
      : await this.facilityRepository.findWithExternalImages(Math.min(Math.max(1, limit), SALPYEO_REHOST_MAX_LIMIT));

    let moved = 0;
    let failed = 0;

    for (const facility of targets) {
      const next: SalpyeoFacilityImage[] = [];

      for (const [index, image] of (facility.images ?? []).entries()) {
        if (isOurBucketUrl(image.url)) {
          next.push(image);
          continue;
        }

        const file = await fetchExternalImage(image.url);
        if (!file) {
          this.logger.warn(`사진을 내려받지 못했습니다 — ${facility.slug} #${index} ${image.url}`);
          next.push(image);
          failed += 1;
          continue;
        }

        const uploaded = await this.awsS3Service.uploadStream(file.buffer, file.mimetype, salpyeoImageKeyPath(facility.slug, index, file.mimetype));
        if (!uploaded) {
          next.push(image);
          failed += 1;
          continue;
        }

        next.push({ ...image, url: uploaded.location });
        moved += 1;

        // 다른 서비스가 같은 컨테이너를 쓰므로 한 장마다 잠깐 양보한다
        await new Promise(resolve => setTimeout(resolve, PAUSE_BETWEEN_IMAGES_MS));
      }

      await this.facilityRepository.update(facility.slug, { images: next });
    }

    const remaining = await this.facilityRepository.countWithExternalImages();
    this.logger.log(`사진 이전: 시설 ${targets.length}곳 · 이동 ${moved}장 · 실패 ${failed}장 · 남은 시설 ${remaining}곳`);

    return { facilities: targets.length, moved, failed, remaining };
  }

  private async findOne(slug: string) {
    const facility = await this.facilityRepository.findBySlugForAdmin(slug);
    if (!facility) throw new SalpyeoFacilityNotFound();

    return [facility];
  }
}
