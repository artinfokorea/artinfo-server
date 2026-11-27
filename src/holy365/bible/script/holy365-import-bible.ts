/**
 * 성경 본문 가져오기 — 번역본 하나를 통째로 교체한다 (holy365_verses · holy365_chapters).
 *
 *   npx ts-node -r tsconfig-paths/register src/holy365/bible/script/holy365-import-bible.ts \
 *     --code KJV --url https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json
 *
 *   npx ts-node -r tsconfig-paths/register src/holy365/bible/script/holy365-import-bible.ts \
 *     --code NKRV --file ./nkrv.json --name 개역개정 --language ko --copyright "성경전서 개역개정판 © 대한성서공회"
 *
 * DB 접속 정보는 .env 의 DATABASE_* 를 읽는다. 지원하는 JSON 형식은 holy365-bible-import.ts 참고.
 * 개역개정 본문은 대한성서공회 사용 허락을 받은 뒤 받은 파일로 가져온다.
 */
import { readFileSync, existsSync } from 'fs';
import axios from 'axios';
import { Client } from 'pg';
import { parseBibleJson } from '@/holy365/bible/domain/holy365-bible-import';
import { HOLY365_SCHEMA_STATEMENTS } from '@/holy365/common/holy365-schema';

function loadDotEnv(path = '.env'): void {
  if (!existsSync(path)) return;
  readFileSync(path, 'utf8')
    .split('\n')
    .forEach(line => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    });
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);

  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function readSource(): Promise<unknown> {
  const file = arg('file');
  const url = arg('url');
  const text = file ? readFileSync(file, 'utf8') : url ? (await axios.get(url, { responseType: 'text', transformResponse: x => x })).data : null;
  if (text === null) throw new Error('--file 또는 --url 이 필요합니다');

  return JSON.parse(String(text).replace(/^﻿/, ''));
}

async function main(): Promise<void> {
  loadDotEnv();
  const code = arg('code')?.toUpperCase();
  if (!code) throw new Error('--code 가 필요합니다 (예: NKRV, KJV)');

  const verses = parseBibleJson(await readSource());
  console.log(`[holy365] ${code}: ${verses.length} verses parsed`);

  const client = new Client({
    host: process.env['DATABASE_HOST'],
    port: Number(process.env['DATABASE_PORT'] ?? 5432),
    user: process.env['DATABASE_USER_NAME'],
    password: process.env['DATABASE_PASSWORD'],
    database: process.env['DATABASE_NAME'],
  });
  await client.connect();

  try {
    for (const statement of HOLY365_SCHEMA_STATEMENTS) await client.query(statement);

    await client.query('BEGIN');
    const name = arg('name');
    const language = arg('language');
    const copyright = arg('copyright');
    if (name && language) {
      await client.query(
        `INSERT INTO holy365_bible_versions (code, name, language, copyright, sort) VALUES ($1, $2, $3, $4, COALESCE($5::int, 99))
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, language = EXCLUDED.language, copyright = EXCLUDED.copyright`,
        [code, name, language, copyright ?? '', arg('sort') ?? null],
      );
    }
    const exists = await client.query('SELECT 1 FROM holy365_bible_versions WHERE code = $1', [code]);
    if (!exists.rowCount) throw new Error(`holy365_bible_versions 에 ${code} 가 없습니다 — --name 과 --language 를 함께 주세요`);

    await client.query('DELETE FROM holy365_verses WHERE version_code = $1', [code]);
    const BATCH = 2000;
    for (let i = 0; i < verses.length; i += BATCH) {
      const chunk = verses.slice(i, i + BATCH);
      await client.query(
        `INSERT INTO holy365_verses (version_code, book, chapter, verse, text)
         SELECT $1, * FROM unnest($2::smallint[], $3::smallint[], $4::smallint[], $5::text[])`,
        [code, chunk.map(v => v.book), chunk.map(v => v.chapter), chunk.map(v => v.verse), chunk.map(v => v.text)],
      );
    }

    await client.query('DELETE FROM holy365_chapters WHERE version_code = $1', [code]);
    await client.query(
      `INSERT INTO holy365_chapters (version_code, book, chapter, verse_count, char_count)
       SELECT version_code, book, chapter, COUNT(*), SUM(char_length(text)) FROM holy365_verses WHERE version_code = $1
        GROUP BY version_code, book, chapter`,
      [code],
    );
    await client.query('COMMIT');
    console.log(`[holy365] ${code}: imported`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(`[holy365] import failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
