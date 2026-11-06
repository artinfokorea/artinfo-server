import axios from 'axios';
import { generateKeyPairSync } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { AppleIdentityTokenVerifier } from '@/auth/service/apple-identity-token.verifier';
import { AppleIdentityTokenIsNotValid } from '@/auth/exception/auth.exception';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

/**
 * 기대값: 앱이 넘긴 Apple identity token(JWT) 을 Apple JWKS 공개키로 검증해 sub·email 을 돌려준다.
 * - iss 는 https://appleid.apple.com, aud 는 앱 번들 ID(com.artinfokorea.app) 여야 한다.
 * - 서명이 다르거나 aud 가 다르거나 kid 를 모르면 AppleIdentityTokenIsNotValid.
 */
describe('AppleIdentityTokenVerifier', () => {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const other = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = publicKey.export({ format: 'jwk' }) as { n: string; e: string };
  const appleKeys = { keys: [{ kty: 'RSA', kid: 'apple-kid-1', use: 'sig', alg: 'RS256', n: jwk.n, e: jwk.e }] };

  const sign = (payload: object, key = privateKey, kid = 'apple-kid-1') => jwt.sign(payload, key, { algorithm: 'RS256', keyid: kid, expiresIn: '5m' });

  let verifier: AppleIdentityTokenVerifier;

  beforeEach(() => {
    verifier = new AppleIdentityTokenVerifier();
    mockedAxios.get.mockReset();
    mockedAxios.get.mockResolvedValue({ data: appleKeys });
    delete process.env['APPLE_CLIENT_IDS'];
  });

  it('올바른 토큰이면 sub 와 email 을 돌려준다', async () => {
    const token = sign({ iss: 'https://appleid.apple.com', aud: 'com.artinfokorea.app', sub: '001234.abcd', email: 'user@privaterelay.appleid.com' });

    await expect(verifier.verify(token)).resolves.toEqual({ sub: '001234.abcd', email: 'user@privaterelay.appleid.com' });
    expect(mockedAxios.get).toHaveBeenCalledWith('https://appleid.apple.com/auth/keys', expect.anything());
  });

  it('email 이 없는 토큰이면 email 은 null 이다', async () => {
    const token = sign({ iss: 'https://appleid.apple.com', aud: 'com.artinfokorea.app', sub: '001234.abcd' });

    await expect(verifier.verify(token)).resolves.toEqual({ sub: '001234.abcd', email: null });
  });

  it('aud 가 우리 앱이 아니면 거부한다', async () => {
    const token = sign({ iss: 'https://appleid.apple.com', aud: 'com.other.app', sub: '001234.abcd' });

    await expect(verifier.verify(token)).rejects.toBeInstanceOf(AppleIdentityTokenIsNotValid);
  });

  it('APPLE_CLIENT_IDS 에 나열된 aud 는 모두 허용한다', async () => {
    process.env['APPLE_CLIENT_IDS'] = 'com.artinfokorea.app,com.artinfokorea.web';
    const token = sign({ iss: 'https://appleid.apple.com', aud: 'com.artinfokorea.web', sub: '001234.abcd' });

    await expect(verifier.verify(token)).resolves.toEqual({ sub: '001234.abcd', email: null });
  });

  it('Apple 키로 서명되지 않은 토큰은 거부한다', async () => {
    const token = sign({ iss: 'https://appleid.apple.com', aud: 'com.artinfokorea.app', sub: '001234.abcd' }, other.privateKey);

    await expect(verifier.verify(token)).rejects.toBeInstanceOf(AppleIdentityTokenIsNotValid);
  });

  it('모르는 kid 면 거부한다', async () => {
    const token = sign({ iss: 'https://appleid.apple.com', aud: 'com.artinfokorea.app', sub: '001234.abcd' }, privateKey, 'unknown-kid');

    await expect(verifier.verify(token)).rejects.toBeInstanceOf(AppleIdentityTokenIsNotValid);
  });

  it('iss 가 Apple 이 아니면 거부한다', async () => {
    const token = sign({ iss: 'https://evil.example.com', aud: 'com.artinfokorea.app', sub: '001234.abcd' });

    await expect(verifier.verify(token)).rejects.toBeInstanceOf(AppleIdentityTokenIsNotValid);
  });

  it('JWT 가 아닌 문자열은 거부한다', async () => {
    await expect(verifier.verify('not-a-jwt')).rejects.toBeInstanceOf(AppleIdentityTokenIsNotValid);
  });

  it('JWKS 는 캐시해서 두 번째 검증엔 다시 받지 않는다', async () => {
    const token = sign({ iss: 'https://appleid.apple.com', aud: 'com.artinfokorea.app', sub: '001234.abcd' });

    await verifier.verify(token);
    await verifier.verify(token);

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });
});
