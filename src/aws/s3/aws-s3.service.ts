import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, PutObjectCommandOutput, ObjectCannedACL } from '@aws-sdk/client-s3';
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

  async uploadStream(buffer: Buffer, mimetype: string, uploadFilePath: string): Promise<AwsS3UploadResult | null> {
    const uploadParams = {
      Bucket: this.BUCKET,
      Body: buffer,
      ContentType: mimetype,
      Key: path.posix.join(process.env['NODE_ENV']!, uploadFilePath),
      ACL: ObjectCannedACL.public_read,
    };

    const command = new PutObjectCommand(uploadParams);

    try {
      const data: PutObjectCommandOutput = await this.s3Client.send(command);

      return {
        key: uploadParams.Key,
        tag: data.ETag ?? '',
        location: `https://${this.BUCKET}.s3.${process.env['AWS_S3_REGION']}.amazonaws.com/${uploadParams.Key}`,
      };
    } catch (err) {
      console.error('Error uploading to S3:', err);
      throw new UploadImageIsNotValid();
    }
  }
}
