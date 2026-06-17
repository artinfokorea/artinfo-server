import { Injectable, Logger } from '@nestjs/common';
import { promises as dns } from 'dns';
import * as net from 'net';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROBE_HELO_DOMAIN = 'onchurch.kr';
const PROBE_FROM = `no-reply@${PROBE_HELO_DOMAIN}`;
const SMTP_TIMEOUT_MS = 5000;

export type EmailVerifyStatus = 'ok' | 'excluded';

export interface EmailVerifyResult {
  email: string;
  status: EmailVerifyStatus;
  reason: string | null; // excluded일 때 사유
}

type ProbeResult = 'ok' | 'no-mailbox' | 'unknown' | 'unavailable';

/**
 * 메일 수신 가능 여부 검증.
 *  1단계 형식(regex) → 2단계 도메인 MX → 3단계 SMTP RCPT 떠보기.
 *  3단계는 환경(아웃바운드 25 차단)·서버 정책에 따라 실패할 수 있으므로,
 *  명백한 거부(550 등)만 제외하고 그 외(타임아웃·연결불가·일시거부)는 통과시킨다.
 */
@Injectable()
export class OnchurchEmailVerificationService {
  private readonly logger = new Logger(OnchurchEmailVerificationService.name);

  async verifyMany(emails: string[]): Promise<EmailVerifyResult[]> {
    const mxCache = new Map<string, string | null>(); // domain → 우선순위 최상 MX host (null = 없음)
    let smtpProbeAvailable = true; // 연결 자체가 막힌 환경으로 판단되면 false로 바꿔 이후 떠보기 생략

    const results: EmailVerifyResult[] = [];
    for (const email of emails) {
      // 1) 형식
      if (!EMAIL_REGEX.test(email)) {
        results.push({ email, status: 'excluded', reason: '이메일 형식 오류' });
        continue;
      }
      const domain = email.split('@')[1].toLowerCase();

      // 2) MX 레코드
      if (!mxCache.has(domain)) {
        mxCache.set(domain, await this.resolvePrimaryMx(domain));
      }
      const mxHost = mxCache.get(domain) ?? null;
      if (!mxHost) {
        results.push({ email, status: 'excluded', reason: '메일 도메인 없음 (MX 레코드 없음)' });
        continue;
      }

      // 3) SMTP RCPT 떠보기 (가능한 환경에서만)
      if (smtpProbeAvailable) {
        const probe = await this.probeMailbox(mxHost, email);
        if (probe === 'no-mailbox') {
          results.push({ email, status: 'excluded', reason: '존재하지 않는 메일함' });
          continue;
        }
        if (probe === 'unavailable') {
          smtpProbeAvailable = false;
          this.logger.warn('SMTP 떠보기 불가(아웃바운드 25 차단 등 추정) — 이후 RCPT 검증을 생략합니다.');
        }
        // 'ok' | 'unknown' | 'unavailable' → 통과
      }

      results.push({ email, status: 'ok', reason: null });
    }

    return results;
  }

  private async resolvePrimaryMx(domain: string): Promise<string | null> {
    try {
      const records = await dns.resolveMx(domain);
      if (!records.length) return null;
      records.sort((a, b) => a.priority - b.priority);
      return records[0].exchange;
    } catch {
      return null;
    }
  }

  // MX 서버에 25번으로 접속해 RCPT TO 응답을 본다.
  private probeMailbox(mxHost: string, email: string): Promise<ProbeResult> {
    return new Promise((resolve) => {
      let stage = 0; // 0:greeting 1:helo 2:mailfrom 3:rcpt
      let settled = false;
      const socket = net.createConnection(25, mxHost);

      const done = (r: ProbeResult) => {
        if (settled) return;
        settled = true;
        try {
          socket.destroy();
        } catch {
          /* noop */
        }
        resolve(r);
      };

      socket.setTimeout(SMTP_TIMEOUT_MS);
      socket.on('timeout', () => done(stage === 0 ? 'unavailable' : 'unknown'));
      socket.on('error', () => done('unavailable'));

      socket.on('data', (buf) => {
        const code = parseInt(buf.toString().slice(0, 3), 10);
        if (stage === 0) {
          if (code !== 220) return done('unknown');
          socket.write(`HELO ${PROBE_HELO_DOMAIN}\r\n`);
          stage = 1;
        } else if (stage === 1) {
          socket.write(`MAIL FROM:<${PROBE_FROM}>\r\n`);
          stage = 2;
        } else if (stage === 2) {
          if (code >= 400) return done('unknown');
          socket.write(`RCPT TO:<${email}>\r\n`);
          stage = 3;
        } else {
          socket.write('QUIT\r\n');
          if (code === 250 || code === 251) return done('ok');
          if (code === 550 || code === 551 || code === 553 || code === 554) return done('no-mailbox');
          return done('unknown'); // 450 등 일시 거부/그레이리스팅 → 통과
        }
      });
    });
  }
}
