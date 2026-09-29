import { CanActivate, Controller, ExecutionContext, Get, INestApplication, Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { OngiActivityModule } from '@/ongi/activity/ongi-activity.module';
import { ONGI_ACTIVITY_REPOSITORY } from '@/ongi/activity/domain/repository/ongi-activity.repository.interface';

/** 토큰 'token-a' 는 사용자 30, 그 밖의 토큰은 거부 */
@Injectable()
class FakeAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.headers.authorization !== 'Bearer token-a') throw new UnauthorizedException();
    req.user = { id: 30, name: '엄마' };

    return true;
  }
}

@Controller()
class FakeController {
  @UseGuards(FakeAuthGuard)
  @Get('/ongi/photos/feed')
  feed() {
    return { ok: true };
  }

  @UseGuards(FakeAuthGuard)
  @Get('/ongi/users/me')
  me() {
    return { ok: true };
  }

  @Get('/ongi/legal/terms')
  terms() {
    return { ok: true };
  }

  @UseGuards(FakeAuthGuard)
  @Get('/ongi/admin/dashboard')
  adminDashboard() {
    return { ok: true };
  }

  @UseGuards(FakeAuthGuard)
  @Get('/azeyo/posts')
  otherService() {
    return { ok: true };
  }
}

const settle = () => new Promise(resolve => setImmediate(resolve));

describe('OngiActivityMiddleware — 어떤 요청을 접속으로 세는가', () => {
  let app: INestApplication;
  let touched: { userId: number; accessToken: string }[];

  beforeEach(async () => {
    touched = [];
    const moduleRef = await Test.createTestingModule({ imports: [OngiActivityModule], controllers: [FakeController], providers: [FakeAuthGuard] })
      .overrideProvider(ONGI_ACTIVITY_REPOSITORY)
      .useValue({
        touch: async (userId: number, accessToken: string) => {
          touched.push({ userId, accessToken });
        },
        addPing: async () => undefined,
      })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('로그인한 사용자의 온기 API 요청이 성공하면 센다', async () => {
    await request(app.getHttpServer()).get('/ongi/photos/feed').set('Authorization', 'Bearer token-a').expect(200);
    await settle();

    expect(touched).toEqual([{ userId: 30, accessToken: 'token-a' }]);
  });

  it('같은 사용자가 여러 API 를 불러도 5분 안에는 한 번만 쓴다', async () => {
    await request(app.getHttpServer()).get('/ongi/photos/feed').set('Authorization', 'Bearer token-a').expect(200);
    await request(app.getHttpServer()).get('/ongi/users/me').set('Authorization', 'Bearer token-a').expect(200);
    await settle();

    expect(touched).toEqual([{ userId: 30, accessToken: 'token-a' }]);
  });

  it('인증에 실패한 요청은 세지 않는다', async () => {
    await request(app.getHttpServer()).get('/ongi/photos/feed').set('Authorization', 'Bearer wrong').expect(401);
    await settle();

    expect(touched).toEqual([]);
  });

  it('로그인 없이 보는 API(약관)는 세지 않는다', async () => {
    await request(app.getHttpServer()).get('/ongi/legal/terms').expect(200);
    await settle();

    expect(touched).toEqual([]);
  });

  it('관리자 페이지 요청은 세지 않는다', async () => {
    await request(app.getHttpServer()).get('/ongi/admin/dashboard').set('Authorization', 'Bearer token-a').expect(200);
    await settle();

    expect(touched).toEqual([]);
  });

  it('다른 서비스(azeyo 등)의 요청은 세지 않는다', async () => {
    await request(app.getHttpServer()).get('/azeyo/posts').set('Authorization', 'Bearer token-a').expect(200);
    await settle();

    expect(touched).toEqual([]);
  });
});
