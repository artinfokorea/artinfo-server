-- 사용: window-titles <procName> [pid] → "pid<TAB>subrole<TAB>title" 줄 목록. 프로세스 없으면 NO_PROCESS.
on run argv
	set procName to item 1 of argv
	set wantPid to -1
	if (count of argv) > 1 then set wantPid to (item 2 of argv) as integer
	set out to ""
	set found to false
	tell application "System Events"
		repeat with p in (every process whose name is procName)
			if wantPid < 0 or (unix id of p) is wantPid then
				set found to true
				repeat with w in windows of p
					set out to out & ((unix id of p) as text) & tab & (subrole of w as text) & tab & (title of w as text) & linefeed
				end repeat
			end if
		end repeat
	end tell
	if not found then return "NO_PROCESS"
	return out
end run
