-- ============================================================
-- 아재요 추가 시드 데이터 (게시글 30개 + 댓글 0~8개)
-- 실행: psql -U <user> -d <db> -f seed_extra.sql
-- 주의: seed.sql 실행 후에 실행해야 합니다.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. 커뮤니티 게시글 30개 (TEXT 21 / VOTE 9)
-- ============================================================
INSERT INTO azeyo_community_posts (type, category, user_id, title, contents, created_at, updated_at) VALUES
-- GIFT (5개: 4 TEXT + 1 VOTE)
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_36'), '아내한테 손편지 처음 써봤어요', '결혼 5년 만에 처음으로 편지를 써봤습니다. 어색해서 3번이나 다시 쓰고... 화장대 위에 올려놨는데 퇴근하니까 아내 눈이 빨갛더라고요. 형님들도 가끔 편지 써보세요. 5분이면 됩니다.', NOW() - INTERVAL '58 days', NOW()),
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_47'), '어버이날 장모님 선물 뭐가 좋을까요', '어버이날이 다가오는데 장모님 선물 뭘 해야 할지 모르겠어요. 작년에 건강식품 드렸는데 올해는 다른 걸 하고 싶습니다. 예산 20만원 정도면 뭐가 좋을까요?', NOW() - INTERVAL '57 days', NOW()),
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_52'), '기념일에 직접 요리해줬더니 감동받음', '결혼기념일에 레스토랑 대신 집에서 직접 스테이크 해줬어요. 유튜브 보고 따라 했는데 의외로 맛있었고 아내가 레스토랑보다 낫다고 했습니다. 재료비 3만원으로 분위기 200%!', NOW() - INTERVAL '56 days', NOW()),
('VOTE', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_60'), '선물은 실용적 vs 감성적?', '아내 선물 고를 때 어떤 기준으로 고르시나요?', NOW() - INTERVAL '55 days', NOW()),
('TEXT', 'GIFT', (SELECT id FROM azeyo_users WHERE sns_id='seed_71'), '아내 지갑 낡아서 바꿔줬더니', '아내 지갑이 헤져서 몰래 새 지갑 사서 카드 다 옮겨놨더니... "내 지갑 어딨어?!" 하다가 새 지갑 발견하고 울더라고요. 실용적 깜짝 선물 추천합니다.', NOW() - INTERVAL '54 days', NOW()),
-- COUPLE_FIGHT (5개: 3 TEXT + 2 VOTE)
('TEXT', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_26'), '여행지 정하다가 싸웠습니다', '아내는 제주도 가자, 저는 강원도 가자... 1시간 실랑이하다가 결국 "그럼 안 가!"로 끝났습니다. 여행 계획 세우다가 싸우는 부부 저희만인가요?', NOW() - INTERVAL '53 days', NOW()),
('TEXT', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_37'), '운전 중에 잔소리하면 진짜 위험해요', '운전할 때 아내가 옆에서 "거기서 왜 안 꺾어" "앞차 너무 가까워" 하면 진짜 스트레스입니다. 안전 문제도 있고... 형님들은 어떻게 대처하시나요?', NOW() - INTERVAL '52 days', NOW()),
('VOTE', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_48'), '부부싸움 원인 1위는?', '우리 집 부부싸움 원인 1위는 뭔가요?', NOW() - INTERVAL '51 days', NOW()),
('TEXT', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_56'), '장모님 앞에서 부부싸움 해버렸어요', '명절에 장모님 댁에서 사소한 것 때문에 아내랑 티격태격했는데 장모님이 다 들으셨어요. 장모님이 "둘 다 그만해"라고 하시는데 땅에 꺼지고 싶었습니다...', NOW() - INTERVAL '50 days', NOW()),
('VOTE', 'COUPLE_FIGHT', (SELECT id FROM azeyo_users WHERE sns_id='seed_66'), '싸운 후 화해 방법은?', '부부싸움 후에 어떻게 화해하시나요?', NOW() - INTERVAL '49 days', NOW()),
-- HOBBY (5개: 4 TEXT + 1 VOTE)
('TEXT', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_28'), '주말에 혼자 카페 가는 남편 이상한가요', '아내 동의 받고 토요일 오전에 혼자 카페 가서 책 읽는데 친구가 "유부남이 혼자 카페?" 하더라고요. 이게 이상한 건가요? 나만의 시간도 필요하잖아요.', NOW() - INTERVAL '48 days', NOW()),
('TEXT', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_34'), '아내랑 넷플릭스 뭐 보세요', '매일 밤 넷플릭스 보는데 저는 액션, 아내는 로맨스... 장르 싸움이 날마다 벌어집니다. 둘 다 즐길 수 있는 작품 추천해주세요.', NOW() - INTERVAL '47 days', NOW()),
('VOTE', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_46'), '혼자만의 시간 vs 가족과 시간', '주말에 어떻게 보내고 싶으세요?', NOW() - INTERVAL '46 days', NOW()),
('TEXT', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_58'), '40대에 수영 시작했습니다', '아내가 뱃살 빼라고 해서 수영 시작했는데 3개월 만에 5kg 빠졌어요. 관절에 무리도 안 가고 40대한테 최고의 운동인 것 같습니다.', NOW() - INTERVAL '45 days', NOW()),
('TEXT', 'HOBBY', (SELECT id FROM azeyo_users WHERE sns_id='seed_69'), '아이랑 축구 시작했어요', '아들이 축구 좋아해서 같이 주말 축구 시작했는데... 20분 뛰고 숨 넘어갈 뻔했어요. 체력이 이렇게 떨어졌나 싶네요 ㅋㅋ 그래도 아이가 좋아하니까 계속 해야죠.', NOW() - INTERVAL '44 days', NOW()),
-- PARENTING (5개: 4 TEXT + 1 VOTE)
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_43'), '아이가 자꾸 거짓말을 해요', '7살 아들이 숙제 안 하고 했다고 거짓말하는 게 발각됐어요. 어떻게 훈육해야 할까요? 심하게 혼내면 역효과 날 것 같고 그냥 넘기자니 습관 될 것 같아서요.', NOW() - INTERVAL '43 days', NOW()),
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_53'), '쌍둥이 아빠의 일상', '쌍둥이 키우시는 형님들 계세요? 하나도 힘든데 둘이라니... 밤에 한 명 재우면 한 명이 울고, 한 명 달래면 다른 한 명이 울고. 아내랑 교대로 안아주다가 팔이 빠질 것 같아요.', NOW() - INTERVAL '42 days', NOW()),
('VOTE', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_62'), '아이 교육비 얼마나 쓰세요?', '월 아이 교육비 얼마 쓰시나요?', NOW() - INTERVAL '41 days', NOW()),
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_72'), '딸이 남자친구를 데려왔어요', '고등학생 딸이 남자친구를 집에 데려왔는데... 머리로는 이해하는데 마음이 복잡합니다. 밥은 해줬는데 남자애 눈을 못 마주치겠더라고요. 아빠들은 이런 상황에서 어떻게 하시나요?', NOW() - INTERVAL '40 days', NOW()),
('TEXT', 'PARENTING', (SELECT id FROM azeyo_users WHERE sns_id='seed_82'), '아이 첫 심부름 보냈어요', '초등 1학년 아들을 처음 혼자 편의점 심부름 보냈는데 몰래 뒤따라간 건 비밀입니다 ㅋㅋ 우유 하나 사오는데 20분 걸렸어요. 대견하면서 걱정되고 복잡하네요.', NOW() - INTERVAL '39 days', NOW()),
-- LIFE_TIP (5개: 3 TEXT + 2 VOTE)
('TEXT', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_18'), '냉장고 정리 꿀팁 공유', '냉장고 정리 투명 수납함 쓰기 시작하고 음식 버리는 양이 절반으로 줄었어요. 다이소 3천원이면 충분합니다. 라벨기까지 쓰면 아내한테 칭찬 받습니다.', NOW() - INTERVAL '38 days', NOW()),
('TEXT', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_32'), '아파트 층간소음 해결한 방법', '아래층에서 항의가 와서 아이들 방에 퍼즐매트 깔고 8시 이후 뛰지 않기 규칙 만들었더니 해결됐어요. 이웃과의 관계가 제일 중요합니다. 사과 과일 세트 들고 인사 가세요.', NOW() - INTERVAL '37 days', NOW()),
('VOTE', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_44'), '식비 절약 어떻게 하세요?', '월 식비 어떻게 관리하시나요?', NOW() - INTERVAL '36 days', NOW()),
('TEXT', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_54'), '자동차 보험 갱신 팁', '매년 자동 갱신하지 마시고 비교 견적 받아보세요. 저는 같은 조건에 연 15만원 아꼈습니다. 다이렉트 보험이 핵심이에요.', NOW() - INTERVAL '35 days', NOW()),
('VOTE', 'LIFE_TIP', (SELECT id FROM azeyo_users WHERE sns_id='seed_64'), '집안일 분담 어떻게 하세요?', '집안일 분담 방식은?', NOW() - INTERVAL '34 days', NOW()),
-- FREE (5개: 3 TEXT + 2 VOTE)
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_38'), '유부남 되고 가장 잘한 일', '결혼 전엔 몰랐는데 매일 집에 돌아갈 곳이 있다는 게 이렇게 큰 행복이었을 줄... 혼자 살 때는 텅 빈 원룸이었는데 지금은 불 켜진 집이 기다리고 있잖아요. 형님들 가끔은 당연한 것에 감사합시다.', NOW() - INTERVAL '33 days', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_50'), '아내가 갑자기 예뻐 보일 때', '아이 재우고 거실에서 졸고 있는 아내 보면 왜 이렇게 예뻐 보이는지. 연애 때보다 지금이 더 좋아요. 이런 말 직접 하면 또 "무슨 속셈이야" 그럴 텐데 ㅋㅋ', NOW() - INTERVAL '32 days', NOW()),
('VOTE', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_59'), '유부남의 최고 스트레스 해소법은?', '스트레스 받을 때 뭐하세요?', NOW() - INTERVAL '31 days', NOW()),
('TEXT', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_69'), '아내 생일에 서프라이즈 실패기', '케이크 사서 깜짝 파티 하려고 일찍 퇴근했는데... 아내가 더 일찍 퇴근해서 이미 집에 있었어요 ㅋㅋ 깜짝이 깜놀로 바뀌었지만 그래도 좋아했습니다. 마음이 중요한 거죠 뭐.', NOW() - INTERVAL '30 days', NOW()),
('VOTE', 'FREE', (SELECT id FROM azeyo_users WHERE sns_id='seed_78'), '결혼 전으로 돌아간다면?', '만약 결혼 전으로 돌아간다면?', NOW() - INTERVAL '29 days', NOW());

-- ============================================================
-- 2. VOTE 게시글 선택지
-- ============================================================
UPDATE azeyo_community_posts SET vote_option_a = '실용적인 선물', vote_option_b = '감성적인 선물'
WHERE title = '선물은 실용적 vs 감성적?';
UPDATE azeyo_community_posts SET vote_option_a = '돈/살림 문제', vote_option_b = '소통 부족'
WHERE title = '부부싸움 원인 1위는?';
UPDATE azeyo_community_posts SET vote_option_a = '말로 직접 사과', vote_option_b = '맛있는 거 사가기'
WHERE title = '싸운 후 화해 방법은?';
UPDATE azeyo_community_posts SET vote_option_a = '혼자만의 시간', vote_option_b = '가족과 함께'
WHERE title = '혼자만의 시간 vs 가족과 시간';
UPDATE azeyo_community_posts SET vote_option_a = '50만원 이하', vote_option_b = '50만원 이상'
WHERE title = '아이 교육비 얼마나 쓰세요?';
UPDATE azeyo_community_posts SET vote_option_a = '장보기 계획', vote_option_b = '배달/외식 줄이기'
WHERE title = '식비 절약 어떻게 하세요?';
UPDATE azeyo_community_posts SET vote_option_a = '영역별 분담', vote_option_b = '그때그때 알아서'
WHERE title = '집안일 분담 어떻게 하세요?';
UPDATE azeyo_community_posts SET vote_option_a = '운동/산책', vote_option_b = '게임/유튜브'
WHERE title = '유부남의 최고 스트레스 해소법은?';
UPDATE azeyo_community_posts SET vote_option_a = '같은 선택', vote_option_b = '좀 더 즐기고 결혼'
WHERE title = '결혼 전으로 돌아간다면?';

-- ============================================================
-- 3. 댓글 (게시글당 0~8개, 총 ~112개)
-- ============================================================
INSERT INTO azeyo_community_comments (post_id, user_id, contents, created_at, updated_at)
SELECT p.id, u.id, c.contents, c.created_at, c.created_at
FROM (VALUES
  -- 아내한테 손편지 처음 써봤어요 (4개)
  ('아내한테 손편지 처음 써봤어요', 'seed_4', '편지는 진짜 효과 만점이에요. 저도 매년 생일마다 씁니다.', NOW() - INTERVAL '57 days'),
  ('아내한테 손편지 처음 써봤어요', 'seed_14', '글씨가 삐뚤삐뚤해도 진심이 담기면 됩니다 ㅋㅋ', NOW() - INTERVAL '57 days'),
  ('아내한테 손편지 처음 써봤어요', 'seed_21', '5분이면 된다는 말에 동의! 근데 쓰다 보면 30분 걸려요 ㅋㅋ', NOW() - INTERVAL '56 days'),
  ('아내한테 손편지 처음 써봤어요', 'seed_59', '저도 해봐야겠다. 결혼 8년인데 한 번도 안 써봤네요...', NOW() - INTERVAL '56 days'),
  -- 어버이날 장모님 선물 뭐가 좋을까요 (3개)
  ('어버이날 장모님 선물 뭐가 좋을까요', 'seed_9', '마사지건 추천이요. 어깨 아프신 분들 진짜 좋아하세요.', NOW() - INTERVAL '56 days'),
  ('어버이날 장모님 선물 뭐가 좋을까요', 'seed_14', '현금이 최고라는 걸 20년 사위 생활로 깨달았습니다.', NOW() - INTERVAL '56 days'),
  ('어버이날 장모님 선물 뭐가 좋을까요', 'seed_74', '손주 사진 액자 만들어서 드려보세요. 가성비 갑이에요.', NOW() - INTERVAL '55 days'),
  -- 기념일에 직접 요리해줬더니 감동받음 (5개)
  ('기념일에 직접 요리해줬더니 감동받음', 'seed_8', '스테이크 레시피 공유 좀 해주세요! 저도 도전하고 싶어요.', NOW() - INTERVAL '55 days'),
  ('기념일에 직접 요리해줬더니 감동받음', 'seed_18', '3만원으로 분위기 200%라니... 가성비의 왕이시네요 ㅋㅋ', NOW() - INTERVAL '55 days'),
  ('기념일에 직접 요리해줬더니 감동받음', 'seed_29', '캔들 하나 켜놓으면 분위기 300%까지 올라갑니다.', NOW() - INTERVAL '54 days'),
  ('기념일에 직접 요리해줬더니 감동받음', 'seed_42', '직접 해준다는 그 마음이 감동인 거죠. 맛은 사실 부차적...', NOW() - INTERVAL '54 days'),
  ('기념일에 직접 요리해줬더니 감동받음', 'seed_90', '저도 파스타 해줬는데 면이 불어서 망했어요 ㅋㅋ 타이밍이 중요!', NOW() - INTERVAL '53 days'),
  -- 선물은 실용적 vs 감성적? (2개)
  ('선물은 실용적 vs 감성적?', 'seed_1', '실용적인 게 오래 쓰니까 기억에 남아요.', NOW() - INTERVAL '54 days'),
  ('선물은 실용적 vs 감성적?', 'seed_25', '감성적 선물+실용적 선물 둘 다 주면 됩니다 ㅋㅋ', NOW() - INTERVAL '54 days'),
  -- 아내 지갑 낡아서 바꿔줬더니 (3개)
  ('아내 지갑 낡아서 바꿔줬더니', 'seed_5', '카드 다 옮겨놓은 센스가 진짜 포인트네요!', NOW() - INTERVAL '53 days'),
  ('아내 지갑 낡아서 바꿔줬더니', 'seed_31', '어떤 브랜드 사셨어요? 저도 해볼까 하는데...', NOW() - INTERVAL '53 days'),
  ('아내 지갑 낡아서 바꿔줬더니', 'seed_60', '깜짝 선물의 정석이네요. 배워갑니다!', NOW() - INTERVAL '52 days'),
  -- 여행지 정하다가 싸웠습니다 (6개)
  ('여행지 정하다가 싸웠습니다', 'seed_7', '둘 다 가세요. 이번엔 제주, 다음엔 강원도! ㅋㅋ', NOW() - INTERVAL '52 days'),
  ('여행지 정하다가 싸웠습니다', 'seed_13', '저는 아내한테 고르라고 합니다. 그게 평화의 길이에요.', NOW() - INTERVAL '52 days'),
  ('여행지 정하다가 싸웠습니다', 'seed_30', '여행 가기도 전에 싸우면... 안 가느니만 못해요 ㅋㅋ', NOW() - INTERVAL '51 days'),
  ('여행지 정하다가 싸웠습니다', 'seed_50', '제비뽑기 추천합니다. 랜덤이 최고에요.', NOW() - INTERVAL '51 days'),
  ('여행지 정하다가 싸웠습니다', 'seed_67', '저희도 매번 이래요... 결국 아내가 정한 곳으로 갑니다.', NOW() - INTERVAL '50 days'),
  ('여행지 정하다가 싸웠습니다', 'seed_85', '여행 계획은 아내한테 위임하고 비용은 제가 담당합니다. 평화로워요.', NOW() - INTERVAL '50 days'),
  -- 운전 중에 잔소리하면 진짜 위험해요 (4개)
  ('운전 중에 잔소리하면 진짜 위험해요', 'seed_6', '100% 공감... 저는 이제 그냥 네비 따라갑니다.', NOW() - INTERVAL '51 days'),
  ('운전 중에 잔소리하면 진짜 위험해요', 'seed_22', '아내한테 운전 가르쳐주세요. 직접 해보면 잔소리 줄어요 ㅋㅋ', NOW() - INTERVAL '51 days'),
  ('운전 중에 잔소리하면 진짜 위험해요', 'seed_44', '저는 "좀 조용히 해줘" 했다가 더 큰 싸움이... 그냥 참으세요.', NOW() - INTERVAL '50 days'),
  ('운전 중에 잔소리하면 진짜 위험해요', 'seed_73', '음악 틀면 좀 나아져요. 노래에 집중하니까 잔소리가 줄더라고요.', NOW() - INTERVAL '50 days'),
  -- 부부싸움 원인 1위는? (1개)
  ('부부싸움 원인 1위는?', 'seed_2', '돈 문제가 압도적 1위 아닌가요... 현실이 그래요.', NOW() - INTERVAL '50 days'),
  -- 장모님 앞에서 부부싸움 해버렸어요 (5개)
  ('장모님 앞에서 부부싸움 해버렸어요', 'seed_9', '장모님 앞에서는 절대 안 됩니다... 그건 철칙이에요.', NOW() - INTERVAL '49 days'),
  ('장모님 앞에서 부부싸움 해버렸어요', 'seed_14', '장모님한테 따로 전화해서 사과하세요. 그게 먼저입니다.', NOW() - INTERVAL '49 days'),
  ('장모님 앞에서 부부싸움 해버렸어요', 'seed_31', '저도 비슷한 경험... 장모님이 "우리 딸 고생 많다" 하시는데 찔렸어요.', NOW() - INTERVAL '48 days'),
  ('장모님 앞에서 부부싸움 해버렸어요', 'seed_49', '형님 힘내세요. 시간이 지나면 다 웃을 수 있는 이야기가 됩니다.', NOW() - INTERVAL '48 days'),
  ('장모님 앞에서 부부싸움 해버렸어요', 'seed_74', '선물 하나 들고 장모님 찾아가세요. 사위가 찾아오면 다 풀립니다.', NOW() - INTERVAL '47 days'),
  -- 싸운 후 화해 방법은? (2개)
  ('싸운 후 화해 방법은?', 'seed_5', '맛있는 거 사가기가 한국 가정의 전통입니다 ㅋㅋ', NOW() - INTERVAL '48 days'),
  ('싸운 후 화해 방법은?', 'seed_40', '둘 다요. 말로 사과하면서 맛있는 거 사가면 됩니다.', NOW() - INTERVAL '48 days'),
  -- 주말에 혼자 카페 가는 남편 이상한가요 (7개)
  ('주말에 혼자 카페 가는 남편 이상한가요', 'seed_1', '전혀 이상하지 않아요. 재충전 시간은 꼭 필요합니다.', NOW() - INTERVAL '47 days'),
  ('주말에 혼자 카페 가는 남편 이상한가요', 'seed_11', '저도 일요일 아침에 혼자 카페 가요. 아내도 그 시간에 낮잠 자고 ㅋㅋ', NOW() - INTERVAL '47 days'),
  ('주말에 혼자 카페 가는 남편 이상한가요', 'seed_20', '혼자만의 시간이 있어야 좋은 남편이 될 수 있어요.', NOW() - INTERVAL '46 days'),
  ('주말에 혼자 카페 가는 남편 이상한가요', 'seed_34', '아내한테 동의 받았으면 뭐가 이상해요. 당당하세요!', NOW() - INTERVAL '46 days'),
  ('주말에 혼자 카페 가는 남편 이상한가요', 'seed_52', '서로 존중하는 거죠. 아내도 혼자만의 시간 만들어주세요.', NOW() - INTERVAL '45 days'),
  ('주말에 혼자 카페 가는 남편 이상한가요', 'seed_78', '독서하면서 커피 마시는 거 최고의 힐링이에요.', NOW() - INTERVAL '45 days'),
  ('주말에 혼자 카페 가는 남편 이상한가요', 'seed_93', '그 친구가 이상한 겁니다. 남편도 쉴 시간이 필요해요.', NOW() - INTERVAL '44 days'),
  -- 아내랑 넷플릭스 뭐 보세요 (5개)
  ('아내랑 넷플릭스 뭐 보세요', 'seed_8', '이상한 변호사 우영우 같이 봤는데 둘 다 재밌었어요.', NOW() - INTERVAL '46 days'),
  ('아내랑 넷플릭스 뭐 보세요', 'seed_15', '범죄 다큐 같이 보면 의외로 둘 다 빠져들어요.', NOW() - INTERVAL '46 days'),
  ('아내랑 넷플릭스 뭐 보세요', 'seed_42', '예능이 답이에요. 나혼자산다 같은 거 보면 싸움 안 나요.', NOW() - INTERVAL '45 days'),
  ('아내랑 넷플릭스 뭐 보세요', 'seed_56', '더 글로리 같이 봤는데 아내가 저한테 더 잘해주더라고요 ㅋㅋ', NOW() - INTERVAL '45 days'),
  ('아내랑 넷플릭스 뭐 보세요', 'seed_82', '여행 다큐 같이 보면 다음 여행 계획도 세울 수 있어요.', NOW() - INTERVAL '44 days'),
  -- 혼자만의 시간 vs 가족과 시간 (0개)
  -- 40대에 수영 시작했습니다 (4개)
  ('40대에 수영 시작했습니다', 'seed_16', '수영 진짜 좋아요. 저도 1년째 하는데 허리 통증이 사라졌어요.', NOW() - INTERVAL '44 days'),
  ('40대에 수영 시작했습니다', 'seed_47', '5kg이면 대단하네요! 주 몇 회 가시나요?', NOW() - INTERVAL '44 days'),
  ('40대에 수영 시작했습니다', 'seed_64', '저도 시작하려는데 수영복 사는 게 부끄럽네요 ㅋㅋ', NOW() - INTERVAL '43 days'),
  ('40대에 수영 시작했습니다', 'seed_85', '관절 안전한 운동 중 최고입니다. 강추!', NOW() - INTERVAL '43 days'),
  -- 아이랑 축구 시작했어요 (3개)
  ('아이랑 축구 시작했어요', 'seed_27', '체력은 점점 올라가니까 포기하지 마세요!', NOW() - INTERVAL '43 days'),
  ('아이랑 축구 시작했어요', 'seed_51', '아이랑 같이 하는 운동이 최고죠. 추억도 쌓이고.', NOW() - INTERVAL '43 days'),
  ('아이랑 축구 시작했어요', 'seed_70', '스트레칭 꼭 하세요. 40대 갑작스런 운동은 부상 위험!', NOW() - INTERVAL '42 days'),
  -- 아이가 자꾸 거짓말을 해요 (6개)
  ('아이가 자꾸 거짓말을 해요', 'seed_10', '왜 거짓말했는지 이유를 먼저 들어보세요. 혼나는 게 무서워서일 수 있어요.', NOW() - INTERVAL '42 days'),
  ('아이가 자꾸 거짓말을 해요', 'seed_19', '솔직하게 말하면 칭찬해주세요. 정직함의 가치를 가르쳐야 해요.', NOW() - INTERVAL '42 days'),
  ('아이가 자꾸 거짓말을 해요', 'seed_33', '7살이면 발달 과정이에요. 너무 걱정 마시고 꾸준히 대화하세요.', NOW() - INTERVAL '41 days'),
  ('아이가 자꾸 거짓말을 해요', 'seed_61', '동화책으로 가르치면 효과 좋아요. 양치기 소년 같은 거요.', NOW() - INTERVAL '41 days'),
  ('아이가 자꾸 거짓말을 해요', 'seed_71', '아이 입장에서 생각해보세요. 숙제가 너무 많은 건 아닌지.', NOW() - INTERVAL '40 days'),
  ('아이가 자꾸 거짓말을 해요', 'seed_81', '저도 겪었는데 대화로 풀었어요. 혼내기보다 이해가 먼저입니다.', NOW() - INTERVAL '40 days'),
  -- 쌍둥이 아빠의 일상 (4개)
  ('쌍둥이 아빠의 일상', 'seed_3', '쌍둥이 아빠 존경합니다... 하나도 정신없는데.', NOW() - INTERVAL '41 days'),
  ('쌍둥이 아빠의 일상', 'seed_19', '체력 관리 꼭 하세요. 부모가 쓰러지면 안 되니까요.', NOW() - INTERVAL '41 days'),
  ('쌍둥이 아빠의 일상', 'seed_39', '주변에 도움 요청하세요. 혼자 감당하려면 무너집니다.', NOW() - INTERVAL '40 days'),
  ('쌍둥이 아빠의 일상', 'seed_62', '2년만 버티세요. 어린이집 보내면 좀 숨 쉴 수 있어요.', NOW() - INTERVAL '40 days'),
  -- 아이 교육비 얼마나 쓰세요? (1개)
  ('아이 교육비 얼마나 쓰세요?', 'seed_10', '월 80만원인데 솔직히 부담됩니다...', NOW() - INTERVAL '40 days'),
  -- 딸이 남자친구를 데려왔어요 (8개)
  ('딸이 남자친구를 데려왔어요', 'seed_3', '딸바보로서 마음이 찢어지겠네요 ㅋㅋ 힘내세요.', NOW() - INTERVAL '39 days'),
  ('딸이 남자친구를 데려왔어요', 'seed_7', '밥 해준 거 대단합니다. 저는 아마 문도 안 열어줬을 거에요...', NOW() - INTERVAL '39 days'),
  ('딸이 남자친구를 데려왔어요', 'seed_17', '자연스럽게 대해주세요. 딸이 더 신뢰하게 됩니다.', NOW() - INTERVAL '38 days'),
  ('딸이 남자친구를 데려왔어요', 'seed_42', '집에 데려온 거면 딸이 아빠를 신뢰하는 거에요. 좋은 신호입니다.', NOW() - INTERVAL '38 days'),
  ('딸이 남자친구를 데려왔어요', 'seed_49', '차라리 몰래 만나는 것보다 100배 나아요. 열린 관계 유지하세요.', NOW() - INTERVAL '37 days'),
  ('딸이 남자친구를 데려왔어요', 'seed_62', '처음엔 힘들지만 적응됩니다. 딸이 행복하면 된 거에요.', NOW() - INTERVAL '37 days'),
  ('딸이 남자친구를 데려왔어요', 'seed_80', '남자애한테 은근히 "우리 딸 소중하다" 어필하세요 ㅋㅋ', NOW() - INTERVAL '36 days'),
  ('딸이 남자친구를 데려왔어요', 'seed_96', '밥 해준 아버지... 딸이 평생 기억할 거에요.', NOW() - INTERVAL '36 days'),
  -- 아이 첫 심부름 보냈어요 (5개)
  ('아이 첫 심부름 보냈어요', 'seed_1', 'ㅋㅋㅋ 몰래 뒤따라간 거 200% 공감합니다!', NOW() - INTERVAL '38 days'),
  ('아이 첫 심부름 보냈어요', 'seed_10', '20분이면 빠른 거에요. 저희 아들은 30분 걸렸어요 ㅋㅋ', NOW() - INTERVAL '38 days'),
  ('아이 첫 심부름 보냈어요', 'seed_33', '영상 찍어두세요. 나중에 보면 진짜 웃겨요 ㅋㅋ', NOW() - INTERVAL '37 days'),
  ('아이 첫 심부름 보냈어요', 'seed_65', '거스름돈 받아오면 칭찬해주세요. 대단한 거에요!', NOW() - INTERVAL '37 days'),
  ('아이 첫 심부름 보냈어요', 'seed_91', '아이 성장하는 모습 보면 뿌듯하죠. 대견하네요.', NOW() - INTERVAL '36 days'),
  -- 냉장고 정리 꿀팁 공유 (3개)
  ('냉장고 정리 꿀팁 공유', 'seed_2', '다이소 수납함 진짜 좋아요. 저도 쓰고 있습니다.', NOW() - INTERVAL '37 days'),
  ('냉장고 정리 꿀팁 공유', 'seed_35', '라벨기까지 쓰시다니... 정리왕이시네요 ㅋㅋ', NOW() - INTERVAL '37 days'),
  ('냉장고 정리 꿀팁 공유', 'seed_68', '유통기한 적어서 붙여놓으면 음식물 쓰레기가 확 줄어요.', NOW() - INTERVAL '36 days'),
  -- 아파트 층간소음 해결한 방법 (6개)
  ('아파트 층간소음 해결한 방법', 'seed_7', '퍼즐매트 어디서 사셨어요? 두께가 중요한가요?', NOW() - INTERVAL '36 days'),
  ('아파트 층간소음 해결한 방법', 'seed_27', '사과 과일 세트 들고 가라는 말 진짜 꿀팁이에요.', NOW() - INTERVAL '36 days'),
  ('아파트 층간소음 해결한 방법', 'seed_39', '아이들한테 8시 이후 규칙 지키게 하는 게 제일 어렵죠 ㅋㅋ', NOW() - INTERVAL '35 days'),
  ('아파트 층간소음 해결한 방법', 'seed_51', '저도 아래층 항의 받았는데 직접 찾아가서 사과하니 해결됐어요.', NOW() - INTERVAL '35 days'),
  ('아파트 층간소음 해결한 방법', 'seed_75', '실내 슬리퍼도 효과 있어요. 푹신한 거로 바꾸세요.', NOW() - INTERVAL '34 days'),
  ('아파트 층간소음 해결한 방법', 'seed_91', '서로 배려하면 해결되는 문제인데 현실은 어렵죠...', NOW() - INTERVAL '34 days'),
  -- 식비 절약 어떻게 하세요? (2개)
  ('식비 절약 어떻게 하세요?', 'seed_18', '장보기 리스트 쓰면 충동구매가 확 줄어요.', NOW() - INTERVAL '35 days'),
  ('식비 절약 어떻게 하세요?', 'seed_35', '반찬 만들어 냉동하면 배달 시킬 일이 없어요.', NOW() - INTERVAL '35 days'),
  -- 자동차 보험 갱신 팁 (3개)
  ('자동차 보험 갱신 팁', 'seed_27', '다이렉트 보험 진짜 싸요. 저도 바꿨습니다.', NOW() - INTERVAL '34 days'),
  ('자동차 보험 갱신 팁', 'seed_44', '비교 사이트 써보세요. 한 번에 견적 나옵니다.', NOW() - INTERVAL '34 days'),
  ('자동차 보험 갱신 팁', 'seed_78', '마일리지 특약 꼭 넣으세요. 출퇴근만 하면 할인 많이 돼요.', NOW() - INTERVAL '33 days'),
  -- 집안일 분담 어떻게 하세요? (0개)
  -- 유부남 되고 가장 잘한 일 (4개)
  ('유부남 되고 가장 잘한 일', 'seed_5', '감성 터지네요... 공감합니다 형님.', NOW() - INTERVAL '32 days'),
  ('유부남 되고 가장 잘한 일', 'seed_11', '결혼이 주는 행복을 아는 사람이네요. 부러워요.', NOW() - INTERVAL '32 days'),
  ('유부남 되고 가장 잘한 일', 'seed_42', '불 켜진 집이 기다린다는 표현 진짜 좋네요.', NOW() - INTERVAL '31 days'),
  ('유부남 되고 가장 잘한 일', 'seed_60', '당연한 것에 감사... 맞는 말이에요. 오늘 일찍 퇴근해야겠다.', NOW() - INTERVAL '31 days'),
  -- 아내가 갑자기 예뻐 보일 때 (5개)
  ('아내가 갑자기 예뻐 보일 때', 'seed_1', '졸고 있는 아내 보면 진짜 예뻐 보이죠 ㅋㅋ 공감!', NOW() - INTERVAL '31 days'),
  ('아내가 갑자기 예뻐 보일 때', 'seed_8', '"무슨 속셈이야" ㅋㅋㅋ 너무 현실적이에요.', NOW() - INTERVAL '31 days'),
  ('아내가 갑자기 예뻐 보일 때', 'seed_15', '그래도 가끔은 직접 말해주세요. 아내도 들으면 좋아해요.', NOW() - INTERVAL '30 days'),
  ('아내가 갑자기 예뻐 보일 때', 'seed_40', '연애 때보다 지금이 더 좋다는 말... 감동이네요.', NOW() - INTERVAL '30 days'),
  ('아내가 갑자기 예뻐 보일 때', 'seed_59', '이런 마음 가진 남편이면 아내분도 행복하실 거에요.', NOW() - INTERVAL '29 days'),
  -- 유부남의 최고 스트레스 해소법은? (2개)
  ('유부남의 최고 스트레스 해소법은?', 'seed_16', '운동이 답이에요. 뛰고 나면 스트레스 다 날아가요.', NOW() - INTERVAL '30 days'),
  ('유부남의 최고 스트레스 해소법은?', 'seed_26', '게임하면 아내한테 또 혼날까봐... 산책이 무난합니다 ㅋㅋ', NOW() - INTERVAL '30 days'),
  -- 아내 생일에 서프라이즈 실패기 (7개)
  ('아내 생일에 서프라이즈 실패기', 'seed_1', 'ㅋㅋㅋ 깜짝이 깜놀 ㅋㅋㅋ 웃겼어요', NOW() - INTERVAL '29 days'),
  ('아내 생일에 서프라이즈 실패기', 'seed_5', '마음이 중요하다는 말 진짜 맞아요. 결과보다 의도!', NOW() - INTERVAL '29 days'),
  ('아내 생일에 서프라이즈 실패기', 'seed_11', '저는 서프라이즈 준비하다가 아내한테 들켜서 같이 준비했어요 ㅋㅋ', NOW() - INTERVAL '28 days'),
  ('아내 생일에 서프라이즈 실패기', 'seed_22', '실패해도 좋아해주면 성공한 거에요!', NOW() - INTERVAL '28 days'),
  ('아내 생일에 서프라이즈 실패기', 'seed_40', '다음엔 친구한테 시간 좀 끌어달라고 하세요 ㅋㅋ', NOW() - INTERVAL '27 days'),
  ('아내 생일에 서프라이즈 실패기', 'seed_60', '케이크 들고 서 있는 장면 상상하니 웃음이 ㅋㅋㅋ', NOW() - INTERVAL '27 days'),
  ('아내 생일에 서프라이즈 실패기', 'seed_75', '형님 사랑이 느껴지네요. 아내분 복 받으셨어요.', NOW() - INTERVAL '26 days'),
  -- 결혼 전으로 돌아간다면? (3개)
  ('결혼 전으로 돌아간다면?', 'seed_4', '같은 선택이죠. 근데 돈은 좀 더 모아서 결혼할 듯 ㅋㅋ', NOW() - INTERVAL '28 days'),
  ('결혼 전으로 돌아간다면?', 'seed_21', '프로포즈를 좀 더 멋지게 했을 것 같아요. 후회 ㅋㅋ', NOW() - INTERVAL '28 days'),
  ('결혼 전으로 돌아간다면?', 'seed_42', '결혼 전에 운동 좀 더 해놓을걸... 체력이 딸려요.', NOW() - INTERVAL '27 days')
) AS c(post_title, sns_id, contents, created_at)
JOIN azeyo_community_posts p ON p.title = c.post_title
JOIN azeyo_users u ON u.sns_id = c.sns_id;

-- ============================================================
-- 4. 좋아요 (추가 게시글 인기글)
-- ============================================================
INSERT INTO azeyo_community_likes (user_id, target_id, created_at)
SELECT u.id, p.id, NOW() - (random() * INTERVAL '30 days')
FROM azeyo_users u
CROSS JOIN azeyo_community_posts p
WHERE u.sns_id LIKE 'seed_%'
  AND p.title IN (
    '주말에 혼자 카페 가는 남편 이상한가요',
    '유부남 되고 가장 잘한 일',
    '아내가 갑자기 예뻐 보일 때',
    '아내 생일에 서프라이즈 실패기',
    '기념일에 직접 요리해줬더니 감동받음',
    '딸이 남자친구를 데려왔어요',
    '아이 첫 심부름 보냈어요',
    '아파트 층간소음 해결한 방법'
  )
  AND random() < 0.35
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. 투표 (추가 VOTE 게시글)
-- ============================================================
INSERT INTO azeyo_community_votes (user_id, post_id, option, created_at)
SELECT u.id, p.id,
  CASE WHEN random() < 0.55 THEN 'A' ELSE 'B' END,
  NOW() - (random() * INTERVAL '20 days')
FROM azeyo_users u
CROSS JOIN azeyo_community_posts p
WHERE u.sns_id LIKE 'seed_%'
  AND p.type = 'VOTE'
  AND p.title IN (
    '선물은 실용적 vs 감성적?',
    '부부싸움 원인 1위는?',
    '싸운 후 화해 방법은?',
    '혼자만의 시간 vs 가족과 시간',
    '아이 교육비 얼마나 쓰세요?',
    '식비 절약 어떻게 하세요?',
    '집안일 분담 어떻게 하세요?',
    '유부남의 최고 스트레스 해소법은?',
    '결혼 전으로 돌아간다면?'
  )
  AND random() < 0.6
ON CONFLICT DO NOTHING;

COMMIT;
