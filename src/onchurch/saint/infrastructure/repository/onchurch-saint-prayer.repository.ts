import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOnchurchSaintPrayerRepository } from '@/onchurch/saint/domain/repository/onchurch-saint-prayer.repository.interface';
import { OnchurchSaintPrayer } from '@/onchurch/saint/domain/entity/onchurch-saint-prayer.entity';
import { OnchurchSaintPrayerNotFound } from '@/onchurch/saint/domain/exception/onchurch-saint.exception';

@Injectable()
export class OnchurchSaintPrayerRepository implements IOnchurchSaintPrayerRepository {
  constructor(
    @InjectRepository(OnchurchSaintPrayer)
    private readonly repo: Repository<OnchurchSaintPrayer>,
  ) {}

  async findBySaintId(churchId: number, saintId: number): Promise<OnchurchSaintPrayer[]> {
    return this.repo.find({
      where: { churchId, saintId },
      order: { id: 'DESC' },
    });
  }

  async findOwnedById(churchId: number, id: number): Promise<OnchurchSaintPrayer | null> {
    return this.repo.findOneBy({ id, churchId });
  }

  async removeBySaintId(churchId: number, saintId: number): Promise<void> {
    const rows = await this.repo.find({ where: { churchId, saintId } });
    if (rows.length) await this.repo.softRemove(rows);
  }

  async create(churchId: number, saintId: number, content: string): Promise<OnchurchSaintPrayer> {
    return this.repo.save({ churchId, saintId, content });
  }

  async remove(churchId: number, id: number): Promise<void> {
    const v = await this.repo.findOneBy({ id, churchId });
    if (!v) throw new OnchurchSaintPrayerNotFound();
    await this.repo.softRemove(v);
  }
}
