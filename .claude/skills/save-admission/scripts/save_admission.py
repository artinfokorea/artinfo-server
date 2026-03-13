#!/usr/bin/env python3
"""
ArtInfo 입시 데이터 저장 스크립트
로그인 후 토큰을 획득하고 추출된 입시 데이터를 API로 전송합니다.
"""

import argparse
import json
import os
import sys
import requests

BASE_URL = "https://api-artinfokorea.com"
LOGIN_URL = f"{BASE_URL}/auths/login/email"
ADMISSION_URL = f"{BASE_URL}/admissions"

DEFAULT_EMAIL = os.getenv("ARTINFO_EMAIL", "")
DEFAULT_PASSWORD = os.getenv("ARTINFO_PASSWORD", "")


def login(email: str, password: str) -> str:
    payload = {"email": email, "password": password}
    headers = {"accept": "application/json", "Content-Type": "application/json"}

    response = requests.post(LOGIN_URL, json=payload, headers=headers)

    if response.status_code not in [200, 201]:
        raise Exception(f"로그인 실패: {response.status_code} - {response.text}")

    data = response.json()
    if data.get("code") != "OK":
        raise Exception(f"로그인 실패: {data.get('message', 'Unknown error')}")

    return data["item"]["accessToken"]


def save_admissions(access_token: str, admissions_data: dict) -> dict:
    headers = {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}",
    }

    response = requests.post(ADMISSION_URL, json=admissions_data, headers=headers)

    if response.status_code not in [200, 201]:
        raise Exception(f"저장 실패: {response.status_code} - {response.text}")

    return response.json()


def read_json_file(file_path: str) -> dict:
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(description="ArtInfo 입시 데이터 저장")
    parser.add_argument("--file", "-f", required=True, help="입시 데이터 JSON 파일 경로")
    parser.add_argument("--email", "-e", default=DEFAULT_EMAIL, help="로그인 이메일")
    parser.add_argument("--password", "-p", default=DEFAULT_PASSWORD, help="로그인 비밀번호")
    parser.add_argument("--dry-run", action="store_true", help="실제 저장 없이 테스트")

    args = parser.parse_args()

    if not args.email or not args.password:
        print("오류: 이메일과 비밀번호가 필요합니다.")
        print("환경변수 ARTINFO_EMAIL, ARTINFO_PASSWORD를 설정하거나 --email, --password 옵션을 사용하세요.")
        sys.exit(1)

    print(f"파일 읽는 중: {args.file}")
    data = read_json_file(args.file)

    admissions = data.get("admissions", [])
    print(f"전공 수: {len(admissions)}개")

    if not admissions:
        print("오류: admissions 배열이 비어있습니다.")
        sys.exit(1)

    school_names = set(a["schoolName"] for a in admissions)
    major_keywords = [a["majorKeyword"] for a in admissions]
    print(f"학교: {', '.join(school_names)}")
    print(f"전공: {', '.join(major_keywords)}")

    if args.dry_run:
        print("\n[DRY RUN] 실제 저장하지 않음")
        print(f"저장될 데이터:")
        print(json.dumps(data, ensure_ascii=False, indent=2)[:2000])
        if len(json.dumps(data)) > 2000:
            print("... (truncated)")
        return

    try:
        print("\n관리자 로그인 중...")
        token = login(args.email, args.password)
        print("관리자 로그인 성공")

        print("\n입시 데이터 저장 중...")
        result = save_admissions(token, data)

        saved_ids = result.get("ids", [])
        print(f"저장 성공! (ID: {saved_ids})")

        output = {
            "status": "success",
            "message": "입시 데이터가 성공적으로 저장되었습니다",
            "savedIds": saved_ids,
            "totalMajors": len(admissions),
        }
        print(f"\n결과:")
        print(json.dumps(output, ensure_ascii=False, indent=2))

    except Exception as e:
        print(f"\n오류 발생: {e}")
        output = {"status": "error", "message": str(e)}
        print(json.dumps(output, ensure_ascii=False, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
