import { RestApiController, RestApiDelete, RestApiPost } from '@/common/decorator/rest-api';
import { ApiConsumes } from '@nestjs/swagger';
import { Body, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadImagesResponse } from '@/system/dto/response/upload-images.response';
import { USER_TYPE } from '@/user/entity/user.entity';
import { Signature } from '@/common/decorator/signature';
import { UploadFile, UserSignature } from '@/common/type/type';
import { UploadImagesRequest } from '@/system/dto/request/upload-images.request';
import { SystemService } from '@/system/service/system.service';
import { OkResponse } from '@/common/response/ok.response';

@RestApiController('/system', 'System')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

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
    const uploadImages = await this.systemService.createImageMany(request.toCreateImagesCommand(signature.id, files));

    return new UploadImagesResponse(uploadImages);
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
