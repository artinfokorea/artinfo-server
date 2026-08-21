import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

/** 일자·시각대별 1위 키워드 */
@Entity('trend_daily_hourly_tops')
export class TrendDailyHourlyTop extends BaseEntity {
  @PrimaryColumn({ type: 'date', name: 'date' })
  date: string;

  @PrimaryColumn({ type: 'smallint', name: 'hour' })
  hour: number;

  @Column({ type: 'varchar', name: 'keyword', length: 100 })
  keyword: string;
}
