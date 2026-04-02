# 아재요 시드 데이터 추가 생성

## 목표
기존 시드 SQL 파일(`/Users/joel/Desktop/dev/azeyo/artinfo-server/src/azeyo/seed/seed.sql`)을 읽고, 중복되지 않는 새로운 시드 데이터를 추가 생성합니다.

## 작업 순서

1. **기존 시드 파일 읽기**: `/Users/joel/Desktop/dev/azeyo/artinfo-server/src/azeyo/seed/seed.sql`을 읽어서 현재 데이터 파악
   - 기존 게시글 제목 목록 확인 (중복 방지)
   - 기존 족보 제목 목록 확인 (중복 방지)
   - 기존 댓글 내용 확인 (중복 방지)
   - 사용 가능한 유저 sns_id 범위 확인 (seed_1 ~ seed_100)

2. **추가 데이터 생성**: 기존 SQL의 INSERT 문 끝에 추가하는 방식으로 새 데이터 작성
   - 게시글: 기존과 다른 제목, 6개 카테고리(GIFT, COUPLE_FIGHT, HOBBY, PARENTING, LIFE_TIP, FREE) 골고루 분배, TEXT/VOTE 비율 7:3
   - 족보: 5개 카테고리(WIFE_BIRTHDAY, MOTHER_IN_LAW_BIRTHDAY, APOLOGY, ANNIVERSARY, ENCOURAGEMENT) 골고루, 실제로 쓸 수 있는 현실적인 한국어 문구
   - 댓글: 새로 추가된 게시글에 대한 댓글, 게시글당 3~5개, 다양한 유저가 작성
   - VOTE 게시글은 vote_option_a, vote_option_b UPDATE문도 추가

3. **데이터 품질 기준**:
   - 한국어 자연스러운 문체 (반말/존댓말 혼용, 인터넷 커뮤니티 느낌)
   - 기혼 남성(유부남) 맥락에 맞는 내용
   - 게시글: 실제 고민/질문/후기/꿀팁 느낌
   - 족보: 실제로 복사해서 보낼 수 있는 메시지 문구
   - 댓글: 공감/조언/유머 섞인 현실적인 답변
   - 날짜: NOW() - INTERVAL 'N days' 형식, 최근 60일 이내

4. **SQL 형식 규칙**:
   - 게시글: `('TEXT'|'VOTE', 'CATEGORY', (SELECT id FROM azeyo_users WHERE sns_id='seed_N'), '제목', '내용', NOW() - INTERVAL 'N days', NOW())`
   - 족보: `('CATEGORY', (SELECT id FROM azeyo_users WHERE sns_id='seed_N'), '제목', '내용', copy_count, NOW() - INTERVAL 'N days', NOW())`
   - 댓글: VALUES 안에 `('게시글 제목', 'seed_N', '댓글 내용', NOW() - INTERVAL 'N days')`
   - 줄바꿈이 필요한 콘텐츠는 PostgreSQL `E'...\n...'` 문법 사용
   - 기존 INSERT 문의 마지막 `;` 앞에 `,`를 추가하고 새 행 이어붙이기

5. **파일 수정**: 기존 seed.sql 파일에 직접 추가 데이터를 병합

6. **확인**: 수정 후 게시글/족보/댓글 총 개수를 grep으로 카운트해서 보고

$ARGUMENTS
