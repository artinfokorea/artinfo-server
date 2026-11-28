import { Body, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { DataSource } from 'typeorm';
import { RestApiController, RestApiPost } from '@/common/decorator/rest-api';
import { OkResponse } from '@/common/response/ok.response';
import { Holy365OptionalUser, Holy365Signature } from '@/holy365/common/holy365-auth.guard';
import { Holy365Errors } from '@/holy365/common/holy365.exception';
import {
  HOLY365_INQUIRY_CATEGORIES,
  HOLY365_INQUIRY_MAX,
  Holy365InquiryCategory,
  inquiryEmail,
  normalizeInquiry,
} from '@/holy365/inquiry/holy365-inquiry-policy';

class Holy365InquiryRequest {
  @IsIn(HOLY365_INQUIRY_CATEGORIES)
  @ApiProperty({ enum: HOLY365_INQUIRY_CATEGORIES })
  category: Holy365InquiryCategory;

  @IsString()
  @MaxLength(HOLY365_INQUIRY_MAX + 500)
  @ApiProperty({ description: `문의 내용 (1~${HOLY365_INQUIRY_MAX}자)` })
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  @ApiProperty({ required: false, description: '답장 받을 이메일 (선택)' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiProperty({ required: false, description: '앱 버전·기기 (예: ios 1.0.0 (7))' })
  client?: string;
}

@Injectable()
export class Holy365InquiryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(input: { userId: number | null; category: string; message: string; email: string | null; client: string | null }): Promise<void> {
    await this.dataSource.query(`INSERT INTO holy365_inquiries (user_id, category, message, email, client) VALUES ($1, $2, $3, $4, $5)`, [
      input.userId,
      input.category,
      input.message,
      input.email,
      input.client,
    ]);
  }
}

/** 문의하기 — 앱·웹에서 보낸 문의를 저장한다 (로그인은 선택). 운영자는 holy365_inquiries 에서 확인 */
@RestApiController('/holy365/inquiries', 'Holy365 Inquiry')
export class Holy365InquiryController {
  constructor(private readonly inquiryRepository: Holy365InquiryRepository) {}

  @RestApiPost(OkResponse, { path: '', description: '문의 보내기 (질문·오류·계정·제안·기타)' })
  async create(@Body() request: Holy365InquiryRequest, @Holy365OptionalUser() user: Holy365Signature | null) {
    const message = normalizeInquiry(request.message);
    if (!message || message.length > HOLY365_INQUIRY_MAX) throw Holy365Errors.inquiryInvalid();
    await this.inquiryRepository.create({
      userId: user?.id ?? null,
      category: request.category,
      message,
      email: inquiryEmail(request.email),
      client: request.client?.slice(0, 100) ?? null,
    });
  }
}
