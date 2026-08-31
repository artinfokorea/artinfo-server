import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { NotBlank } from '@/common/decorator/validator';
import { OngiUploadPhotosCommand } from '@/ongi/photo/application/command/ongi-upload-photos.command';

const toNumberIds = (ids: string[] | undefined): number[] => (ids ?? []).map(id => Number(id)).filter(id => Number.isInteger(id));

export class OngiUploadPhotoItemRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '사진 URL' })
  url: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false, description: '목록용 축소본 URL (업로드 응답의 thumbUrls)' })
  thumbUrl?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, required: false, description: '세로 비율 힌트 (width/height)', example: 1 })
  aspectRatio?: number;
}

export class OngiUploadTargetRequest {
  @NotBlank()
  @ApiProperty({ type: String, required: true, description: '게시할 그룹 id', example: '1' })
  groupId: string;

  @IsOptional()
  @ApiProperty({ type: String, required: false, description: '담을 앨범 id', example: '2' })
  albumId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], required: false, description: '함께 찍힌 인물 id 목록', example: ['3'] })
  personIds?: string[];
}

export class OngiUploadPhotosRequest {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OngiUploadPhotoItemRequest)
  @ApiProperty({ type: [OngiUploadPhotoItemRequest], required: true, description: '올릴 사진 목록' })
  photos: OngiUploadPhotoItemRequest[];

  @IsOptional()
  @MaxLength(500)
  @ApiProperty({ type: String, required: false, description: '문구 (첫 사진에만 저장)', example: '오늘 공원에서' })
  caption?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OngiUploadTargetRequest)
  @ApiProperty({ type: [OngiUploadTargetRequest], required: true, description: '게시 대상 그룹 목록' })
  targets: OngiUploadTargetRequest[];

  toCommand(): OngiUploadPhotosCommand {
    return new OngiUploadPhotosCommand({
      photos: this.photos.map(photo => ({ url: photo.url.trim(), thumbUrl: photo.thumbUrl?.trim() || null, aspectRatio: photo.aspectRatio ?? 1 })),
      caption: this.caption?.trim() || null,
      targets: this.targets.map(target => ({
        groupId: Number(target.groupId),
        albumId: target.albumId ? Number(target.albumId) : null,
        personIds: toNumberIds(target.personIds),
      })),
    });
  }
}
