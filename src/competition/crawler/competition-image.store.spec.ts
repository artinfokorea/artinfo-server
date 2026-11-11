import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { CompetitionImageStore } from './competition-image.store';

/**
 * 기대값: 원 사이트 이미지를 받아 S3 upload/competitions/{folder}/{url 해시}.{확장자} 로 올리고 그 URL 을 돌려준다.
 * 이미 우리 S3 URL 이면 그대로, 다운로드 실패·이미지가 아님·S3 실패는 null (여러 장에서는 빠진다)
 */
describe('CompetitionImageStore', () => {
  const s3 = {
    uploadStream: jest.fn(async (_b: Buffer, _m: string, key: string) => ({
      key,
      tag: '',
      location: `https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/${key}`,
    })),
  };
  const downloader = { download: jest.fn() };
  const store = new CompetitionImageStore(s3 as unknown as AwsS3Service, downloader);

  beforeEach(() => jest.clearAllMocks());

  it('받아서 S3 에 올리고 우리 URL 을 돌려준다', async () => {
    downloader.download.mockResolvedValueOnce({ buffer: Buffer.from('jpg'), contentType: 'image/jpeg' });
    const url = await store.store('https://contest.co.kr/data/media/image/contest/202611/imgm_1.jpg', '23151');
    expect(url).toMatch(/^https:\/\/artinfo\.s3\.ap-northeast-2\.amazonaws\.com\/prod\/upload\/competitions\/23151\/[0-9a-f]{16}\.jpg$/);
    expect(s3.uploadStream).toHaveBeenCalledWith(Buffer.from('jpg'), 'image/jpeg', expect.stringMatching(/^upload\/competitions\/23151\/[0-9a-f]{16}\.jpg$/));
  });

  it('같은 원본은 같은 키, 우리 URL 은 그대로', async () => {
    downloader.download.mockResolvedValue({ buffer: Buffer.from('png'), contentType: 'image/png; charset=binary' });
    const a = await store.store('https://contest.co.kr/x.png', 'f');
    const b = await store.store('https://contest.co.kr/x.png', 'f');
    expect(a).toBe(b);
    expect(a).toMatch(/\.png$/);
    const ours = 'https://artinfo.s3.ap-northeast-2.amazonaws.com/prod/upload/4637/images/a.png';
    await expect(store.store(ours, 'f')).resolves.toBe(ours);
    expect(downloader.download).toHaveBeenCalledTimes(2);
  });

  it('실패한 이미지는 null, 여러 장에서는 빠진다', async () => {
    downloader.download
      .mockResolvedValueOnce({ buffer: Buffer.from('ok'), contentType: 'image/jpeg' })
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({ buffer: Buffer.from('<html>'), contentType: 'text/html' });
    const urls = await store.storeAll(['https://a/1.jpg', 'https://a/2.jpg', 'https://a/3.jpg'], 'f');
    expect(urls).toHaveLength(1);
    expect(s3.uploadStream).toHaveBeenCalledTimes(1);
  });
});
