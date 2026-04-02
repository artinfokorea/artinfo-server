-- ============================================================
-- 아재요 시드 데이터
-- 실행: psql -U <user> -d <db> -f seed.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 0. 모든 azeyo 테이블 초기화
-- ============================================================
TRUNCATE TABLE azeyo_community_votes CASCADE;
TRUNCATE TABLE azeyo_community_likes CASCADE;
TRUNCATE TABLE azeyo_community_comments CASCADE;
TRUNCATE TABLE azeyo_community_posts CASCADE;
TRUNCATE TABLE azeyo_jokbo_likes CASCADE;
TRUNCATE TABLE azeyo_jokbo_templates CASCADE;
TRUNCATE TABLE azeyo_schedule_tag_map CASCADE;
TRUNCATE TABLE azeyo_schedules CASCADE;
TRUNCATE TABLE azeyo_schedule_recommendations CASCADE;
TRUNCATE TABLE azeyo_schedule_tags CASCADE;
TRUNCATE TABLE azeyo_notifications CASCADE;
TRUNCATE TABLE azeyo_notification_settings CASCADE;
TRUNCATE TABLE azeyo_auths CASCADE;
TRUNCATE TABLE azeyo_users CASCADE;

-- ============================================================
-- 1. 유저 100명
-- ============================================================
INSERT INTO azeyo_users (nickname, subtitle, marriage_year, children, email, icon_image_url, sns_type, sns_id, activity_points, monthly_points, is_online, created_at, updated_at) VALUES
('든든한남편', '결혼 8년차 · 아이 2명', 2018, '2', 'seed1@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/3.jpg', 'KAKAO', 'seed_1', 320, 85, false, NOW() - INTERVAL '90 days', NOW()),
('살림왕아재', '결혼 12년차 · 아이 1명', 2014, '1', 'seed2@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/10.jpg', 'KAKAO', 'seed_2', 890, 210, false, NOW() - INTERVAL '85 days', NOW()),
('딸바보파파', '결혼 6년차 · 딸 2명', 2020, '2', 'seed3@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/12.jpg', 'NAVER', 'seed_3', 450, 120, false, NOW() - INTERVAL '80 days', NOW()),
('로맨틱가이', '결혼 15년차', 2011, '3+', 'seed4@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/8.jpg', 'GOOGLE', 'seed_4', 1560, 340, false, NOW() - INTERVAL '75 days', NOW()),
('워킹대디', '결혼 5년차 · 아이 1명', 2021, '1', 'seed5@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/11.jpg', 'KAKAO', 'seed_5', 280, 95, false, NOW() - INTERVAL '70 days', NOW()),
('야근전사', '결혼 7년차 · 아이 2명', 2019, '2', 'seed6@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/8.jpg', 'NAVER', 'seed_6', 510, 145, false, NOW() - INTERVAL '65 days', NOW()),
('주말아빠', '결혼 10년차 · 아이 3명', 2016, '3+', 'seed7@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/6.jpg', 'KAKAO', 'seed_7', 720, 190, false, NOW() - INTERVAL '60 days', NOW()),
('요리하는남편', '결혼 4년차', 2022, '0', 'seed8@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/10.jpg', 'GOOGLE', 'seed_8', 180, 60, false, NOW() - INTERVAL '55 days', NOW()),
('센스있는사위', '결혼 9년차 · 아이 1명', 2017, '1', 'seed9@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/1.jpg', 'KAKAO', 'seed_9', 640, 170, false, NOW() - INTERVAL '50 days', NOW()),
('육아고수', '결혼 11년차 · 아이 2명', 2015, '2', 'seed10@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/7.jpg', 'NAVER', 'seed_10', 980, 250, false, NOW() - INTERVAL '45 days', NOW()),
('결혼3년차', '신혼 끝자락', 2023, '0', 'seed11@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/1.jpg', 'KAKAO', 'seed_11', 90, 40, false, NOW() - INTERVAL '40 days', NOW()),
('치킨아빠', '결혼 7년차 · 아이 1명', 2019, '1', 'seed12@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/11.jpg', 'NAVER', 'seed_12', 350, 100, false, NOW() - INTERVAL '38 days', NOW()),
('캠핑족장', '결혼 8년차 · 아이 2명', 2018, '2', 'seed13@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/10.jpg', 'GOOGLE', 'seed_13', 420, 110, false, NOW() - INTERVAL '36 days', NOW()),
('효도왕사위', '결혼 13년차 · 아이 1명', 2013, '1', 'seed14@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/7.jpg', 'KAKAO', 'seed_14', 1100, 280, false, NOW() - INTERVAL '34 days', NOW()),
('새내기남편', '결혼 1년차', 2025, '0', 'seed15@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/5.jpg', 'NAVER', 'seed_15', 30, 20, false, NOW() - INTERVAL '32 days', NOW()),
('운동하는아빠', '결혼 6년차 · 아이 1명', 2020, '1', 'seed16@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/3.jpg', 'KAKAO', 'seed_16', 290, 80, false, NOW() - INTERVAL '30 days', NOW()),
('장인사랑꾼', '결혼 14년차 · 아이 2명', 2012, '2', 'seed17@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/1.jpg', 'GOOGLE', 'seed_17', 1340, 310, false, NOW() - INTERVAL '28 days', NOW()),
('퇴근후요리사', '결혼 5년차', 2021, '1', 'seed18@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/1.jpg', 'NAVER', 'seed_18', 210, 70, false, NOW() - INTERVAL '26 days', NOW()),
('아이둘아빠', '결혼 9년차 · 아이 2명', 2017, '2', 'seed19@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/10.jpg', 'KAKAO', 'seed_19', 580, 155, false, NOW() - INTERVAL '24 days', NOW()),
('주말등산러', '결혼 11년차 · 아이 1명', 2015, '1', 'seed20@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/3.jpg', 'NAVER', 'seed_20', 760, 200, false, NOW() - INTERVAL '22 days', NOW()),
('감성아재', '결혼 10년차 · 아이 2명', 2016, '2', 'seed21@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/2.jpg', 'KAKAO', 'seed_21', 670, 175, false, NOW() - INTERVAL '21 days', NOW()),
('유머왕남편', '결혼 7년차 · 아이 1명', 2019, '1', 'seed22@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/6.jpg', 'GOOGLE', 'seed_22', 430, 115, false, NOW() - INTERVAL '20 days', NOW()),
('집순이남편', '결혼 4년차', 2022, '0', 'seed23@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/3.jpg', 'KAKAO', 'seed_23', 150, 50, false, NOW() - INTERVAL '19 days', NOW()),
('낚시아재', '결혼 12년차 · 아이 2명', 2014, '2', 'seed24@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/1.jpg', 'NAVER', 'seed_24', 920, 230, false, NOW() - INTERVAL '18 days', NOW()),
('커피아빠', '결혼 6년차 · 아이 1명', 2020, '1', 'seed25@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/7.jpg', 'KAKAO', 'seed_25', 310, 90, false, NOW() - INTERVAL '17 days', NOW()),
('게임하는남편', '결혼 3년차', 2023, '0', 'seed26@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/11.jpg', 'GOOGLE', 'seed_26', 120, 45, false, NOW() - INTERVAL '16 days', NOW()),
('자전거아빠', '결혼 8년차 · 아이 2명', 2018, '2', 'seed27@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/2.jpg', 'NAVER', 'seed_27', 480, 130, false, NOW() - INTERVAL '15 days', NOW()),
('독서하는아재', '결혼 10년차 · 아이 1명', 2016, '1', 'seed28@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/12.jpg', 'KAKAO', 'seed_28', 700, 185, false, NOW() - INTERVAL '14 days', NOW()),
('베이킹아빠', '결혼 5년차 · 아이 1명', 2021, '1', 'seed29@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/8.jpg', 'NAVER', 'seed_29', 250, 75, false, NOW() - INTERVAL '13 days', NOW()),
('골프초보남편', '결혼 9년차 · 아이 2명', 2017, '2', 'seed30@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/2.jpg', 'GOOGLE', 'seed_30', 550, 150, false, NOW() - INTERVAL '12 days', NOW()),
('다정한사위', '결혼 7년차 · 아이 1명', 2019, '1', 'seed31@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/2.jpg', 'KAKAO', 'seed_31', 380, 105, false, NOW() - INTERVAL '11 days', NOW()),
('설거지마스터', '결혼 6년차', 2020, '1', 'seed32@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/11.jpg', 'NAVER', 'seed_32', 340, 95, false, NOW() - INTERVAL '10 days', NOW()),
('아침형아빠', '결혼 8년차 · 아이 2명', 2018, '2', 'seed33@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/1.jpg', 'KAKAO', 'seed_33', 460, 125, false, NOW() - INTERVAL '9 days', NOW()),
('택배수령인', '결혼 4년차', 2022, '0', 'seed34@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/3.jpg', 'GOOGLE', 'seed_34', 160, 55, false, NOW() - INTERVAL '8 days', NOW()),
('장보기달인', '결혼 11년차 · 아이 2명', 2015, '2', 'seed35@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/4.jpg', 'NAVER', 'seed_35', 810, 205, false, NOW() - INTERVAL '7 days', NOW()),
('빨래접기왕', '결혼 5년차 · 아이 1명', 2021, '1', 'seed36@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/6.jpg', 'KAKAO', 'seed_36', 230, 70, false, NOW() - INTERVAL '6 days', NOW()),
('청소기아빠', '결혼 7년차 · 아이 1명', 2019, '1', 'seed37@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/7.jpg', 'NAVER', 'seed_37', 400, 108, false, NOW() - INTERVAL '5 days', NOW()),
('분리수거맨', '결혼 9년차 · 아이 2명', 2017, '2', 'seed38@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/8.jpg', 'GOOGLE', 'seed_38', 560, 148, false, NOW() - INTERVAL '4 days', NOW()),
('아이돌봄이', '결혼 6년차 · 아이 2명', 2020, '2', 'seed39@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/11.jpg', 'KAKAO', 'seed_39', 370, 100, false, NOW() - INTERVAL '3 days', NOW()),
('새벽기상러', '결혼 10년차 · 아이 1명', 2016, '1', 'seed40@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/10.jpg', 'NAVER', 'seed_40', 690, 180, false, NOW() - INTERVAL '2 days', NOW()),
('반찬만들기', '결혼 8년차', 2018, '2', 'seed41@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/4.jpg', 'KAKAO', 'seed_41', 440, 118, false, NOW() - INTERVAL '1 day', NOW()),
('피아노아빠', '결혼 12년차 · 아이 1명', 2014, '1', 'seed42@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/7.jpg', 'GOOGLE', 'seed_42', 950, 240, false, NOW(), NOW()),
('텃밭아재', '결혼 15년차 · 아이 3명', 2011, '3+', 'seed43@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/3.jpg', 'NAVER', 'seed_43', 1480, 330, false, NOW(), NOW()),
('미니밴아빠', '결혼 7년차 · 아이 2명', 2019, '2', 'seed44@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/1.jpg', 'KAKAO', 'seed_44', 410, 112, false, NOW(), NOW()),
('와인남편', '결혼 10년차', 2016, '1', 'seed45@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/12.jpg', 'NAVER', 'seed_45', 680, 178, false, NOW(), NOW()),
('홈카페남편', '결혼 3년차', 2023, '0', 'seed46@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/2.jpg', 'GOOGLE', 'seed_46', 100, 38, false, NOW(), NOW()),
('조깅아빠', '결혼 6년차 · 아이 1명', 2020, '1', 'seed47@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/11.jpg', 'KAKAO', 'seed_47', 300, 88, false, NOW(), NOW()),
('수영하는남편', '결혼 5년차', 2021, '0', 'seed48@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/9.jpg', 'NAVER', 'seed_48', 220, 68, false, NOW(), NOW()),
('등산마니아', '결혼 13년차 · 아이 2명', 2013, '2', 'seed49@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/10.jpg', 'KAKAO', 'seed_49', 1150, 290, false, NOW(), NOW()),
('바베큐아재', '결혼 9년차 · 아이 1명', 2017, '1', 'seed50@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/2.jpg', 'GOOGLE', 'seed_50', 530, 142, false, NOW(), NOW()),
('DIY아빠', '결혼 8년차 · 아이 2명', 2018, '2', 'seed51@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/6.jpg', 'NAVER', 'seed_51', 470, 128, false, NOW(), NOW()),
('영화남편', '결혼 4년차', 2022, '0', 'seed52@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/5.jpg', 'KAKAO', 'seed_52', 170, 58, false, NOW(), NOW()),
('사진찍는아빠', '결혼 7년차 · 아이 1명', 2019, '1', 'seed53@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/12.jpg', 'NAVER', 'seed_53', 390, 106, false, NOW(), NOW()),
('노래방남편', '결혼 11년차 · 아이 2명', 2015, '2', 'seed54@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/12.jpg', 'GOOGLE', 'seed_54', 830, 215, false, NOW(), NOW()),
('볼링아재', '결혼 6년차 · 아이 1명', 2020, '1', 'seed55@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/9.jpg', 'KAKAO', 'seed_55', 330, 92, false, NOW(), NOW()),
('보드게임아빠', '결혼 5년차 · 아이 1명', 2021, '1', 'seed56@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/9.jpg', 'NAVER', 'seed_56', 240, 72, false, NOW(), NOW()),
('드라이브남편', '결혼 9년차 · 아이 2명', 2017, '2', 'seed57@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/2.jpg', 'KAKAO', 'seed_57', 570, 152, false, NOW(), NOW()),
('맥주아재', '결혼 10년차 · 아이 1명', 2016, '1', 'seed58@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/11.jpg', 'GOOGLE', 'seed_58', 710, 188, false, NOW(), NOW()),
('손편지남편', '결혼 8년차', 2018, '2', 'seed59@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/12.jpg', 'NAVER', 'seed_59', 450, 122, false, NOW(), NOW()),
('꽃배달남편', '결혼 3년차', 2023, '0', 'seed60@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/8.jpg', 'KAKAO', 'seed_60', 110, 42, false, NOW(), NOW()),
('가구조립왕', '결혼 7년차 · 아이 2명', 2019, '2', 'seed61@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/3.jpg', 'NAVER', 'seed_61', 420, 114, false, NOW(), NOW()),
('아이숙제도우미', '결혼 12년차 · 아이 2명', 2014, '2', 'seed62@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/6.jpg', 'GOOGLE', 'seed_62', 960, 245, false, NOW(), NOW()),
('산책남편', '결혼 5년차 · 아이 1명', 2021, '1', 'seed63@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/9.jpg', 'KAKAO', 'seed_63', 260, 78, false, NOW(), NOW()),
('요가하는아빠', '결혼 6년차', 2020, '1', 'seed64@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/5.jpg', 'NAVER', 'seed_64', 320, 90, false, NOW(), NOW()),
('레고아빠', '결혼 8년차 · 아이 2명', 2018, '2', 'seed65@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/10.jpg', 'KAKAO', 'seed_65', 490, 132, false, NOW(), NOW()),
('농구아재', '결혼 11년차 · 아이 1명', 2015, '1', 'seed66@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/8.jpg', 'GOOGLE', 'seed_66', 840, 218, false, NOW(), NOW()),
('탁구남편', '결혼 4년차', 2022, '0', 'seed67@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/3.jpg', 'NAVER', 'seed_67', 140, 48, false, NOW(), NOW()),
('라면마스터', '결혼 7년차 · 아이 1명', 2019, '1', 'seed68@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/3.jpg', 'KAKAO', 'seed_68', 360, 98, false, NOW(), NOW()),
('빵굽는아빠', '결혼 9년차 · 아이 2명', 2017, '2', 'seed69@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/3.jpg', 'NAVER', 'seed_69', 590, 158, false, NOW(), NOW()),
('축구코치아빠', '결혼 10년차 · 아이 2명', 2016, '2', 'seed70@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/7.jpg', 'GOOGLE', 'seed_70', 730, 195, false, NOW(), NOW()),
('기타치는남편', '결혼 6년차', 2020, '1', 'seed71@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/6.jpg', 'KAKAO', 'seed_71', 310, 88, false, NOW(), NOW()),
('밤산책남편', '결혼 5년차 · 아이 1명', 2021, '1', 'seed72@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/2.jpg', 'NAVER', 'seed_72', 250, 75, false, NOW(), NOW()),
('주차달인', '결혼 8년차 · 아이 2명', 2018, '2', 'seed73@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/6.jpg', 'KAKAO', 'seed_73', 460, 125, false, NOW(), NOW()),
('마트남편', '결혼 13년차 · 아이 1명', 2013, '1', 'seed74@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/12.jpg', 'GOOGLE', 'seed_74', 1170, 295, false, NOW(), NOW()),
('도시락아빠', '결혼 7년차 · 아이 2명', 2019, '2', 'seed75@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/8.jpg', 'NAVER', 'seed_75', 430, 116, false, NOW(), NOW()),
('운전대남편', '결혼 4년차', 2022, '0', 'seed76@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/1.jpg', 'KAKAO', 'seed_76', 130, 44, false, NOW(), NOW()),
('반려견아빠', '결혼 6년차 · 아이 1명', 2020, '1', 'seed77@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/10.jpg', 'NAVER', 'seed_77', 340, 94, false, NOW(), NOW()),
('통기타남편', '결혼 9년차', 2017, '1', 'seed78@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/11.jpg', 'GOOGLE', 'seed_78', 600, 160, false, NOW(), NOW()),
('헬스남편', '결혼 5년차', 2021, '0', 'seed79@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/5.jpg', 'KAKAO', 'seed_79', 200, 65, false, NOW(), NOW()),
('정원사아빠', '결혼 14년차 · 아이 2명', 2012, '2', 'seed80@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/3.jpg', 'NAVER', 'seed_80', 1380, 315, false, NOW(), NOW()),
('음악아재', '결혼 10년차 · 아이 1명', 2016, '1', 'seed81@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/12.jpg', 'KAKAO', 'seed_81', 690, 182, false, NOW(), NOW()),
('당근마켓남편', '결혼 3년차', 2023, '0', 'seed82@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/5.jpg', 'GOOGLE', 'seed_82', 80, 35, false, NOW(), NOW()),
('퍼즐아빠', '결혼 8년차 · 아이 2명', 2018, '2', 'seed83@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/8.jpg', 'NAVER', 'seed_83', 480, 130, false, NOW(), NOW()),
('명상남편', '결혼 7년차 · 아이 1명', 2019, '1', 'seed84@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/2.jpg', 'KAKAO', 'seed_84', 370, 102, false, NOW(), NOW()),
('마라톤아재', '결혼 11년차 · 아이 1명', 2015, '1', 'seed85@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/1.jpg', 'NAVER', 'seed_85', 860, 222, false, NOW(), NOW()),
('아이스크림아빠', '결혼 6년차 · 아이 2명', 2020, '2', 'seed86@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/6.jpg', 'GOOGLE', 'seed_86', 350, 96, false, NOW(), NOW()),
('집수리남편', '결혼 9년차 · 아이 1명', 2017, '1', 'seed87@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/9.jpg', 'KAKAO', 'seed_87', 540, 145, false, NOW(), NOW()),
('배달앱남편', '결혼 4년차', 2022, '0', 'seed88@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/6.jpg', 'NAVER', 'seed_88', 160, 52, false, NOW(), NOW()),
('보드타는아빠', '결혼 8년차 · 아이 2명', 2018, '2', 'seed89@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/9.jpg', 'KAKAO', 'seed_89', 500, 135, false, NOW(), NOW()),
('요리도전남편', '결혼 5년차', 2021, '1', 'seed90@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/11.jpg', 'GOOGLE', 'seed_90', 230, 72, false, NOW(), NOW()),
('코딩아빠', '결혼 7년차 · 아이 1명', 2019, '1', 'seed91@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/3.jpg', 'NAVER', 'seed_91', 380, 104, false, NOW(), NOW()),
('클라이밍남편', '결혼 6년차', 2020, '0', 'seed92@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/6.jpg', 'KAKAO', 'seed_92', 280, 82, false, NOW(), NOW()),
('서핑아재', '결혼 10년차 · 아이 1명', 2016, '1', 'seed93@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/7.jpg', 'NAVER', 'seed_93', 720, 192, false, NOW(), NOW()),
('블로그남편', '결혼 8년차 · 아이 2명', 2018, '2', 'seed94@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/12.jpg', 'GOOGLE', 'seed_94', 470, 126, false, NOW(), NOW()),
('강아지아빠', '결혼 3년차', 2023, '0', 'seed95@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/3.jpg', 'KAKAO', 'seed_95', 95, 38, false, NOW(), NOW()),
('텐트아재', '결혼 12년차 · 아이 2명', 2014, '2', 'seed96@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/9.jpg', 'NAVER', 'seed_96', 940, 238, false, NOW(), NOW()),
('패들보드남편', '결혼 5년차 · 아이 1명', 2021, '1', 'seed97@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/12.jpg', 'KAKAO', 'seed_97', 220, 68, false, NOW(), NOW()),
('볼링아빠', '결혼 9년차 · 아이 2명', 2017, '2', 'seed98@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/7.jpg', 'GOOGLE', 'seed_98', 580, 155, false, NOW(), NOW()),
('드럼치는남편', '결혼 7년차', 2019, '1', 'seed99@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/7.jpg', 'NAVER', 'seed_99', 400, 110, false, NOW(), NOW()),
('풍경사진가', '결혼 11년차 · 아이 1명', 2015, '1', 'seed100@azeyo.co.kr', 'https://azeyo-storage.s3.ap-northeast-2.amazonaws.com/prod/azeyo/system/profiles/7.jpg', 'KAKAO', 'seed_100', 850, 220, false, NOW(), NOW());

-- ============================================================
-- 2. 커뮤니티 게시글 50개
-- ============================================================

-- 유저 ID 범위를 변수로 사용할 수 없으므로 서브쿼리 사용
-- 시드 유저의 ID 범위: (SELECT id FROM azeyo_users WHERE sns_id LIKE 'seed_%')

INSERT INTO azeyo_community_posts (type, category, user_id, title, contents, created_at, updated_at) VALUES
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_1'), '아내 생일 선물 뭐가 좋을까요?', '다음 주가 아내 생일인데 매년 뭘 사야 할지 모르겠어요. 올해는 좀 특별한 걸 해주고 싶은데... 30대 후반 아내한테 어떤 선물이 좋을까요? 작년에 향수 사줬더니 좋아하긴 했는데 또 향수는 좀 그렇고.', NOW() - INTERVAL '30 days', NOW()),
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_3'), '장모님 생신 선물 추천 부탁드려요', '장모님 생신이 2주 뒤인데 건강식품 세트 말고 다른 거 추천해주세요. 올해 환갑이시라 좀 특별한 걸 드리고 싶어요. 예산은 30-50만원 정도 생각하고 있습니다.', NOW() - INTERVAL '28 days', NOW()),
('VOTE', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_4'), '결혼기념일 선물 A vs B', '결혼기념일 선물로 고민 중입니다. 여러분이라면 어떤 걸 선택하시겠어요?', NOW() - INTERVAL '26 days', NOW()),
('TEXT', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_6'), '설거지 안 했다고 대판 싸웠어요', '퇴근하고 너무 피곤해서 설거지 좀 미뤘더니... 아내가 "항상 이런 식"이라며 대판 싸웠습니다. 제가 잘못한 건 맞는데 솔직히 하루 미룬 거 가지고 이렇게까지 해야 하나 싶기도 하고. 형님들은 이런 상황에서 어떻게 하세요?', NOW() - INTERVAL '25 days', NOW()),
('TEXT', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_7'), '시어머니 편 들었다가 대참사', '명절에 시어머니가 아내한테 좀 심한 말씀을 하셨는데, 그 자리에서 제가 "엄마 말씀도 일리가 있다"고 했다가... 지금 3일째 냉전 중입니다. 형님들 이거 어떻게 풀어야 하나요?', NOW() - INTERVAL '24 days', NOW()),
('VOTE', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_9'), '부부싸움 후 먼저 사과하는 편?', '부부싸움 후에 보통 누가 먼저 사과하시나요?', NOW() - INTERVAL '23 days', NOW()),
('TEXT', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_13'), '장인어른이랑 등산 가는데 팁 좀', '이번 주말에 처음으로 장인어른이랑 단둘이 등산 갑니다. 평소에 말이 별로 없으신 분이라 2시간 넘게 뭔 얘기를 해야 할지 막막해요. 형님들 장인어른이랑 등산 가본 적 있으신 분 팁 좀 주세요.', NOW() - INTERVAL '22 days', NOW()),
('TEXT', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_20'), '40대 남편 취미 추천', '아이들 다 크고 나니까 갑자기 할 게 없어요. 주말에 뭘 해야 할지 모르겠습니다. 골프는 비싸고, 낚시는 아내가 싫어하고... 형님들 취미 뭐 하세요?', NOW() - INTERVAL '21 days', NOW()),
('VOTE', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_24'), '주말에 뭐하시나요?', '주말에 주로 어떻게 보내시나요?', NOW() - INTERVAL '20 days', NOW()),
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_10'), '첫째가 둘째 때문에 질투해요', '둘째 태어난 지 3개월인데 첫째(5살)가 너무 질투합니다. "아기 다시 보내"라고 하질 않나, 일부러 아기 앞에서 소리 지르질 않나... 어떻게 해야 할까요?', NOW() - INTERVAL '19 days', NOW()),
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_19'), '아이 학원 몇 개까지 보내야 할까요', '초등 2학년 아들인데 현재 영어, 수학, 태권도 다니고 있어요. 아내는 피아노도 보내자고 하는데 솔직히 아이가 너무 지쳐 보여서... 형님들 자녀분들 학원 몇 개 다니시나요?', NOW() - INTERVAL '18 days', NOW()),
('VOTE', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_21'), '아이 스마트폰 몇 살부터?', '아이한테 스마트폰 몇 살부터 사줘야 할까요?', NOW() - INTERVAL '17 days', NOW()),
('TEXT', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_2'), '에어컨 필터 청소 꿀팁', '에어컨 필터 청소 매번 업체 부르다가 직접 해봤는데 의외로 쉽습니다. 중성세제 + 미지근한 물에 30분 담가두면 끝! 연 2회 청소로 전기세도 절약되고 아내한테 칭찬도 받았어요.', NOW() - INTERVAL '16 days', NOW()),
('TEXT', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_14'), '명절 차례상 간소화 성공기', '올해 추석 때 양가 합의해서 차례상 간소화했습니다. 전 3종류 → 1종류, 나물 5가지 → 3가지로 줄였더니 아내가 너무 좋아했어요. 핵심은 며느리가 아니라 사위가 먼저 제안하는 겁니다.', NOW() - INTERVAL '15 days', NOW()),
('VOTE', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_28'), '가계부 쓰시나요?', '가계부를 쓰시나요?', NOW() - INTERVAL '14 days', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_5'), '오늘 퇴근길에 꽃 사갔더니', '별 생각 없이 퇴근길에 편의점 앞 꽃집에서 5천원짜리 꽃다발 하나 사갔는데... 아내가 울더라고요. "언제 이런 걸 다 해"라면서. 형님들 가끔 이런 거 해주세요. 효과 200% 보장합니다.', NOW() - INTERVAL '13 days', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_8'), '아내가 요리 맛있다고 했어요', '결혼 4년 만에 처음으로 제가 해준 김치찌개를 먹고 아내가 "맛있다"고 했습니다. 유튜브 보고 3번 연습했거든요. 인생 처음 칭찬받은 것처럼 기분이 좋네요.', NOW() - INTERVAL '12 days', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_11'), '결혼 3년차인데 아직도 설레요', '주변에서 결혼하면 다 시들해진다고 하던데... 저는 아직도 아내 보면 설레요. 이거 정상인가요? ㅋㅋ', NOW() - INTERVAL '11 days', NOW()),
('VOTE', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_15'), '유부남 최고의 행복은?', '유부남으로서 가장 행복한 순간은?', NOW() - INTERVAL '10 days', NOW()),
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_17'), '100일 선물로 뭘 줬는지 기억나세요?', '아내가 갑자기 "우리 결혼 100일 때 뭘 줬는지 기억해?" 라고 묻는데 진짜 하나도 기억이 안 납니다... 형님들도 이런 거 다 기억하시나요?', NOW() - INTERVAL '9 days', NOW()),
('TEXT', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_22'), '게임했다고 또 싸웠습니다', '아이 재우고 게임 1시간 했는데 아내가 "나는 집안일 하느라 쉬지도 못하는데"라면서 화를 내네요. 솔직히 1시간도 못 쉬나 싶으면서도 아내 입장에서는 그럴 수 있다는 것도 알겠고...', NOW() - INTERVAL '8 days', NOW()),
('TEXT', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_30'), '아내 몰래 골프 시작했는데 들켰어요', '아내한테 야근한다고 하고 골프 연습장 다녔는데 카드 내역으로 들켰습니다 ㅋㅋ 차라리 솔직하게 말할걸 그랬나봐요. 지금 반성문 쓰는 중입니다.', NOW() - INTERVAL '7 days', NOW()),
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_33'), '아빠 싫다는 말에 상처받았어요', '5살 아들이 엄마한테만 가고 "아빠 싫어"라고 해요. 머리로는 다 이해하는데 솔직히 마음이 아프네요. 형님들도 이런 시기 있으셨나요?', NOW() - INTERVAL '6 days', NOW()),
('TEXT', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_35'), '청소 당번제 도입 후기', '아내랑 청소 당번제 도입한 지 3개월째. 화장실은 제가, 주방은 아내가, 거실은 번갈아가면서. 싸움이 확 줄었습니다. 핵심은 자기 영역은 절대 간섭 안 하는 겁니다.', NOW() - INTERVAL '5 days', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_40'), '오늘 아내한테 사랑한다고 말했습니다', '결혼 10년 만에 진지하게 눈 보고 "사랑해"라고 했더니 아내가 "뭐야 무서워" 하면서 웃더라고요. 근데 저녁에 맛있는 거 시켜주더라구요 ㅋㅋ', NOW() - INTERVAL '4 days', NOW()),
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_25'), '아내 운동화 사줬더니 대반응', '아내가 요즘 산책 다니는데 운동화가 낡아서 뉴발란스 993 사줬어요. 10만원대인데 반응이 명품 선물 받은 것 같더라고요. 실용적인 선물이 최고인 것 같습니다.', NOW() - INTERVAL '3 days', NOW()),
('TEXT', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_31'), '냉전 3일째... 해법 좀', '사소한 말다툼으로 3일째 냉전인데 서로 먼저 말 안 걸려고 해요. 저도 자존심이 있는데... 형님들 냉전 풀 때 어떻게 하세요?', NOW() - INTERVAL '2 days', NOW()),
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_39'), '아이 태권도 시작했는데 울면서 안 간대요', '7살 아들 태권도 시작한 지 일주일인데 매일 울면서 안 간다고 해요. 아내는 "좀 더 시켜보자"고 하는데 저는 억지로 시키는 게 맞나 싶어서요.', NOW() - INTERVAL '1 day', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_42'), '아재 개그 모음 공유합니다', E'아이한테 시전해서 성공한 아재 개그 모음입니다.\n\n1. "아빠 배고파" \u2192 "안녕 배고파, 나는 아빠"\n2. "비가 오면 뭐 탈까?" \u2192 "비타민"\n3. "세상에서 가장 빠른 닭은?" \u2192 "후라이드 치킨 (튀림)"\n\n아이가 웃는 건지 한심해서 웃는 건지 모르겠지만 일단 웃깁니다.', NOW(), NOW()),
-- 추가 게시글 70개+
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_12'), '크리스마스 선물 뭐가 좋을까요', '아내한테 크리스마스 선물 뭘 사줘야 할지 고민입니다. 매년 뻔한 것만 사주다 보니 올해는 좀 다른 걸 하고 싶어요.', NOW() - INTERVAL '45 days', NOW()),
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_16'), '아내 출산 선물 추천', '곧 둘째 출산인데 아내한테 수고 선물 뭘 사줘야 할까요? 산후조리원은 이미 예약했고, 추가로 뭔가 해주고 싶습니다.', NOW() - INTERVAL '44 days', NOW()),
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_27'), '화이트데이 선물 뭐 하셨어요?', '발렌타인에 초콜릿 받았는데 화이트데이에 뭘 줘야 할지... 사탕은 좀 유치한 것 같고.', NOW() - INTERVAL '43 days', NOW()),
('VOTE', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_34'), '선물 살 때 아내한테 물어보나요?', '선물 고를 때 어떻게 하시나요?', NOW() - INTERVAL '42 days', NOW()),
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_41'), '아내 핸드크림 추천', '아내가 요즘 손이 거칠다고 하는데 좋은 핸드크림 추천해주세요. 록시땅 괜찮나요?', NOW() - INTERVAL '41 days', NOW()),
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_53'), '10주년 기념 여행지 추천', '결혼 10주년 기념으로 여행 가려는데 추천 부탁드려요. 아이 없이 둘이서 2박 3일 정도요.', NOW() - INTERVAL '40 days', NOW()),
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_62'), '장인어른 생신 선물 고민', '장인어른이 70대이신데 건강식품은 이미 많으시고... 뭘 드려야 할지 막막합니다.', NOW() - INTERVAL '39 days', NOW()),
('TEXT', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_12'), '돈 문제로 싸웠습니다', '가계부 쓰자는 아내와 자유롭게 쓰고 싶은 저... 항상 돈 때문에 싸우네요. 형님들은 용돈 얼마씩 쓰세요?', NOW() - INTERVAL '38 days', NOW()),
('TEXT', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_23'), '핸드폰 비밀번호 문제', '아내가 핸드폰 비밀번호 바꿨다고 화를 내요. 숨길 건 없는데 그냥 습관적으로 바꾼 건데... 이해가 안 되네요.', NOW() - INTERVAL '37 days', NOW()),
('VOTE', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_34'), '부부싸움 후 풀리는 데 얼마나 걸려요?', '보통 싸우고 얼마 만에 풀리시나요?', NOW() - INTERVAL '36 days', NOW()),
('TEXT', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_44'), '아내 친구들 앞에서 실수했어요', '아내 친구들 모임에 갔다가 아내 나이를 잘못 말해서... 집에 오자마자 대판 싸웠습니다 ㅠㅠ', NOW() - INTERVAL '35 days', NOW()),
('TEXT', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_55'), '육아 방식 때문에 매일 싸워요', '아내는 엄격하게, 저는 자유롭게 키우자는 입장인데 매번 충돌합니다. 아이 앞에서 싸우면 안 되는 거 아는데...', NOW() - INTERVAL '34 days', NOW()),
('TEXT', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_66'), '청소 기준이 다릅니다', '저는 깨끗하다고 생각하는데 아내는 아직 더럽다고 해요. 기준이 너무 달라서 맨날 갈등입니다.', NOW() - INTERVAL '33 days', NOW()),
('TEXT', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_27'), '캠핑 초보 장비 추천', '가족 캠핑 시작하려는데 텐트부터 뭘 사야 할지 모르겠어요. 예산 100만원 정도면 뭘 갖춰야 할까요?', NOW() - INTERVAL '32 days', NOW()),
('TEXT', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_37'), '아내랑 같이 할 수 있는 취미', '둘이서 같이 할 수 있는 취미 찾고 있어요. 보드게임 말고 밖에서 하는 거로요.', NOW() - INTERVAL '31 days', NOW()),
('VOTE', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_47'), '운동 뭐 하세요?', '형님들 운동 뭐 하시나요?', NOW() - INTERVAL '30 days', NOW()),
('TEXT', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_57'), '러닝 시작했는데 무릎이 아파요', '40대에 러닝 시작했는데 2주 만에 무릎이 아프기 시작합니다. 러닝화가 문제일까요?', NOW() - INTERVAL '29 days', NOW()),
('TEXT', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_67'), '아이랑 레고 같이 하기', '아들이랑 레고 시작했는데 제가 더 빠져들었습니다 ㅋㅋ 형님들 추천 세트 있나요?', NOW() - INTERVAL '28 days', NOW()),
('TEXT', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_77'), '자전거 출퇴근 후기', '자전거 출퇴근 시작한 지 한 달. 체중 3kg 빠지고, 아침에 개운하고, 교통비 절약되고. 단점은 비 오는 날뿐입니다.', NOW() - INTERVAL '27 days', NOW()),
('TEXT', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_87'), '홈트 유튜브 추천', '헬스장 갈 시간이 없어서 집에서 운동하려는데 좋은 유튜브 채널 추천 부탁드립니다.', NOW() - INTERVAL '26 days', NOW()),
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_29'), '아이 잠투정이 심해요', '3살 아이가 매일 밤 잠투정 합니다. 1시간씩 울다가 겨우 자는데 저도 아내도 체력이 바닥이에요.', NOW() - INTERVAL '25 days', NOW()),
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_43'), '어린이집 적응 기간', '아이가 어린이집 가기 싫다고 매일 아침 울어요. 2주째인데 적응 기간이 원래 이렇게 긴가요?', NOW() - INTERVAL '24 days', NOW()),
('VOTE', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_51'), '아이 훈육, 어떻게 하세요?', '아이 훈육할 때 어떤 방식을 쓰시나요?', NOW() - INTERVAL '23 days', NOW()),
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_61'), '아이 영어 교육 몇 살부터?', '주변에서 5살부터 영어 가르치라고 하는데 너무 이른 거 아닌가요? 형님들은 몇 살부터 시키셨어요?', NOW() - INTERVAL '22 days', NOW()),
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_71'), '딸 사춘기 시작된 것 같아요', '초등 5학년 딸이 갑자기 말수가 줄었어요. 방문도 잠그고... 아빠로서 어떻게 대해야 할까요?', NOW() - INTERVAL '21 days', NOW()),
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_81'), '아이 용돈 얼마씩 주세요?', '초등 3학년인데 친구들은 다 용돈 받는다고 해요. 얼마가 적당할까요?', NOW() - INTERVAL '20 days', NOW()),
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_91'), '아빠표 도시락 도전기', '아이 소풍 도시락을 제가 만들었습니다. 김밥이랑 미니 핫도그... 모양은 별로인데 아이가 다 먹어줘서 뿌듯했어요.', NOW() - INTERVAL '19 days', NOW()),
('TEXT', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_18'), '세탁기 냄새 제거 꿀팁', '세탁기에서 냄새 나시는 분? 식초 + 베이킹소다 넣고 빈 통 세탁 돌리면 신세계입니다.', NOW() - INTERVAL '18 days', NOW()),
('TEXT', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_29'), '전기세 절약 실험 결과', '에어컨 26도 vs 28도+선풍기 한 달 비교해봤습니다. 전기세 3만원 차이... 28도+선풍기 승.', NOW() - INTERVAL '17 days', NOW()),
('VOTE', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_38'), '주말 장보기 어디서 하세요?', '장 어디서 주로 보시나요?', NOW() - INTERVAL '16 days', NOW()),
('TEXT', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_48'), '화장실 타일 곰팡이 제거법', '락스 키친타올 팩 진짜 효과 있어요. 키친타올에 락스 적셔서 곰팡이 위에 1시간 붙여놓으면 깨끗해집니다.', NOW() - INTERVAL '15 days', NOW()),
('TEXT', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_58'), '신발장 냄새 잡는 법', '커피 찌꺼기 말려서 신발장에 넣어두면 냄새가 싹 사라집니다. 스타벅스에서 무료로 줘요.', NOW() - INTERVAL '14 days', NOW()),
('TEXT', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_68'), '자동차 세차 셀프 vs 자동', '셀프 세차 3천원, 자동 세차 7천원. 결과는 비슷합니다. 다만 셀프는 운동 효과가 있어요 ㅋㅋ', NOW() - INTERVAL '13 days', NOW()),
('TEXT', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_78'), '배수구 막힘 해결', '베이킹소다 + 뜨거운 물 조합이면 웬만한 배수구 막힘은 해결됩니다. 업체 부르면 5만원인데 500원이면 끝.', NOW() - INTERVAL '12 days', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_15'), '신혼 1년차의 깨달음', '결혼 전: "나는 절대 안 변해" 결혼 후: 화장실 변기 뚜껑 자동으로 내리는 사람이 됐습니다.', NOW() - INTERVAL '11 days', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_26'), '아내의 "아무거나 먹자"', '형님들도 "뭐 먹을래?" "아무거나" 이러면 30분 넘게 고민하시죠? 저만 그런 게 아니었군요...', NOW() - INTERVAL '10 days', NOW()),
('VOTE', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_36'), '결혼해서 좋은 점 vs 힘든 점', '결혼 생활에서 더 크게 느끼는 건?', NOW() - INTERVAL '9 days', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_46'), '아내 잘 때 보면 예쁘더라', '자고 있는 아내 얼굴 보면 진짜 예쁘다는 생각이 들어요. 깨어있을 때는 무섭... 아 아무것도 아닙니다.', NOW() - INTERVAL '8 days', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_56'), '유부남의 금요일 밤', '예전: "야 오늘 술 한잔?" 지금: "여보 나 치킨 사갈까?" 이게 행복입니다.', NOW() - INTERVAL '7 days', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_65'), '아이 학예회 다녀왔습니다', '아이가 무대에서 노래 부르는데 눈물이 나더라고요. 옆에 있던 아빠들도 다 울었습니다 ㅋㅋ', NOW() - INTERVAL '6 days', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_75'), '결혼 후 달라진 것들', '결혼 전: 자유 결혼 후: 책임감, 그리고 더 큰 행복. 형님들 다 공감하시죠?', NOW() - INTERVAL '5 days', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_85'), '아내 몰래 다이어트 중', '아내가 "요즘 좀 나왔다"고 해서 몰래 다이어트 시작했습니다. 점심 샐러드 먹는데 동료들이 이상하게 봐요 ㅋㅋ', NOW() - INTERVAL '4 days', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_95'), '강아지 키우고 싶은데', '아내는 강아지 키우자고 하는데 저는 고양이파... 형님들 반려동물 뭐 키우세요?', NOW() - INTERVAL '3 days', NOW()),
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_70'), '화해 선물로 뭐가 좋을까요', '어제 크게 싸웠는데 사과의 의미로 선물 하나 사가려고요. 꽃+케이크는 너무 뻔한가?', NOW() - INTERVAL '2 days', NOW()),
('TEXT', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_80'), '말투 때문에 오해받아요', '장난으로 한 말인데 아내가 진심으로 받아들여서 싸웠어요. 말투를 고쳐야 하는 걸까요?', NOW() - INTERVAL '1 day', NOW()),
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_100'), '아이 첫 걸음마', '오늘 아이가 처음 걸었습니다!! 비틀비틀 3걸음... 영상 찍느라 정신없었는데 아내랑 둘 다 울었어요 ㅠㅠ', NOW(), NOW()),
('VOTE', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_50'), '아내 생일에 깜짝 파티 vs 조용한 디너', '어떤 게 더 좋을까요?', NOW() - INTERVAL '48 days', NOW()),
('VOTE', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_73'), '아이 습관 교정, 엄격하게 vs 부드럽게', '아이 잘못된 습관 고칠 때 어떤 방식이 좋을까요?', NOW() - INTERVAL '47 days', NOW()),
('VOTE', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_83'), '설거지 누가 하시나요?', '우리 집 설거지 담당은?', NOW() - INTERVAL '46 days', NOW()),
('VOTE', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_93'), '유부남의 취침 시간', '보통 몇 시에 주무시나요?', NOW() - INTERVAL '44 days', NOW()),
('VOTE', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_63'), '명절 어디서 보내나요?', '명절은 주로 어디서?', NOW() - INTERVAL '43 days', NOW()),
('VOTE', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_89'), '캠핑 vs 호텔', '가족 여행 스타일은?', NOW() - INTERVAL '42 days', NOW());

-- 추가 VOTE 게시글 선택지
UPDATE azeyo_community_posts SET vote_option_a = '서프라이즈로 고르기', vote_option_b = '물어보고 사기'
WHERE title = '선물 살 때 아내한테 물어보나요?';
UPDATE azeyo_community_posts SET vote_option_a = '하루 이내', vote_option_b = '며칠 걸림'
WHERE title = '부부싸움 후 풀리는 데 얼마나 걸려요?';
UPDATE azeyo_community_posts SET vote_option_a = '헬스/러닝', vote_option_b = '골프/등산'
WHERE title = '운동 뭐 하세요?';
UPDATE azeyo_community_posts SET vote_option_a = '대화로 설명', vote_option_b = '타임아웃 후 대화'
WHERE title = '아이 훈육, 어떻게 하세요?';
UPDATE azeyo_community_posts SET vote_option_a = '대형마트', vote_option_b = '온라인/새벽배송'
WHERE title = '주말 장보기 어디서 하세요?';
UPDATE azeyo_community_posts SET vote_option_a = '좋은 점이 더 많다', vote_option_b = '힘든 점이 더 많다'
WHERE title = '결혼해서 좋은 점 vs 힘든 점';
UPDATE azeyo_community_posts SET vote_option_a = '깜짝 파티', vote_option_b = '조용한 디너'
WHERE title = '아내 생일에 깜짝 파티 vs 조용한 디너';
UPDATE azeyo_community_posts SET vote_option_a = '엄격하게', vote_option_b = '부드럽게'
WHERE title = '아이 습관 교정, 엄격하게 vs 부드럽게';
UPDATE azeyo_community_posts SET vote_option_a = '내가 한다', vote_option_b = '아내가 한다'
WHERE title = '설거지 누가 하시나요?';
UPDATE azeyo_community_posts SET vote_option_a = '11시 전', vote_option_b = '12시 이후'
WHERE title = '유부남의 취침 시간';
UPDATE azeyo_community_posts SET vote_option_a = '남편 쪽', vote_option_b = '아내 쪽'
WHERE title = '명절 어디서 보내나요?';
UPDATE azeyo_community_posts SET vote_option_a = '캠핑', vote_option_b = '호텔'
WHERE title = '캠핑 vs 호텔';

-- VOTE 게시글에 선택지 추가
UPDATE azeyo_community_posts SET vote_option_a = '고급 레스토랑 디너', vote_option_b = '여행 이용권'
WHERE title = '결혼기념일 선물 A vs B';

UPDATE azeyo_community_posts SET vote_option_a = '내가 먼저', vote_option_b = '아내가 먼저'
WHERE title = '부부싸움 후 먼저 사과하는 편?';

UPDATE azeyo_community_posts SET vote_option_a = '집에서 쉬기', vote_option_b = '밖에서 활동'
WHERE title = '주말에 뭐하시나요?';

UPDATE azeyo_community_posts SET vote_option_a = '초등 입학 전', vote_option_b = '초등 고학년'
WHERE title = '아이 스마트폰 몇 살부터?';

UPDATE azeyo_community_posts SET vote_option_a = '쓴다', vote_option_b = '안 쓴다'
WHERE title = '가계부 쓰시나요?';

UPDATE azeyo_community_posts SET vote_option_a = '아이가 웃을 때', vote_option_b = '아내가 행복할 때'
WHERE title = '유부남 최고의 행복은?';

-- ============================================================
-- 3. 족보 50개
-- ============================================================
INSERT INTO azeyo_jokbo_templates (category, user_id, title, content, copy_count, created_at, updated_at) VALUES

('WIFE_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_4'), '결혼 10년차 남편의 진심 어린 생일 편지', E'여보, 생일 축하해.\n\n이 편지를 쓰면서 우리가 함께 걸어온 시간들을 떠올려봤어. 처음 만났을 때 수줍게 웃던 네 모습, 결혼식 날 하얀 드레스를 입고 걸어오던 네 모습, 첫째를 낳고 지쳐서 잠들었을 때의 평화로운 얼굴... 그 모든 순간이 아직도 생생해.\n\n솔직히 말할게. 결혼 생활이 항상 꽃길만은 아니었잖아. 나도 미숙했고, 서로 다른 점 때문에 부딪히기도 많이 했어. 밤새 싸우고 서로 등 돌리고 잤던 날들, 지금 생각하면 왜 그랬나 싶기도 하고... 그런데 있잖아, 그 모든 시간을 견딘 건 결국 당신이 내 옆에 있었기 때문이야.\n\n아이들이 아플 때 밤새 간호하던 네가, 내가 회사에서 힘들어할 때 아무 말 없이 맥주 하나 건네주던 네가, 시어머니한테 서운한 일 있어도 웃으면서 넘기던 네가... 그런 당신이 얼마나 대단한 사람인지 나는 알아. 매일 말은 못 하지만, 매일 느끼고 있어.\n\n기억나? 작년에 내가 갑자기 입원했을 때, 아이들 학교 보내고 병원으로 뛰어오던 네 모습. 헐레벌떡 들어오면서도 나한테는 웃으면서 \"걱정 마, 다 괜찮을 거야\" 했잖아. 나중에 간호사분이 말해줬어, 복도에서 혼자 울고 있었다고. 그 이야기 듣고 나도 몰래 울었어. 미안하고 고맙고... 그런 당신이 있어서 내가 버틸 수 있었어.\n\n당신은 내 인생의 MVP야. 아이들의 세상에서 가장 좋은 엄마이자, 나한테는 세상에서 가장 든든한 동반자야. 당신이 있어서 집에 돌아오는 길이 항상 기대되고, 당신이 있어서 내일이 두렵지 않아.\n\n오늘은 당신만을 위한 날이야. 아이들 내가 볼 테니까 오늘만큼은 아무 걱정 말고 하고 싶은 거 해. 카페 가서 커피 마시면서 책 읽어도 좋고, 친구들 만나서 수다 떨어도 좋고, 그냥 집에서 낮잠 자도 좋아. 당신이 행복하면 나도 행복해, 진심으로.\n\n앞으로 남은 생일마다 이렇게 편지 쓸게. 점점 주름이 늘고 머리가 희끗희끗해져도, 내 눈에 당신은 항상 처음 만났을 때 그 사람이야.\n\n생일 축하해, 여보. 당신을 만난 건 내 인생 최고의 행운이야. 사랑해, 오늘도 내일도 영원히.', 567, NOW() - INTERVAL '25 days', NOW()),

('WIFE_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_21'), '웃음과 감동이 함께하는 생일 편지', E'여보, 생일 축하해! 🎂\n\n일단 고백부터 할게. 오늘이 네 생일이라는 거 까먹을 뻔했어. (농담이야 농담!! 한 달 전부터 캘린더에 별 다섯 개 표시해놨다고!!)\n\n근데 진짜 신기한 게 있어. 매년 네 생일이 돌아올 때마다 내가 얼마나 운이 좋은 사람인지 다시 한번 느껴. 생각해봐, 전 세계 수십억 명 중에서 하필 너를 만나고, 하필 서로 좋아하게 되고, 하필 결혼까지 한 거잖아. 이건 뭐 로또 당첨보다 더한 확률 아니야?\n\n솔직히 나 같은 남편 데리고 사느라 고생이 많지? 양말 뒤집어서 빨래통에 넣는 것도 아직 못 고쳤고, 냉장고 문 열어놓는 것도 여전하고, 주말마다 소파에서 잠드는 것도... 어, 이러면 안 되는데. 사과 편지가 아니라 생일 편지인데 ㅋㅋ\n\n진지하게 말할게. 당신은 정말 대단한 사람이야. 아침마다 온 가족 밥 차려주고, 아이들 숙제 봐주고, 집안일 하면서도 자기 일도 해내잖아. 나는 가끔 설거지 한 번 하고 "오늘 집안일 했다" 하는데... 반성합니다, 여보님.\n\n올해는 좀 달라질게, 진짜로. 매일은 아니더라도 이틀에 한 번은 설거지 하고, 주말 아침은 내가 챙기고, 네가 쉴 수 있는 시간을 더 만들어줄게. 말로만 하는 거 아니야. 이 편지 스크린샷 찍어서 약속 어기면 보여줘도 돼. 아니, 냉장고에 붙여놔. 매일 볼 수 있게. 그래야 나도 정신 차리니까.\n\n그리고 하나 더. 올해는 매달 데이트하자. 아이들 친정에 맡기든, 시터 부르든, 한 달에 한 번은 우리 둘만의 시간을 만들자. 연애 때처럼 손잡고 걷고, 맛있는 거 먹고, 영화도 보자. 부부인데 데이트가 왜 안 돼? ㅋㅋ\n\n마지막으로, 당신이 내 옆에 있어줘서 진심으로 고마워. 당신 때문에 매일이 재밌고, 당신 때문에 힘든 것도 견딜 수 있어. 앞으로도 같이 늙어가자, 할머니 할아버지 될 때까지.\n\n생일 축하해, 세상에서 제일 사랑하는 우리 와이프! ❤️\n\nPS. 선물은 택배로 올 거야. 기대해도 좋아. (이번엔 사이즈 안 틀렸다, 아마도...)\nPPS. 오늘 저녁은 네가 가고 싶었던 그 식당 예약했어. 아이들은 엄마한테 맡겨놨으니까 걱정 마!', 876, NOW() - INTERVAL '24 days', NOW()),

('WIFE_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_42'), '깊은 감사를 담은 아내에게 보내는 편지', E'사랑하는 여보에게.\n\n매년 이맘때쯤이면 편지를 써야지 하다가도 막상 펜을 잡으면 뭘 써야 할지 모르겠더라고. 하고 싶은 말은 많은데 글로 표현하는 게 서툴러서... 그래도 올해는 제대로 써보려고 해.\n\n우리가 처음 만났을 때 기억나? 소개팅 자리에서 네가 아이스 아메리카노를 시키면서 빨대를 안 꽂고 마시던 모습. 사소한 건데 그게 왜 그렇게 예뻐 보였는지. 그날 집에 가면서 이 사람이다 싶었어, 진짜로.\n\n결혼하고 나서 정신없이 살았지. 신혼의 설렘도 잠시, 아이가 태어나고 육아에 치이고 서로한테 여유가 없어지면서 다투기도 많이 했잖아. 새벽에 아이 울음소리에 깨서 서로 눈치 보던 것, 누가 먼저 일어날 건지 가위바위보 하던 것도 지금 생각하면 우리만의 추억이야.\n\n당신이 나한테 해준 것들을 헤아려보면 끝이 없어. 내가 야근할 때 혼자 아이 재우고 기다려준 밤들, 내가 아플 때 새벽에 약국 뛰어가 준 것, 시댁 가면서 아무렇지 않은 척 웃어준 것, 내 부족한 월급으로 살림하면서도 한 번도 원망하지 않은 것... 당신은 그냥 한 거겠지만, 나한테는 하나하나가 다 감사한 거야.\n\n가끔 당신이 혼자 거실에 앉아서 멍하니 있을 때 보면 마음이 아파. 많이 지쳤구나, 더 잘해줘야 하는데, 하면서도 막상 다음 날이면 또 바쁘다는 핑계로 넘어가버리는 내가 밉다.\n\n올해 당신의 생일에 약속할게. 완벽한 남편은 못 되더라도, 당신이 외롭지 않은 남편이 될게. 당신이 이야기할 때 핸드폰 내려놓고 들을게. 당신이 힘들다고 하면 해결하려 하지 말고 그냥 안아줄게. 당신의 작은 변화도 눈치채는 남편이 될게. 머리 잘랐을 때, 새 옷 입었을 때, 기분이 안 좋을 때... 그런 사소한 것들을 놓치지 않는 남편이 될게.\n\n그리고 가끔은 이유 없이 꽃도 사갈게. 기념일이 아니어도 "사랑해"라고 말할게. 당신이 당연하다고 느끼는 것들이 나한테는 하나도 당연하지 않다는 걸, 매일 표현하며 살게.\n\n생일 축하해, 여보. 당신은 이 세상에서 가장 아름다운 사람이야. 겉모습이 아니라, 마음이. 당신의 따뜻한 마음이, 누군가를 위해 희생하는 그 마음이, 나를 더 나은 사람으로 만들어줘.\n\n영원히 사랑해. ❤️', 789, NOW() - INTERVAL '23 days', NOW()),

('WIFE_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_59'), '아이들과 함께 쓰는 엄마 생일 편지', E'세상에서 제일 좋은 엄마이자, 나의 소중한 아내에게.\n\n오늘은 우리 가족에게 특별한 날이야. 바로 당신이 이 세상에 태어난 날. 당신이 태어나지 않았다면 우리 가족도 없었을 거야. 그러니까 오늘은 우리 가족 전체의 기념일인 셈이지.\n\n아이들이 오늘 아침부터 난리야. 큰애는 새벽에 일어나서 그림 그리고 있었어. 뭐냐고 물었더니 "엄마 생일 선물이니까 보지 마" 래. 둘째는 "엄마한테 편지 쓸 건데 아빠가 글자 좀 알려줘" 하더라고. 틀린 글자 투성이지만 그게 더 귀엽잖아. 아이들이 이 카드 안에 직접 쓴 편지 넣어놨으니까 꼭 읽어줘.\n\n나도 아이들한테 "엄마한테 뭐라고 쓰면 좋을까?" 물어봤거든. 큰애가 이러더라. "엄마가 세상에서 제일 좋아요. 맛있는 거 해줘서 감사해요. 근데 가끔 무서워요." 마지막 거 빼고는 완벽하지? ㅋㅋ 둘째는 "엄마 예뻐요! 아빠보다 더 좋아요!" 래... 배신자...\n\n당신이 엄마로서 얼마나 대단한지 아이들은 아직 모를 거야. 새벽에 열나는 아이 안고 응급실 뛰어갔던 것, 아이 학교 발표 준비물 만든다고 밤새 풀칠하던 것, 아이가 친구한테 따돌림당했을 때 혼자 울면서 학교에 전화했던 것... 나는 다 기억하고 있어.\n\n당신 덕분에 우리 아이들이 밝고 건강하게 자라고 있어. 가끔 아이들이 예의 바르게 인사하거나 다른 사람을 배려하는 모습을 보면, 이건 다 당신이 가르친 거구나 싶어서 존경스러워.\n\n그리고 엄마이기 전에 당신도 한 사람이잖아. 가끔 당신만의 시간이 필요하다는 거 알아. 올해는 한 달에 한 번은 당신만의 날을 만들어줄게. 그날은 아이들 내가 데리고 있을 테니까 친구 만나든, 카페 가든, 뭐든 하고 싶은 거 해.\n\n생일 축하해, 여보. 우리 가족의 중심이 되어줘서 고마워. 아이들 말처럼 세상에서 제일 좋은 엄마야, 당신은. 그리고 세상에서 제일 좋은 아내이기도 하고.\n\n사랑해, 오늘도 내일도 영원히. 당신이 이 집의 햇살이야. 당신이 웃으면 온 집안이 밝아지고, 당신이 지치면 우리 모두가 걱정돼. 그러니까 오늘만큼은 활짝 웃어줘, 우리를 위해서.\n\n- 남편 & 아이들 올림 🎈', 456, NOW() - INTERVAL '22 days', NOW()),

('WIFE_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_70'), '신혼 시절을 그리워하며 쓰는 생일 편지', E'여보, 생일 축하해.\n\n어젯밤에 옛날 사진첩을 꺼내봤어. 연애 시절 사진, 결혼식 사진, 신혼여행 사진... 보면서 혼자 웃었다가 혼자 찡했다가 했어.\n\n사진 속 우리는 진짜 풋풋하더라. 데이트할 때 뭘 입을지 한 시간씩 고민하고, 손잡으면 심장이 두근거리고, 헤어지기 싫어서 전화 먼저 끊자고 실랑이하고... 그때의 우리가 지금의 우리를 본다면 어떨까? "야, 좀 로맨틱하게 살아라" 할까? ㅋㅋ\n\n근데 있잖아, 나는 오히려 지금이 더 좋아. 그때는 설레기만 했지, 서로를 진짜로 알지는 못했거든. 지금은 네가 피곤하면 표정만 봐도 알고, 네가 속상하면 어깨를 두드려줘야 한다는 것도 알고, 네가 아무렇지 않은 척할 때가 제일 힘들다는 것도 알아. 이건 시간이 준 선물이야.\n\n신혼 때 우리가 밤새 이야기하면서 꿈꿨던 것들 기억나? 아이 둘 낳고, 마당 있는 집에서 살고, 주말마다 가족 여행 다니고... 전부 다 이루지는 못했지만, 당신과 함께 꿈꿨다는 것 자체가 행복이었어. 그리고 아직 시간은 많잖아, 하나씩 이뤄가면 되지 뭐.\n\n요즘 살면서 가장 행복한 순간이 뭔지 알아? 퇴근하고 집에 들어서는데 집에서 불빛이 새어나올 때. 아, 나를 기다리는 사람이 있구나, 하는 그 느낌. 비 오는 날에는 특히 더 그래. 춥고 축축한 바깥에서 따뜻한 우리 집으로 돌아오면 당신이 "밥 먹었어?" 하잖아. 그 한마디가 나한테는 세상에서 제일 따뜻한 말이야.\n\n생일이라고 거창한 건 준비 못 했어. 근데 당신이 요즘 가고 싶다고 했던 곳, 먹고 싶다고 했던 것, 사고 싶다고 했던 것, 다 기억하고 있어. 당신이 무심코 던진 말들을 나는 하나하나 마음속에 적어놓거든. 하나씩 이뤄줄게, 약속해.\n\n가끔 당신이 창밖을 멍하니 보고 있을 때, 뭘 생각하는지 궁금해. 혹시 연애 시절처럼 어딘가 떠나고 싶은 건 아닌지, 지금 생활에 지친 건 아닌지... 그럴 때 나한테 말해줘. 당신이 가고 싶은 곳이면 어디든 같이 갈게. 당신이 하고 싶은 거면 뭐든 같이 할게.\n\n생일 축하해, 내 사랑. 당신과 함께 늙어가는 게 내 인생의 가장 큰 축복이야. 내년 생일에도, 10년 뒤 생일에도, 50년 뒤 생일에도 내가 옆에서 축하해줄게. 주름진 손으로 서로를 잡고 공원 벤치에 앉아 있는 그날까지.\n\n사랑해, 영원히. 💕', 345, NOW() - INTERVAL '21 days', NOW()),

('MOTHER_IN_LAW_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_14'), '장모님 카톡 정석', '어머니, 생신 축하드립니다! 🎂

항상 건강하시고 행복한 나날 보내세요.
맛있는 거 드시러 이번 주말에 찾아뵙겠습니다.

늘 감사드립니다. 🙏', 456, NOW() - INTERVAL '21 days', NOW()),

('MOTHER_IN_LAW_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_17'), '장모님 감동 카톡', '어머니, 생신 진심으로 축하드립니다.

어머니 덕분에 이렇게 좋은 아내를 만나
행복한 가정을 꾸리고 살 수 있었습니다.
항상 베풀어주시는 사랑에 감사드립니다.

건강이 최고입니다.
오래오래 건강하시길 바랍니다.

사위 올림 🌸', 389, NOW() - INTERVAL '20 days', NOW()),

('MOTHER_IN_LAW_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_9'), '간결하지만 센스있는 카톡', '어머니! 생신 축하드려요 🎉
이따 저녁에 좋은 데 모시고 갈게요.
선물은 비밀입니다 ㅎㅎ
항상 건강하세요!', 278, NOW() - INTERVAL '19 days', NOW()),

('MOTHER_IN_LAW_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_49'), '어른스러운 카톡', '어머니, 생신을 진심으로 축하드립니다.

돌이켜보면 처음 인사드리러 갔을 때가
엊그제 같은데 벌써 이렇게 시간이 흘렀네요.

아이들의 좋은 외할머니가 되어주셔서
늘 감사한 마음입니다.

건강하시고 행복한 한 해 되세요. 🙏', 198, NOW() - INTERVAL '18 days', NOW()),

('APOLOGY', (SELECT id FROM azeyo_users WHERE sns_id='seed_6'), '진심 사과 문자', '여보, 아까 내가 잘못했어.

피곤하다는 핑계로
당신 마음을 생각 안 했어.
당신이 얼마나 서운했을지 생각하면
정말 미안해.

다시는 이런 일 없을게.
미안하고 사랑해.', 567, NOW() - INTERVAL '17 days', NOW()),

('APOLOGY', (SELECT id FROM azeyo_users WHERE sns_id='seed_22'), '유머 + 진심 사과', '여보... 아까 그거 내가 100% 잘못했어.
변명의 여지가 없다.

반성의 의미로
1. 오늘 설거지 내가 할게
2. 내일 저녁 맛집 예약할게
3. 앞으로 더 신경 쓸게

냉장고에 맥주 있으면 하나 꺼내줄래?
들어가면서 치킨 사갈게 🍗

미안하고 고마워, 항상.', 876, NOW() - INTERVAL '16 days', NOW()),

('APOLOGY', (SELECT id FROM azeyo_users WHERE sns_id='seed_31'), '깜빡한 날의 사과', '여보, 오늘 진짜 미안해.

바쁘다는 핑계로 중요한 걸 놓쳤어.
당신이 얼마나 서운했을지 생각하면 마음이 아파.

내일부터 캘린더 알림 3개 걸어놓을게.
같은 실수 두 번 안 한다, 약속해.

미안하고 사랑해, 항상.', 345, NOW() - INTERVAL '15 days', NOW()),

('APOLOGY', (SELECT id FROM azeyo_users WHERE sns_id='seed_44'), '짧지만 진심인 사과', '여보, 미안해.
내가 생각이 짧았어.
당신 말이 맞아.

오늘 저녁 맛있는 거 사갈게.
사랑해. ❤️', 432, NOW() - INTERVAL '14 days', NOW()),

('ANNIVERSARY', (SELECT id FROM azeyo_users WHERE sns_id='seed_4'), '결혼기념일 메시지', '오늘이 우리가 부부가 된 지 OO년 되는 날이야.

돌이켜보면 좋은 날도, 힘든 날도 있었지만
당신과 함께여서 다 견딜 수 있었어.

앞으로 남은 날들도 함께 걸어가자.
당신을 만난 건 내 인생 최고의 행운이야.

OO주년 축하해, 여보. 영원히 사랑해 ❤️', 789, NOW() - INTERVAL '13 days', NOW()),

('ANNIVERSARY', (SELECT id FROM azeyo_users WHERE sns_id='seed_45'), '100일 / 발렌타인 메시지', '같이 밥 먹고, 같이 TV 보고, 같이 잠드는
평범한 일상이 사실은 가장 특별한 거더라.

오늘 하루도 수고했어, 여보.
당신이 있어서 집에 오는 길이 항상 기대돼.

사랑해, 오늘도 내일도 모레도.', 456, NOW() - INTERVAL '12 days', NOW()),

('ANNIVERSARY', (SELECT id FROM azeyo_users WHERE sns_id='seed_58'), '유머 기념일 메시지', '여보, 오늘 우리 기념일이야!
(이번에는 잊지 않았다 👍)

매년 이 날이 오면
당신과 결혼하길 정말 잘했다는 생각이 들어.
(나머지 364일도 그렇긴 해)

올해도 행복하자.
사랑해! 🥂', 321, NOW() - INTERVAL '11 days', NOW()),

('ENCOURAGEMENT', (SELECT id FROM azeyo_users WHERE sns_id='seed_10'), '지친 아내에게 응원', '여보, 오늘 하루도 고생 많았어.

아이들 챙기고 집안일 하면서
자기 시간도 없이 바쁜 거 알아.

당신은 정말 대단한 사람이야.
가끔 지쳐도 괜찮아, 내가 있잖아.

오늘 저녁은 내가 할게. 좀 쉬어 ❤️', 654, NOW() - INTERVAL '10 days', NOW()),

('ENCOURAGEMENT', (SELECT id FROM azeyo_users WHERE sns_id='seed_40'), '퇴근 후 응원 한마디', '여보, 오늘도 수고했어.

당신이 집을 지켜주니까
내가 마음 놓고 일할 수 있는 거야.
항상 고마워.

오늘 저녁 뭐 먹고 싶어?
네가 원하는 거 다 사갈게. 🛒', 432, NOW() - INTERVAL '9 days', NOW()),

('ENCOURAGEMENT', (SELECT id FROM azeyo_users WHERE sns_id='seed_81'), '힘들 때 보내는 메시지', '여보야,

요즘 많이 힘들지?
말 안 해도 다 알아.

그래도 당신은 잘하고 있어.
세상 누구보다.

힘들면 나한테 기대.
그게 남편인 이유니까.

사랑해. 항상.', 287, NOW() - INTERVAL '8 days', NOW()),

('MOTHER_IN_LAW_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_74'), '효도 만렙 카톡', '어머니, 생신 축하드립니다!

어머니의 손맛을 닮은 아내 덕분에
매일 행복한 밥상을 받고 있습니다.
모든 게 어머니 덕분입니다.

이번 주말에 온 가족이 모셔다 드릴게요.
미리 맛집 예약해뒀습니다 ㅎㅎ

늘 건강하세요! 🌹', 234, NOW() - INTERVAL '6 days', NOW()),

('APOLOGY', (SELECT id FROM azeyo_users WHERE sns_id='seed_57'), '약속 못 지킨 사과', '여보, 오늘 약속 못 지켜서 진짜 미안해.

일이 갑자기 생겨서...
라고 변명하고 싶지만
어떤 이유든 약속은 약속이니까.

이번 주말에 당신이 가고 싶었던 곳
꼭 데려다 줄게. 약속해.

미안해, 여보. 🙏', 198, NOW() - INTERVAL '5 days', NOW()),

('ANNIVERSARY', (SELECT id FROM azeyo_users WHERE sns_id='seed_80'), '10주년 기념 메시지', '여보, 결혼 10주년 축하해.

10년.
짧다면 짧고 길다면 긴 시간인데
당신과 보낸 10년은 정말 빠르게 지나갔어.

그만큼 행복했다는 뜻이겠지.

다음 10년도, 그 다음 10년도
당신과 함께하고 싶어.

사랑해, 여보. 10년 동안 고마웠어. 💕', 567, NOW() - INTERVAL '4 days', NOW()),

('ENCOURAGEMENT', (SELECT id FROM azeyo_users WHERE sns_id='seed_33'), '아침에 보내는 응원', '좋은 아침, 여보!

오늘도 힘내자.
당신은 최고의 아내이자 최고의 엄마야.

점심 맛있는 거 먹어.
저녁에 보자!

사랑해 ☀️', 176, NOW() - INTERVAL '3 days', NOW()),

('MOTHER_IN_LAW_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_87'), '깔끔한 카톡', '어머니, 생신 축하드립니다! 🎂
건강이 최고입니다.
항상 건강하시고 행복한 나날 보내세요.
이번 주에 맛있는 거 모시러 가겠습니다!', 167, NOW() - INTERVAL '1 day', NOW()),

('APOLOGY', (SELECT id FROM azeyo_users WHERE sns_id='seed_68'), '솔직한 사과', '여보, 솔직하게 말할게.
내가 잘못했어, 100%.

변명할 생각 없어.
그냥 미안해.

어떻게 하면 용서받을 수 있을까?
당신이 원하는 거 다 할게.
진심이야.', 234, NOW() - INTERVAL '12 hours', NOW()),

('ANNIVERSARY', (SELECT id FROM azeyo_users WHERE sns_id='seed_93'), '캐주얼 기념일 메시지', '여보~ 오늘 우리 기념일이야!

같이 있으면 편하고
같이 없으면 보고 싶고
이게 사랑 아니면 뭐겠어 ㅋㅋ

오늘 뭐 먹을래?
네가 골라. 내가 쏜다! 🍽️', 145, NOW(), NOW()),

('ENCOURAGEMENT', (SELECT id FROM azeyo_users WHERE sns_id='seed_50'), '주말 응원 메시지', '여보, 주말이야!

한 주 동안 고생했어.
오늘은 아무것도 안 해도 돼.
아이들 내가 볼게.

좀 쉬어. 당신도 충전이 필요하잖아.

사랑해! 🛋️', 198, NOW(), NOW()),
-- 추가 족보 50개+
('MOTHER_IN_LAW_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_25'), '정중한 생신 카톡', '어머니, 생신을 진심으로 축하드립니다. 언제나 따뜻하게 대해주셔서 감사합니다. 건강하시고 행복한 한 해 되시길 바랍니다. 주말에 가족 모두 모시고 맛있는 거 드시러 가겠습니다.', 213, NOW() - INTERVAL '30 days', NOW()),
('MOTHER_IN_LAW_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_38'), '손자 사진 첨부용', '어머니, 생신 축하드려요! 🎂 손주가 "할머니 사랑해요" 라고 영상 찍었는데 보내드릴게요 ㅎㅎ 항상 건강하세요!', 178, NOW() - INTERVAL '28 days', NOW()),
('MOTHER_IN_LAW_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_52'), '유머있는 사위 카톡', '어머니~ 대한민국 최고의 장모님 생신 축하드립니다! ㅎㅎ 어머니 덕분에 인생 최고의 아내를 만났습니다. 감사합니다! 이따 맛있는 거 사들고 갈게요 🎁', 145, NOW() - INTERVAL '26 days', NOW()),
('MOTHER_IN_LAW_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_64'), '건강 챙기는 카톡', '어머니, 생신 축하드립니다. 요즘 날씨가 변덕스러운데 건강 잘 챙기세요. 이번에 좋은 영양제 세트 보내드렸는데 잘 드시고, 다음 주에 찾아뵐게요. 항상 감사합니다 🙏', 167, NOW() - INTERVAL '24 days', NOW()),
('APOLOGY', (SELECT id FROM azeyo_users WHERE sns_id='seed_15'), '처음 쓰는 사과 문자', '여보... 결혼하고 처음으로 진심으로 사과해. 내가 너무 생각 없이 말했어. 당신 마음이 아팠을 거 생각하면 미안해. 앞으로 말하기 전에 한 번 더 생각할게. 미안해.', 89, NOW() - INTERVAL '22 days', NOW()),
('APOLOGY', (SELECT id FROM azeyo_users WHERE sns_id='seed_28'), '밥으로 사과하기', '여보, 아까 잘못했어. 변명 안 할게. 대신 당신이 좋아하는 떡볶이+순대 사왔어. 같이 먹으면서 얘기하자. 미안해 ❤️', 234, NOW() - INTERVAL '20 days', NOW()),
('APOLOGY', (SELECT id FROM azeyo_users WHERE sns_id='seed_41'), '깊은 반성문', '여보에게. 오늘 내 행동을 돌아보니 정말 부끄러워. 당신은 항상 나를 위해 최선을 다하는데 나는 그걸 당연하게 여겼어. 앞으로 달라질게. 진심이야. 미안하고 사랑해.', 178, NOW() - INTERVAL '18 days', NOW()),
('APOLOGY', (SELECT id FROM azeyo_users WHERE sns_id='seed_54'), '재미+진심 사과', '여보, 아까 그거... 10점 만점에 제가 -100점이었습니다. 반성합니다. 벌칙: 1주일 설거지+청소 자진하겠습니다. 미안해, 진심으로. 사랑해.', 198, NOW() - INTERVAL '16 days', NOW()),
('ANNIVERSARY', (SELECT id FROM azeyo_users WHERE sns_id='seed_19'), '5주년 메시지', '여보, 결혼 5주년 축하해! 5년... 아직도 가끔 신혼 같은 느낌이 드는 건 나만 그런가? 앞으로 50년 더 함께하자. 사랑해!', 312, NOW() - INTERVAL '14 days', NOW()),
('ANNIVERSARY', (SELECT id FROM azeyo_users WHERE sns_id='seed_32'), '현실적인 기념일 메시지', '여보, 기념일이야! 올해도 건강하게 함께할 수 있어서 감사해. 아이들 재우고 오랜만에 둘이 와인 한잔 하자. 네가 좋아하는 치즈도 사왔어 🧀🍷', 145, NOW() - INTERVAL '12 days', NOW()),
('ANNIVERSARY', (SELECT id FROM azeyo_users WHERE sns_id='seed_46'), '1주년 감동 메시지', '여보, 결혼 1주년 축하해! 작년 이맘때 우리 결혼식이 어제 같은데. 1년 동안 정말 행복했어. 매일매일 당신과 함께여서 감사해. 100주년까지 가보자!', 234, NOW() - INTERVAL '10 days', NOW()),
('ANNIVERSARY', (SELECT id FROM azeyo_users WHERE sns_id='seed_69'), '7주년 일상 감사', '여보, 결혼 7주년. 대단한 이벤트는 없지만 매일 아침 같이 밥 먹고, 저녁에 같이 산책하는 이 일상이 나한테는 최고의 선물이야. 고맙고 사랑해.', 189, NOW() - INTERVAL '8 days', NOW()),
('ENCOURAGEMENT', (SELECT id FROM azeyo_users WHERE sns_id='seed_22'), '야근하는 아내에게', '여보야, 오늘도 야근이구나. 힘들지? 집에 오면 따뜻한 국 끓여놓을게. 아이들도 잘 재워놨으니 걱정 마. 조금만 힘내! 사랑해.', 234, NOW() - INTERVAL '6 days', NOW()),
('ENCOURAGEMENT', (SELECT id FROM azeyo_users WHERE sns_id='seed_35'), '시험 앞둔 아내에게', '여보, 시험 공부 하느라 고생 많아. 당신이 노력하는 모습이 정말 멋져. 결과와 상관없이 당신은 이미 대단해. 할 수 있어! 파이팅! 💪', 178, NOW() - INTERVAL '4 days', NOW()),
('ENCOURAGEMENT', (SELECT id FROM azeyo_users WHERE sns_id='seed_55'), '육아 지친 아내에게', '여보, 오늘도 아이들 때문에 힘들었지? 당신이 있어서 우리 아이들이 이렇게 건강하게 자라는 거야. 당신은 세상에서 가장 좋은 엄마야. 이번 주말에 내가 아이들 볼게. 쉬어!', 267, NOW() - INTERVAL '2 days', NOW()),
('ENCOURAGEMENT', (SELECT id FROM azeyo_users WHERE sns_id='seed_75'), '무조건 응원 메시지', '여보, 뭐가 됐든 나는 당신 편이야. 힘들면 말해. 당신이 웃으면 나도 웃고, 당신이 울면 나도 울어. 그게 부부잖아. 사랑해, 항상.', 198, NOW() - INTERVAL '1 day', NOW()),
('MOTHER_IN_LAW_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_96'), '멀리 사는 사위 카톡', '어머니, 생신 축하드립니다! 멀리 있어서 직접 못 찾아뵙지만 마음은 항상 어머니 곁에 있습니다. 택배로 작은 선물 보내드렸어요. 건강하세요! 🎁', 112, NOW() - INTERVAL '48 days', NOW()),
('APOLOGY', (SELECT id FROM azeyo_users WHERE sns_id='seed_73'), '약속 깜빡 사과', '여보, 오늘 약속 까먹은 거 진짜 미안해. 핸드폰 알림까지 설정해놨는데 왜 못 봤는지... 다음부터 2개씩 설정해놓을게. 미안해 ㅠㅠ', 156, NOW() - INTERVAL '46 days', NOW()),
('ANNIVERSARY', (SELECT id FROM azeyo_users WHERE sns_id='seed_85'), '20주년 메시지', '여보, 20년. 인생의 절반을 당신과 보냈어. 돌이켜보면 참 많은 일이 있었지만 단 한 번도 당신과 결혼한 걸 후회한 적 없어. 다음 20년도 함께하자. 영원히 사랑해.', 456, NOW() - INTERVAL '44 days', NOW()),
('ENCOURAGEMENT', (SELECT id FROM azeyo_users WHERE sns_id='seed_90'), '직장 스트레스 받는 아내에게', '여보, 직장에서 힘든 일 있었구나. 말하기 싫으면 안 해도 돼. 그냥 오늘은 맛있는 거 먹고 푹 자. 내일은 더 나을 거야. 항상 응원해.', 134, NOW() - INTERVAL '42 days', NOW());

-- ============================================================
-- 4. 댓글 100개 (게시글에 랜덤 배정)
-- ============================================================

-- 게시글별 댓글 삽입 (게시글 제목으로 매칭)
INSERT INTO azeyo_community_comments (post_id, user_id, contents, created_at, updated_at)
SELECT p.id, u.id, c.contents, c.created_at, c.created_at
FROM (VALUES
  ('아내 생일 선물 뭐가 좋을까요?', 'seed_2', '다이슨 에어랩 추천합니다. 아내가 진짜 좋아했어요.', NOW() - INTERVAL '29 days'),
  ('아내 생일 선물 뭐가 좋을까요?', 'seed_4', '호텔 스파 이용권은 어떠세요? 쉬는 시간이 최고의 선물이에요.', NOW() - INTERVAL '29 days'),
  ('아내 생일 선물 뭐가 좋을까요?', 'seed_10', '저는 명품 향수 줬는데 반응 좋았습니다. 디올 추천!', NOW() - INTERVAL '28 days'),
  ('아내 생일 선물 뭐가 좋을까요?', 'seed_14', '뭘 사든 손편지 같이 쓰세요. 그게 진짜 포인트입니다.', NOW() - INTERVAL '28 days'),
  ('아내 생일 선물 뭐가 좋을까요?', 'seed_20', '실용적인 게 좋아요. 에어팟 맥스 사줬더니 매일 쓰더라고요.', NOW() - INTERVAL '27 days'),
  ('장모님 생신 선물 추천 부탁드려요', 'seed_9', '환갑이시면 금 선물은 어떨까요? 의미도 있고.', NOW() - INTERVAL '27 days'),
  ('장모님 생신 선물 추천 부탁드려요', 'seed_17', '안마의자 추천합니다. 부모님들이 진짜 좋아하세요.', NOW() - INTERVAL '26 days'),
  ('장모님 생신 선물 추천 부탁드려요', 'seed_35', '여행 상품권 + 용돈 조합이 제일 좋았어요.', NOW() - INTERVAL '26 days'),
  ('설거지 안 했다고 대판 싸웠어요', 'seed_7', '형님, 그냥 바로 하세요... 미루면 100% 싸움납니다 ㅋㅋ', NOW() - INTERVAL '24 days'),
  ('설거지 안 했다고 대판 싸웠어요', 'seed_22', '공감합니다. 저도 비슷한 경험이... 그냥 바로바로 합시다.', NOW() - INTERVAL '24 days'),
  ('설거지 안 했다고 대판 싸웠어요', 'seed_32', '식기세척기 사세요. 인생이 바뀝니다.', NOW() - INTERVAL '23 days'),
  ('설거지 안 했다고 대판 싸웠어요', 'seed_40', '저는 설거지 담당입니다. 차라리 역할 분담하세요.', NOW() - INTERVAL '23 days'),
  ('시어머니 편 들었다가 대참사', 'seed_6', '형님... 그건 절대 하면 안 되는 건데... 무조건 아내 편이어야 합니다.', NOW() - INTERVAL '23 days'),
  ('시어머니 편 들었다가 대참사', 'seed_14', '꽃 사가세요. 그리고 진심으로 사과하세요. 시간이 약입니다.', NOW() - INTERVAL '22 days'),
  ('시어머니 편 들었다가 대참사', 'seed_33', '저도 같은 실수 했었는데... 1주일 냉전 겪었습니다. 힘내세요.', NOW() - INTERVAL '22 days'),
  ('장인어른이랑 등산 가는데 팁 좀', 'seed_20', '날씨 얘기, 건강 얘기, 손주 얘기. 이 3가지면 충분합니다.', NOW() - INTERVAL '21 days'),
  ('장인어른이랑 등산 가는데 팁 좀', 'seed_49', '장인어른 페이스에 맞춰서 천천히 가세요. 절대 앞서가지 마세요.', NOW() - INTERVAL '21 days'),
  ('장인어른이랑 등산 가는데 팁 좀', 'seed_74', '간식 넉넉히 챙겨가세요. 어르신들 간식 챙기면 좋아하십니다.', NOW() - INTERVAL '20 days'),
  ('40대 남편 취미 추천', 'seed_13', '캠핑 추천합니다! 가족이랑 같이 할 수 있어서 좋아요.', NOW() - INTERVAL '20 days'),
  ('40대 남편 취미 추천', 'seed_30', '골프 비싸긴 한데... 한번 시작하면 빠져나올 수 없습니다 ㅋㅋ', NOW() - INTERVAL '19 days'),
  ('40대 남편 취미 추천', 'seed_50', '러닝 추천이요. 돈 안 들고 건강에 좋고 혼자 할 수 있어요.', NOW() - INTERVAL '19 days'),
  ('40대 남편 취미 추천', 'seed_70', '자전거 어떠세요? 출퇴근도 가능하고 운동도 되고.', NOW() - INTERVAL '18 days'),
  ('첫째가 둘째 때문에 질투해요', 'seed_19', '첫째만의 시간을 따로 만들어주세요. 주말에 둘이만 나가는 거요.', NOW() - INTERVAL '18 days'),
  ('첫째가 둘째 때문에 질투해요', 'seed_33', '자연스러운 과정이에요. 6개월 지나면 둘이 짝꿍이 됩니다.', NOW() - INTERVAL '17 days'),
  ('첫째가 둘째 때문에 질투해요', 'seed_39', '형아/언니 역할을 칭찬해주세요. "역시 형이야!" 이런 식으로요.', NOW() - INTERVAL '17 days'),
  ('아이 학원 몇 개까지 보내야 할까요', 'seed_10', '아이 체력 보고 결정하세요. 억지로 시키면 역효과만 납니다.', NOW() - INTERVAL '17 days'),
  ('아이 학원 몇 개까지 보내야 할까요', 'seed_33', '저희 아이는 3개 다니다가 2개로 줄였어요. 놀 시간도 필요해요.', NOW() - INTERVAL '16 days'),
  ('에어컨 필터 청소 꿀팁', 'seed_5', '오 진짜요? 저도 해봐야겠다. 매번 업체 부르니까 돈이 아깝더라고요.', NOW() - INTERVAL '15 days'),
  ('에어컨 필터 청소 꿀팁', 'seed_25', '추가 팁: 실외기도 물 뿌려서 씻어주면 효율 올라갑니다.', NOW() - INTERVAL '15 days'),
  ('에어컨 필터 청소 꿀팁', 'seed_35', '아내한테 칭찬받는 게 핵심이죠 ㅋㅋㅋ', NOW() - INTERVAL '14 days'),
  ('오늘 퇴근길에 꽃 사갔더니', 'seed_8', '5천원으로 이 효과면 가성비 최고 아닌가요 ㅋㅋ', NOW() - INTERVAL '12 days'),
  ('오늘 퇴근길에 꽃 사갔더니', 'seed_11', '저도 해봐야겠다... 근데 갑자기 사가면 의심하지 않을까요?', NOW() - INTERVAL '12 days'),
  ('오늘 퇴근길에 꽃 사갔더니', 'seed_25', '편의점 꽃이 의외로 예쁘더라고요. 좋은 정보 감사합니다!', NOW() - INTERVAL '11 days'),
  ('오늘 퇴근길에 꽃 사갔더니', 'seed_40', '꽃은 진리입니다. 이유 없이 사가는 게 포인트에요.', NOW() - INTERVAL '11 days'),
  ('오늘 퇴근길에 꽃 사갔더니', 'seed_60', '저도 어제 꽃 사갔더니 "뭐 잘못했어?" 라고 하더라구요 ㅋㅋㅋ', NOW() - INTERVAL '10 days'),
  ('아내가 요리 맛있다고 했어요', 'seed_1', '축하합니다 ㅋㅋ 김치찌개 레시피 공유 좀 해주세요!', NOW() - INTERVAL '11 days'),
  ('아내가 요리 맛있다고 했어요', 'seed_18', '유튜브 보고 연습하는 정성이 대단하십니다. 존경합니다!', NOW() - INTERVAL '11 days'),
  ('결혼 3년차인데 아직도 설레요', 'seed_5', '부럽습니다... 저는 7년차인데 설렘은 가끔씩만 ㅋㅋ', NOW() - INTERVAL '10 days'),
  ('결혼 3년차인데 아직도 설레요', 'seed_15', '저도요! 2년차인데 아직 신혼 느낌입니다.', NOW() - INTERVAL '10 days'),
  ('결혼 3년차인데 아직도 설레요', 'seed_42', '그 마음 계속 간직하세요. 그게 행복의 비결입니다.', NOW() - INTERVAL '9 days'),
  ('게임했다고 또 싸웠습니다', 'seed_6', '형님, 아이 재우고 나서 아내한테 먼저 "뭐 해줄까?" 하고 물어보세요. 그 다음에 게임하면 OK', NOW() - INTERVAL '7 days'),
  ('게임했다고 또 싸웠습니다', 'seed_26', '저도 같은 이유로 싸웠었는데... 이제 아내 잠든 다음에 합니다 ㅋㅋ', NOW() - INTERVAL '7 days'),
  ('게임했다고 또 싸웠습니다', 'seed_44', '아내랑 같이 할 수 있는 게임 찾아보세요. 닌텐도 스위치 추천!', NOW() - INTERVAL '6 days'),
  ('아내 몰래 골프 시작했는데 들켰어요', 'seed_24', 'ㅋㅋㅋㅋ 카드 내역... 클래식한 발각 루트네요', NOW() - INTERVAL '6 days'),
  ('아내 몰래 골프 시작했는데 들켰어요', 'seed_45', '차라리 같이 치자고 하세요. 커플 골프 의외로 재밌습니다.', NOW() - INTERVAL '6 days'),
  ('아내 몰래 골프 시작했는데 들켰어요', 'seed_58', '반성문 쓰시면서 골프 실력은 늘었나요? ㅋㅋ', NOW() - INTERVAL '5 days'),
  ('아빠 싫다는 말에 상처받았어요', 'seed_10', '다 지나가는 시기에요. 저도 겪었는데 지금은 "아빠 최고!"에요.', NOW() - INTERVAL '5 days'),
  ('아빠 싫다는 말에 상처받았어요', 'seed_19', '아이랑 둘만의 루틴을 만들어보세요. 자기 전 책 읽어주기 같은 거요.', NOW() - INTERVAL '5 days'),
  ('아빠 싫다는 말에 상처받았어요', 'seed_65', '힘내세요 형님. 아이들은 다 엄마파였다가 결국 아빠파가 됩니다.', NOW() - INTERVAL '4 days'),
  ('청소 당번제 도입 후기', 'seed_2', '오 이거 좋네요. 저도 도입해봐야겠다.', NOW() - INTERVAL '4 days'),
  ('청소 당번제 도입 후기', 'seed_32', '핵심이 "간섭 안 하기"인 거 진짜 공감합니다 ㅋㅋ', NOW() - INTERVAL '4 days'),
  ('오늘 아내한테 사랑한다고 말했습니다', 'seed_5', '맛있는 거 시켜줬으면 성공이죠 ㅋㅋㅋ', NOW() - INTERVAL '3 days'),
  ('오늘 아내한테 사랑한다고 말했습니다', 'seed_11', '결혼 10년에 이 용기... 대단하십니다.', NOW() - INTERVAL '3 days'),
  ('오늘 아내한테 사랑한다고 말했습니다', 'seed_42', '저도 해봐야겠다. 근데 진짜 무서울 것 같아요 ㅋㅋ', NOW() - INTERVAL '2 days'),
  ('아내 운동화 사줬더니 대반응', 'seed_8', '뉴발란스 993 갓벽이죠. 저도 아내한테 사줬어요.', NOW() - INTERVAL '2 days'),
  ('아내 운동화 사줬더니 대반응', 'seed_47', '실용적인 선물이 최고라는 말에 200% 동의합니다.', NOW() - INTERVAL '2 days'),
  ('냉전 3일째... 해법 좀', 'seed_6', '치킨 시키세요. 치킨 앞에서 냉전 유지하는 사람 없습니다.', NOW() - INTERVAL '1 day'),
  ('냉전 3일째... 해법 좀', 'seed_22', '그냥 먼저 말 거세요. 자존심보다 가정이 더 소중합니다.', NOW() - INTERVAL '1 day'),
  ('냉전 3일째... 해법 좀', 'seed_40', '아이 핑계 대세요. "애기 데리고 나갈까?" 이러면 자연스럽게 풀려요.', NOW() - INTERVAL '1 day'),
  ('아이 태권도 시작했는데 울면서 안 간대요', 'seed_10', '2주만 더 버텨보세요. 적응 기간이 필요합니다.', NOW() - INTERVAL '12 hours'),
  ('아이 태권도 시작했는데 울면서 안 간대요', 'seed_33', '관장님께 상담해보세요. 좋은 관장님이면 아이 맞춤으로 이끌어줘요.', NOW() - INTERVAL '12 hours'),
  ('아재 개그 모음 공유합니다', 'seed_1', 'ㅋㅋㅋㅋ 비타민에서 터졌습니다', NOW() - INTERVAL '6 hours'),
  ('아재 개그 모음 공유합니다', 'seed_5', '아이가 웃는 건지 한심해서 웃는 건지 ㅋㅋㅋ 공감합니다', NOW() - INTERVAL '5 hours'),
  ('아재 개그 모음 공유합니다', 'seed_11', '더 있으면 공유 부탁드려요 ㅋㅋ 저도 써먹을게요', NOW() - INTERVAL '4 hours'),
  ('아재 개그 모음 공유합니다', 'seed_42', '추가요: "세상에서 가장 게으른 왕은?" → "누워왕" ㅋㅋ', NOW() - INTERVAL '3 hours'),
  ('아재 개그 모음 공유합니다', 'seed_60', '아이가 "아빠 재미없어" 했는데 눈은 웃고 있더라고요 ㅋㅋ', NOW() - INTERVAL '2 hours'),
  -- 추가 게시글 댓글 240개+
  ('크리스마스 선물 뭐가 좋을까요', 'seed_1', '작년에 가방 사줬더니 엄청 좋아했어요.', NOW() - INTERVAL '44 days'),
  ('크리스마스 선물 뭐가 좋을까요', 'seed_9', '커플 파자마 세트 추천합니다. 겨울이니까!', NOW() - INTERVAL '44 days'),
  ('크리스마스 선물 뭐가 좋을까요', 'seed_20', '아이폰 사줬는데 갑분싸... 본인이 고른 거 사주세요.', NOW() - INTERVAL '43 days'),
  ('크리스마스 선물 뭐가 좋을까요', 'seed_35', '같이 고르러 가는 것도 좋아요. 데이트 겸!', NOW() - INTERVAL '43 days'),
  ('아내 출산 선물 추천', 'seed_3', '고급 바디로션 세트 추천이요. 산후에 피부 관리 중요합니다.', NOW() - INTERVAL '43 days'),
  ('아내 출산 선물 추천', 'seed_10', '수고 선물로 명품 지갑 사줬더니 눈물 흘리더라고요.', NOW() - INTERVAL '43 days'),
  ('아내 출산 선물 추천', 'seed_19', '산후도우미 기간 연장이 최고의 선물입니다.', NOW() - INTERVAL '42 days'),
  ('아내 출산 선물 추천', 'seed_33', '감동적인 편지 꼭 같이 쓰세요. 그게 진짜 선물이에요.', NOW() - INTERVAL '42 days'),
  ('화이트데이 선물 뭐 하셨어요?', 'seed_5', '마카롱 세트 사줬습니다. 예쁘고 맛있고!', NOW() - INTERVAL '42 days'),
  ('화이트데이 선물 뭐 하셨어요?', 'seed_14', '꽃+편지+마카롱 삼종세트가 정답이에요.', NOW() - INTERVAL '41 days'),
  ('화이트데이 선물 뭐 하셨어요?', 'seed_25', '저는 쿠킹클래스 쿠폰 줬어요. 같이 요리하는 거!', NOW() - INTERVAL '41 days'),
  ('돈 문제로 싸웠습니다', 'seed_2', '공동 계좌 + 개인 용돈 분리가 답입니다.', NOW() - INTERVAL '37 days'),
  ('돈 문제로 싸웠습니다', 'seed_14', '저희도 가계부 앱 쓰기 시작하고 싸움이 줄었어요.', NOW() - INTERVAL '37 days'),
  ('돈 문제로 싸웠습니다', 'seed_28', '용돈 30만원 받는데 솔직히 부족합니다 ㅋㅋ', NOW() - INTERVAL '36 days'),
  ('돈 문제로 싸웠습니다', 'seed_40', '토스 가계부 추천해요. 자동으로 잡히니까 편합니다.', NOW() - INTERVAL '36 days'),
  ('돈 문제로 싸웠습니다', 'seed_55', '돈 문제는 대화가 답이에요. 감정 빼고 숫자로 이야기하세요.', NOW() - INTERVAL '35 days'),
  ('핸드폰 비밀번호 문제', 'seed_6', '저는 아내한테 비번 다 공개합니다. 숨길 거 없으니까요.', NOW() - INTERVAL '36 days'),
  ('핸드폰 비밀번호 문제', 'seed_22', '서로 존중의 문제인 것 같아요. 대화로 풀어보세요.', NOW() - INTERVAL '36 days'),
  ('핸드폰 비밀번호 문제', 'seed_44', '지문 등록 서로 해주면 해결됩니다.', NOW() - INTERVAL '35 days'),
  ('아내 친구들 앞에서 실수했어요', 'seed_7', 'ㅋㅋㅋ 나이 잘못 말하면... 끝장이죠', NOW() - INTERVAL '34 days'),
  ('아내 친구들 앞에서 실수했어요', 'seed_31', '저도 비슷한 실수... 아내 직업을 잘못 말했어요 ㅋㅋ', NOW() - INTERVAL '34 days'),
  ('아내 친구들 앞에서 실수했어요', 'seed_50', '그냥 가만히 있는 게 최고입니다. 말을 줄이세요.', NOW() - INTERVAL '33 days'),
  ('육아 방식 때문에 매일 싸워요', 'seed_10', '일관성이 중요합니다. 둘 중 하나로 통일하세요.', NOW() - INTERVAL '33 days'),
  ('육아 방식 때문에 매일 싸워요', 'seed_33', '육아 관련 책 같이 읽어보시는 거 추천해요.', NOW() - INTERVAL '33 days'),
  ('육아 방식 때문에 매일 싸워요', 'seed_61', '아이 앞에서 의견 다르면 나중에 둘이서 얘기하세요.', NOW() - INTERVAL '32 days'),
  ('육아 방식 때문에 매일 싸워요', 'seed_71', '전문 상담 받아보세요. 부부 육아 코칭이 있습니다.', NOW() - INTERVAL '32 days'),
  ('청소 기준이 다릅니다', 'seed_2', '로봇청소기 사세요. 기준 따질 필요가 없어져요 ㅋㅋ', NOW() - INTERVAL '32 days'),
  ('청소 기준이 다릅니다', 'seed_32', '아내 기준에 맞추는 게 정신 건강에 좋습니다...', NOW() - INTERVAL '31 days'),
  ('청소 기준이 다릅니다', 'seed_48', '체크리스트 만들어서 공유하세요. 객관적으로 판단 가능해요.', NOW() - INTERVAL '31 days'),
  ('캠핑 초보 장비 추천', 'seed_13', '텐트: 코베아/스노우피크, 타프 하나, 버너, 랜턴이 기본이에요.', NOW() - INTERVAL '31 days'),
  ('캠핑 초보 장비 추천', 'seed_43', '코스트코 캠핑 의자가 가성비 최고입니다.', NOW() - INTERVAL '30 days'),
  ('캠핑 초보 장비 추천', 'seed_57', '처음엔 글램핑부터 시작하세요. 장비 다 있으니까요.', NOW() - INTERVAL '30 days'),
  ('캠핑 초보 장비 추천', 'seed_77', '침낭이 제일 중요해요. 싸구려 사면 잠을 못 잡니다.', NOW() - INTERVAL '29 days'),
  ('아내랑 같이 할 수 있는 취미', 'seed_20', '테니스 추천이요! 커플 레슨 있어요.', NOW() - INTERVAL '30 days'),
  ('아내랑 같이 할 수 있는 취미', 'seed_37', '등산 좋아요. 대화도 하고 운동도 되고.', NOW() - INTERVAL '30 days'),
  ('아내랑 같이 할 수 있는 취미', 'seed_58', '자전거 타세요! 한강 자전거 길 같이 달리면 최고에요.', NOW() - INTERVAL '29 days'),
  ('러닝 시작했는데 무릎이 아파요', 'seed_47', '러닝화가 맞지 않을 수 있어요. 전문점에서 족형 분석 받아보세요.', NOW() - INTERVAL '28 days'),
  ('러닝 시작했는데 무릎이 아파요', 'seed_70', '초반에는 걷기+러닝 번갈아 하세요. 급하게 뛰면 다칩니다.', NOW() - INTERVAL '28 days'),
  ('러닝 시작했는데 무릎이 아파요', 'seed_85', '무릎 보호대 착용하시고 근력 운동도 병행하세요.', NOW() - INTERVAL '27 days'),
  ('아이랑 레고 같이 하기', 'seed_51', '레고 테크닉 추천! 어른도 재밌어요.', NOW() - INTERVAL '27 days'),
  ('아이랑 레고 같이 하기', 'seed_65', '레고 스타워즈 밀레니엄팔콘... 가격이 좀 하지만 갓작입니다.', NOW() - INTERVAL '27 days'),
  ('아이랑 레고 같이 하기', 'seed_83', '아이 생일 선물로 레고 사줬는데 제가 다 만들었어요 ㅋㅋ', NOW() - INTERVAL '26 days'),
  ('자전거 출퇴근 후기', 'seed_27', '비 오는 날 대비 우비 꼭 챙기세요!', NOW() - INTERVAL '26 days'),
  ('자전거 출퇴근 후기', 'seed_47', '땀 문제는 어떻게 해결하세요? 사무실에 갈아입을 옷?', NOW() - INTERVAL '26 days'),
  ('자전거 출퇴근 후기', 'seed_93', '회사에 샤워실 있으면 완벽한데... 없으면 물티슈 신세 ㅋㅋ', NOW() - INTERVAL '25 days'),
  ('홈트 유튜브 추천', 'seed_16', '피지컬갤러리 추천이요! 설명이 친절해요.', NOW() - INTERVAL '25 days'),
  ('홈트 유튜브 추천', 'seed_50', '하루 30분 운동이면 충분합니다. 꾸준함이 답이에요.', NOW() - INTERVAL '25 days'),
  ('아이 잠투정이 심해요', 'seed_10', '백색소음 들려주세요. 효과 있었어요.', NOW() - INTERVAL '24 days'),
  ('아이 잠투정이 심해요', 'seed_39', '루틴이 중요해요. 매일 같은 시간에 같은 순서로 재워보세요.', NOW() - INTERVAL '24 days'),
  ('아이 잠투정이 심해요', 'seed_65', '저도 겪었는데 6개월 지나면 나아졌어요. 힘내세요!', NOW() - INTERVAL '23 days'),
  ('어린이집 적응 기간', 'seed_19', '보통 2-4주 걸려요. 조금만 더 인내심을 가져보세요.', NOW() - INTERVAL '23 days'),
  ('어린이집 적응 기간', 'seed_43', '선생님이랑 소통 많이 하세요. 도움이 됩니다.', NOW() - INTERVAL '22 days'),
  ('어린이집 적응 기간', 'seed_81', '처음 일주일은 반일만 보내고 점점 늘려보세요.', NOW() - INTERVAL '22 days'),
  ('아이 영어 교육 몇 살부터?', 'seed_10', '7살부터 시작했는데 잘 따라가고 있어요.', NOW() - INTERVAL '21 days'),
  ('아이 영어 교육 몇 살부터?', 'seed_33', '영어 유치원보다 영어 그림책이 효과 좋았어요.', NOW() - INTERVAL '21 days'),
  ('아이 영어 교육 몇 살부터?', 'seed_62', '너무 일찍 시작하면 한국어가 흔들릴 수 있어요.', NOW() - INTERVAL '20 days'),
  ('딸 사춘기 시작된 것 같아요', 'seed_3', '자연스러운 과정이에요. 너무 캐묻지 마시고 기다려주세요.', NOW() - INTERVAL '20 days'),
  ('딸 사춘기 시작된 것 같아요', 'seed_42', '딸이랑 둘이 카페 가보세요. 편한 분위기에서 대화해보세요.', NOW() - INTERVAL '19 days'),
  ('딸 사춘기 시작된 것 같아요', 'seed_80', '문자나 편지로 마음 전해보세요. 직접 말보다 효과적이에요.', NOW() - INTERVAL '19 days'),
  ('아이 용돈 얼마씩 주세요?', 'seed_19', '주 3천원 주고 있어요. 저축 습관도 가르치려고요.', NOW() - INTERVAL '19 days'),
  ('아이 용돈 얼마씩 주세요?', 'seed_61', '용돈기입장 쓰게 하면 좋아요. 경제 교육 겸!', NOW() - INTERVAL '18 days'),
  ('아빠표 도시락 도전기', 'seed_8', '대단하십니다! 저도 도전해봐야겠어요.', NOW() - INTERVAL '18 days'),
  ('아빠표 도시락 도전기', 'seed_29', '유튜브에 아이 도시락 검색하면 쉬운 레시피 많아요!', NOW() - INTERVAL '18 days'),
  ('아빠표 도시락 도전기', 'seed_75', '모양은 상관없어요. 아빠가 만들어줬다는 게 중요한 거에요 ㅎㅎ', NOW() - INTERVAL '17 days'),
  ('세탁기 냄새 제거 꿀팁', 'seed_2', '식초 대신 구연산도 좋아요!', NOW() - INTERVAL '17 days'),
  ('세탁기 냄새 제거 꿀팁', 'seed_35', '한 달에 한 번은 해줘야 합니다. 저도 바로 해봐야지.', NOW() - INTERVAL '16 days'),
  ('전기세 절약 실험 결과', 'seed_14', '오 3만원 차이면 크네요. 선풍기 사야겠다.', NOW() - INTERVAL '16 days'),
  ('전기세 절약 실험 결과', 'seed_48', '서큘레이터+에어컨 조합도 효과 좋아요.', NOW() - INTERVAL '15 days'),
  ('전기세 절약 실험 결과', 'seed_68', '실험 정신 대단하십니다 ㅋㅋ 과학적 남편이시네요.', NOW() - INTERVAL '15 days'),
  ('화장실 타일 곰팡이 제거법', 'seed_32', '이거 진짜 효과 있나요? 당장 해봐야겠다.', NOW() - INTERVAL '14 days'),
  ('화장실 타일 곰팡이 제거법', 'seed_58', '추가로 환기 잘 시켜주면 예방도 됩니다.', NOW() - INTERVAL '13 days'),
  ('신발장 냄새 잡는 법', 'seed_25', '커피 찌꺼기 꿀팁 감사합니다! 바로 스타벅스 갑니다 ㅋㅋ', NOW() - INTERVAL '13 days'),
  ('신발장 냄새 잡는 법', 'seed_78', '숯도 효과 있어요. 다이소에서 500원이면 됩니다.', NOW() - INTERVAL '12 days'),
  ('자동차 세차 셀프 vs 자동', 'seed_27', '셀프 세차 운동 효과 ㅋㅋㅋ 공감합니다', NOW() - INTERVAL '12 days'),
  ('자동차 세차 셀프 vs 자동', 'seed_44', '코팅까지 하면 셀프가 확실히 깨끗해요.', NOW() - INTERVAL '11 days'),
  ('배수구 막힘 해결', 'seed_35', '500원으로 5만원 절약이라니 대박 꿀팁!', NOW() - INTERVAL '11 days'),
  ('배수구 막힘 해결', 'seed_68', '머리카락 거름망 미리 설치하면 안 막힙니다.', NOW() - INTERVAL '10 days'),
  ('신혼 1년차의 깨달음', 'seed_11', 'ㅋㅋㅋ 공감... 저도 자동화된 사람이 됐어요', NOW() - INTERVAL '10 days'),
  ('신혼 1년차의 깨달음', 'seed_26', '1년차면 아직 입문이에요. 갈 길이 멀었습니다 ㅋㅋ', NOW() - INTERVAL '9 days'),
  ('신혼 1년차의 깨달음', 'seed_46', '변기 뚜껑은 기본이죠. 저는 치약 캡 닫기도 마스터했습니다.', NOW() - INTERVAL '9 days'),
  ('아내의 "아무거나 먹자"', 'seed_5', '"아무거나" = "내가 원하는 거 맞춰봐" 입니다 ㅋㅋ', NOW() - INTERVAL '9 days'),
  ('아내의 "아무거나 먹자"', 'seed_22', '3개 후보 제시하고 고르게 하세요. 100% 성공합니다.', NOW() - INTERVAL '8 days'),
  ('아내의 "아무거나 먹자"', 'seed_40', '저는 "그럼 삼겹살?" 하면 대부분 OK입니다.', NOW() - INTERVAL '8 days'),
  ('아내의 "아무거나 먹자"', 'seed_56', '배달 앱 같이 보면서 고르세요. 시간은 걸리지만 싸움은 안 납니다.', NOW() - INTERVAL '7 days'),
  ('아내 잘 때 보면 예쁘더라', 'seed_8', '깨어있을 때는 무서... 에서 터졌습니다 ㅋㅋㅋ', NOW() - INTERVAL '7 days'),
  ('아내 잘 때 보면 예쁘더라', 'seed_15', '저도 자고 있는 아내 보면 행복해요. 평화롭잖아요 ㅋㅋ', NOW() - INTERVAL '7 days'),
  ('아내 잘 때 보면 예쁘더라', 'seed_60', '공감 천만 ㅋㅋㅋㅋ 자는 모습이 제일 사랑스러워요', NOW() - INTERVAL '6 days'),
  ('유부남의 금요일 밤', 'seed_8', '치킨 들고 가는 남편이 최고의 남편입니다.', NOW() - INTERVAL '6 days'),
  ('유부남의 금요일 밤', 'seed_26', '예전에는 2차 3차 갔는데 지금은 집이 최고... 나이 먹었나봐요.', NOW() - INTERVAL '5 days'),
  ('유부남의 금요일 밤', 'seed_42', '금요일 밤 = 넷플릭스 + 치맥 + 아내. 이게 인생이죠.', NOW() - INTERVAL '5 days'),
  ('아이 학예회 다녀왔습니다', 'seed_10', '학예회는 부모 눈물 제조기입니다 ㅋㅋ 공감해요.', NOW() - INTERVAL '5 days'),
  ('아이 학예회 다녀왔습니다', 'seed_33', '영상 꼭 찍어두세요. 나중에 보면 또 울어요 ㅋㅋ', NOW() - INTERVAL '4 days'),
  ('아이 학예회 다녀왔습니다', 'seed_71', '저는 졸업식 때 펑펑 울었습니다... 아빠들 다 그래요.', NOW() - INTERVAL '4 days'),
  ('결혼 후 달라진 것들', 'seed_5', '책임감이 커졌지만 그만큼 행복도 커졌어요. 공감합니다.', NOW() - INTERVAL '4 days'),
  ('결혼 후 달라진 것들', 'seed_40', '혼자 살 때보다 확실히 성장했어요. 사람이 됐달까 ㅋㅋ', NOW() - INTERVAL '3 days'),
  ('아내 몰래 다이어트 중', 'seed_16', '점심 샐러드 먹는 유부남... 동료들이 신기해하겠네요 ㅋㅋ', NOW() - INTERVAL '3 days'),
  ('아내 몰래 다이어트 중', 'seed_47', '간헐적 단식 추천이요. 점심만 먹으면 자연스럽게 빠져요.', NOW() - INTERVAL '2 days'),
  ('아내 몰래 다이어트 중', 'seed_79', '운동도 같이 하세요. 살만 빼면 피부가 처집니다.', NOW() - INTERVAL '2 days'),
  ('강아지 키우고 싶은데', 'seed_25', '강아지 키우면 산책 때문에 운동도 되고 좋아요!', NOW() - INTERVAL '2 days'),
  ('강아지 키우고 싶은데', 'seed_77', '고양이는 독립적이라 바쁜 유부남에게 딱이에요.', NOW() - INTERVAL '1 day'),
  ('강아지 키우고 싶은데', 'seed_95', '둘 다 키우세요 ㅋㅋ 저는 강아지 1 + 고양이 1 입니다.', NOW() - INTERVAL '1 day'),
  ('화해 선물로 뭐가 좋을까요', 'seed_5', '꽃+케이크가 뻔해도 효과는 최고입니다.', NOW() - INTERVAL '1 day'),
  ('화해 선물로 뭐가 좋을까요', 'seed_31', '편지 쓰세요. 진심이 담긴 편지만큼 강력한 건 없어요.', NOW() - INTERVAL '1 day'),
  ('화해 선물로 뭐가 좋을까요', 'seed_60', '아내가 좋아하는 디저트+진심 사과 조합 추천합니다.', NOW() - INTERVAL '12 hours'),
  ('말투 때문에 오해받아요', 'seed_6', '톤을 좀 부드럽게 하시면 도움이 돼요.', NOW() - INTERVAL '12 hours'),
  ('말투 때문에 오해받아요', 'seed_22', '장난이라도 상대방 기분을 생각해야 해요. 형님 반성 좀 하세요 ㅋㅋ', NOW() - INTERVAL '6 hours'),
  ('말투 때문에 오해받아요', 'seed_55', '저도 같은 문제... 이모티콘 많이 쓰면 좀 나아지더라고요 ㅎㅎ', NOW() - INTERVAL '3 hours'),
  ('아이 첫 걸음마', 'seed_1', '축하합니다!! 영상 꼭 저장해두세요! 평생 보물이에요.', NOW() - INTERVAL '2 hours'),
  ('아이 첫 걸음마', 'seed_10', '저도 그때 울었어요 ㅋㅋ 아이의 첫 걸음은 부모의 눈물이죠.', NOW() - INTERVAL '1 hour'),
  ('아이 첫 걸음마', 'seed_33', '앞으로 뛰어다닐 거 생각하면... 체력 미리 키워두세요 ㅋㅋ', NOW() - INTERVAL '30 minutes'),
  ('아이 첫 걸음마', 'seed_42', '감동적이네요! 부모 되면 이런 순간이 최고의 행복이에요.', NOW() - INTERVAL '10 minutes')
) AS c(post_title, sns_id, contents, created_at)
JOIN azeyo_community_posts p ON p.title = c.post_title
JOIN azeyo_users u ON u.sns_id = c.sns_id;

-- ============================================================
-- 5. 좋아요 (게시글 + 족보)
-- ============================================================

-- 게시글 좋아요 (인기글 위주)
INSERT INTO azeyo_community_likes (user_id, target_id, created_at)
SELECT u.id, p.id, NOW() - (random() * INTERVAL '30 days')
FROM azeyo_users u
CROSS JOIN azeyo_community_posts p
WHERE u.sns_id LIKE 'seed_%'
  AND p.title IN (
    '오늘 퇴근길에 꽃 사갔더니',
    '아내가 요리 맛있다고 했어요',
    '오늘 아내한테 사랑한다고 말했습니다',
    '아재 개그 모음 공유합니다',
    '에어컨 필터 청소 꿀팁',
    '설거지 안 했다고 대판 싸웠어요',
    '아내 운동화 사줬더니 대반응',
    '신혼 1년차의 깨달음',
    '유부남의 금요일 밤',
    '아이 학예회 다녀왔습니다',
    '아이 첫 걸음마',
    '아내의 "아무거나 먹자"',
    '아내 잘 때 보면 예쁘더라',
    '아빠표 도시락 도전기',
    '자전거 출퇴근 후기',
    '배수구 막힘 해결'
  )
  AND random() < 0.4
ON CONFLICT DO NOTHING;

-- 족보 좋아요
INSERT INTO azeyo_jokbo_likes (user_id, template_id, created_at)
SELECT u.id, t.id, NOW() - (random() * INTERVAL '20 days')
FROM azeyo_users u
CROSS JOIN azeyo_jokbo_templates t
WHERE u.sns_id LIKE 'seed_%'
  AND random() < 0.25
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. 투표 (VOTE 게시글)
-- ============================================================

INSERT INTO azeyo_community_votes (user_id, post_id, option, created_at)
SELECT u.id, p.id,
  CASE WHEN random() < 0.55 THEN 'A' ELSE 'B' END,
  NOW() - (random() * INTERVAL '20 days')
FROM azeyo_users u
CROSS JOIN azeyo_community_posts p
WHERE u.sns_id LIKE 'seed_%'
  AND p.type = 'VOTE'
  AND random() < 0.6
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. 일정 태그 (시스템 태그 11개)
-- ============================================================

INSERT INTO azeyo_schedule_tags (name, color, is_system, user_id) VALUES
('아내 생일', '#E8637A', true, NULL),
('결혼기념일', '#D4785C', true, NULL),
('장모님 생신', '#8B7EC8', true, NULL),
('장인어른 생신', '#6B8EC4', true, NULL),
('어머니 생신', '#C47DB5', true, NULL),
('아버지 생신', '#5D9B8A', true, NULL),
('아이 생일', '#F5A623', true, NULL),
('발렌타인/화이트데이', '#FF8FA3', true, NULL),
('크리스마스', '#D45555', true, NULL),
('명절', '#B8860B', true, NULL),
('기타 기념일', '#7EAAB5', true, NULL);

-- ============================================================
-- 8. 일정 태그별 추천 (선물/행동)
-- ============================================================

INSERT INTO azeyo_schedule_recommendations (tag_id, title, items)
SELECT t.id, r.title, r.items::jsonb
FROM (VALUES
  ('아내 생일', '아내 생일 선물 추천', '[
    {"rank":1,"name":"향수","description":"조말론, 딥티크 등 고급 향수. 취향 모르면 플로럴 계열이 무난","emoji":"🌸"},
    {"rank":2,"name":"호텔 스파 이용권","description":"하루쯤 쉬게 해주는 게 최고의 선물. 반나절 스파 패키지 추천","emoji":"🧖‍♀️"},
    {"rank":3,"name":"명품 소품","description":"지갑, 카드케이스, 키링 등 실용적인 명품 소품","emoji":"👜"},
    {"rank":4,"name":"꽃다발 + 손편지","description":"거창하지 않아도 진심이 담긴 꽃과 편지. 효과 200%","emoji":"💐"},
    {"rank":5,"name":"레스토랑 디너","description":"분위기 좋은 레스토랑 예약. 아이들은 친정에 맡기기","emoji":"🍽️"}
  ]'),
  ('결혼기념일', '결혼기념일 추천', '[
    {"rank":1,"name":"커플 여행","description":"1박 2일 근교 여행. 호캉스도 좋고, 펜션도 좋고","emoji":"✈️"},
    {"rank":2,"name":"레스토랑 디너","description":"처음 데이트했던 곳이나 프로포즈 장소 재방문도 감동적","emoji":"🥂"},
    {"rank":3,"name":"주얼리","description":"반지, 목걸이, 팔찌 등. 매년 하나씩 모으는 것도 의미 있음","emoji":"💍"},
    {"rank":4,"name":"커플 사진 촬영","description":"웨딩 스냅 다시 찍기. 세월이 담긴 사진이 더 아름다움","emoji":"📸"},
    {"rank":5,"name":"영상 편지","description":"연애 시절~현재 사진으로 영상 만들어 선물하기","emoji":"🎬"}
  ]'),
  ('장모님 생신', '장모님 생신 선물 추천', '[
    {"rank":1,"name":"건강검진 상품권","description":"종합건강검진 쿠폰. 건강이 최고라는 마음을 담아","emoji":"🏥"},
    {"rank":2,"name":"안마의자/안마기","description":"어깨·목 안마기도 좋고, 여유 있으면 안마의자도 효자 선물","emoji":"💆"},
    {"rank":3,"name":"맛집 식사 대접","description":"온 가족 모시고 좋은 식당에서 식사. 예약은 필수","emoji":"🍲"},
    {"rank":4,"name":"금 선물","description":"돌반지, 금목걸이 등. 환갑·칠순이면 더 의미 있음","emoji":"✨"},
    {"rank":5,"name":"효도 관광","description":"부모님과 함께하는 1박 2일 여행. 온천 여행 추천","emoji":"🚗"}
  ]'),
  ('장인어른 생신', '장인어른 생신 선물 추천', '[
    {"rank":1,"name":"건강식품 세트","description":"홍삼, 녹용 등 건강식품. 정관장 세트가 무난","emoji":"💊"},
    {"rank":2,"name":"골프 용품","description":"골프 치시는 분이면 골프공, 장갑, 모자 등","emoji":"⛳"},
    {"rank":3,"name":"용돈 + 식사 대접","description":"현금이 최고라는 분도 많음. 식사 자리를 마련하는 게 핵심","emoji":"💰"},
    {"rank":4,"name":"등산/운동 용품","description":"등산화, 등산 스틱, 운동복 등 취미에 맞는 선물","emoji":"🥾"},
    {"rank":5,"name":"전자기기","description":"태블릿, 블루투스 스피커 등. 요즘 어르신들도 IT 기기 좋아하심","emoji":"📱"}
  ]'),
  ('어머니 생신', '어머니(시어머니) 생신 선물 추천', '[
    {"rank":1,"name":"금 선물","description":"금반지, 금팔찌 등. 어머니 세대에는 금이 최고의 선물","emoji":"✨"},
    {"rank":2,"name":"건강검진 상품권","description":"종합건강검진. 건강 챙겨드리는 마음이 전해짐","emoji":"🏥"},
    {"rank":3,"name":"백화점 상품권","description":"직접 고르시게 상품권도 좋은 선택. 금액은 넉넉하게","emoji":"🎁"},
    {"rank":4,"name":"한복/외출복","description":"좋은 옷 한 벌. 생신 잔치에 입으실 수 있게","emoji":"👗"},
    {"rank":5,"name":"효도 여행","description":"온천, 크루즈, 해외여행 등. 아버지와 함께 보내드리기","emoji":"🌴"}
  ]'),
  ('아버지 생신', '아버지(시아버지) 생신 선물 추천', '[
    {"rank":1,"name":"건강식품","description":"홍삼, 비타민 세트 등. 실용적이고 건강 챙기는 선물","emoji":"💊"},
    {"rank":2,"name":"전동 안마기","description":"목·어깨 안마기, 발 마사지기 등. 피로 회복에 도움","emoji":"💆‍♂️"},
    {"rank":3,"name":"양주/와인","description":"술 좋아하시는 분이면 고급 양주. 함께 한잔하는 시간이 선물","emoji":"🥃"},
    {"rank":4,"name":"운동 용품","description":"골프, 등산, 낚시 등 취미에 맞는 용품","emoji":"🎣"},
    {"rank":5,"name":"식사 대접 + 용돈","description":"맛집 모시기 + 용돈 봉투. 어른들은 현금을 제일 좋아하심","emoji":"🍽️"}
  ]'),
  ('아이 생일', '아이 생일 선물/이벤트 추천', '[
    {"rank":1,"name":"레고/장난감","description":"나이에 맞는 레고 세트나 인기 장난감. 요즘 트렌드 확인 필수","emoji":"🧱"},
    {"rank":2,"name":"키즈카페/테마파크","description":"에버랜드, 롯데월드 등 놀이공원 데이트. 아빠와 특별한 하루","emoji":"🎡"},
    {"rank":3,"name":"자전거/킥보드","description":"야외 활동 좋아하는 아이에게. 헬멧·보호대 함께 선물","emoji":"🚲"},
    {"rank":4,"name":"책 세트","description":"연령별 추천 도서 세트. 독서 습관 잡아주기","emoji":"📚"},
    {"rank":5,"name":"생일 파티","description":"친구들 초대해서 홈파티. 케이크+풍선+게임 준비하기","emoji":"🎈"}
  ]'),
  ('발렌타인/화이트데이', '발렌타인/화이트데이 추천', '[
    {"rank":1,"name":"마카롱/초콜릿 세트","description":"고급 마카롱이나 수제 초콜릿. 예쁜 패키지가 포인트","emoji":"🍫"},
    {"rank":2,"name":"꽃다발","description":"장미, 튤립 등 시즌 꽃다발. 사무실로 배달 보내기도 센스","emoji":"🌹"},
    {"rank":3,"name":"쿠킹 클래스","description":"커플 쿠킹 클래스 수업. 함께 요리하며 데이트","emoji":"👨‍🍳"},
    {"rank":4,"name":"액세서리","description":"목걸이, 팔찌 등 부담 없는 선물. 이니셜 각인 추천","emoji":"📿"},
    {"rank":5,"name":"편지 + 작은 선물","description":"손편지가 제일 감동적. 핸드크림이나 립밤 같은 소소한 선물 곁들이기","emoji":"💌"}
  ]'),
  ('크리스마스', '크리스마스 선물/이벤트 추천', '[
    {"rank":1,"name":"호캉스","description":"크리스마스 패키지 호텔 예약. 도심 야경 보이는 곳 추천","emoji":"🏨"},
    {"rank":2,"name":"어그부츠/겨울 아이템","description":"겨울 패션 아이템. 따뜻한 머플러, 장갑, 부츠 등","emoji":"🧤"},
    {"rank":3,"name":"커플 파자마","description":"크리스마스 테마 커플 파자마. 가족 파자마도 인기","emoji":"🎄"},
    {"rank":4,"name":"전자기기","description":"에어팟, 태블릿, 스마트워치 등. 연말 할인 시즌 활용","emoji":"🎧"},
    {"rank":5,"name":"홈파티","description":"치킨+케이크+영화. 아이들과 함께하는 집콕 크리스마스","emoji":"🍗"}
  ]'),
  ('명절', '명절 준비/선물 추천', '[
    {"rank":1,"name":"양가 선물 세트","description":"한우, 과일, 건강식품 세트 등. 양가 균형 맞추기","emoji":"🎁"},
    {"rank":2,"name":"장모님 용돈","description":"명절 인사와 함께 용돈 봉투. 금액은 상황에 맞게","emoji":"💰"},
    {"rank":3,"name":"차례/제사 분담","description":"아내와 역할 분담. 전 부치기, 설거지 등 적극 참여하기","emoji":"🍳"},
    {"rank":4,"name":"귀성길 간식","description":"장거리 운전 대비 간식+음료. 아이들 놀이감도 챙기기","emoji":"🚙"},
    {"rank":5,"name":"명절 후 아내 위로","description":"명절 끝나면 아내 수고 인정하기. 외식이나 작은 선물로 보답","emoji":"❤️"}
  ]'),
  ('기타 기념일', '기타 기념일 추천', '[
    {"rank":1,"name":"꽃 배달","description":"기념일엔 꽃이 빠질 수 없음. 사무실 배달도 좋은 서프라이즈","emoji":"💐"},
    {"rank":2,"name":"케이크","description":"디자인 케이크 주문. 레터링으로 메시지 넣기","emoji":"🎂"},
    {"rank":3,"name":"외식","description":"분위기 좋은 레스토랑. 평소 안 가던 곳으로 예약","emoji":"🍷"},
    {"rank":4,"name":"편지/카드","description":"짧더라도 손글씨로 진심 전하기. 카카오톡보다 100배 감동","emoji":"✉️"},
    {"rank":5,"name":"깜짝 이벤트","description":"퇴근 후 집에 풍선+캔들 세팅. 소소하지만 잊지 못할 추억","emoji":"🎉"}
  ]')
) AS r(tag_name, title, items)
JOIN azeyo_schedule_tags t ON t.name = r.tag_name AND t.is_system = true;

-- ============================================================
-- 9. 시드 유저 일정 (샘플)
-- ============================================================

INSERT INTO azeyo_schedules (user_id, title, date, memo, created_at)
SELECT u.id, s.title, s.date::date, s.memo, NOW()
FROM (VALUES
  ('seed_1', '아내 생일', '2026-05-15', '올해는 호텔 스파 이용권 + 꽃다발 준비'),
  ('seed_1', '결혼기념일', '2026-08-22', '8주년! 레스토랑 예약하기'),
  ('seed_1', '장모님 생신', '2026-09-10', '건강검진 상품권 준비'),
  ('seed_2', '아내 생일', '2026-04-20', '향수 사기 — 조말론?'),
  ('seed_2', '어머니 생신', '2026-06-05', '형이랑 상의해서 준비'),
  ('seed_3', '첫째 생일', '2026-04-12', '키즈카페 파티 예약'),
  ('seed_3', '둘째 생일', '2026-07-30', '장난감 리서치 시작'),
  ('seed_3', '결혼기념일', '2026-11-11', '빼빼로데이겸 기념일'),
  ('seed_4', '아내 생일', '2026-06-01', '올해는 커플 사진 촬영 해볼까'),
  ('seed_4', '장인어른 생신', '2026-10-15', '골프공 세트 준비'),
  ('seed_5', '결혼기념일', '2026-04-28', '5주년! 여행 가자'),
  ('seed_5', '아이 생일', '2026-08-10', '자전거 사주기로 약속함'),
  ('seed_7', '크리스마스', '2026-12-25', '가족 파자마 + 홈파티'),
  ('seed_7', '명절 (추석)', '2026-09-25', '양가 선물 미리 준비'),
  ('seed_10', '아내 생일', '2026-05-03', '첫째 데리고 케이크 만들기'),
  ('seed_10', '어머니 생신', '2026-07-20', '금팔찌 알아보기'),
  ('seed_14', '장모님 생신', '2026-04-18', '효도관광 알아보기 — 온천?'),
  ('seed_14', '장인어른 생신', '2026-08-08', '건강식품 세트 준비'),
  ('seed_21', '발렌타인데이', '2027-02-14', '마카롱+편지 준비'),
  ('seed_21', '아내 생일', '2026-06-22', '깜짝 이벤트 계획')
) AS s(sns_id, title, date, memo)
JOIN azeyo_users u ON u.sns_id = s.sns_id;

-- 일정-태그 연결
INSERT INTO azeyo_schedule_tag_map (schedule_id, tag_id)
SELECT sc.id, t.id
FROM azeyo_schedules sc
JOIN azeyo_users u ON u.id = sc.user_id
JOIN azeyo_schedule_tags t ON t.is_system = true
  AND (
    (sc.title LIKE '%아내 생일%' AND t.name = '아내 생일')
    OR (sc.title LIKE '%결혼기념일%' AND t.name = '결혼기념일')
    OR (sc.title LIKE '%장모님%' AND t.name = '장모님 생신')
    OR (sc.title LIKE '%장인어른%' AND t.name = '장인어른 생신')
    OR (sc.title LIKE '%어머니%' AND t.name = '어머니 생신')
    OR (sc.title LIKE '%아버지%' AND t.name = '아버지 생신')
    OR (sc.title LIKE '%아이 생일%' AND t.name = '아이 생일')
    OR (sc.title LIKE '%첫째 생일%' AND t.name = '아이 생일')
    OR (sc.title LIKE '%둘째 생일%' AND t.name = '아이 생일')
    OR (sc.title LIKE '%발렌타인%' AND t.name = '발렌타인/화이트데이')
    OR (sc.title LIKE '%크리스마스%' AND t.name = '크리스마스')
    OR (sc.title LIKE '%명절%' AND t.name = '명절')
  )
WHERE u.sns_id LIKE 'seed_%';

COMMIT;
