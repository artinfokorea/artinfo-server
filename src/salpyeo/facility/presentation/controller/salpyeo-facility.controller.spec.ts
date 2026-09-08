import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ResponseInterceptor } from '@/common/interceptor/interceptor';
import { HttpExceptionFilter } from '@/common/exception/http-exception-filter';
import { SALPYEO_FACILITY_REPOSITORY } from '@/salpyeo/facility/domain/repository/salpyeo-facility.repository.interface';
import { SalpyeoFacilityMemoryRepository } from '@/salpyeo/facility/infrastructure/repository/salpyeo-facility.memory.repository';
import { SALPYEO_FACILITY_CONTROLLERS, SALPYEO_FACILITY_USE_CASES } from '@/salpyeo/facility/salpyeo-facility.module';

/**
 * 스펙 (프론트 salpyeo-client 가 기대하는 계약):
 * 1) GET /salpyeo/verticals → 5개, post 만 enabled, count 는 시드 기준 (post 4 / 나머지 3)
 * 2) GET /salpyeo/verticals/post → 단건, 알 수 없는 키는 404 SALPYEO-VERTICAL-001
 * 3) GET /salpyeo/facilities?vertical=post → 4개, 기본 가격 낮은순, 응답은 { code:'OK', item:{ facilities } } 봉투
 * 4) sort=ratingDesc → 소풍이 첫 번째
 * 5) q=라온 → 1개 / slugs=p1,p2 → 2개
 * 6) vertical 누락·오타 → 400 BAD_REQUEST
 * 7) GET /salpyeo/facilities/p1 → distance/badges 객체, rating 은 숫자 4.6, images 5장
 * 8) 없는 slug → 404 SALPYEO-FACILITY-001
 */
describe('Salpyeo facility API (memory repository)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: SALPYEO_FACILITY_CONTROLLERS,
      providers: [...SALPYEO_FACILITY_USE_CASES, { provide: SALPYEO_FACILITY_REPOSITORY, useValue: new SalpyeoFacilityMemoryRepository() }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('버티컬 목록: 5개, post 만 활성, 시드 기준 시설 수', async () => {
    const res = await request(app.getHttpServer()).get('/salpyeo/verticals').expect(200);
    expect(res.body.code).toBe('OK');
    const verticals = res.body.item.verticals;
    expect(verticals).toHaveLength(5);
    expect(verticals.map((v: any) => v.key)).toEqual(['post', 'nursing', 'funeral', 'daycare', 'academy']);
    expect(verticals.filter((v: any) => v.enabled).map((v: any) => v.key)).toEqual(['post']);
    expect(verticals.find((v: any) => v.key === 'post')).toMatchObject({
      label: '산후조리원',
      priceLabel: '2주 일반실',
      source: '모자보건법 요금 공개',
      count: 4,
    });
    expect(verticals.find((v: any) => v.key === 'nursing').count).toBe(3);
  });

  it('버티컬 단건 / 알 수 없는 키는 404', async () => {
    const ok = await request(app.getHttpServer()).get('/salpyeo/verticals/post').expect(200);
    expect(ok.body.item).toMatchObject({ key: 'post', enabled: true, count: 4 });

    const notFound = await request(app.getHttpServer()).get('/salpyeo/verticals/hospital').expect(404);
    expect(notFound.body).toEqual({ code: 'SALPYEO-VERTICAL-001', message: '알 수 없는 시설 종류예요.' });
  });

  it('시설 목록: 기본 가격 낮은순', async () => {
    const res = await request(app.getHttpServer()).get('/salpyeo/facilities?vertical=post').expect(200);
    expect(res.body.code).toBe('OK');
    expect(res.body.item.facilities.map((f: any) => f.slug)).toEqual(['p1', 'p2', 'p3', 'p4']);
    expect(res.body.item.facilities.map((f: any) => f.price)).toEqual([4800000, 5200000, 5450000, 6100000]);
  });

  it('시설 목록: 평점 높은순 정렬', async () => {
    const res = await request(app.getHttpServer()).get('/salpyeo/facilities?vertical=post&sort=ratingDesc').expect(200);
    expect(res.body.item.facilities[0]).toMatchObject({ slug: 'p4', name: '소풍 산후조리원', rating: 4.7 });
  });

  it('시설 목록: 검색어·slug 필터', async () => {
    const byKeyword = await request(app.getHttpServer()).get('/salpyeo/facilities').query({ vertical: 'post', q: '라온' }).expect(200);
    expect(byKeyword.body.item.facilities.map((f: any) => f.name)).toEqual(['라온 산후조리원']);

    const bySlugs = await request(app.getHttpServer()).get('/salpyeo/facilities?vertical=post&slugs=p2,p1').expect(200);
    expect(bySlugs.body.item.facilities.map((f: any) => f.slug)).toEqual(['p1', 'p2']);
  });

  it('시설 목록: vertical 누락·오타는 400', async () => {
    await request(app.getHttpServer()).get('/salpyeo/facilities').expect(400);
    const res = await request(app.getHttpServer()).get('/salpyeo/facilities?vertical=hospital').expect(400);
    expect(res.body.code).toBe('BAD_REQUEST');
  });

  it('시설 상세: 프론트 계약 형태', async () => {
    const res = await request(app.getHttpServer()).get('/salpyeo/facilities/p1').expect(200);
    const f = res.body.item;
    expect(f).toMatchObject({
      slug: 'p1',
      vertical: 'post',
      name: '라온 산후조리원',
      meta: '정자역 도보 6분',
      distance: { label: '차 8분', minutes: 8 },
      badges: { inspection: '점검 지적 없음', feature: '모자동실' },
      price: 4800000,
      rating: 4.6,
      reviewCount: 128,
      vsAvgPercent: -7,
      review: { meta: '2026.07 이용' },
    });
    expect(f.images).toHaveLength(5);
    expect(f.images[0]).toMatchObject({ alt: '건물 외관', width: 1200, height: 800 });
    expect(f.priceRows).toHaveLength(3);
    expect(f.priceRows[0]).toEqual({ room: '일반실', note: '2주 · 모자동실 선택 가능', price: '480만원' });
    expect(f.inspections).toHaveLength(2);
  });

  it('시설 상세: 없는 slug 는 404', async () => {
    const res = await request(app.getHttpServer()).get('/salpyeo/facilities/zzz').expect(404);
    expect(res.body).toEqual({ code: 'SALPYEO-FACILITY-001', message: '시설을 찾을 수 없어요.' });
  });
});
