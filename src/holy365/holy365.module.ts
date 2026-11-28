import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holy365User } from '@/holy365/user/domain/entity/holy365-user.entity';
import { Holy365Auth } from '@/holy365/auth/domain/entity/holy365-auth.entity';
import { Holy365SchemaBootstrapService } from '@/holy365/common/holy365-schema-bootstrap.service';
import { Holy365AuthGuard } from '@/holy365/common/holy365-auth.guard';
import { Holy365UserRepository } from '@/holy365/user/infrastructure/holy365-user.repository';
import { Holy365TokenService } from '@/holy365/auth/infrastructure/holy365-token.service';
import { Holy365OAuthClient } from '@/holy365/auth/infrastructure/holy365-oauth-client.service';
import { Holy365AppleVerifier } from '@/holy365/auth/infrastructure/holy365-apple-verifier.service';
import { Holy365GoogleVerifier } from '@/holy365/auth/infrastructure/holy365-google-verifier.service';
import { Holy365AppleRevoker } from '@/holy365/auth/infrastructure/holy365-apple-revoker.service';
import { Holy365InquiryController, Holy365InquiryRepository } from '@/holy365/inquiry/holy365-inquiry.controller';
import { Holy365AuthUseCase } from '@/holy365/auth/application/holy365-auth.usecase';
import { Holy365UserUseCase } from '@/holy365/user/application/holy365-user.usecase';
import { Holy365BibleRepository } from '@/holy365/bible/infrastructure/holy365-bible.repository';
import { Holy365TranscriptionRepository } from '@/holy365/transcription/infrastructure/holy365-transcription.repository';
import { Holy365TranscriptionUseCase } from '@/holy365/transcription/application/holy365-transcription.usecase';
import { Holy365AuthController } from '@/holy365/auth/presentation/holy365-auth.controller';
import { Holy365UserController } from '@/holy365/user/presentation/holy365-user.controller';
import { Holy365BibleController } from '@/holy365/bible/presentation/holy365-bible.controller';
import { Holy365TranscriptionController } from '@/holy365/transcription/presentation/holy365-transcription.controller';
import { Holy365CommunityController } from '@/holy365/community/presentation/holy365-community.controller';
import { Holy365CommunityRepository } from '@/holy365/community/infrastructure/holy365-community.repository';
import { Holy365SocialRepository } from '@/holy365/social/infrastructure/holy365-social.repository';
import { Holy365KakaoPlaceClient } from '@/holy365/social/infrastructure/holy365-kakao-place.client';
import { Holy365SocialService } from '@/holy365/social/holy365-social.service';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { Holy365ChurchController, Holy365ProfileController, Holy365SocialController } from '@/holy365/social/presentation/holy365-social.controller';
import { Holy365FeedRepository } from '@/holy365/feed/infrastructure/holy365-feed.repository';
import { Holy365FeedService } from '@/holy365/feed/holy365-feed.service';
import { Holy365FeedController } from '@/holy365/feed/presentation/holy365-feed.controller';

/** 홀리365 — 성경 온라인 필사 웹서비스 (프론트: holy365-front). API 는 전부 /holy365/* */
@Module({
  imports: [TypeOrmModule.forFeature([Holy365User, Holy365Auth])],
  controllers: [
    Holy365InquiryController,
    Holy365AuthController,
    Holy365UserController,
    Holy365BibleController,
    Holy365TranscriptionController,
    Holy365CommunityController,
    Holy365ProfileController,
    Holy365SocialController,
    Holy365ChurchController,
    Holy365FeedController,
  ],
  providers: [
    Holy365SchemaBootstrapService,
    Holy365AuthGuard,
    Holy365UserRepository,
    Holy365TokenService,
    Holy365OAuthClient,
    Holy365AppleVerifier,
    Holy365GoogleVerifier,
    Holy365AppleRevoker,
    Holy365InquiryRepository,
    Holy365AuthUseCase,
    Holy365UserUseCase,
    Holy365BibleRepository,
    Holy365TranscriptionRepository,
    Holy365TranscriptionUseCase,
    Holy365CommunityRepository,
    Holy365SocialRepository,
    Holy365KakaoPlaceClient,
    Holy365SocialService,
    AwsS3Service,
    Holy365FeedRepository,
    Holy365FeedService,
  ],
})
export class Holy365Module {}
