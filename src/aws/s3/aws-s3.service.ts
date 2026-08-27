import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, PutObjectCommandOutput, ObjectCannedACL, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import * as path from 'path';
import { UploadImageIsNotValid } from '@/system/exception/system.exception';

export interface AwsS3UploadResult {
  key: string;
  tag: string;
  location: string;
}

@Injectable()
export class AwsS3Service {
  private s3Client: S3Client;
  private BUCKET = 'artinfo';

  constructor() {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: process.env['AWS_ACCESS_KEY']!,
        secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY']!,
      },
      region: process.env['AWS_REGION'],
    });
  }

  async uploadStream(
    buffer: Buffer,
    mimetype: string,
    uploadFilePath: string,
    contentDisposition?: string,
    // 기본은 공개(기존 프로젝트 호환). 온기처럼 비공개가 필요하면 private 을 넘기고 조회 시 presigned URL 을 쓴다
    acl: ObjectCannedACL = ObjectCannedACL.public_read,
  ): Promise<AwsS3UploadResult | null> {
    const uploadParams = {
      Bucket: this.BUCKET,
      Body: buffer,
      ContentType: mimetype,
      Key: path.posix.join(process.env['NODE_ENV']!, uploadFilePath),
      ACL: acl,
      // 첨부파일 다운로드 시 원본 파일명을 강제하기 위해 Content-Disposition을 지정한다(이미지 등은 미지정).
      ...(contentDisposition ? { ContentDisposition: contentDisposition } : {}),
    };

    const command = new PutObjectCommand(uploadParams);

    try {
      const data: PutObjectCommandOutput = await this.s3Client.send(command);

      return {
        key: uploadParams.Key,
        tag: data.ETag ?? '',
        location: `https://${this.BUCKET}.s3.${process.env['AWS_REGION']}.amazonaws.com/${uploadParams.Key}`,
      };
    } catch (err) {
      console.error('Error uploading to S3:', err);
      throw new UploadImageIsNotValid();
    }
  }

  /** 이 버킷의 공개 URL 이면 객체 키로, 아니면 null (다른 호스트의 이미지는 건드리지 않는다) */
  keyOfUrl(url: string): string | null {
    const prefix = `https://${this.BUCKET}.s3.${process.env['AWS_REGION']}.amazonaws.com/`;
    if (!url.startsWith(prefix)) return null;
    const key = decodeURIComponent(url.slice(prefix.length).split('?')[0]);
    return key.length > 0 ? key : null;
  }

  /**
   * URL 목록에 해당하는 객체를 삭제한다 (best-effort — 실패해도 예외를 던지지 않고 로그만 남긴다).
   * DB 삭제가 이미 끝난 뒤 호출되므로, S3 장애가 사용자 요청을 실패시키지 않게 한다.
   */
  async deleteByUrls(urls: string[]): Promise<void> {
    const keys = [...new Set(urls.map(url => this.keyOfUrl(url)).filter((k): k is string => k !== null))];
    if (keys.length === 0) return;

    // DeleteObjects 는 요청당 최대 1000개
    for (let i = 0; i < keys.length; i += 1000) {
      const chunk = keys.slice(i, i + 1000);
      try {
        await this.s3Client.send(
          new DeleteObjectsCommand({ Bucket: this.BUCKET, Delete: { Objects: chunk.map(Key => ({ Key })), Quiet: true } }),
        );
      } catch (err) {
        console.error('Error deleting from S3:', err);
      }
    }
  }
}
