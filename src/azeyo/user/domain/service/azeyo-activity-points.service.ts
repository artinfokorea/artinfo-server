export const AZEYO_ACTIVITY_POINTS_SERVICE = Symbol('AZEYO_ACTIVITY_POINTS_SERVICE');

export enum AZEYO_ACTIVITY_ACTION {
  CREATE_POST = 'CREATE_POST',           // +10
  CREATE_COMMENT = 'CREATE_COMMENT',     // +3
  CREATE_JOKBO = 'CREATE_JOKBO',        // +15
  JOKBO_COPIED = 'JOKBO_COPIED',        // +5
  RECEIVE_LIKE = 'RECEIVE_LIKE',         // +2
  GIVE_LIKE = 'GIVE_LIKE',              // +1
  VOTE = 'VOTE',                         // +2
  CREATE_SCHEDULE = 'CREATE_SCHEDULE',   // +3
}

export interface IAzeyoActivityPointsService {
  addPoints(userId: number, action: AZEYO_ACTIVITY_ACTION): Promise<void>;
}
