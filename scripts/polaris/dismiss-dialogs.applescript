-- 사용: dismiss-dialogs <procName>
-- 같은 이름의 모든 프로세스에서 안내성 모달(예: "Polaris Drive에 문서 업로드")을 닫는다.
-- "다시 보지 않음" 체크상자가 있으면 켜고, 확인/닫기 계열 버튼을 누른다. 닫은 대화상자 제목을 돌려준다.
on run argv
	set procName to item 1 of argv
	set closedTitles to ""
	tell application "System Events"
		set procs to every process whose name is procName
		if (count of procs) is 0 then return "NO_PROCESS"
		repeat with p in procs
			tell p
				set dlgs to {}
				repeat with w in windows
					try
						if (subrole of w as text) is "AXDialog" then set end of dlgs to w
					end try
				end repeat
				repeat with d in dlgs
					set t to ""
					try
						set t to title of d as text
					end try
					if t is not "내보내기" and t is not "다른 이름으로 저장" and t is not "Export" and t is not "Save As" then
						try
							repeat with cb in checkboxes of d
								try
									set cbt to title of cb as text
									if (cbt contains "다시 보지 않음") or (cbt contains "Don't show") or (cbt contains "Do not show") then
										if (value of cb as integer) is 0 then click cb
									end if
								end try
							end repeat
						end try
						set done to false
						repeat with bn in {"확인", "OK", "닫기", "Close", "나중에", "Later", "취소", "Cancel"}
							if not done then
								try
									click button bn of d
									set done to true
								end try
							end if
						end repeat
						if not done then
							try
								click (first button of d whose subrole is "AXCloseButton")
								set done to true
							end try
						end if
						if done then set closedTitles to closedTitles & t & linefeed
					end if
				end repeat
			end tell
		end repeat
	end tell
	if closedTitles is "" then return "NONE"
	return closedTitles
end run
