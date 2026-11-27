import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HomepageStatus, LeadStatus, SalesLeadInput } from '@/onchurch/sales/sales-lead';

export interface SalesLeadRow extends SalesLeadInput {
  id: number;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalesLeadFilter {
  keyword?: string | null;
  status?: LeadStatus | null;
  homepage?: HomepageStatus | 'need' | null; // need: 없음 + 블로그 + 오래됨
  contact?: 'email' | 'phone' | 'any' | null;
  region?: string | null;
  denomination?: string | null;
  page: number;
  size: number;
}

export interface SalesLeadSearchResult {
  items: SalesLeadRow[];
  total: number;
  /** 상태별 개수(상태 필터를 뺀 나머지 조건 기준) */
  counts: Record<string, number>;
}

const COLUMNS = `id, name, denomination, region, address, pastor, phone, email, homepage_status, homepage_url, source, status, email_consent, memo,
  last_contacted_at, created_at, updated_at`;

type DbRow = {
  id: number;
  name: string;
  denomination: string | null;
  region: string | null;
  address: string | null;
  pastor: string | null;
  phone: string | null;
  email: string | null;
  homepage_status: HomepageStatus;
  homepage_url: string | null;
  source: string | null;
  status: LeadStatus;
  email_consent: boolean;
  memo: string | null;
  last_contacted_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

const iso = (d: Date | null) => (d ? new Date(d).toISOString() : null);

function toRow(r: DbRow): SalesLeadRow {
  return {
    id: r.id,
    name: r.name,
    denomination: r.denomination,
    region: r.region,
    address: r.address,
    pastor: r.pastor,
    phone: r.phone,
    email: r.email,
    homepageStatus: r.homepage_status,
    homepageUrl: r.homepage_url,
    source: r.source,
    status: r.status,
    emailConsent: r.email_consent,
    memo: r.memo,
    lastContactedAt: iso(r.last_contacted_at),
    createdAt: iso(r.created_at) as string,
    updatedAt: iso(r.updated_at) as string,
  };
}

const values = (l: SalesLeadInput) => [
  l.name,
  l.denomination,
  l.region,
  l.address,
  l.pastor,
  l.phone,
  l.email,
  l.homepageStatus,
  l.homepageUrl,
  l.source,
  l.status,
  l.emailConsent,
  l.memo,
];

/** 영업 대상 저장소. 테이블은 부팅 때 멱등 DDL 로 만든다. */
@Injectable()
export class OnchurchSalesLeadRepository implements OnModuleInit {
  private readonly logger = new Logger(OnchurchSalesLeadRepository.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.dataSource.query(`CREATE TABLE IF NOT EXISTS onchurch_sales_leads (
        id                SERIAL PRIMARY KEY,
        name              VARCHAR(120) NOT NULL,
        denomination      VARCHAR(80),
        region            VARCHAR(80),
        address           VARCHAR(300),
        pastor            VARCHAR(80),
        phone             VARCHAR(40),
        email             VARCHAR(200),
        homepage_status   VARCHAR(20) NOT NULL DEFAULT 'unknown',
        homepage_url      VARCHAR(300),
        source            VARCHAR(120),
        status            VARCHAR(20) NOT NULL DEFAULT 'new',
        email_consent     BOOLEAN NOT NULL DEFAULT false,
        memo              TEXT,
        last_contacted_at TIMESTAMP,
        created_at        TIMESTAMP NOT NULL DEFAULT now(),
        updated_at        TIMESTAMP NOT NULL DEFAULT now(),
        deleted_at        TIMESTAMP
      )`);
      await this.dataSource.query(
        `CREATE INDEX IF NOT EXISTS idx_onchurch_sales_leads_name ON onchurch_sales_leads (replace(name, ' ', '')) WHERE deleted_at IS NULL`,
      );
    } catch (error) {
      this.logger.error(`영업 대상 테이블 생성 실패: ${error}`);
    }
  }

  async search(f: SalesLeadFilter): Promise<SalesLeadSearchResult> {
    const where: string[] = ['deleted_at IS NULL'];
    const params: unknown[] = [];
    const add = (sql: string, v: unknown) => {
      params.push(v);
      where.push(sql.replace(/\$\?/g, () => `$${params.length}`));
    };
    if (f.keyword) add(`(name ILIKE $? OR address ILIKE $? OR pastor ILIKE $? OR memo ILIKE $? OR phone ILIKE $? OR email ILIKE $?)`, `%${f.keyword}%`);
    if (f.region) add(`(region ILIKE $? OR address ILIKE $?)`, `%${f.region}%`);
    if (f.denomination) add(`denomination ILIKE $?`, `%${f.denomination}%`);
    if (f.homepage === 'need') where.push(`homepage_status IN ('none', 'blog', 'old')`);
    else if (f.homepage) add(`homepage_status = $?`, f.homepage);
    if (f.contact === 'email') where.push(`email IS NOT NULL`);
    else if (f.contact === 'phone') where.push(`phone IS NOT NULL`);
    else if (f.contact === 'any') where.push(`(email IS NOT NULL OR phone IS NOT NULL)`);

    const baseWhere = where.join(' AND ');
    const countRows: { status: string; n: string }[] = await this.dataSource.query(
      `SELECT status, COUNT(*) AS n FROM onchurch_sales_leads WHERE ${baseWhere} GROUP BY status`,
      params,
    );
    const counts: Record<string, number> = {};
    for (const r of countRows) counts[r.status] = Number(r.n);

    const listParams = [...params];
    let listWhere = baseWhere;
    if (f.status) {
      listParams.push(f.status);
      listWhere += ` AND status = $${listParams.length}`;
    }
    const total = f.status ? (counts[f.status] ?? 0) : Object.values(counts).reduce((a, b) => a + b, 0);
    listParams.push(f.size, (f.page - 1) * f.size);
    const rows: DbRow[] = await this.dataSource.query(
      `SELECT ${COLUMNS} FROM onchurch_sales_leads WHERE ${listWhere} ORDER BY updated_at DESC, id DESC LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams,
    );
    return { items: rows.map(toRow), total, counts };
  }

  /** 이름(공백 뺀 값)이 같은 교회들 — 겹침 확인용 */
  async findByNames(names: string[]): Promise<SalesLeadRow[]> {
    const rows: DbRow[] = await this.dataSource.query(
      `SELECT ${COLUMNS} FROM onchurch_sales_leads WHERE deleted_at IS NULL AND replace(name, ' ', '') = ANY($1::text[])`,
      [names],
    );
    return rows.map(toRow);
  }

  async findById(id: number): Promise<SalesLeadRow | null> {
    const rows: DbRow[] = await this.dataSource.query(`SELECT ${COLUMNS} FROM onchurch_sales_leads WHERE id = $1 AND deleted_at IS NULL`, [id]);
    return rows[0] ? toRow(rows[0]) : null;
  }

  async insert(lead: SalesLeadInput): Promise<SalesLeadRow> {
    const rows: DbRow[] = await this.dataSource.query(
      `INSERT INTO onchurch_sales_leads (name, denomination, region, address, pastor, phone, email, homepage_status, homepage_url, source, status, email_consent, memo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING ${COLUMNS}`,
      values(lead),
    );
    return toRow(rows[0]);
  }

  async insertMany(leads: SalesLeadInput[]): Promise<number> {
    await this.dataSource.transaction(async m => {
      for (const lead of leads) {
        await m.query(
          `INSERT INTO onchurch_sales_leads (name, denomination, region, address, pastor, phone, email, homepage_status, homepage_url, source, status, email_consent, memo)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          values(lead),
        );
      }
    });
    return leads.length;
  }

  async update(id: number, lead: SalesLeadInput, contacted: boolean): Promise<SalesLeadRow> {
    const rows: DbRow[] = await this.dataSource.query(
      `UPDATE onchurch_sales_leads SET name = $2, denomination = $3, region = $4, address = $5, pastor = $6, phone = $7, email = $8,
         homepage_status = $9, homepage_url = $10, source = $11, status = $12, email_consent = $13, memo = $14,
         last_contacted_at = CASE WHEN $15::boolean THEN now() ELSE last_contacted_at END, updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL RETURNING ${COLUMNS}`,
      [id, ...values(lead), contacted],
    );
    const row = Array.isArray(rows[0]) ? (rows[0] as unknown as DbRow[])[0] : rows[0];
    return toRow(row);
  }

  async softDelete(ids: number[]): Promise<number> {
    const rows = await this.dataSource.query(
      `UPDATE onchurch_sales_leads SET deleted_at = now() WHERE id = ANY($1::int[]) AND deleted_at IS NULL RETURNING id`,
      [ids],
    );
    return Array.isArray(rows?.[0]) ? rows[0].length : Array.isArray(rows) ? rows.length : 0;
  }
}
