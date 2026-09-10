import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ResponseInterceptor } from '@/common/interceptor/interceptor';
import { HttpExceptionFilter } from '@/common/exception/http-exception-filter';
import { JwtStrategy } from '@/common/security/jwt.strategy';
import { AwsS3Service, AwsS3UploadResult } from '@/aws/s3/aws-s3.service';
import { SalpyeoAdminGuard } from '@/salpyeo/common/salpyeo-admin.guard';
import { SALPYEO_SNS_TYPE, SALPYEO_USER_ROLE } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';
import { SALPYEO_USER_REPOSITORY } from '@/salpyeo/user/domain/repository/salpyeo-user.repository.interface';
import { SalpyeoUserMemoryRepository } from '@/salpyeo/user/infrastructure/repository/salpyeo-user.memory.repository';
import { SalpyeoTokenIssuer } from '@/salpyeo/auth/infrastructure/service/salpyeo-token.issuer';
import { SALPYEO_INQUIRY_REPOSITORY } from '@/salpyeo/inquiry/domain/repository/salpyeo-inquiry.repository.interface';
import { SalpyeoInquiryMemoryRepository } from '@/salpyeo/inquiry/infrastructure/repository/salpyeo-inquiry.memory.repository';
import { SALPYEO_INQUIRY_CONTROLLERS, SALPYEO_INQUIRY_USE_CASES } from '@/salpyeo/inquiry/salpyeo-inquiry.module';

class FakeS3Service {
  uploads: string[] = [];

  async uploadStream(_buffer: Buffer, _mimetype: string, uploadFilePath: string): Promise<AwsS3UploadResult> {
    this.uploads.push(uploadFilePath);

    return { key: uploadFilePath, tag: 'etag', location: `https://artinfo.s3.ap-northeast-2.amazonaws.com/test/${uploadFilePath}` };
  }
}

/** 3x2 회색 PNG */
const PNG_3X2 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAIAAAASFvFNAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADklEQVR4nGM4AQMMcBYAjLQOETxAoQ8AAAAASUVORK5CYII=',
  'base64',
);

/**
 * 스펙 (문의 페이지가 기대하는 계약):
 * 1) POST /salpyeo/inquiries — **비로그인 공개**. 제목·내용·이메일로 접수하고 접수번호를 돌려준다
 * 2) 이미지 첨부(최대 10장)는 S3 에 올리고 URL 을 함께 저장한다. 이미지가 아닌 파일·10장 초과는 400
 * 3) 값 검증: 제목·내용·이메일 필수, 이메일 형식, 제목 100자·내용 2000자 초과는 400
 * 4) GET /salpyeo/admin/inquiries — 관리자만. 최근 접수가 먼저. 비로그인 401 · 일반 사용자 403
 * 5) PUT /salpyeo/admin/inquiries/:id/resolved — 처리 완료 표시 토글
 */
describe('Salpyeo inquiry API (memory repository)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let s3: FakeS3Service;

  beforeAll(async () => {
    process.env['JWT_TOKEN_KEY'] = 'salpyeo-inquiry-test-key';
    s3 = new FakeS3Service();
    const userRepository = new SalpyeoUserMemoryRepository();

    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({}), PassportModule],
      controllers: SALPYEO_INQUIRY_CONTROLLERS,
      providers: [
        JwtStrategy,
        SalpyeoAdminGuard,
        SalpyeoTokenIssuer,
        ...SALPYEO_INQUIRY_USE_CASES,
        { provide: AwsS3Service, useValue: s3 },
        { provide: SALPYEO_INQUIRY_REPOSITORY, useValue: new SalpyeoInquiryMemoryRepository() },
        { provide: SALPYEO_USER_REPOSITORY, useValue: userRepository },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();

    const issuer = moduleRef.get(SalpyeoTokenIssuer);
    const admin = await userRepository.create({ name: '관리자', snsType: SALPYEO_SNS_TYPE.GOOGLE, snsId: 'admin', email: null, iconImageUrl: null });
    admin.role = SALPYEO_USER_ROLE.ADMIN;
    const member = await userRepository.create({ name: '일반', snsType: SALPYEO_SNS_TYPE.GOOGLE, snsId: 'member', email: null, iconImageUrl: null });
    adminToken = issuer.issueAccessToken(admin).token;
    userToken = issuer.issueAccessToken(member).token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('비로그인으로 문의를 접수한다', async () => {
    const res = await request(app.getHttpServer())
      .post('/salpyeo/inquiries')
      .field('title', '요금 정보가 실제와 달라요')
      .field('content', '올리비움산후조리원 2주 요금이 홈페이지와 다릅니다.')
      .field('email', 'mom@example.com')
      .expect(201);

    expect(res.body.code).toBe('OK');
    expect(res.body.item).toMatchObject({ title: '요금 정보가 실제와 달라요', email: 'mom@example.com', isResolved: false });
    expect(res.body.item.id).toEqual(expect.any(Number));
    expect(res.body.item.images).toEqual([]);
  });

  it('이미지를 첨부하면 S3 에 올리고 URL 을 함께 저장한다 (이미지가 아니면 400)', async () => {
    const res = await request(app.getHttpServer())
      .post('/salpyeo/inquiries')
      .field('title', '사진이 실제와 달라요')
      .field('content', '방 사진이 다른 곳 사진 같습니다.')
      .field('email', 'mom2@example.com')
      .attach('imageFiles', PNG_3X2, { filename: 'a.png', contentType: 'image/png' })
      .attach('imageFiles', PNG_3X2, { filename: 'b.png', contentType: 'image/png' })
      .expect(201);

    expect(res.body.item.images).toHaveLength(2);
    expect(res.body.item.images[0]).toMatch(/^https:\/\/artinfo\.s3\./);
    expect(s3.uploads.at(-1)).toMatch(/^salpyeo\/inquiries\/\d{4}-\d{2}\/.+\.png$/);

    const notImage = await request(app.getHttpServer())
      .post('/salpyeo/inquiries')
      .field('title', '제목')
      .field('content', '내용')
      .field('email', 'mom3@example.com')
      .attach('imageFiles', Buffer.from('hello'), { filename: 'a.txt', contentType: 'text/plain' })
      .expect(400);
    expect(notImage.body.code).toBe('SALPYEO-INQUIRY-001');
  });

  it('사진 10장까지 붙일 수 있고, 넘기면 400', async () => {
    const withTen = request(app.getHttpServer())
      .post('/salpyeo/inquiries')
      .field('title', '사진 여러 장')
      .field('content', '여러 각도에서 찍었습니다.')
      .field('email', 'mom10@example.com');
    for (let i = 0; i < 10; i++) withTen.attach('imageFiles', PNG_3X2, { filename: `${i}.png`, contentType: 'image/png' });

    const res = await withTen.expect(201);
    expect(res.body.item.images).toHaveLength(10);

    const withEleven = request(app.getHttpServer())
      .post('/salpyeo/inquiries')
      .field('title', '사진 너무 많음')
      .field('content', '11장')
      .field('email', 'mom11@example.com');
    for (let i = 0; i < 11; i++) withEleven.attach('imageFiles', PNG_3X2, { filename: `${i}.png`, contentType: 'image/png' });
    await withEleven.expect(400);
  });

  it('값 검증 — 필수값 누락·이메일 형식 오류·길이 초과는 400', async () => {
    await request(app.getHttpServer()).post('/salpyeo/inquiries').field('content', '내용').field('email', 'a@b.com').expect(400);
    await request(app.getHttpServer()).post('/salpyeo/inquiries').field('title', '제목').field('email', 'a@b.com').expect(400);
    await request(app.getHttpServer()).post('/salpyeo/inquiries').field('title', '제목').field('content', '내용').field('email', '이메일아님').expect(400);
    await request(app.getHttpServer())
      .post('/salpyeo/inquiries')
      .field('title', 'ㄱ'.repeat(101))
      .field('content', '내용')
      .field('email', 'a@b.com')
      .expect(400);
    await request(app.getHttpServer())
      .post('/salpyeo/inquiries')
      .field('title', '제목')
      .field('content', 'ㄱ'.repeat(2001))
      .field('email', 'a@b.com')
      .expect(400);
  });

  it('관리자만 목록을 본다 — 최근 접수가 먼저', async () => {
    await request(app.getHttpServer()).get('/salpyeo/admin/inquiries').expect(401);
    await request(app.getHttpServer()).get('/salpyeo/admin/inquiries').set('Authorization', `Bearer ${userToken}`).expect(403);

    const res = await request(app.getHttpServer()).get('/salpyeo/admin/inquiries').set('Authorization', `Bearer ${adminToken}`).expect(200);
    const inquiries = res.body.item.inquiries;
    expect(inquiries).toHaveLength(3);
    expect(inquiries.map((i: { title: string }) => i.title)).toEqual(['사진 여러 장', '사진이 실제와 달라요', '요금 정보가 실제와 달라요']);
  });

  it('처리 완료를 표시한다', async () => {
    const list = await request(app.getHttpServer()).get('/salpyeo/admin/inquiries').set('Authorization', `Bearer ${adminToken}`);
    const id = list.body.item.inquiries[0].id;

    const done = await request(app.getHttpServer())
      .put(`/salpyeo/admin/inquiries/${id}/resolved`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isResolved: true })
      .expect(200);
    expect(done.body.item).toMatchObject({ id, isResolved: true });

    await request(app.getHttpServer()).put(`/salpyeo/admin/inquiries/${id}/resolved`).send({ isResolved: true }).expect(401);
    await request(app.getHttpServer())
      .put('/salpyeo/admin/inquiries/99999/resolved')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isResolved: true })
      .expect(404);
  });
});
