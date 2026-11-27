import { avatarPath, HOLY365_AVATAR_MAX_BYTES, isAllowedAvatar } from '@/holy365/user/domain/service/holy365-avatar-policy';

describe('isAllowedAvatar — 프로필 사진으로 받을 파일', () => {
  it('jpeg · png · webp · gif 이고 10MB 이하면 통과', () => {
    expect(isAllowedAvatar('image/jpeg', 1024)).toBe(true);
    expect(isAllowedAvatar('image/png', HOLY365_AVATAR_MAX_BYTES)).toBe(true);
    expect(isAllowedAvatar('image/webp', 10)).toBe(true);
    expect(isAllowedAvatar('image/gif', 10)).toBe(true);
  });

  it('이미지가 아니거나 너무 크거나 비었으면 거부', () => {
    expect(isAllowedAvatar('application/pdf', 1024)).toBe(false);
    expect(isAllowedAvatar('image/svg+xml', 1024)).toBe(false);
    expect(isAllowedAvatar('image/jpeg', HOLY365_AVATAR_MAX_BYTES + 1)).toBe(false);
    expect(isAllowedAvatar('image/jpeg', 0)).toBe(false);
  });
});

describe('avatarPath — S3 경로', () => {
  it('holy365/avatars/{userId}/{랜덤}.webp', () => {
    expect(avatarPath(42, 'abc123', 1700000000000)).toBe('holy365/avatars/42/abc123.1700000000000.webp');
  });
});
