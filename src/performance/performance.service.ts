import { Injectable } from '@nestjs/common';
import { PerformanceRepository } from '@/performance/repository/performance.repository';
import { PagingItems } from '@/common/type/type';
import { GetPerformancesQuery } from '@/performance/dto/query/get-performances.query';
import { Performance, PERFORMANCE_CATEGORY } from '@/performance/performance.entity';
import { PerformanceAreaRepository } from '@/performance/repository/performance-area.repository';
import { CreatePerformanceCommand } from '@/performance/dto/command/create-performance.command';
import { PerformanceArea } from '@/performance/performance-area.entity';
import { UserRepository } from '@/user/repository/user.repository';
import { EditPerformanceCommand } from '@/performance/dto/command/edit-performance.command';
import { PerformanceCounter } from '@/performance/repository/operation/performance.counter';
import * as xml2js from 'xml2js';
import axios from 'axios';
import { In } from 'typeorm';

@Injectable()
export class PerformanceService {
  constructor(
    private readonly performanceRepository: PerformanceRepository,
    private readonly performanceAreaRepository: PerformanceAreaRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async countPreArrangedPerformance() {
    const performanceCounter = new PerformanceCounter({
      keyword: null,
      categories: [],
      provinceIds: [],
      isPreArranged: true,
    });
    return await this.performanceRepository.countPerformances(performanceCounter);
  }

  async editPerformance(command: EditPerformanceCommand): Promise<void> {
    let area: PerformanceArea | null = null;
    if (command.areaId) area = await this.performanceAreaRepository.findOneOrThrowById(command.areaId);

    await this.performanceRepository.editOrThrow(command.toEditor(area));
  }

  async createPerformance(command: CreatePerformanceCommand): Promise<number> {
    const user = await this.userRepository.findOneOrThrowById(command.userId);
    let performanceArea: PerformanceArea | null = null;
    if (command.areaId) performanceArea = await this.performanceAreaRepository.findOneOrThrowById(command.areaId);

    return await this.performanceRepository.createPerformance(command.toCreator(user, performanceArea));
  }

  async getPagingPerformances(query: GetPerformancesQuery): Promise<PagingItems<Performance>> {
    const performances = await this.performanceRepository.find(query.toFetcher());
    const totalCount = await this.performanceRepository.countPerformances(query.toCounter());

    return { items: performances, totalCount: totalCount };
  }

  getPerformance(performanceId: number) {
    return this.performanceRepository.findOneOrThrowById(performanceId);
  }

  async deletePerformance(userId: number, performanceId: number) {
    await this.performanceRepository.deleteOrThrow(userId, performanceId);
  }

  async scrapPerformances() {
    const user = await this.userRepository.findOneOrThrowByEmail('artinfokorea2022@gmail.com');

    const categoryCodeMap = {
      classic: 'CCCA',
      musical: 'GGGA',
      dance: 'BBBC',
      traditional_music: 'CCCC',
    };

    for (const categoryKey in categoryCodeMap) {
      let cpage = 1;
      while (true) {
        try {
          const kopisPerformances = await axios.get(
            `http://www.kopis.or.kr/openApi/restful/pblprfr?service=40e662ed52d14dd09bdf8268b2d87d47&stdate=${this.getFutureDateInKST(
              30,
            )}&eddate=${this.getFutureDateInKST(120)}&cpage=${cpage}&rows=100&newsql=Y&shcate=${categoryCodeMap[categoryKey]}`,
          );

          const kopisPerformancesXml = kopisPerformances.data;
          const parser = new xml2js.Parser({
            explicitArray: false,
          });
          const kopisPerformancesDbs = await parser.parseStringPromise(kopisPerformancesXml);

          if (!kopisPerformancesDbs.dbs || !kopisPerformancesDbs.dbs.db) {
            // 결과 자체가 없으면 종료
            break;
          }

          let performancesDb = kopisPerformancesDbs.dbs.db;

          // 단일 객체일 수 있으니 배열로 통일
          if (!Array.isArray(performancesDb)) {
            performancesDb = [performancesDb];
          }

          if (performancesDb.length === 0) {
            break; // 더 이상 데이터 없으면 종료
          }

          const kopisIds = performancesDb.map(performanceDb => performanceDb.mt20id);
          const fetchedPerformances = await this.performanceRepository.findBy({ kopisId: In(kopisIds) });
          const fetchedPerformanceIds = fetchedPerformances.map(performance => performance.kopisId);
          const filteredKopisIds = kopisIds.filter(id => !fetchedPerformanceIds.includes(id));

          await Promise.all(
            filteredKopisIds.map(async kopisId => {
              try {
                const kopisPerformance = await axios.get(
                  `https://www.kopis.or.kr/openApi/restful/pblprfr/${kopisId}?service=40e662ed52d14dd09bdf8268b2d87d47&newsql=Y`,
                );
                const kopisPerformanceXml = kopisPerformance.data;
                const parserDetail = new xml2js.Parser({
                  explicitArray: false,
                });
                const performanceDbs = await parserDetail.parseStringPromise(kopisPerformanceXml);
                const performanceDetail = performanceDbs.dbs.db;
                const title = performanceDetail.prfnm?.trim() ?? '';

                let introductionImageUrls: string[] = [];
                let introductionText: string | null = performanceDetail.sty?.trim() || null;
                if (introductionText === '') introductionText = null;

                if (performanceDetail.styurls && performanceDetail.styurls.styurl) {
                  if (typeof performanceDetail.styurls.styurl === 'string') {
                    introductionImageUrls.push(performanceDetail.styurls.styurl);
                  } else if (Array.isArray(performanceDetail.styurls.styurl)) {
                    introductionImageUrls = performanceDetail.styurls.styurl;
                  }
                }

                const introduction = this.getIntroductionHtml({
                  imageUrls: introductionImageUrls,
                  text: introductionText,
                });
                const category = PERFORMANCE_CATEGORY[`${categoryKey.toUpperCase()}`];
                const time = performanceDetail.dtguidance?.trim() ?? null;
                const age = performanceDetail.prfage?.trim() ?? null;
                const cast = performanceDetail.prfcast?.trim() ?? null;
                const ticketPrice = performanceDetail.pcseguidance?.trim() ?? null;
                const host = performanceDetail.entrpsnmH?.trim() ?? null;
                let reservationUrl: string | null = performanceDetail.relates?.relate?.relateurl || null;
                if (reservationUrl === '') reservationUrl = null;
                const posterImageUrl = performanceDetail.poster?.trim() ?? null;
                const startAt = this.convertToUTC(performanceDetail.prfpdfrom?.trim() ?? '');
                const endAt = this.convertToUTC(performanceDetail.prfpdto?.trim() ?? '');

                let customAreaName = (performanceDetail.fcltynm || '').replace(/[()]/g, '').trim();
                customAreaName = this.removeRepeatedSentence(customAreaName);

                const area = await this.performanceAreaRepository.findOneByName(customAreaName);
                if (area) {
                  customAreaName = null;
                }

                await this.performanceRepository.save({
                  kopisId: kopisId,
                  title: title,
                  introduction: introduction,
                  category: category,
                  area: area,
                  customAreaName: customAreaName,
                  time: time,
                  age: age,
                  cast: cast,
                  ticketPrice: ticketPrice,
                  host: host,
                  posterImageUrl: posterImageUrl,
                  reservationUrl: reservationUrl,
                  startAt: startAt,
                  endAt: endAt,
                  user: user,
                });
              } catch (innerErr) {
                console.error(`failed to fetch detail for ${kopisId}`, innerErr);
              }
            }),
          );

          cpage += 1; // 다음 페이지
        } catch (err) {
          console.error(`failed to fetch list for category ${categoryKey} page ${cpage}`, err);
          break;
        }
      }
    }
  }

  private getIntroductionHtml({ imageUrls, text }: { imageUrls: string[]; text: string | null }) {
    let contents = '';
    imageUrls.forEach(imageUrl => {
      let secureImageUrl = imageUrl;
      if (imageUrl.startsWith('http://')) {
        secureImageUrl = secureImageUrl.replace('http://', 'https://');
      }

      const imageTag = `
        <figure class="image">
            <img src="${secureImageUrl}">
          </figure>
      `;

      contents += imageTag;
    });

    if (text) {
      const textTag = `
        <p>&nbsp;</p>
        <p>${text}</p>
      `;

      contents += textTag;
    }

    return contents.trim();
  }

  private convertToUTC(koreanDateString: string): Date {
    const [year, month, day] = koreanDateString.split('.').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  }

  private removeRepeatedSentence(input: string): string {
    if (input.length % 2 === 1) {
      const centerIndex = Math.ceil(input.length / 2);
      const firstSentence = input.slice(0, centerIndex - 1);
      const secondSentence = input.slice(centerIndex);
      if (firstSentence === secondSentence) return firstSentence;
    }

    return input;
  }

  private getFutureDateInKST(daysToAdd: number): string {
    const currentDate = new Date();

    currentDate.setDate(currentDate.getDate() + daysToAdd);

    const formatter = new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Seoul',
    });

    const formattedDate = formatter.format(currentDate);

    const [year, month, day] = formattedDate.split('.').map(part => part.trim());
    return `${year}${month}${day}`;
  }
}
