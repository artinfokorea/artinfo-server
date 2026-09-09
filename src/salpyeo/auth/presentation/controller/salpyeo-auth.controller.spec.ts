import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ResponseInterceptor } from '@/common/interceptor/interceptor';
import { HttpExceptionFilter } from '@/common/exception/http-exception-filter';
import { JwtStrategy } from '@/common/security/jwt.strategy';
import { SALPYEO_SNS_TYPE } from '@/salpyeo/user/domain/entity/salpyeo-user.entity';
import { SALPYEO_USER_REPOSITORY } from '@/salpyeo/user/domain/repository/salpyeo-user.repository.interface';
import { SalpyeoUserMemoryRepository } from '@/salpyeo/user/infrastructure/repository/salpyeo-user.memory.repository';
import { SalpyeoGetMeUseCase } from '@/salpyeo/user/application/usecase/salpyeo-get-me.usecase';
import { SalpyeoUserController } from '@/salpyeo/user/presentation/controller/salpyeo-user.controller';
import { SALPYEO_AUTH_REPOSITORY } from '@/salpyeo/auth/domain/repository/salpyeo-auth.repository.interface';
import { SalpyeoAuthMemoryRepository } from '@/salpyeo/auth/infrastructure/repository/salpyeo-auth.memory.repository';
import { SALPYEO_SNS_CLIENT, ISalpyeoSnsClient, SalpyeoSnsUserInfo } from '@/salpyeo/auth/domain/service/salpyeo-sns-client.interface';
import { SalpyeoInvalidSnsToken } from '@/salpyeo/auth/domain/exception/salpyeo-auth.exception';
import { SalpyeoTokenIssuer } from '@/salpyeo/auth/infrastructure/service/salpyeo-token.issuer';
import { SalpyeoSnsLoginUseCase } from '@/salpyeo/auth/application/usecase/salpyeo-sns-login.usecase';
import { SalpyeoRefreshTokensUseCase } from '@/salpyeo/auth/application/usecase/salpyeo-refresh-tokens.usecase';
import { SalpyeoAuthController } from '@/salpyeo/auth/presentation/controller/salpyeo-auth.controller';

/** 구글 대신 답하는 가짜 SNS 클라이언트 — 토큰 문자열로 어떤 계정인지 정한다 */
class FakeSnsClient implements ISalpyeoSnsClient {
  profiles = new Map<string, SalpyeoSnsUserInfo>([
    ['google-token-a', { snsId: '1010', name: '김살펴', email: 'salpyeo@example.com', iconImageUrl: 'https://lh3.googleusercontent.com/a' }],
    ['google-token-b', { snsId: '2020', name: null, email: null, iconImageUrl: null }],
  ]);

  async getUserInfo(token: string): Promise<SalpyeoSnsUserInfo> {
    const profile = this.profiles.get(token);
    if (!profile) throw new SalpyeoInvalidSnsToken();

    return profile;
  }
}

/**
 * 스펙 (프론트 salpyeo-client 가 기대하는 계약):
 * 1) POST /salpyeo/auths/login — 미가입 구글 계정이면 자동 가입하고 사용자 + 토큰을 돌려준다
 * 2) 구글이 이름을 주지 않으면 '살펴 사용자', 이메일·사진은 null
 * 3) 같은 구글 계정으로 다시 로그인하면 같은 사용자 id 이고, 바뀐 구글 프로필이 반영된다
 * 4) provider 오타·token 누락은 400, 구글이 거절한 토큰은 400 SALPYEO-AUTH-001
 * 5) GET /salpyeo/users/me — 발급받은 access token 으로 조회, 토큰이 없으면 401 AUTH-001
 * 6) POST /salpyeo/auths/refresh — access token 만 새로 발급하고 refresh token 은 유지한다
 */
describe('Salpyeo auth API (memory repository)', () => {
  let app: INestApplication;
  let snsClient: FakeSnsClient;

  beforeAll(async () => {
    process.env['JWT_TOKEN_KEY'] = 'salpyeo-test-key';
    snsClient = new FakeSnsClient();

    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({}), PassportModule],
      controllers: [SalpyeoAuthController, SalpyeoUserController],
      providers: [
        JwtStrategy,
        SalpyeoTokenIssuer,
        SalpyeoSnsLoginUseCase,
        SalpyeoRefreshTokensUseCase,
        SalpyeoGetMeUseCase,
        { provide: SALPYEO_SNS_CLIENT, useValue: snsClient },
        { provide: SALPYEO_USER_REPOSITORY, useValue: new SalpyeoUserMemoryRepository() },
        { provide: SALPYEO_AUTH_REPOSITORY, useClass: SalpyeoAuthMemoryRepository },
      ],
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

  const login = (token: string) => request(app.getHttpServer()).post('/salpyeo/auths/login').send({ provider: SALPYEO_SNS_TYPE.GOOGLE, token });

  it('미가입 구글 계정이면 자동 가입하고 사용자 + 토큰을 돌려준다', async () => {
    const res = await login('google-token-a').expect(201);

    expect(res.body.code).toBe('OK');
    expect(res.body.item.user).toMatchObject({
      id: '1',
      name: '김살펴',
      provider: 'google',
      email: 'salpyeo@example.com',
      avatarUrl: 'https://lh3.googleusercontent.com/a',
    });
    expect(Object.keys(res.body.item.tokens).sort()).toEqual(['accessToken', 'accessTokenExpiresIn', 'refreshToken', 'refreshTokenExpiresIn']);
    expect(typeof res.body.item.tokens.accessToken).toBe('string');
  });

  it('구글이 이름을 주지 않으면 기본 이름, 이메일·사진은 null', async () => {
    const res = await login('google-token-b').expect(201);

    expect(res.body.item.user).toMatchObject({ id: '2', name: '살펴 사용자', email: null, avatarUrl: null });
  });

  it('같은 계정으로 다시 로그인하면 같은 사용자 id 이고 바뀐 구글 프로필이 반영된다', async () => {
    snsClient.profiles.set('google-token-a', {
      snsId: '1010',
      name: '김살펴2',
      email: 'changed@example.com',
      iconImageUrl: 'https://lh3.googleusercontent.com/b',
    });

    const res = await login('google-token-a').expect(201);

    expect(res.body.item.user).toMatchObject({
      id: '1',
      name: '김살펴2',
      email: 'changed@example.com',
      avatarUrl: 'https://lh3.googleusercontent.com/b',
    });
  });

  it('provider 오타·token 누락은 400, 구글이 거절한 토큰은 400 SALPYEO-AUTH-001', async () => {
    await request(app.getHttpServer()).post('/salpyeo/auths/login').send({ provider: 'kakao', token: 'google-token-a' }).expect(400);
    await request(app.getHttpServer()).post('/salpyeo/auths/login').send({ provider: SALPYEO_SNS_TYPE.GOOGLE }).expect(400);

    const rejected = await login('expired-token').expect(400);
    expect(rejected.body.code).toBe('SALPYEO-AUTH-001');
  });

  it('발급받은 access token 으로 내 정보를 조회한다 (토큰 없으면 401)', async () => {
    const { body } = await login('google-token-a');
    const accessToken = body.item.tokens.accessToken;

    const me = await request(app.getHttpServer()).get('/salpyeo/users/me').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(me.body.item).toMatchObject({ id: '1', name: '김살펴2', provider: 'google' });

    const anonymous = await request(app.getHttpServer()).get('/salpyeo/users/me').expect(401);
    expect(anonymous.body.code).toBe('AUTH-001');
  });

  it('refresh 는 access token 만 새로 발급하고 refresh token 은 유지한다', async () => {
    const { body } = await login('google-token-b');
    const { accessToken, refreshToken } = body.item.tokens;

    const res = await request(app.getHttpServer()).post('/salpyeo/auths/refresh').send({ accessToken, refreshToken }).expect(201);

    expect(res.body.item.refreshToken).toBe(refreshToken);
    expect(typeof res.body.item.accessToken).toBe('string');
  });
});
