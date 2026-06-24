import { Body, Query } from '@nestjs/common';
import { RestApiController, RestApiGet, RestApiPut } from '@/common/decorator/rest-api';
import { AuthSignature } from '@/common/decorator/AuthSignature';
import { UserSignature } from '@/common/type/type';
import { USER_TYPE } from '@/user/entity/user.entity';
import { OkResponse } from '@/common/response/ok.response';
import {
  OnchurchGetAttendanceSessionUseCase,
  OnchurchMarkAttendanceUseCase,
  OnchurchListAttendanceSessionsUseCase,
} from '@/onchurch/attendance/application/usecase/onchurch-attendance.usecase';
import { OnchurchAttendanceMarkRequest } from '@/onchurch/attendance/presentation/dto/request/onchurch-attendance-mark.request';
import {
  OnchurchAttendanceSessionListResponse,
  OnchurchAttendanceSessionResponse,
} from '@/onchurch/attendance/presentation/dto/response/onchurch-attendance.response';

@RestApiController('/onchurch/attendances', 'Onchurch Attendance')
export class OnchurchAttendanceController {
  constructor(
    private readonly getSessionUseCase: OnchurchGetAttendanceSessionUseCase,
    private readonly markUseCase: OnchurchMarkAttendanceUseCase,
    private readonly listSessionsUseCase: OnchurchListAttendanceSessionsUseCase,
  ) {}

  @RestApiGet(OnchurchAttendanceSessionResponse, { path: '/me', description: '특정 날짜·예배의 출석 성도 목록', auth: [USER_TYPE.CLIENT] })
  async getSession(
    @AuthSignature() s: UserSignature,
    @Query('date') date: string,
    @Query('serviceType') serviceType: string,
  ) {
    return new OnchurchAttendanceSessionResponse(await this.getSessionUseCase.execute(s.id, date, serviceType));
  }

  @RestApiPut(OkResponse, { path: '/me/mark', description: '출석 체크/해제', auth: [USER_TYPE.CLIENT] })
  async mark(@AuthSignature() s: UserSignature, @Body() req: OnchurchAttendanceMarkRequest) {
    await this.markUseCase.execute(s.id, req.toCommand());
    return new OkResponse();
  }

  @RestApiGet(OnchurchAttendanceSessionListResponse, { path: '/me/sessions', description: '출석 이력(세션별 인원수)', auth: [USER_TYPE.CLIENT] })
  async listSessions(@AuthSignature() s: UserSignature) {
    return new OnchurchAttendanceSessionListResponse(await this.listSessionsUseCase.execute(s.id));
  }
}
