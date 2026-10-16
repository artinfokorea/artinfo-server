-- 보조 접근 권한 확인. 프로세스 목록 조회는 권한 없이도 되므로, 실제 UI 요소(창)에 접근해 본다.
-- 성공 시 "OK <n>", 권한 없으면 -1728/-1719 오류로 종료.
tell application "System Events"
	set p to first process whose name is "Finder"
	set n to count of windows of p
	-- 창이 0개라도 위 접근 자체가 권한 없으면 실패한다
	return "OK " & n
end tell
