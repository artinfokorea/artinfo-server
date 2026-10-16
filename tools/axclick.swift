// axclick — CGEvent 기반 마우스 입력·창 목록 도우미 (System Events `click at` 가 전달되지 않는 커스텀 뷰용)
//   axclick windows <pid>           : 해당 프로세스의 온스크린 창 목록 (CGWindowID, bounds, title)
//   axclick click <x> <y> [count]   : 화면 좌표에 좌클릭 (count=2 더블클릭)
//   axclick move <x> <y>            : 마우스 이동만
import Foundation
import CoreGraphics
import AppKit

func post(_ type: CGEventType, _ p: CGPoint, button: CGMouseButton = .left, clickState: Int64 = 1) {
    guard let ev = CGEvent(mouseEventSource: nil, mouseType: type, mouseCursorPosition: p, mouseButton: button) else { return }
    ev.setIntegerValueField(.mouseEventClickState, value: clickState)
    ev.post(tap: .cghidEventTap)
}

let args = CommandLine.arguments
guard args.count >= 2 else { print("usage: axclick windows <pid> | click <x> <y> [count] | move <x> <y>"); exit(2) }

switch args[1] {
case "windows":
    guard args.count >= 3, let pid = Int32(args[2]) else { print("pid required"); exit(2) }
    let opts: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
    guard let list = CGWindowListCopyWindowInfo(opts, kCGNullWindowID) as? [[String: Any]] else { exit(1) }
    for w in list where (w[kCGWindowOwnerPID as String] as? Int32) == pid {
        let id = w[kCGWindowNumber as String] as? Int ?? -1
        let name = w[kCGWindowName as String] as? String ?? ""
        let layer = w[kCGWindowLayer as String] as? Int ?? 0
        var bounds = CGRect.zero
        if let b = w[kCGWindowBounds as String] as? NSDictionary { CGRectMakeWithDictionaryRepresentation(b, &bounds) }
        print("id=\(id) layer=\(layer) bounds=\(Int(bounds.origin.x)),\(Int(bounds.origin.y)) \(Int(bounds.width))x\(Int(bounds.height)) title=\"\(name)\"")
    }
case "click", "move":
    guard args.count >= 4, let x = Double(args[2]), let y = Double(args[3]) else { print("x y required"); exit(2) }
    let count = args.count >= 5 ? Int64(args[4]) ?? 1 : 1
    let p = CGPoint(x: x, y: y)
    post(.mouseMoved, p)
    usleep(60_000)
    if args[1] == "click" {
        for i in 1...count {
            post(.leftMouseDown, p, clickState: i)
            usleep(40_000)
            post(.leftMouseUp, p, clickState: i)
            usleep(60_000)
        }
    }
    print("ok \(args[1]) \(Int(x)),\(Int(y)) x\(count)")
default:
    print("unknown command"); exit(2)
}
