import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { PerformanceArea } from '@/performance/performance-area.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { PerformanceArea } from '@/performance/performance-area.entity';

@Injectable()
export class PerformanceService {
  parser: XMLParser;
  constructor() {
    // private performanceAreaRepository: Repository<PerformanceArea>, // @InjectRepository(PerformanceArea)
    this.parser = new XMLParser();
  }

  async temp() {
    const response = await axios({
      method: 'get',
      url: 'http://www.kopis.or.kr/openApi/restful/prfplc?service=734440a5e0584dd3b3d3fd587bafa0b0&&cpage=1&rows=2',
    });
    const xmlData = response.data;

    const jsonObj = this.parser.parse(xmlData);
    const mt10ids = jsonObj.dbs.db.map(async (facility: any) => {
      const facilityId = facility.mt10id;

      const facilityXml = await axios({
        method: 'get',
        url: `http://www.kopis.or.kr/openApi/restful/prfplc/${facilityId}?service=734440a5e0584dd3b3d3fd587bafa0b0&newsql=Y`,
      });
      const facilityJson = this.parser.parse(facilityXml.data);
      const prfmArea = new PerformanceArea();
      prfmArea.name = 'a';
      prfmArea.address = 'a';
      prfmArea.latitude = 1;
      prfmArea.longitude = 1;
      prfmArea.seatScale = 1;
      prfmArea.siteUrl = 'a';
      prfmArea.areaType = 'a';

      console.log(facilityJson);
      console.log(facilityJson.dbs.db.mt13s);
    });

    console.log(mt10ids.length);
  }
}
