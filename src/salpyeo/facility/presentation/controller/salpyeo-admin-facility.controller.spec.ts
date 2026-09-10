import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ResponseInterceptor } from '@/common/interceptor/interceptor';
import { HttpExceptionFilter } from '@/common/exception/http-exception-filter';
import { JwtStrategy } from '@/common/security/jwt.strategy';
import { SalpyeoAdminGuard } from '@/salpyeo/common/salpyeo-admin.guard';
import { SALPYEO_SNS_TYPE, SALPYEO_USER_ROLE } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';
import { SALPYEO_USER_REPOSITORY } from '@/salpyeo/user/domain/repository/salpyeo-user.repository.interface';
import { SalpyeoUserMemoryRepository } from '@/salpyeo/user/infrastructure/repository/salpyeo-user.memory.repository';
import { SALPYEO_FACILITY_REPOSITORY } from '@/salpyeo/facility/domain/repository/salpyeo-facility.repository.interface';
import { SalpyeoFacilityMemoryRepository } from '@/salpyeo/facility/infrastructure/repository/salpyeo-facility.memory.repository';
import { SALPYEO_ADMIN_FACILITY_USE_CASES, SALPYEO_FACILITY_CONTROLLERS, SALPYEO_FACILITY_USE_CASES } from '@/salpyeo/facility/salpyeo-facility.module';
import { SalpyeoAdminFacilityController } from '@/salpyeo/facility/presentation/controller/salpyeo-admin-facility.controller';
import { SalpyeoTokenIssuer } from '@/salpyeo/auth/infrastructure/service/salpyeo-token.issuer';
import { AwsS3Service, AwsS3UploadResult } from '@/aws/s3/aws-s3.service';

/** S3 를 흉내 내 올라간 경로만 기록한다 */
class FakeS3Service {
  uploads: { path: string; mimetype: string; size: number }[] = [];

  async uploadStream(buffer: Buffer, mimetype: string, uploadFilePath: string): Promise<AwsS3UploadResult> {
    this.uploads.push({ path: uploadFilePath, mimetype, size: buffer.length });

    return { key: uploadFilePath, tag: 'etag', location: `https://artinfo.s3.ap-northeast-2.amazonaws.com/test/${uploadFilePath}` };
  }
}

/** 3x2 회색 PNG (sharp 가 크기를 읽을 수 있는 실제 파일) */
const PNG_3X2 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAIAAAASFvFNAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADklEQVR4nGM4AQMMcBYAjLQOETxAoQ8AAAAASUVORK5CYII=',
  'base64',
);

/** 올리비움산후조리원 — 시드 첫 번째 시설 */
const SLUG = 'post-a9656bde';

/**
 * 스펙 (관리자 페이지가 기대하는 계약):
 * 1) 비로그인 → 401 AUTH-001, 일반 사용자 토큰 → 403 SALPYEO-ADMIN-001 (읽기·쓰기 모두)
 * 2) GET /salpyeo/admin/facilities?vertical=post → 456건, 검색어로 좁혀지고 비활성 시설도 보인다
 * 3) GET /salpyeo/admin/facilities/:slug → 편집용 원본 필드 (없는 slug 는 404 SALPYEO-FACILITY-001)
 * 4) PUT /salpyeo/admin/facilities/:slug → 보낸 필드만 바뀌고, 안 보낸 필드는 그대로다
 * 5) 수정 결과가 공개 API(GET /salpyeo/facilities/:slug)에도 그대로 보인다
 * 6) isActive=false 로 내리면 공개 API 에서는 404, 관리자 목록에는 남는다
 * 7) 값 검증: 이름 빈 문자열·가격 음수·요금표 형식 오류는 400
 * 8) POST /salpyeo/admin/facilities/:slug/images → S3 공개 URL + 실제 이미지 크기를 돌려준다 (이미지가 아니면 400)
 * 9) POST /salpyeo/admin/facilities/rehost-images → 외부 URL 사진을 우리 S3 로 옮기고 남은 시설 수를 돌려준다.
 *    내려받지 못한 사진은 원래 URL 로 남고, 이미 우리 버킷인 사진은 건너뛴다. 반복 호출해도 안전하다.
 *    slug 를 주면 그 시설만 처리한다. 동시에 두 번 돌지 않는다(409)
 */
describe('Salpyeo admin facility API (memory repository)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let s3: FakeS3Service;

  beforeAll(async () => {
    process.env['JWT_TOKEN_KEY'] = 'salpyeo-admin-test-key';
    s3 = new FakeS3Service();
    const userRepository = new SalpyeoUserMemoryRepository();

    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({}), PassportModule],
      controllers: [...SALPYEO_FACILITY_CONTROLLERS, SalpyeoAdminFacilityController],
      providers: [
        JwtStrategy,
        SalpyeoAdminGuard,
        SalpyeoTokenIssuer,
        ...SALPYEO_FACILITY_USE_CASES,
        ...SALPYEO_ADMIN_FACILITY_USE_CASES,
        { provide: SALPYEO_FACILITY_REPOSITORY, useValue: new SalpyeoFacilityMemoryRepository() },
        { provide: SALPYEO_USER_REPOSITORY, useValue: userRepository },
        { provide: AwsS3Service, useValue: s3 },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();

    const issuer = moduleRef.get(SalpyeoTokenIssuer);
    const admin = await userRepository.create({ name: '관리자', snsType: SALPYEO_SNS_TYPE.GOOGLE, snsId: 'admin', email: null, iconImageUrl: null });
    admin.role = SALPYEO_USER_ROLE.ADMIN; // 운영에서는 DB 에서 직접 바꾼다
    const member = await userRepository.create({ name: '일반', snsType: SALPYEO_SNS_TYPE.GOOGLE, snsId: 'member', email: null, iconImageUrl: null });

    adminToken = issuer.issueAccessToken(admin).token;
    userToken = issuer.issueAccessToken(member).token;
  });

  afterAll(async () => {
    await app.close();
  });

  const asAdmin = (req: request.Test) => req.set('Authorization', `Bearer ${adminToken}`);

  it('비로그인은 401, 일반 사용자는 403', async () => {
    const anonymous = await request(app.getHttpServer()).get('/salpyeo/admin/facilities?vertical=post').expect(401);
    expect(anonymous.body.code).toBe('AUTH-001');

    const member = await request(app.getHttpServer()).get('/salpyeo/admin/facilities?vertical=post').set('Authorization', `Bearer ${userToken}`).expect(403);
    expect(member.body.code).toBe('SALPYEO-ADMIN-001');

    await request(app.getHttpServer())
      .put(`/salpyeo/admin/facilities/${SLUG}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ phone: '02-000-0000' })
      .expect(403);
  });

  it('관리자 목록 — 전체 456건, 검색어로 좁혀진다', async () => {
    const all = await asAdmin(request(app.getHttpServer()).get('/salpyeo/admin/facilities?vertical=post')).expect(200);
    expect(all.body.item.facilities).toHaveLength(456);
    expect(all.body.item.facilities[0]).toMatchObject({ slug: SLUG, name: '올리비움산후조리원', meta: '서울 종로구', isActive: true });

    const searched = await asAdmin(request(app.getHttpServer()).get(`/salpyeo/admin/facilities?vertical=post&q=${encodeURIComponent('올리비움')}`)).expect(200);
    expect(searched.body.item.facilities.map((f: { slug: string }) => f.slug)).toEqual([SLUG]);
  });

  it('관리자 상세 — 편집용 원본 필드 / 없는 slug 는 404', async () => {
    const res = await asAdmin(request(app.getHttpServer()).get(`/salpyeo/admin/facilities/${SLUG}`)).expect(200);
    expect(res.body.item).toMatchObject({
      slug: SLUG,
      name: '올리비움산후조리원',
      sido: '서울',
      sigungu: '종로구',
      operatorType: '민간',
      phone: '02-730-1717',
      isActive: true,
    });
    expect(Array.isArray(res.body.item.priceRows)).toBe(true);

    const missing = await asAdmin(request(app.getHttpServer()).get('/salpyeo/admin/facilities/nope')).expect(404);
    expect(missing.body.code).toBe('SALPYEO-FACILITY-001');
  });

  it('보낸 필드만 수정되고, 결과가 공개 API 에도 반영된다', async () => {
    const before = await asAdmin(request(app.getHttpServer()).get(`/salpyeo/admin/facilities/${SLUG}`));
    const untouchedAddress = before.body.item.address;

    const updated = await asAdmin(request(app.getHttpServer()).put(`/salpyeo/admin/facilities/${SLUG}`))
      .send({
        phone: '02-730-9999',
        price: 5000000,
        priceRows: [{ room: '일반실', note: '2주 기준 · 관리자 확인', price: '500만원' }],
      })
      .expect(200);

    expect(updated.body.item).toMatchObject({ phone: '02-730-9999', price: 5000000, address: untouchedAddress, name: '올리비움산후조리원' });
    expect(updated.body.item.priceRows).toEqual([{ room: '일반실', note: '2주 기준 · 관리자 확인', price: '500만원' }]);

    const publicView = await request(app.getHttpServer()).get(`/salpyeo/facilities/${SLUG}`).expect(200);
    expect(publicView.body.item).toMatchObject({ phone: '02-730-9999', price: 5000000 });
    expect(publicView.body.item.priceRows).toEqual([{ room: '일반실', note: '2주 기준 · 관리자 확인', price: '500만원' }]);
  });

  it('노출을 내리면 공개 API 는 404, 관리자 목록에는 남는다', async () => {
    await asAdmin(request(app.getHttpServer()).put(`/salpyeo/admin/facilities/${SLUG}`))
      .send({ isActive: false })
      .expect(200);

    const publicView = await request(app.getHttpServer()).get(`/salpyeo/facilities/${SLUG}`).expect(404);
    expect(publicView.body.code).toBe('SALPYEO-FACILITY-001');

    const adminList = await asAdmin(request(app.getHttpServer()).get(`/salpyeo/admin/facilities?vertical=post&q=${encodeURIComponent('올리비움')}`)).expect(
      200,
    );
    expect(adminList.body.item.facilities[0]).toMatchObject({ slug: SLUG, isActive: false });

    await asAdmin(request(app.getHttpServer()).put(`/salpyeo/admin/facilities/${SLUG}`))
      .send({ isActive: true })
      .expect(200);
  });

  it('값 검증 — 빈 이름·음수 가격·요금표 형식 오류는 400', async () => {
    await asAdmin(request(app.getHttpServer()).put(`/salpyeo/admin/facilities/${SLUG}`))
      .send({ name: '' })
      .expect(400);
    await asAdmin(request(app.getHttpServer()).put(`/salpyeo/admin/facilities/${SLUG}`))
      .send({ price: -1 })
      .expect(400);
    await asAdmin(request(app.getHttpServer()).put(`/salpyeo/admin/facilities/${SLUG}`))
      .send({ priceRows: [{ room: '일반실' }] })
      .expect(400);
  });

  it('사진 업로드 — S3 공개 URL 과 실제 크기를 돌려준다 (이미지가 아니면 400)', async () => {
    const res = await asAdmin(request(app.getHttpServer()).post(`/salpyeo/admin/facilities/${SLUG}/images`))
      .attach('imageFile', PNG_3X2, { filename: 'room.png', contentType: 'image/png' })
      .expect(201);

    expect(res.body.item).toMatchObject({ alt: '시설 사진', width: 3, height: 2 });
    expect(res.body.item.url).toMatch(/^https:\/\/artinfo\.s3\./);
    expect(s3.uploads.at(-1)?.path).toMatch(new RegExp(`^salpyeo/facilities/${SLUG}/\\d+-[a-z0-9]+\\.png$`));

    const notImage = await asAdmin(request(app.getHttpServer()).post(`/salpyeo/admin/facilities/${SLUG}/images`))
      .attach('imageFile', Buffer.from('hello'), { filename: 'a.txt', contentType: 'text/plain' })
      .expect(400);
    expect(notImage.body.code).toBe('SALPYEO-FACILITY-002');

    // 일반 사용자는 업로드도 막힌다
    await request(app.getHttpServer())
      .post(`/salpyeo/admin/facilities/${SLUG}/images`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('imageFile', PNG_3X2, { filename: 'room.png', contentType: 'image/png' })
      .expect(403);
  });

  it('사진 이전 — 외부 URL 을 S3 로 옮기고 남은 시설 수를 돌려준다', async () => {
    // 조리원 홈페이지 대신 응답하는 가짜 fetch: 첫 장은 성공, 'broken' 이 든 URL 은 실패
    const realFetch = global.fetch;
    global.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('broken')) return new Response(null, { status: 404 });
      return new Response(PNG_3X2, { status: 200, headers: { 'Content-Type': 'image/png' } });
    }) as typeof fetch;

    try {
      await asAdmin(request(app.getHttpServer()).put(`/salpyeo/admin/facilities/${SLUG}`))
        .send({
          images: [
            { url: 'https://www.olivium.co.kr/a.jpg', alt: '시설 사진', width: 1200, height: 800 },
            { url: 'https://www.olivium.co.kr/broken.jpg', alt: '시설 사진', width: 1200, height: 800 },
            { url: 'https://artinfo.s3.ap-northeast-2.amazonaws.com/test/already.jpg', alt: '이미 이전됨', width: 10, height: 10 },
          ],
        })
        .expect(200);

      const res = await asAdmin(request(app.getHttpServer()).post('/salpyeo/admin/facilities/rehost-images')).send({ slug: SLUG }).expect(201);

      expect(res.body.item).toMatchObject({ facilities: 1, moved: 1, failed: 1 });

      const after = await asAdmin(request(app.getHttpServer()).get(`/salpyeo/admin/facilities/${SLUG}`)).expect(200);
      const urls = after.body.item.images.map((i: { url: string }) => i.url);
      expect(urls[0]).toMatch(/^https:\/\/artinfo\.s3\./); // 옮겨짐
      expect(urls[1]).toBe('https://www.olivium.co.kr/broken.jpg'); // 실패한 건 원래 URL 그대로
      expect(urls[2]).toBe('https://artinfo.s3.ap-northeast-2.amazonaws.com/test/already.jpg'); // 이미 우리 버킷이라 건너뜀

      // 다시 호출해도 남은 것은 실패한 한 장뿐 — 여러 번 눌러도 안전하다
      const again = await asAdmin(request(app.getHttpServer()).post('/salpyeo/admin/facilities/rehost-images')).send({ slug: SLUG }).expect(201);
      expect(again.body.item.moved).toBe(0);
      expect(again.body.item.failed).toBe(1);

      // 일반 사용자는 막힌다
      await request(app.getHttpServer())
        .post('/salpyeo/admin/facilities/rehost-images')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ slug: SLUG })
        .expect(403);
    } finally {
      global.fetch = realFetch;
    }
  });

  it('사진 이전은 동시에 두 번 돌지 않는다', async () => {
    const realFetch = global.fetch;
    // 첫 요청이 끝나기 전에 두 번째 요청이 들어오도록 응답을 늦춘다
    global.fetch = (async () => {
      await new Promise(resolve => setTimeout(resolve, 120));
      return new Response(PNG_3X2, { status: 200, headers: { 'Content-Type': 'image/png' } });
    }) as typeof fetch;

    try {
      await asAdmin(request(app.getHttpServer()).put(`/salpyeo/admin/facilities/${SLUG}`))
        .send({ images: [{ url: 'https://www.olivium.co.kr/slow.jpg', alt: '시설 사진', width: 10, height: 10 }] })
        .expect(200);

      // supertest 는 then 을 부를 때 실제로 요청을 보낸다 — 먼저 띄워 두고 두 번째를 겹치게 한다
      const first = asAdmin(request(app.getHttpServer()).post('/salpyeo/admin/facilities/rehost-images'))
        .send({ slug: SLUG })
        .then(res => res);
      await new Promise(resolve => setTimeout(resolve, 30));
      const second = await asAdmin(request(app.getHttpServer()).post('/salpyeo/admin/facilities/rehost-images')).send({ slug: SLUG }).expect(409);

      expect(second.body.code).toBe('SALPYEO-FACILITY-003');
      expect((await first).status).toBe(201);
    } finally {
      global.fetch = realFetch;
    }
  });
});
