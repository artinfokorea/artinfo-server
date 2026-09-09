import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ResponseInterceptor } from '@/common/interceptor/interceptor';
import { HttpExceptionFilter } from '@/common/exception/http-exception-filter';
import { SALPYEO_FACILITY_REPOSITORY } from '@/salpyeo/facility/domain/repository/salpyeo-facility.repository.interface';
import { SalpyeoFacilityMemoryRepository } from '@/salpyeo/facility/infrastructure/repository/salpyeo-facility.memory.repository';
import { SALPYEO_FACILITY_CONTROLLERS, SALPYEO_FACILITY_USE_CASES } from '@/salpyeo/facility/salpyeo-facility.module';

/**
 * 스펙 (프론트 salpyeo-client 가 기대하는 계약. 시드 = 보건복지부 전국 산후조리원 현황 2023-12-31, 456건):
 * 1) GET /salpyeo/verticals → 5개, post 만 enabled, post count 456 · asOf 2023-12-31, 나머지 count 0 · asOf null
 * 2) GET /salpyeo/verticals/post → 단건, 알 수 없는 키는 404 SALPYEO-VERTICAL-001
 * 3) GET /salpyeo/facilities?vertical=post → 456개, 기본 가격 낮은순(청주미즈맘 130만 첫 번째), 일반실 미공개(price 0) 7곳은 맨 뒤
 * 4) sort=ratingDesc → 평점이 전부 0 이라 원본 순번(sortOrder) 순 → 올리비움이 첫 번째
 * 5) q=올리비움 → 1개 / q=종로구 → 2개(위치 요약) / q=정자일로 → 1개(주소) / slugs 2개 → 2개
 * 6) vertical 누락·오타 → 400 BAD_REQUEST
 * 7) GET /salpyeo/facilities/post-a9656bde(올리비움) → region/operator/address/phone 포함, 공공데이터에 없는 값은 빈 값
 * 8) 없는 slug (과거 목데이터 p1 포함) → 404 SALPYEO-FACILITY-001
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

  it('버티컬 목록: 5개, post 만 활성, 시드 기준 시설 수·기준일', async () => {
    const res = await request(app.getHttpServer()).get('/salpyeo/verticals').expect(200);
    expect(res.body.code).toBe('OK');
    const verticals = res.body.item.verticals;
    expect(verticals).toHaveLength(5);
    expect(verticals.map((v: any) => v.key)).toEqual(['post', 'nursing', 'funeral', 'daycare', 'academy']);
    expect(verticals.filter((v: any) => v.enabled).map((v: any) => v.key)).toEqual(['post']);
    expect(verticals.find((v: any) => v.key === 'post')).toMatchObject({
      label: '산후조리원',
      priceLabel: '2주 일반실',
      source: '보건복지부 전국 산후조리원 현황',
      asOf: '2023-12-31',
      count: 456,
    });
    expect(verticals.find((v: any) => v.key === 'nursing')).toMatchObject({ count: 0, asOf: null });
  });

  it('버티컬 단건 / 알 수 없는 키는 404', async () => {
    const ok = await request(app.getHttpServer()).get('/salpyeo/verticals/post').expect(200);
    expect(ok.body.item).toMatchObject({ key: 'post', enabled: true, count: 456 });

    const notFound = await request(app.getHttpServer()).get('/salpyeo/verticals/hospital').expect(404);
    expect(notFound.body).toEqual({ code: 'SALPYEO-VERTICAL-001', message: '알 수 없는 시설 종류예요.' });
  });

  it('시설 목록: 456개, 기본 가격 낮은순, 미공개는 맨 뒤', async () => {
    const res = await request(app.getHttpServer()).get('/salpyeo/facilities?vertical=post').expect(200);
    expect(res.body.code).toBe('OK');
    const facilities = res.body.item.facilities;
    expect(facilities).toHaveLength(456);
    expect(facilities[0]).toMatchObject({ name: '청주미즈맘산후조리원', meta: '충북 청주시', price: 1300000 });
    expect(facilities[1]).toMatchObject({ name: '미앤맘산후조리원', price: 1400000 });
    expect(facilities.slice(-7).map((f: any) => f.price)).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(facilities[448].price).toBe(17000000);
  });

  it('시설 목록: 평점 높은순 정렬 (평점 없으면 원본 순번)', async () => {
    const res = await request(app.getHttpServer()).get('/salpyeo/facilities?vertical=post&sort=ratingDesc').expect(200);
    expect(res.body.item.facilities[0]).toMatchObject({ slug: 'post-a9656bde', name: '올리비움산후조리원', rating: 0 });
  });

  it('시설 목록: 검색어(이름·위치·주소)·slug 필터', async () => {
    const byName = await request(app.getHttpServer()).get('/salpyeo/facilities').query({ vertical: 'post', q: '올리비움' }).expect(200);
    expect(byName.body.item.facilities.map((f: any) => f.name)).toEqual(['올리비움산후조리원']);

    const byRegion = await request(app.getHttpServer()).get('/salpyeo/facilities').query({ vertical: 'post', q: '종로구' }).expect(200);
    expect(byRegion.body.item.facilities.map((f: any) => f.name)).toEqual(['라솜산후조리원(창경궁점)', '올리비움산후조리원']);

    const byAddress = await request(app.getHttpServer()).get('/salpyeo/facilities').query({ vertical: 'post', q: '정자일로' }).expect(200);
    expect(byAddress.body.item.facilities.map((f: any) => f.name)).toEqual(['디에르산후조리원']);

    const bySlugs = await request(app.getHttpServer()).get('/salpyeo/facilities?vertical=post&slugs=post-a9656bde,post-b38efc70').expect(200);
    expect(bySlugs.body.item.facilities.map((f: any) => f.name)).toEqual(['서귀포공공산후조리원', '올리비움산후조리원']);
  });

  it('시설 목록: vertical 누락·오타는 400', async () => {
    await request(app.getHttpServer()).get('/salpyeo/facilities').expect(400);
    const res = await request(app.getHttpServer()).get('/salpyeo/facilities?vertical=hospital').expect(400);
    expect(res.body.code).toBe('BAD_REQUEST');
  });

  it('시설 상세: 프론트 계약 형태 (공공데이터 값 + 빈 값)', async () => {
    const res = await request(app.getHttpServer()).get('/salpyeo/facilities/post-a9656bde').expect(200);
    expect(res.body.item).toEqual({
      slug: 'post-a9656bde',
      vertical: 'post',
      name: '올리비움산후조리원',
      meta: '서울 종로구',
      region: { sido: '서울', sigungu: '종로구' },
      operator: '민간',
      address: '서울시 종로구 통일로 16길 4-1',
      phone: '02-730-1717',
      distance: { label: '', minutes: 0 },
      badges: { inspection: '', feature: '민간 운영' },
      price: 4700000,
      rating: 0,
      reviewCount: 0,
      vsAvgPercent: 9,
      images: [],
      priceRows: [
        { room: '일반실', note: '2주 기준 · 2023.12.31 공개 요금', price: '470만원' },
        { room: '특실', note: '2주 기준 · 2023.12.31 공개 요금', price: '2,000만원' },
      ],
      inspections: [],
      review: null,
    });

    const publicOne = await request(app.getHttpServer()).get('/salpyeo/facilities/post-b38efc70').expect(200);
    expect(publicOne.body.item).toMatchObject({ name: '서귀포공공산후조리원', operator: '지자체', badges: { feature: '지자체 운영' }, vsAvgPercent: -50 });
  });

  it('없는 slug 는 404 (과거 목데이터 p1 포함)', async () => {
    for (const slug of ['nope', 'p1']) {
      const res = await request(app.getHttpServer()).get(`/salpyeo/facilities/${slug}`).expect(404);
      expect(res.body).toEqual({ code: 'SALPYEO-FACILITY-001', message: '시설을 찾을 수 없어요.' });
    }
  });
});
