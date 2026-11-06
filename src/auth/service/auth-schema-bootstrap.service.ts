import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * auths.type 은 Postgres enum 이라 새 로그인 수단(APPLE)을 쓰려면 enum 값이 먼저 있어야 한다.
 * synchronize 가 꺼져 있어 기동 시 멱등하게 추가한다 (ongi-schema-bootstrap 과 같은 안전장치).
 * 컬럼의 실제 enum 타입 이름을 카탈로그에서 찾으므로 타입 이름(auths_type_enum 등)에 의존하지 않는다.
 */
@Injectable()
export class AuthSchemaBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AuthSchemaBootstrapService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    const statement = `
      DO $$
      DECLARE enum_type text;
      BEGIN
        SELECT udt_name INTO enum_type
          FROM information_schema.columns
         WHERE table_name = 'auths' AND column_name = 'type' AND data_type = 'USER-DEFINED';
        IF enum_type IS NOT NULL THEN
          EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS %L', enum_type, 'APPLE');
        END IF;
      END $$`;
    try {
      await this.dataSource.query(statement);
    } catch (error) {
      this.logger.error(`auths.type enum 에 APPLE 추가 실패 — Apple 로그인이 동작하지 않을 수 있습니다: ${error}`);
    }
  }
}
