-- 사용: close-document <procName> <pid>
-- 지정 프로세스의 문서 창(AXStandardWindow)들을 닫기 버튼 클릭으로 닫는다(키 입력 사용 안 함).
-- 저장 여부 대화상자가 뜨면 "저장 안 함" 계열 버튼을 누른다.
on run argv
	set procName to item 1 of argv
	set wantPid to (item 2 of argv) as integer
	tell application "System Events"
		set target to missing value
		repeat with p in (every process whose name is procName)
			if (unix id of p) is wantPid then set target to p
		end repeat
		if target is missing value then return "NO_PROCESS"
		set result to ""
		tell target
			set wins to {}
			repeat with w in windows
				try
					if (subrole of w as text) is "AXStandardWindow" then set end of wins to w
				end try
			end repeat
			repeat with w in wins
				try
					click (first button of w whose subrole is "AXCloseButton")
					set result to result & "closed "
				end try
				repeat 12 times
					delay 0.25
					if not (exists target) then return result & "PROCESS_EXITED"
					set handled to false
					try
						repeat with d in windows
							repeat with b in buttons of d
								try
									set bn to name of b as text
									if bn is in {"저장 안 함", "Don't Save", "Don’t Save", "저장하지 않음"} then
										click b
										set handled to true
									end if
								end try
							end repeat
							repeat with sh in sheets of d
								repeat with b in buttons of sh
									try
										set bn to name of b as text
										if bn is in {"저장 안 함", "Don't Save", "Don’t Save", "저장하지 않음"} then
											click b
											set handled to true
										end if
									end try
								end repeat
							end repeat
						end repeat
					end try
					if handled then
						set result to result & "discarded "
						exit repeat
					end if
				end repeat
			end repeat
		end tell
		return result & "DONE"
	end tell
end run
