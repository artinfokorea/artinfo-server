import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchStaffRepository, OnchurchStaffWriteParams } from '@/onchurch/about/domain/repository/onchurch-staff.repository.interface';
import { OnchurchStaff } from '@/onchurch/about/domain/entity/onchurch-staff.entity';
import { OnchurchStaffNotFound } from '@/onchurch/about/domain/exception/onchurch-about.exception';

@Injectable()
export class OnchurchStaffRepository implements IOnchurchStaffRepository {
  constructor(
    @InjectRepository(OnchurchStaff)
    private readonly staffRepository: Repository<OnchurchStaff>,
  ) {}

  async findAllByChurchId(churchId: number): Promise<OnchurchStaff[]> {
    return this.staffRepository.find({
      where: { churchId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchStaff | null> {
    return this.staffRepository.findOneBy({ id, churchId });
  }

  async create(churchId: number, params: OnchurchStaffWriteParams): Promise<OnchurchStaff> {
    return this.staffRepository.save({ churchId, ...params });
  }

  async update(churchId: number, id: number, params: OnchurchStaffWriteParams): Promise<OnchurchStaff> {
    const s = await this.staffRepository.findOneBy({ id, churchId });
    if (!s) throw new OnchurchStaffNotFound();
    Object.assign(s, params);
    return this.staffRepository.save(s);
  }

  async remove(churchId: number, id: number): Promise<void> {
    const s = await this.staffRepository.findOneBy({ id, churchId });
    if (!s) throw new OnchurchStaffNotFound();
    await this.staffRepository.softRemove(s);
  }
}
