-- 사용: frontmost <procName> <pid>
on run argv
	set procName to item 1 of argv
	set wantPid to (item 2 of argv) as integer
	tell application "System Events"
		repeat with p in (every process whose name is procName)
			if (unix id of p) is wantPid then
				set frontmost of p to true
				return "OK"
			end if
		end repeat
	end tell
	return "NO_PROCESS"
end run
