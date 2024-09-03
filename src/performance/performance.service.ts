import { Injectable } from '@nestjs/common';
import { PerformanceRepository } from '@/performance/repository/performance.repository';
import { PagingItems } from '@/common/type/type';
import { GetPerformancesQuery } from '@/performance/dto/query/get-performances.query';
import { Performance, PERFORMANCE_CATEGORY } from '@/performance/performance.entity';
import axios from 'axios';
import * as xml2js from 'xml2js';
import { PerformanceCreator } from '@/performance/repository/operation/performance.creator';
import { Util } from '@/common/util/util';
import { PerformanceAreaRepository } from '@/performance/repository/performance-area.repository';
import { CreatePerformanceCommand } from '@/performance/dto/command/create-performance.command';
import { PerformanceArea } from '@/performance/performance-area.entity';
import { UserRepository } from '@/user/repository/user.repository';
import { EditPerformanceCommand } from '@/performance/dto/command/edit-performance.command';
import { PerformanceCounter } from '@/performance/repository/operation/performance.counter';

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
    return await this.performanceRepository.count(performanceCounter);
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

    return await this.performanceRepository.create(command.toCreator(user, performanceArea));
  }

  async getPagingPerformances(query: GetPerformancesQuery): Promise<PagingItems<Performance>> {
    const performances = await this.performanceRepository.find(query.toFetcher());
    const totalCount = await this.performanceRepository.count(query.toCounter());

    return { items: performances, totalCount: totalCount };
  }

  getPerformance(performanceId: number) {
    return this.performanceRepository.findOneOrThrowById(performanceId);
  }

  async deletePerformance(userId: number, performanceId: number) {
    await this.performanceRepository.deleteOrThrow(userId, performanceId);
  }

  async pushPerformances() {
    const user = await this.userRepository.findAdminOrThrow();
    const kopisPerformances = await axios.get(
      'http://www.kopis.or.kr/openApi/restful/pblprfr?service=734440a5e0584dd3b3d3fd587bafa0b0&stdate=20240901&eddate=20241130&cpage=1&rows=30&newsql=Y&shcate=CCCA',
    );

    const kopisPerformancesXml = kopisPerformances.data;
    const parser = new xml2js.Parser({
      explicitArray: false,
    });
    const kopisPerformancesDbs = await parser.parseStringPromise(kopisPerformancesXml);
    const performances = kopisPerformancesDbs.dbs.db;

    await Promise.all(
      performances.map(async performance => {
        const kopisPerformance = await axios.get(
          `https://www.kopis.or.kr/openApi/restful/pblprfr/${performance.mt20id}?service=734440a5e0584dd3b3d3fd587bafa0b0&newsql=Y`,
        );

        const kopisPerformanceXml = kopisPerformance.data;
        const parser = new xml2js.Parser({
          explicitArray: false,
        });
        const performanceDbs = await parser.parseStringPromise(kopisPerformanceXml);
        const performanceDetail = performanceDbs.dbs.db;

        const kopisId = performanceDetail.mt20id.trim();
        const title = performanceDetail.prfnm.trim();

        let introductionImageUrls: string[] = [];
        let introductionText: string | null = performanceDetail.sty.trim();
        if (introductionText === '') introductionText = null;
        if (typeof performanceDetail.styurls.styurl === 'string') {
          introductionImageUrls.push(performanceDetail.styurls.styurl);
        } else {
          introductionImageUrls = performanceDetail.styurls.styurl;
        }
        const introduction = this.getIntroductionHtml({ imageUrls: introductionImageUrls, text: introductionText });
        const category = PERFORMANCE_CATEGORY.CLASSIC;
        const time = performanceDetail.dtguidance.trim();
        const age = performanceDetail.prfage.trim();
        const cast = performanceDetail.prfcast.trim();
        const ticketPrice = performanceDetail.pcseguidance.trim();
        const host = performanceDetail.entrpsnmH.trim();
        let reservationUrl: string | null = performanceDetail.relates.relate.relateurl;
        if (reservationUrl === '') reservationUrl = null;
        const posterImageUrl = performanceDetail.poster.trim();
        const startAt = new Util().convertToUTC(performanceDetail.prfpdfrom.trim());
        const endAt = new Util().convertToUTC(performanceDetail.prfpdto.trim());

        let customAreaName = performanceDetail.fcltynm.replace(/[()]/g, '').trim();
        customAreaName = new Util().removeRepeatedSentence(customAreaName);

        const area = await this.performanceAreaRepository.findOneByName(customAreaName);
        if (area) {
          customAreaName = null;
        }

        const performanceCreator = new PerformanceCreator({
          kopisId,
          title,
          introduction,
          category,
          time,
          age,
          cast,
          ticketPrice,
          host,
          reservationUrl,
          posterImageUrl,
          startAt,
          endAt,
          area,
          customAreaName,
          user: user,
        });

        await this.performanceRepository.create(performanceCreator);
      }),
    );
  }

  private getIntroductionHtml({ imageUrls, text }: { imageUrls: string[]; text: string | null }) {
    let contents = '';
    imageUrls.forEach(imageUrl => {
      const imageTag = `
        <figure class="image">
            <img src="${imageUrl}">
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
}
