import { Inject, Injectable } from '@nestjs/common';
import {
  ONCHURCH_SAINT_RELATION_REPOSITORY,
  IOnchurchSaintRelationRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint-relation.repository.interface';
import {
  ONCHURCH_SAINT_REPOSITORY,
  IOnchurchSaintRepository,
} from '@/onchurch/saint/domain/repository/onchurch-saint.repository.interface';
import { OnchurchChurchManagerResolver } from '@/onchurch/church/application/service/onchurch-church-manager.resolver';
import { OnchurchSaintRelationCreateCommand } from '@/onchurch/saint/application/command/onchurch-saint-write.command';
import {
  OnchurchSaintChurchNotConfigured,
  OnchurchSaintNotFound,
  OnchurchSaintRelationInvalid,
  OnchurchSaintRelationNotFound,
} from '@/onchurch/saint/domain/exception/onchurch-saint.exception';

export interface OnchurchSaintRelationView {
  id: number;
  relation: string;
  relatedSaintId: number;
  relatedSaintName: string;
  relatedSaintPhotoUrl: string | null;
}

// 역방향 관계 라벨 매핑(가족관계는 양방향으로 한 쌍씩 저장).
const INVERSE_RELATION: Record<string, string> = {
  배우자: '배우자',
  부모: '자녀',
  자녀: '부모',
  형제자매: '형제자매',
  조부모: '손자녀',
  손자녀: '조부모',
  친척: '친척',
  기타: '기타',
};

function inverseOf(relation: string): string {
  return INVERSE_RELATION[relation] ?? relation;
}

@Injectable()
export class OnchurchListMySaintRelationsUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_RELATION_REPOSITORY) private readonly relationRepo: IOnchurchSaintRelationRepository,
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly saintRepo: IOnchurchSaintRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, saintId: number): Promise<OnchurchSaintRelationView[]> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) return [];
    const owned = await this.saintRepo.findOwnedById(church.id, saintId);
    if (!owned) throw new OnchurchSaintNotFound();

    const relations = await this.relationRepo.findBySaintId(church.id, saintId);
    if (relations.length === 0) return [];

    const relatedSaints = await this.saintRepo.findByIds(
      church.id,
      relations.map((r) => r.relatedSaintId),
    );
    const byId = new Map(relatedSaints.map((s) => [s.id, s]));

    return relations
      .filter((r) => byId.has(r.relatedSaintId))
      .map((r) => {
        const s = byId.get(r.relatedSaintId)!;
        return {
          id: r.id,
          relation: r.relation,
          relatedSaintId: r.relatedSaintId,
          relatedSaintName: s.name,
          relatedSaintPhotoUrl: s.photoUrl,
        };
      });
  }
}

@Injectable()
export class OnchurchCreateMySaintRelationUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_RELATION_REPOSITORY) private readonly relationRepo: IOnchurchSaintRelationRepository,
    @Inject(ONCHURCH_SAINT_REPOSITORY) private readonly saintRepo: IOnchurchSaintRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, saintId: number, command: OnchurchSaintRelationCreateCommand): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    if (saintId === command.relatedSaintId) throw new OnchurchSaintRelationInvalid();

    const [subject, target] = await Promise.all([
      this.saintRepo.findOwnedById(church.id, saintId),
      this.saintRepo.findOwnedById(church.id, command.relatedSaintId),
    ]);
    if (!subject || !target) throw new OnchurchSaintNotFound();

    // 이미 같은 쌍이 있으면 라벨만 갱신(중복 행 방지). 양방향 모두 처리.
    const existing = await this.relationRepo.findPair(church.id, saintId, command.relatedSaintId);
    if (existing) {
      await this.relationRepo.remove(church.id, existing.id);
    }
    const inverse = await this.relationRepo.findPair(church.id, command.relatedSaintId, saintId);
    if (inverse) {
      await this.relationRepo.remove(church.id, inverse.id);
    }

    await this.relationRepo.create(church.id, {
      saintId,
      relatedSaintId: command.relatedSaintId,
      relation: command.relation,
    });
    await this.relationRepo.create(church.id, {
      saintId: command.relatedSaintId,
      relatedSaintId: saintId,
      relation: inverseOf(command.relation),
    });
  }
}

@Injectable()
export class OnchurchDeleteMySaintRelationUseCase {
  constructor(
    @Inject(ONCHURCH_SAINT_RELATION_REPOSITORY) private readonly relationRepo: IOnchurchSaintRelationRepository,
    private readonly managerResolver: OnchurchChurchManagerResolver,
  ) {}
  async execute(userId: number, relationId: number): Promise<void> {
    const church = await this.managerResolver.resolveManagedChurch(userId);
    if (!church) throw new OnchurchSaintChurchNotConfigured();
    const owned = await this.relationRepo.findOwnedById(church.id, relationId);
    if (!owned) throw new OnchurchSaintRelationNotFound();

    // 양방향 쌍을 함께 삭제한다.
    const inverse = await this.relationRepo.findPair(church.id, owned.relatedSaintId, owned.saintId);
    await this.relationRepo.remove(church.id, owned.id);
    if (inverse) await this.relationRepo.remove(church.id, inverse.id);
  }
}
