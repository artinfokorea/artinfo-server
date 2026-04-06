-- MENTION 알림 타입 추가
ALTER TYPE azeyo_notifications_type_enum ADD VALUE IF NOT EXISTS 'MENTION' AFTER 'COMMENT';
