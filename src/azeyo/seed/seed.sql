-- ============================================================
-- 아재요 시드 데이터
-- 실행: psql -U <user> -d <db> -f seed.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. 유저 100명
-- ============================================================
INSERT INTO azeyo_users (nickname, subtitle, marriage_year, children, email, sns_type, sns_id, activity_points, monthly_points, is_online, created_at, updated_at) VALUES
('든든한남편', '결혼 8년차 · 아이 2명', 2018, '2', 'seed1@azeyo.co.kr', 'KAKAO', 'seed_1', 320, 85, false, NOW() - INTERVAL '90 days', NOW()),
('살림왕아재', '결혼 12년차 · 아이 1명', 2014, '1', 'seed2@azeyo.co.kr', 'KAKAO', 'seed_2', 890, 210, false, NOW() - INTERVAL '85 days', NOW()),
('딸바보파파', '결혼 6년차 · 딸 2명', 2020, '2', 'seed3@azeyo.co.kr', 'NAVER', 'seed_3', 450, 120, false, NOW() - INTERVAL '80 days', NOW()),
('로맨틱가이', '결혼 15년차', 2011, '3+', 'seed4@azeyo.co.kr', 'GOOGLE', 'seed_4', 1560, 340, false, NOW() - INTERVAL '75 days', NOW()),
('워킹대디', '결혼 5년차 · 아이 1명', 2021, '1', 'seed5@azeyo.co.kr', 'KAKAO', 'seed_5', 280, 95, false, NOW() - INTERVAL '70 days', NOW()),
('야근전사', '결혼 7년차 · 아이 2명', 2019, '2', 'seed6@azeyo.co.kr', 'NAVER', 'seed_6', 510, 145, false, NOW() - INTERVAL '65 days', NOW()),
('주말아빠', '결혼 10년차 · 아이 3명', 2016, '3+', 'seed7@azeyo.co.kr', 'KAKAO', 'seed_7', 720, 190, false, NOW() - INTERVAL '60 days', NOW()),
('요리하는남편', '결혼 4년차', 2022, '0', 'seed8@azeyo.co.kr', 'GOOGLE', 'seed_8', 180, 60, false, NOW() - INTERVAL '55 days', NOW()),
('센스있는사위', '결혼 9년차 · 아이 1명', 2017, '1', 'seed9@azeyo.co.kr', 'KAKAO', 'seed_9', 640, 170, false, NOW() - INTERVAL '50 days', NOW()),
('육아고수', '결혼 11년차 · 아이 2명', 2015, '2', 'seed10@azeyo.co.kr', 'NAVER', 'seed_10', 980, 250, false, NOW() - INTERVAL '45 days', NOW()),
('결혼3년차', '신혼 끝자락', 2023, '0', 'seed11@azeyo.co.kr', 'KAKAO', 'seed_11', 90, 40, false, NOW() - INTERVAL '40 days', NOW()),
('치킨아빠', '결혼 7년차 · 아이 1명', 2019, '1', 'seed12@azeyo.co.kr', 'NAVER', 'seed_12', 350, 100, false, NOW() - INTERVAL '38 days', NOW()),
('캠핑족장', '결혼 8년차 · 아이 2명', 2018, '2', 'seed13@azeyo.co.kr', 'GOOGLE', 'seed_13', 420, 110, false, NOW() - INTERVAL '36 days', NOW()),
('효도왕사위', '결혼 13년차 · 아이 1명', 2013, '1', 'seed14@azeyo.co.kr', 'KAKAO', 'seed_14', 1100, 280, false, NOW() - INTERVAL '34 days', NOW()),
('새내기남편', '결혼 1년차', 2025, '0', 'seed15@azeyo.co.kr', 'NAVER', 'seed_15', 30, 20, false, NOW() - INTERVAL '32 days', NOW()),
('운동하는아빠', '결혼 6년차 · 아이 1명', 2020, '1', 'seed16@azeyo.co.kr', 'KAKAO', 'seed_16', 290, 80, false, NOW() - INTERVAL '30 days', NOW()),
('장인사랑꾼', '결혼 14년차 · 아이 2명', 2012, '2', 'seed17@azeyo.co.kr', 'GOOGLE', 'seed_17', 1340, 310, false, NOW() - INTERVAL '28 days', NOW()),
('퇴근후요리사', '결혼 5년차', 2021, '1', 'seed18@azeyo.co.kr', 'NAVER', 'seed_18', 210, 70, false, NOW() - INTERVAL '26 days', NOW()),
('아이둘아빠', '결혼 9년차 · 아이 2명', 2017, '2', 'seed19@azeyo.co.kr', 'KAKAO', 'seed_19', 580, 155, false, NOW() - INTERVAL '24 days', NOW()),
('주말등산러', '결혼 11년차 · 아이 1명', 2015, '1', 'seed20@azeyo.co.kr', 'NAVER', 'seed_20', 760, 200, false, NOW() - INTERVAL '22 days', NOW()),
('감성아재', '결혼 10년차 · 아이 2명', 2016, '2', 'seed21@azeyo.co.kr', 'KAKAO', 'seed_21', 670, 175, false, NOW() - INTERVAL '21 days', NOW()),
('유머왕남편', '결혼 7년차 · 아이 1명', 2019, '1', 'seed22@azeyo.co.kr', 'GOOGLE', 'seed_22', 430, 115, false, NOW() - INTERVAL '20 days', NOW()),
('집순이남편', '결혼 4년차', 2022, '0', 'seed23@azeyo.co.kr', 'KAKAO', 'seed_23', 150, 50, false, NOW() - INTERVAL '19 days', NOW()),
('낚시아재', '결혼 12년차 · 아이 2명', 2014, '2', 'seed24@azeyo.co.kr', 'NAVER', 'seed_24', 920, 230, false, NOW() - INTERVAL '18 days', NOW()),
('커피아빠', '결혼 6년차 · 아이 1명', 2020, '1', 'seed25@azeyo.co.kr', 'KAKAO', 'seed_25', 310, 90, false, NOW() - INTERVAL '17 days', NOW()),
('게임하는남편', '결혼 3년차', 2023, '0', 'seed26@azeyo.co.kr', 'GOOGLE', 'seed_26', 120, 45, false, NOW() - INTERVAL '16 days', NOW()),
('자전거아빠', '결혼 8년차 · 아이 2명', 2018, '2', 'seed27@azeyo.co.kr', 'NAVER', 'seed_27', 480, 130, false, NOW() - INTERVAL '15 days', NOW()),
('독서하는아재', '결혼 10년차 · 아이 1명', 2016, '1', 'seed28@azeyo.co.kr', 'KAKAO', 'seed_28', 700, 185, false, NOW() - INTERVAL '14 days', NOW()),
('베이킹아빠', '결혼 5년차 · 아이 1명', 2021, '1', 'seed29@azeyo.co.kr', 'NAVER', 'seed_29', 250, 75, false, NOW() - INTERVAL '13 days', NOW()),
('골프초보남편', '결혼 9년차 · 아이 2명', 2017, '2', 'seed30@azeyo.co.kr', 'GOOGLE', 'seed_30', 550, 150, false, NOW() - INTERVAL '12 days', NOW()),
('다정한사위', '결혼 7년차 · 아이 1명', 2019, '1', 'seed31@azeyo.co.kr', 'KAKAO', 'seed_31', 380, 105, false, NOW() - INTERVAL '11 days', NOW()),
('설거지마스터', '결혼 6년차', 2020, '1', 'seed32@azeyo.co.kr', 'NAVER', 'seed_32', 340, 95, false, NOW() - INTERVAL '10 days', NOW()),
('아침형아빠', '결혼 8년차 · 아이 2명', 2018, '2', 'seed33@azeyo.co.kr', 'KAKAO', 'seed_33', 460, 125, false, NOW() - INTERVAL '9 days', NOW()),
('택배수령인', '결혼 4년차', 2022, '0', 'seed34@azeyo.co.kr', 'GOOGLE', 'seed_34', 160, 55, false, NOW() - INTERVAL '8 days', NOW()),
('장보기달인', '결혼 11년차 · 아이 2명', 2015, '2', 'seed35@azeyo.co.kr', 'NAVER', 'seed_35', 810, 205, false, NOW() - INTERVAL '7 days', NOW()),
('빨래접기왕', '결혼 5년차 · 아이 1명', 2021, '1', 'seed36@azeyo.co.kr', 'KAKAO', 'seed_36', 230, 70, false, NOW() - INTERVAL '6 days', NOW()),
('청소기아빠', '결혼 7년차 · 아이 1명', 2019, '1', 'seed37@azeyo.co.kr', 'NAVER', 'seed_37', 400, 108, false, NOW() - INTERVAL '5 days', NOW()),
('분리수거맨', '결혼 9년차 · 아이 2명', 2017, '2', 'seed38@azeyo.co.kr', 'GOOGLE', 'seed_38', 560, 148, false, NOW() - INTERVAL '4 days', NOW()),
('아이돌봄이', '결혼 6년차 · 아이 2명', 2020, '2', 'seed39@azeyo.co.kr', 'KAKAO', 'seed_39', 370, 100, false, NOW() - INTERVAL '3 days', NOW()),
('새벽기상러', '결혼 10년차 · 아이 1명', 2016, '1', 'seed40@azeyo.co.kr', 'NAVER', 'seed_40', 690, 180, false, NOW() - INTERVAL '2 days', NOW()),
('반찬만들기', '결혼 8년차', 2018, '2', 'seed41@azeyo.co.kr', 'KAKAO', 'seed_41', 440, 118, false, NOW() - INTERVAL '1 day', NOW()),
('피아노아빠', '결혼 12년차 · 아이 1명', 2014, '1', 'seed42@azeyo.co.kr', 'GOOGLE', 'seed_42', 950, 240, false, NOW(), NOW()),
('텃밭아재', '결혼 15년차 · 아이 3명', 2011, '3+', 'seed43@azeyo.co.kr', 'NAVER', 'seed_43', 1480, 330, false, NOW(), NOW()),
('미니밴아빠', '결혼 7년차 · 아이 2명', 2019, '2', 'seed44@azeyo.co.kr', 'KAKAO', 'seed_44', 410, 112, false, NOW(), NOW()),
('와인남편', '결혼 10년차', 2016, '1', 'seed45@azeyo.co.kr', 'NAVER', 'seed_45', 680, 178, false, NOW(), NOW()),
('홈카페남편', '결혼 3년차', 2023, '0', 'seed46@azeyo.co.kr', 'GOOGLE', 'seed_46', 100, 38, false, NOW(), NOW()),
('조깅아빠', '결혼 6년차 · 아이 1명', 2020, '1', 'seed47@azeyo.co.kr', 'KAKAO', 'seed_47', 300, 88, false, NOW(), NOW()),
('수영하는남편', '결혼 5년차', 2021, '0', 'seed48@azeyo.co.kr', 'NAVER', 'seed_48', 220, 68, false, NOW(), NOW()),
('등산마니아', '결혼 13년차 · 아이 2명', 2013, '2', 'seed49@azeyo.co.kr', 'KAKAO', 'seed_49', 1150, 290, false, NOW(), NOW()),
('바베큐아재', '결혼 9년차 · 아이 1명', 2017, '1', 'seed50@azeyo.co.kr', 'GOOGLE', 'seed_50', 530, 142, false, NOW(), NOW()),
('DIY아빠', '결혼 8년차 · 아이 2명', 2018, '2', 'seed51@azeyo.co.kr', 'NAVER', 'seed_51', 470, 128, false, NOW(), NOW()),
('영화남편', '결혼 4년차', 2022, '0', 'seed52@azeyo.co.kr', 'KAKAO', 'seed_52', 170, 58, false, NOW(), NOW()),
('사진찍는아빠', '결혼 7년차 · 아이 1명', 2019, '1', 'seed53@azeyo.co.kr', 'NAVER', 'seed_53', 390, 106, false, NOW(), NOW()),
('노래방남편', '결혼 11년차 · 아이 2명', 2015, '2', 'seed54@azeyo.co.kr', 'GOOGLE', 'seed_54', 830, 215, false, NOW(), NOW()),
('볼링아재', '결혼 6년차 · 아이 1명', 2020, '1', 'seed55@azeyo.co.kr', 'KAKAO', 'seed_55', 330, 92, false, NOW(), NOW()),
('보드게임아빠', '결혼 5년차 · 아이 1명', 2021, '1', 'seed56@azeyo.co.kr', 'NAVER', 'seed_56', 240, 72, false, NOW(), NOW()),
('드라이브남편', '결혼 9년차 · 아이 2명', 2017, '2', 'seed57@azeyo.co.kr', 'KAKAO', 'seed_57', 570, 152, false, NOW(), NOW()),
('맥주아재', '결혼 10년차 · 아이 1명', 2016, '1', 'seed58@azeyo.co.kr', 'GOOGLE', 'seed_58', 710, 188, false, NOW(), NOW()),
('손편지남편', '결혼 8년차', 2018, '2', 'seed59@azeyo.co.kr', 'NAVER', 'seed_59', 450, 122, false, NOW(), NOW()),
('꽃배달남편', '결혼 3년차', 2023, '0', 'seed60@azeyo.co.kr', 'KAKAO', 'seed_60', 110, 42, false, NOW(), NOW()),
('가구조립왕', '결혼 7년차 · 아이 2명', 2019, '2', 'seed61@azeyo.co.kr', 'NAVER', 'seed_61', 420, 114, false, NOW(), NOW()),
('아이숙제도우미', '결혼 12년차 · 아이 2명', 2014, '2', 'seed62@azeyo.co.kr', 'GOOGLE', 'seed_62', 960, 245, false, NOW(), NOW()),
('산책남편', '결혼 5년차 · 아이 1명', 2021, '1', 'seed63@azeyo.co.kr', 'KAKAO', 'seed_63', 260, 78, false, NOW(), NOW()),
('요가하는아빠', '결혼 6년차', 2020, '1', 'seed64@azeyo.co.kr', 'NAVER', 'seed_64', 320, 90, false, NOW(), NOW()),
('레고아빠', '결혼 8년차 · 아이 2명', 2018, '2', 'seed65@azeyo.co.kr', 'KAKAO', 'seed_65', 490, 132, false, NOW(), NOW()),
('농구아재', '결혼 11년차 · 아이 1명', 2015, '1', 'seed66@azeyo.co.kr', 'GOOGLE', 'seed_66', 840, 218, false, NOW(), NOW()),
('탁구남편', '결혼 4년차', 2022, '0', 'seed67@azeyo.co.kr', 'NAVER', 'seed_67', 140, 48, false, NOW(), NOW()),
('라면마스터', '결혼 7년차 · 아이 1명', 2019, '1', 'seed68@azeyo.co.kr', 'KAKAO', 'seed_68', 360, 98, false, NOW(), NOW()),
('빵굽는아빠', '결혼 9년차 · 아이 2명', 2017, '2', 'seed69@azeyo.co.kr', 'NAVER', 'seed_69', 590, 158, false, NOW(), NOW()),
('축구코치아빠', '결혼 10년차 · 아이 2명', 2016, '2', 'seed70@azeyo.co.kr', 'GOOGLE', 'seed_70', 730, 195, false, NOW(), NOW()),
('기타치는남편', '결혼 6년차', 2020, '1', 'seed71@azeyo.co.kr', 'KAKAO', 'seed_71', 310, 88, false, NOW(), NOW()),
('밤산책남편', '결혼 5년차 · 아이 1명', 2021, '1', 'seed72@azeyo.co.kr', 'NAVER', 'seed_72', 250, 75, false, NOW(), NOW()),
('주차달인', '결혼 8년차 · 아이 2명', 2018, '2', 'seed73@azeyo.co.kr', 'KAKAO', 'seed_73', 460, 125, false, NOW(), NOW()),
('마트남편', '결혼 13년차 · 아이 1명', 2013, '1', 'seed74@azeyo.co.kr', 'GOOGLE', 'seed_74', 1170, 295, false, NOW(), NOW()),
('도시락아빠', '결혼 7년차 · 아이 2명', 2019, '2', 'seed75@azeyo.co.kr', 'NAVER', 'seed_75', 430, 116, false, NOW(), NOW()),
('운전대남편', '결혼 4년차', 2022, '0', 'seed76@azeyo.co.kr', 'KAKAO', 'seed_76', 130, 44, false, NOW(), NOW()),
('반려견아빠', '결혼 6년차 · 아이 1명', 2020, '1', 'seed77@azeyo.co.kr', 'NAVER', 'seed_77', 340, 94, false, NOW(), NOW()),
('통기타남편', '결혼 9년차', 2017, '1', 'seed78@azeyo.co.kr', 'GOOGLE', 'seed_78', 600, 160, false, NOW(), NOW()),
('헬스남편', '결혼 5년차', 2021, '0', 'seed79@azeyo.co.kr', 'KAKAO', 'seed_79', 200, 65, false, NOW(), NOW()),
('정원사아빠', '결혼 14년차 · 아이 2명', 2012, '2', 'seed80@azeyo.co.kr', 'NAVER', 'seed_80', 1380, 315, false, NOW(), NOW()),
('음악아재', '결혼 10년차 · 아이 1명', 2016, '1', 'seed81@azeyo.co.kr', 'KAKAO', 'seed_81', 690, 182, false, NOW(), NOW()),
('당근마켓남편', '결혼 3년차', 2023, '0', 'seed82@azeyo.co.kr', 'GOOGLE', 'seed_82', 80, 35, false, NOW(), NOW()),
('퍼즐아빠', '결혼 8년차 · 아이 2명', 2018, '2', 'seed83@azeyo.co.kr', 'NAVER', 'seed_83', 480, 130, false, NOW(), NOW()),
('명상남편', '결혼 7년차 · 아이 1명', 2019, '1', 'seed84@azeyo.co.kr', 'KAKAO', 'seed_84', 370, 102, false, NOW(), NOW()),
('마라톤아재', '결혼 11년차 · 아이 1명', 2015, '1', 'seed85@azeyo.co.kr', 'NAVER', 'seed_85', 860, 222, false, NOW(), NOW()),
('아이스크림아빠', '결혼 6년차 · 아이 2명', 2020, '2', 'seed86@azeyo.co.kr', 'GOOGLE', 'seed_86', 350, 96, false, NOW(), NOW()),
('집수리남편', '결혼 9년차 · 아이 1명', 2017, '1', 'seed87@azeyo.co.kr', 'KAKAO', 'seed_87', 540, 145, false, NOW(), NOW()),
('배달앱남편', '결혼 4년차', 2022, '0', 'seed88@azeyo.co.kr', 'NAVER', 'seed_88', 160, 52, false, NOW(), NOW()),
('보드타는아빠', '결혼 8년차 · 아이 2명', 2018, '2', 'seed89@azeyo.co.kr', 'KAKAO', 'seed_89', 500, 135, false, NOW(), NOW()),
('요리도전남편', '결혼 5년차', 2021, '1', 'seed90@azeyo.co.kr', 'GOOGLE', 'seed_90', 230, 72, false, NOW(), NOW()),
('코딩아빠', '결혼 7년차 · 아이 1명', 2019, '1', 'seed91@azeyo.co.kr', 'NAVER', 'seed_91', 380, 104, false, NOW(), NOW()),
('클라이밍남편', '결혼 6년차', 2020, '0', 'seed92@azeyo.co.kr', 'KAKAO', 'seed_92', 280, 82, false, NOW(), NOW()),
('서핑아재', '결혼 10년차 · 아이 1명', 2016, '1', 'seed93@azeyo.co.kr', 'NAVER', 'seed_93', 720, 192, false, NOW(), NOW()),
('블로그남편', '결혼 8년차 · 아이 2명', 2018, '2', 'seed94@azeyo.co.kr', 'GOOGLE', 'seed_94', 470, 126, false, NOW(), NOW()),
('강아지아빠', '결혼 3년차', 2023, '0', 'seed95@azeyo.co.kr', 'KAKAO', 'seed_95', 95, 38, false, NOW(), NOW()),
('텐트아재', '결혼 12년차 · 아이 2명', 2014, '2', 'seed96@azeyo.co.kr', 'NAVER', 'seed_96', 940, 238, false, NOW(), NOW()),
('패들보드남편', '결혼 5년차 · 아이 1명', 2021, '1', 'seed97@azeyo.co.kr', 'KAKAO', 'seed_97', 220, 68, false, NOW(), NOW()),
('볼링아빠', '결혼 9년차 · 아이 2명', 2017, '2', 'seed98@azeyo.co.kr', 'GOOGLE', 'seed_98', 580, 155, false, NOW(), NOW()),
('드럼치는남편', '결혼 7년차', 2019, '1', 'seed99@azeyo.co.kr', 'NAVER', 'seed_99', 400, 110, false, NOW(), NOW()),
('풍경사진가', '결혼 11년차 · 아이 1명', 2015, '1', 'seed100@azeyo.co.kr', 'KAKAO', 'seed_100', 850, 220, false, NOW(), NOW());

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
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_42'), '아재 개그 모음 공유합니다', E'아이한테 시전해서 성공한 아재 개그 모음입니다.\n\n1. "아빠 배고파" \u2192 "안녕 배고파, 나는 아빠"\n2. "비가 오면 뭐 탈까?" \u2192 "비타민"\n3. "세상에서 가장 빠른 닭은?" \u2192 "후라이드 치킨 (튀김)"\n\n아이가 웃는 건지 한심해서 웃는 건지 모르겠지만 일단 웃깁니다.', NOW(), NOW());

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
('WIFE_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_4'), '진심 담은 생일 편지', '여보, 생일 축하해!

올해도 우리 가족을 위해 고생 많았어.
아이들 키우면서 자기 시간도 없는데
항상 웃으면서 해내는 당신이 정말 대단해.

오늘은 당신만을 위한 날이야.
내가 준비한 건 소소하지만
진심을 담았어.

생일 축하해, 세상에서 제일 예쁜 우리 와이프!', 234, NOW() - INTERVAL '25 days', NOW()),

('WIFE_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_21'), '유머 섞은 생일 편지', '여보 생일 축하해~ 🎂

솔직히 말하면...
당신 없이는 하루도 못 살 것 같아.
(밥을 누가 해...?)

농담이고,
당신이 내 인생 최고의 선물이야.
올해도 내 옆에 있어줘서 고마워.

PS. 선물은 택배로 갔어. 기대해도 좋아 😎', 189, NOW() - INTERVAL '24 days', NOW()),

('WIFE_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_42'), '감동형 편지', '여보에게.

결혼하고 보낸 시간들을 돌아보면
행복한 날도, 힘든 날도 있었지만
당신과 함께여서 다 감사했어.

당신은 나에게 아내이자, 친구이자
가장 든든한 동반자야.

생일 축하해.
앞으로 남은 모든 생일을
내가 옆에서 축하해줄게.

영원히 사랑해 ❤️', 567, NOW() - INTERVAL '23 days', NOW()),

('WIFE_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_59'), '아이들과 함께 쓴 편지', '세상에서 제일 좋은 엄마이자
나의 소중한 아내에게

아이들이 그린 그림 봤지?
"엄마 사랑해" 라고 썼어.
나도 똑같은 마음이야.

올해도 우리 가족의 중심이 되어줘서 고마워.
생일 축하해!

- 남편 & 아이들 올림 🎈', 145, NOW() - INTERVAL '22 days', NOW()),

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

('WIFE_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_70'), '스포츠맨 남편의 편지', '여보, 생일 축하해!

내 인생의 MVP는 바로 당신이야.
매일 풀타임으로 뛰면서도
지치지 않는 당신이 진짜 대단해.

올해는 당신이 쉴 수 있게
내가 더 열심히 할게.

해피 버스데이! ⚽🎂', 123, NOW() - INTERVAL '7 days', NOW()),

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

('WIFE_BIRTHDAY', (SELECT id FROM azeyo_users WHERE sns_id='seed_35'), '실용파 남편의 편지', '여보, 생일 축하해!

올해 선물은 네가 요즘 갖고 싶다던 그거야.
(택배 올 때 놀라지 마 ㅎㅎ)

선물보다 더 중요한 건
매일 당신이 행복했으면 좋겠다는 내 마음이야.

생일 축하하고, 사랑해! 🎁', 289, NOW() - INTERVAL '2 days', NOW()),

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

사랑해! 🛋️', 198, NOW(), NOW());

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
  ('아재 개그 모음 공유합니다', 'seed_60', '아이가 "아빠 재미없어" 했는데 눈은 웃고 있더라고요 ㅋㅋ', NOW() - INTERVAL '2 hours')
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
    '아내 운동화 사줬더니 대반응'
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

COMMIT;
