import { Injectable } from '@nestjs/common';
import { Brackets, DataSource } from 'typeorm';
import { Admission } from '@/admission/entity/admission.entity';
import { AdmissionRound } from '@/admission/entity/admission-round.entity';
import { AdmissionRoundTask } from '@/admission/entity/admission-round-task.entity';
import { AdmissionCreator } from '@/admission/repository/operation/admission.creator';
import { AdmissionFetcher } from '@/admission/repository/operation/admission.fetcher';
import { AdmissionCreationFailed } from '@/admission/exception/admission.exception';
import { PagingItems } from '@/common/type/type';

@Injectable()
export class AdmissionRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAdmissions(fetcher: AdmissionFetcher): Promise<PagingItems<Admission>> {
    const qb = this.dataSource
      .getRepository(Admission)
      .createQueryBuilder('admission')
      .leftJoinAndSelect('admission.majorCategory', 'majorCategory')
      .leftJoinAndSelect('admission.rounds', 'rounds')
      .leftJoinAndSelect('rounds.tasks', 'tasks');

    if (fetcher.keyword) {
      qb.andWhere(
        new Brackets(sub => {
          sub
            .where('LOWER(admission.schoolName) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` })
            .orWhere('LOWER(majorCategory.koName) LIKE LOWER(:keyword)', { keyword: `%${fetcher.keyword}%` });
        }),
      );
    }

    if (fetcher.year) {
      qb.andWhere('admission.year = :year', { year: fetcher.year });
    }

    if (fetcher.majorCategoryIds.length) {
      qb.andWhere('admission.majorCategoryId IN (:...majorCategoryIds)', { majorCategoryIds: fetcher.majorCategoryIds });
    }

    if (fetcher.majorGroups.length) {
      qb.andWhere('majorCategory.thirdGroupEn IN (:...majorGroups)', { majorGroups: fetcher.majorGroups });
    }

    const [items, totalCount] = await qb
      .orderBy('admission.applicationEndAt', 'DESC')
      .addOrderBy('admission.createdAt', 'DESC')
      .skip(fetcher.skip)
      .take(fetcher.take)
      .getManyAndCount();

    return { items, totalCount };
  }

  async createWithRoundsAndTasks(creator: AdmissionCreator): Promise<number> {
    try {
      return await this.dataSource.transaction(async transactionManager => {
        const admission = await transactionManager.save(Admission, {
          majorCategory: { id: creator.majorCategoryId },
          type: creator.type,
          year: creator.year,
          schoolName: creator.schoolName,
          applicationStartAt: creator.applicationStartAt,
          applicationEndAt: creator.applicationEndAt,
          applicationNote: creator.applicationNote,
          documentStartAt: creator.documentStartAt,
          documentEndAt: creator.documentEndAt,
          documentNote: creator.documentNote,
          finalResultAt: creator.finalResultAt,
        });

        for (const roundCreator of creator.rounds) {
          const round = await transactionManager.save(AdmissionRound, {
            admission: admission,
            roundNumber: roundCreator.roundNumber,
            examStartAt: roundCreator.examStartAt,
            examEndAt: roundCreator.examEndAt,
            resultAt: roundCreator.resultAt,
            registrationStartAt: roundCreator.registrationStartAt,
            registrationEndAt: roundCreator.registrationEndAt,
            note: roundCreator.note,
          });

          if (roundCreator.tasks.length) {
            const tasks = roundCreator.tasks.map(taskCreator => {
              return transactionManager.create(AdmissionRoundTask, {
                round: round,
                description: taskCreator.description,
                sequence: taskCreator.sequence,
                note: taskCreator.note,
              });
            });

            await transactionManager.save(tasks);
          }
        }

        return admission.id;
      });
    } catch (e) {
      console.log(e);
      throw new AdmissionCreationFailed();
    }
  }
}
