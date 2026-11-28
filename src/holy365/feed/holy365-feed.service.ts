import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as sharp from 'sharp';
import { ObjectCannedACL } from '@aws-sdk/client-s3';
import { AwsS3Service } from '@/aws/s3/aws-s3.service';
import { UploadFile } from '@/common/type/type';
import { Holy365BibleRepository } from '@/holy365/bible/infrastructure/holy365-bible.repository';
import { isValidChapter } from '@/holy365/bible/domain/holy365-books';
import { Holy365FeedRepository, Holy365FeedScope, Holy365PostRow, Holy365PostVerse } from '@/holy365/feed/infrastructure/holy365-feed.repository';
import {
  aspectSize,
  feedImagePath,
  Holy365Aspect,
  HOLY365_COMMENT_MAX_CONTENT,
  HOLY365_POST_MAX_PASSAGES,
  HOLY365_POST_MAX_IMAGES,
  isFeedImageUrl,
  normalizePostContent,
  validatePostInput,
  validateVerseRange,
} from '@/holy365/feed/domain/holy365-post-policy';
import { isAllowedAvatar } from '@/holy365/user/domain/service/holy365-avatar-policy';
import { Holy365Errors } from '@/holy365/common/holy365.exception';

type Holy365VerseInput = { versionCode: string; book: number; chapter: number; verseStart: number; verseEnd: number };

export function postOf(row: Holy365PostRow) {
  return {
    id: String(row.id),
    author: {
      id: String(row.userId),
      name: row.name,
      iconImageUrl: row.iconImageUrl,
      church: row.churchId ? { id: String(row.churchId), name: row.churchName } : null,
    },
    content: row.content,
    aspect: row.aspect,
    images: row.images,
    verses: row.verses,
    likeCount: row.likeCount,
    commentCount: row.commentCount,
    likedByMe: row.likedByMe,
    createdAt: row.createdAt,
  };
}

const PAGE_SIZE = 20;

@Injectable()
export class Holy365FeedService {
  constructor(
    private readonly feedRepository: Holy365FeedRepository,
    private readonly bibleRepository: Holy365BibleRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  /** 사진 올리기 — 고른 비율(1:1 · 4:5)에 맞춰 가운데 기준으로 잘라 1080px WebP 로 저장 (게시물 저장 전에 먼저 올린다) */
  async uploadImages(userId: number, aspect: Holy365Aspect, files: UploadFile[] | undefined): Promise<string[]> {
    if (!files?.length) throw Holy365Errors.postInvalidImage();
    if (files.length > HOLY365_POST_MAX_IMAGES) throw Holy365Errors.postTooManyImages();
    if (files.some(file => !isAllowedAvatar(file.mimetype, file.size))) throw Holy365Errors.invalidAvatar();

    const { width, height } = aspectSize(aspect);
    const urls: string[] = [];
    for (const file of files) {
      let image: Buffer;
      try {
        image = await sharp(file.buffer).rotate().resize(width, height, { fit: 'cover', position: 'centre' }).webp({ quality: 82 }).toBuffer();
      } catch {
        throw Holy365Errors.postInvalidImage();
      }
      const result = await this.awsS3Service.uploadStream(
        image,
        'image/webp',
        feedImagePath(userId, randomBytes(6).toString('hex'), Date.now()),
        undefined,
        ObjectCannedACL.public_read,
      );
      urls.push(result!.location);
    }

    return urls;
  }

  async create(
    userId: number,
    input: {
      content?: string;
      aspect: Holy365Aspect;
      images?: string[];
      verses?: Holy365VerseInput[];
    },
  ) {
    const content = normalizePostContent(input.content);
    const images = input.images ?? [];
    const error = validatePostInput({ content, imageCount: images.length, hasVerse: !!input.verses?.length });
    if (error === 'empty') throw Holy365Errors.postEmpty();
    if (error === 'tooLong') throw Holy365Errors.postTooLong();
    if (error === 'tooManyImages') throw Holy365Errors.postTooManyImages();
    if (images.some(url => !isFeedImageUrl(url, userId))) throw Holy365Errors.postInvalidImage();

    if ((input.verses?.length ?? 0) > HOLY365_POST_MAX_PASSAGES) throw Holy365Errors.postInvalidVerse();
    const verses: Holy365PostVerse[] = [];
    for (const verse of input.verses ?? []) verses.push(await this.resolveVerse(verse));
    const id = await this.feedRepository.create({ userId, content, aspect: input.aspect, images, verses });

    return this.get(id, userId);
  }

  /** 구절 본문은 클라이언트가 보낸 것을 믿지 않고 DB 에서 가져와 그 시점 그대로 저장한다 */
  private async resolveVerse(input: Holy365VerseInput): Promise<Holy365PostVerse> {
    if (!isValidChapter(input.book, input.chapter) || !validateVerseRange(input.verseStart, input.verseEnd)) throw Holy365Errors.postInvalidVerse();
    const verses = (await this.bibleRepository.verses(input.versionCode, input.book, input.chapter)).filter(
      v => v.verse >= input.verseStart && v.verse <= input.verseEnd,
    );
    if (!verses.length) throw Holy365Errors.postInvalidVerse();

    return {
      versionCode: input.versionCode,
      book: input.book,
      chapter: input.chapter,
      verseStart: verses[0].verse,
      verseEnd: verses[verses.length - 1].verse,
      text: verses.map(v => v.text).join(' '),
    };
  }

  async list(scope: Holy365FeedScope, viewerId: number | null, before: number | null, lang = 'ko') {
    const rows = await this.feedRepository.list(scope, viewerId, before, PAGE_SIZE + 1, lang);
    return { posts: rows.slice(0, PAGE_SIZE).map(postOf), hasMore: rows.length > PAGE_SIZE };
  }

  async get(postId: number, viewerId: number | null) {
    const row = await this.feedRepository.find(postId, viewerId);
    if (!row) throw Holy365Errors.postNotFound();
    return postOf(row);
  }

  async remove(postId: number, userId: number): Promise<void> {
    const author = await this.feedRepository.authorOf(postId);
    if (author === null) throw Holy365Errors.postNotFound();
    if (author !== userId) throw Holy365Errors.notYourPost();

    const images = await this.feedRepository.softDelete(postId);
    if (images.length) await this.awsS3Service.deleteByUrls(images).catch(() => undefined);
  }

  async like(postId: number, userId: number, liked: boolean) {
    if ((await this.feedRepository.authorOf(postId)) === null) throw Holy365Errors.postNotFound();
    if (liked) await this.feedRepository.like(postId, userId);
    else await this.feedRepository.unlike(postId, userId);
    return this.get(postId, userId);
  }

  async comments(postId: number, viewerId: number | null = null) {
    if ((await this.feedRepository.authorOf(postId)) === null) throw Holy365Errors.postNotFound();
    const rows = await this.feedRepository.comments(postId, viewerId);
    return rows.map(row => ({
      id: String(row.id),
      author: { id: String(row.userId), name: row.name, iconImageUrl: row.iconImageUrl },
      content: row.content,
      createdAt: row.createdAt,
    }));
  }

  async addComment(postId: number, userId: number, raw: string) {
    const content = normalizePostContent(raw);
    if (!content || content.length > HOLY365_COMMENT_MAX_CONTENT) throw Holy365Errors.commentInvalid();
    if ((await this.feedRepository.authorOf(postId)) === null) throw Holy365Errors.postNotFound();
    await this.feedRepository.addComment(postId, userId, content);
    return this.comments(postId, userId);
  }

  /** 댓글 지우기 — 댓글 쓴 사람 또는 게시물 주인 */
  async removeComment(commentId: number, userId: number): Promise<void> {
    const comment = await this.feedRepository.findComment(commentId);
    if (!comment) throw Holy365Errors.postNotFound();
    const postAuthor = await this.feedRepository.authorOf(comment.postId);
    if (comment.userId !== userId && postAuthor !== userId) throw Holy365Errors.notYourPost();
    await this.feedRepository.deleteComment(commentId, comment.postId);
  }

  async report(userId: number, targetType: 'post' | 'comment' | 'user', targetId: number, reason: string): Promise<void> {
    await this.feedRepository.report(userId, targetType, targetId, normalizePostContent(reason).slice(0, 500) || '-');
  }
}
