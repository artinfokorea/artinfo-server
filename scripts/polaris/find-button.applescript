-- 사용: find-button <procName> <pid> <minX> <minY> <maxY> <minW>
-- 지정 pid 프로세스의 창들에서 조건(위치·최소 너비)에 맞는 첫 AXButton → "x y w h". 없으면 NONE.
on run argv
	set procName to item 1 of argv
	set wantPid to (item 2 of argv) as integer
	set minX to (item 3 of argv) as integer
	set minY to (item 4 of argv) as integer
	set maxY to (item 5 of argv) as integer
	set minW to (item 6 of argv) as integer
	tell application "System Events"
		repeat with p in (every process whose name is procName)
			if (unix id of p) is wantPid then
				repeat with w in windows of p
					set r to my find(p, w, minX, minY, maxY, minW, 0, 10)
					if r is not "NONE" then return r
				end repeat
			end if
		end repeat
	end tell
	return "NONE"
end run
on find(p, el, minX, minY, maxY, minW, depth, maxDepth)
	tell application "System Events" to tell p
		try
			if (role of el as text) is "AXButton" then
				set pp to position of el
				set ss to size of el
				if (item 1 of pp) ≥ minX and (item 2 of pp) ≥ minY and (item 2 of pp) ≤ maxY and (item 1 of ss) ≥ minW then
					return ((item 1 of pp) as text) & " " & ((item 2 of pp) as text) & " " & ((item 1 of ss) as text) & " " & ((item 2 of ss) as text)
				end if
			end if
		end try
		if depth < maxDepth then
			try
				repeat with c in UI elements of el
					set r to my find(p, c, minX, minY, maxY, minW, depth + 1, maxDepth)
					if r is not "NONE" then return r
				end repeat
			end try
		end if
	end tell
	return "NONE"
end find
