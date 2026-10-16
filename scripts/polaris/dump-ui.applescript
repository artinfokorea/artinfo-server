-- Polaris Office Editor 의 모든 창 UI 트리를 덤프한다 (자동화 스크립트 보정용).
-- 사용: osascript scripts/dump-ui.applescript "Polaris Office Editor" [maxDepth]
on run argv
	set procName to item 1 of argv
	set maxDepth to 12
	if (count of argv) > 1 then set maxDepth to (item 2 of argv) as integer
	set output to ""
	tell application "System Events"
		if not (exists process procName) then return "NO_PROCESS " & procName
		tell process procName
			set output to output & "frontmost=" & (frontmost as text) & linefeed
			repeat with w in windows
				set output to output & my dumpElement(w, 0, maxDepth)
			end repeat
			try
				set output to output & "--- menu bar ---" & linefeed
				repeat with mb in menu bar items of menu bar 1
					set output to output & my dumpElement(mb, 1, 3)
				end repeat
			end try
		end tell
	end tell
	return output
end run

on dumpElement(el, depth, maxDepth)
	set pad to ""
	repeat depth times
		set pad to pad & "  "
	end repeat
	set ln to pad
	tell application "System Events"
		try
			set ln to ln & (role of el as text)
		end try
		try
			set sr to subrole of el
			if sr is not missing value then set ln to ln & "/" & (sr as text)
		end try
		try
			set t to title of el
			if t is not missing value and t is not "" then set ln to ln & " title=\"" & (t as text) & "\""
		end try
		try
			set n to name of el
			if n is not missing value and n is not "" then set ln to ln & " name=\"" & (n as text) & "\""
		end try
		try
			set d to description of el
			if d is not missing value and d is not "" then set ln to ln & " desc=\"" & (d as text) & "\""
		end try
		try
			set v to value of el
			if v is not missing value then
				set vt to v as text
				if (length of vt) > 60 then set vt to (text 1 thru 60 of vt) & "…"
				set ln to ln & " value=\"" & vt & "\""
			end if
		end try
		try
			set ln to ln & " enabled=" & (enabled of el as text)
		end try
		try
			set p to position of el
			set s to size of el
			set ln to ln & " pos=" & (item 1 of p) & "," & (item 2 of p) & " size=" & (item 1 of s) & "x" & (item 2 of s)
		end try
		set acc to ln & linefeed
		if depth < maxDepth then
			try
				repeat with c in UI elements of el
					set acc to acc & my dumpElement(c, depth + 1, maxDepth)
				end repeat
			end try
		end if
	end tell
	return acc
end dumpElement
