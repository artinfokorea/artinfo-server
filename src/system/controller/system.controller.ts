import { RestApiController, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { province } from '@/system/entity/province';
import { ProvinceAllResponse } from '@/system/dto/response/province-all.response';
import { ApiConsumes } from '@nestjs/swagger';
import { Body, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadImagesResponse } from '@/system/dto/response/upload-images.response';
import { USER_TYPE } from '@/user/entity/user.entity';
import { Signature } from '@/common/decorator/signature';
import { UploadFile, UserSignature } from '@/common/type/type';
import { UploadImagesRequest } from '@/system/dto/request/upload-images.request';
import { SystemService } from '@/system/service/system.service';
import * as moment from 'moment';
import { UploadImageIsNotValid } from '@/system/exception/system.exception';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';

@RestApiController('/system', 'System')
export class SystemController {
  constructor(
    private readonly systemService: SystemService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  @RestApiGet(ProvinceAllResponse, { path: '/province', description: '행정 구역 조회' })
  async getProvince() {
    return new ProvinceAllResponse(province);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('imageFiles', 10, {
      limits: {
        fileSize: 32 * 1024 * 1024,
        files: 10,
      },
    }),
  )
  @RestApiPost(UploadImagesResponse, {
    path: '/upload/images',
    description: '이미지 목록 업로드',
    auth: [USER_TYPE.CLIENT],
  })
  async uploadImages(@Signature() signature: UserSignature, @Body() request: UploadImagesRequest, @UploadedFiles() files: UploadFile[]) {
    const imageMetas = await this.systemService.getUploadImageMetasOrThrow(files);

    const uploadImages = [];
    for (const imageMeta of imageMetas) {
      const groupPath = ['upload', signature.id, 'images', moment().format('YYYYMMDD')].join('/');
      const filename = imageMeta.hash + '.' + Date.now() + '.' + imageMeta.extension;
      const path = [groupPath, 'original', filename].join('/');

      const result = await this.awsS3Service.uploadStream(imageMeta.buffer, imageMeta.mimeType, path);
      if (result == null) {
        throw new UploadImageIsNotValid();
      }

      const imagePayload = {
        userId: signature.id,
        target: request.target,
        originalFilename: imageMeta.filename,
        groupPath: groupPath,
        savedFilename: filename,
        savedPath: result.key,
        mimeType: imageMeta.mimeType,
        width: imageMeta.width,
        height: imageMeta.height,
        size: imageMeta.size,
      };

      uploadImages.push(uploadImage);
    }
    const uploadImage = await this.systemService.create(imagePayload);

    return new UploadImagesResponse(uploadImages);
  }
}
