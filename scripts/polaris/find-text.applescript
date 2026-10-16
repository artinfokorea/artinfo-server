-- 사용: find-text <procName> <mode:equals|contains> <text> [minX] [maxX]
-- 같은 이름의 모든 프로세스·모든 창에서 조건에 맞는 첫 AXStaticText → "x y w h pid". 없으면 NONE.
on run argv
	set procName to item 1 of argv
	set mode to item 2 of argv
	set wanted to item 3 of argv
	set minX to -99999
	set maxX to 99999
	if (count of argv) > 3 then set minX to (item 4 of argv) as integer
	if (count of argv) > 4 then set maxX to (item 5 of argv) as integer
	tell application "System Events"
		repeat with p in (every process whose name is procName)
			set pidText to (unix id of p) as text
			repeat with w in windows of p
				set r to my find(p, w, mode, wanted, minX, maxX, 0, 10)
				if r is not "NONE" then return r & " " & pidText
			end repeat
		end repeat
	end tell
	return "NONE"
end run
on find(p, el, mode, wanted, minX, maxX, depth, maxDepth)
	tell application "System Events" to tell p
		try
			if (role of el as text) is "AXStaticText" then
				set v to value of el as text
				set hit to false
				if mode is "contains" then
					if v contains wanted then set hit to true
				else
					if v is wanted then set hit to true
				end if
				if hit then
					set pp to position of el
					set ss to size of el
					if (item 1 of pp) ≥ minX and (item 1 of pp) ≤ maxX then
						return ((item 1 of pp) as text) & " " & ((item 2 of pp) as text) & " " & ((item 1 of ss) as text) & " " & ((item 2 of ss) as text)
					end if
				end if
			end if
		end try
		if depth < maxDepth then
			try
				repeat with c in UI elements of el
					set r to my find(p, c, mode, wanted, minX, maxX, depth + 1, maxDepth)
					if r is not "NONE" then return r
				end repeat
			end try
		end if
	end tell
	return "NONE"
end find
