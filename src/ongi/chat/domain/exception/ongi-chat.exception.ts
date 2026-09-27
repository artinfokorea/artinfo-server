import { HttpException, HttpStatus } from '@nestjs/common';

export class OngiChatRoomNotFound extends HttpException {
  constructor() {
    super({ code: 'ONGI-CHAT-001', message: '대화방을 찾을 수 없어요.' }, HttpStatus.NOT_FOUND);
  }
}

export class OngiChatInvalidTargets extends HttpException {
  constructor() {
    super({ code: 'ONGI-CHAT-002', message: '같은 가족 공간에 있는 사람만 대화에 초대할 수 있어요.' }, HttpStatus.BAD_REQUEST);
  }
}

export class OngiChatInvalidMessage extends HttpException {
  constructor() {
    super({ code: 'ONGI-CHAT-003', message: '메시지를 1~1000자로 입력해 주세요.' }, HttpStatus.BAD_REQUEST);
  }
}

export class OngiChatBlocked extends HttpException {
  constructor() {
    super({ code: 'ONGI-CHAT-004', message: '이 사람과는 대화할 수 없어요.' }, HttpStatus.FORBIDDEN);
  }
}

export class OngiChatInvalidRoomName extends HttpException {
  constructor() {
    super({ code: 'ONGI-CHAT-005', message: '방 이름은 30자까지 쓸 수 있어요.' }, HttpStatus.BAD_REQUEST);
  }
}

export class OngiChatTooManyParticipants extends HttpException {
  constructor() {
    super({ code: 'ONGI-CHAT-006', message: '대화방에는 50명까지 참여할 수 있어요.' }, HttpStatus.BAD_REQUEST);
  }
}

export class OngiChatNotGroupRoom extends HttpException {
  constructor() {
    super({ code: 'ONGI-CHAT-007', message: '1:1 대화에는 초대할 수 없어요. 새 그룹 대화를 만들어 주세요.' }, HttpStatus.BAD_REQUEST);
  }
}

export class OngiChatMessageNotFound extends HttpException {
  constructor() {
    super({ code: 'ONGI-CHAT-008', message: '메시지를 찾을 수 없어요.' }, HttpStatus.NOT_FOUND);
  }
}
