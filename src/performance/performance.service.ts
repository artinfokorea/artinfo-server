import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { PerformanceArea } from '@/performance/performance-area.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PerformanceService {
  parser: XMLParser;

  constructor(
    @InjectRepository(PerformanceArea)
    private performanceAreaRepository: Repository<PerformanceArea>,
  ) {
    this.parser = new XMLParser();
  }

  async temp() {
    const response = await axios({
      method: 'get',
      url: 'http://www.kopis.or.kr/openApi/restful/prfplc?service=734440a5e0584dd3b3d3fd587bafa0b0&&cpage=1&rows=10000',
    });
    const xmlData = response.data;

    const jsonObj = this.parser.parse(xmlData);
    let prfmAreas: PerformanceArea[] = [];
    const errorIds: string[] = [];

    for (let idx = 0; idx < jsonObj.dbs.db.length; idx++) {
      const facility = jsonObj.dbs.db[idx];
      const facilityId = facility.mt10id;
      try {
        const facilityXml = await axios({
          method: 'get',
          url: `http://www.kopis.or.kr/openApi/restful/prfplc/${facilityId}?service=734440a5e0584dd3b3d3fd587bafa0b0&newsql=Y`,
        });

        const facilityJson = this.parser.parse(facilityXml.data);
        if (Array.isArray(facilityJson.dbs.db.mt13s.mt13)) {
          facilityJson.dbs.db.mt13s.mt13.forEach(hall => {
            const prfmArea = new PerformanceArea();
            prfmArea.name = facilityJson.dbs.db.fcltynm;
            prfmArea.address = facilityJson.dbs.db.adres;
            prfmArea.latitude = facilityJson.dbs.db.la;
            prfmArea.longitude = facilityJson.dbs.db.lo;
            prfmArea.siteUrl = facilityJson.dbs.db.relateurl === '' ? null : facilityJson.dbs.db.relateurl;
            prfmArea.areaType = facilityJson.dbs.db.fcltychartr;
            prfmArea.seatScale = Number(String(hall.seatscale).replace(',', ''));
            if (Number.isNaN(prfmArea.seatScale)) console.log(hall.seatscale);
            prfmArea.name = prfmArea.name + ' ' + hall.prfplcnm.replaceAll('(', ' ').replaceAll(')', ' ').trim();

            prfmAreas.push(prfmArea);
          });
        } else {
          const prfmArea = new PerformanceArea();
          prfmArea.name = facilityJson.dbs.db.fcltynm;
          prfmArea.address = facilityJson.dbs.db.adres;
          prfmArea.latitude = facilityJson.dbs.db.la;
          prfmArea.longitude = facilityJson.dbs.db.lo;
          prfmArea.siteUrl = facilityJson.dbs.db.relateurl === '' ? null : facilityJson.dbs.db.relateurl;
          prfmArea.areaType = facilityJson.dbs.db.fcltychartr;
          prfmArea.seatScale = Number(String(facilityJson.dbs.db.seatscale).replace(',', ''));
          if (Number.isNaN(prfmArea.seatScale)) console.log(facilityJson.dbs.db.seatscale);
          prfmArea.name =
            facilityJson.dbs.db.mt13s.mt13 && prfmArea.name === facilityJson.dbs.db.mt13s.mt13.prfplcnm
              ? prfmArea.name
              : prfmArea.name + ' ' + facilityJson.dbs.db.mt13s.mt13.prfplcnm.replaceAll('(', ' ').replaceAll(')', ' ').trim();
          prfmAreas.push(prfmArea);
        }
        if (prfmAreas.length % 100 === 0 || jsonObj.dbs.db.length === idx + 1) {
          await this.performanceAreaRepository.save(prfmAreas);
          prfmAreas = [];
          await this.sleep(5000);
        }
      } catch {
        errorIds.push(facilityId);
        console.log(errorIds);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
