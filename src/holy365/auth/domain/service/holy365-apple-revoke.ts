/** 애플 로그인 연결 해제용 키 — Sign in with Apple 키(.p8). 없으면 해제를 건너뛴다 */
export function holy365AppleSiwaKey(): { teamId: string; keyId: string; privateKey: string } | null {
  const keyId = process.env['HOLY365_APPLE_SIWA_KEY_ID'];
  const privateKey = process.env['HOLY365_APPLE_SIWA_PRIVATE_KEY'];
  if (!keyId || !privateKey) return null;
  return { teamId: process.env['HOLY365_APPLE_TEAM_ID'] ?? 'D7RV3R6ALY', keyId, privateKey: privateKey.replace(/\\n/g, '\n') };
}
