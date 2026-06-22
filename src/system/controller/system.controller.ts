import { RestApiController, RestApiDelete, RestApiGet, RestApiPost } from '@/common/decorator/rest-api';
import { ApiConsumes } from '@nestjs/swagger';
import { Body, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadImagesResponse } from '@/system/dto/response/upload-images.response';
import { UploadFilesResponse } from '@/system/dto/response/upload-files.response';
import { USER_TYPE } from '@/user/entity/user.entity';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UploadFile, UserSignature } from '@/common/type/type';
import { UploadImagesRequest } from '@/system/dto/request/upload-images.request';
import { UploadFilesRequest } from '@/system/dto/request/upload-files.request';
import { SystemService } from '@/system/service/system.service';
import { OkResponse } from '@/common/response/ok.response';

@RestApiController('/system', 'System')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @RestApiGet(OkResponse, { path: '/health', description: '헬스체크' })
  async healthCheck() {
    return new OkResponse();
  }

  @RestApiGet(OkResponse, { path: '/error-test', description: '500 에러 테스트' })
  async errorTest() {
    throw new Error('테스트 에러: SystemController.errorTest()에서 발생');
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
  async uploadImages(@AuthSignature() signature: UserSignature, @Body() request: UploadImagesRequest, @UploadedFiles() files: UploadFile[]) {
    const uploadImages = await this.systemService.createImageMany(request.toCreateImagesCommand(signature.id, files));

    return new UploadImagesResponse(uploadImages);
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 32 * 1024 * 1024,
        files: 10,
      },
    }),
  )
  @RestApiPost(UploadFilesResponse, {
    path: '/upload/files',
    description: '일반 첨부파일 업로드(이미지 외 형식, 다운로드용)',
    auth: [USER_TYPE.CLIENT],
  })
  async uploadFiles(@AuthSignature() signature: UserSignature, @Body() _request: UploadFilesRequest, @UploadedFiles() files: UploadFile[]) {
    const uploaded = await this.systemService.uploadFiles(signature.id, files);

    return new UploadFilesResponse(uploaded);
  }

  @RestApiDelete(OkResponse, {
    path: '/caching',
    description: '캐싱 삭제',
    auth: [USER_TYPE.ADMIN],
  })
  async deleteCaching() {
    await this.systemService.deleteCaching();

    return new OkResponse();
  }
}
