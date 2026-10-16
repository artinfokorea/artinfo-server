-- 사용: panel-save <procName> <pid> <panelTitle> <fileName>
-- 지정 프로세스에서 제목이 panelTitle 인 저장 패널의 이름 필드에 fileName 을 넣고, 패널의 가장 오른쪽 버튼(기본 버튼)을 누른다.
-- 키 입력(Return)은 포커스가 다른 앱에 있을 때 위험하므로 쓰지 않는다.
-- Polaris 의 PNG 내보내기 패널은 경로를 받지 않으며(슬래시는 콜론으로 치환) 문서가 있는 폴더에 저장한다.
on run argv
	set procName to item 1 of argv
	set wantPid to (item 2 of argv) as integer
	set panelTitle to item 3 of argv
	set fileName to item 4 of argv
	tell application "System Events"
		repeat with p in (every process whose name is procName)
			if (unix id of p) is wantPid then
				tell p
					set frontmost to true
					set pnl to missing value
					repeat with w in windows
						if (title of w as text) is panelTitle then set pnl to w
					end repeat
					if pnl is missing value then return "NO_PANEL"
					perform action "AXRaise" of pnl
					delay 0.3
					set tfs to my collectRole(p, pnl, "AXTextField", 0, 8)
					if (count of tfs) is 0 then return "NO_TEXTFIELD"
					set tf to item 1 of tfs
					try
						set focused of tf to true
					end try
					set value of tf to fileName
					delay 0.4
					set v to value of tf as text
					set loc to ""
					try
						set pops to my collectRole(p, pnl, "AXPopUpButton", 0, 8)
						if (count of pops) > 0 then set loc to value of (item 1 of pops) as text
					end try
					-- 가장 오른쪽의 넓은 버튼 = 기본(내보내기/저장) 버튼
					set btns to my collectRole(p, pnl, "AXButton", 0, 8)
					set best to missing value
					set bestX to -1
					repeat with b in btns
						try
							set pp to position of b
							set ss to size of b
							if (item 1 of ss) ≥ 40 and (item 1 of pp) > bestX then
								set bestX to item 1 of pp
								set best to b
							end if
						end try
					end repeat
					if best is missing value then return "NO_BUTTON buttons=" & (count of btns)
					click best
					return "SAVED name=" & v & " location=" & loc & " buttons=" & (count of btns)
				end tell
			end if
		end repeat
	end tell
	return "NO_PROCESS"
end run
on collectRole(p, el, wantRole, depth, maxDepth)
	set acc to {}
	tell application "System Events" to tell p
		try
			if (role of el as text) is wantRole then set end of acc to el
		end try
		if depth < maxDepth then
			try
				repeat with c in UI elements of el
					set acc to acc & my collectRole(p, c, wantRole, depth + 1, maxDepth)
				end repeat
			end try
		end if
	end tell
	return acc
end collectRole
