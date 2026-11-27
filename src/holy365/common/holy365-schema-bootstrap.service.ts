import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HOLY365_SCHEMA_STATEMENTS } from '@/holy365/common/holy365-schema';

/** 기동 시 홀리365 테이블을 멱등하게 만든다 — 실패해도 서버 기동은 막지 않는다 */
@Injectable()
export class Holy365SchemaBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(Holy365SchemaBootstrapService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      for (const statement of HOLY365_SCHEMA_STATEMENTS) {
        await this.dataSource.query(statement);
      }
    } catch (error) {
      this.logger.error(`holy365 schema bootstrap failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
