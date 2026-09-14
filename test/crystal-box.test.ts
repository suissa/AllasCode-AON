import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { 
  crystalBoxMiddleware, 
  isCrystalBoxMode, 
  isInteractiveMode, 
  createCrystalBoxWriter 
} from '../index.js';
import type { Request, Response } from '../index.js';

class MockResponse extends EventEmitter {
  statusCode = 200;
  headers: Record<string, string> = {};
  chunks: string[] = [];
  ended = false;
  earlyHintsSent: Record<string, string | string[]>[] = [];

  setHeader(name: string, value: string) {
    this.headers[name.toLowerCase()] = value;
    return this;
  }

  getHeader(name: string) {
    return this.headers[name.toLowerCase()];
  }

  write(chunk: any) {
    this.chunks.push(typeof chunk === 'string' ? chunk : chunk.toString());
    return true;
  }

  end(chunk?: any) {
    if (chunk) {
      this.write(chunk);
    }
    this.ended = true;
    this.emit('finish');
    return this;
  }

  writeEarlyHints(hints: Record<string, string | string[]>) {
    this.earlyHintsSent.push(hints);
  }
}

describe('CrystalBox Mode & Interactive Healing', () => {
  it('should detect crystal mode and interactive mode after middleware execution', async () => {
    const middleware = crystalBoxMiddleware();
    const req = {
      headers: {
        accept: 'application/x-ndjson',
        'x-crystal-mode': 'interactive'
      },
      method: 'GET',
      url: '/test'
    } as unknown as Request;
    const res = new MockResponse() as unknown as Response;

    await middleware(req, res, () => {});

    assert.ok(isCrystalBoxMode(req));
    assert.ok(isInteractiveMode(req));
  });

  it('should write early hints and interactive telemetry in CrystalBox mode', () => {
    const mockRes = new MockResponse() as unknown as Response;
    const writer = createCrystalBoxWriter(mockRes as any);

    writer.writeEarlyHints({
      theme: 'dark',
      preloadLinks: ['</css/theme-dark.css>; rel=preload; as=style']
    });

    writer.writeProcessingStatus({
      message: 'Resolving incident...',
      healingAttempt: 1,
      devNotified: true
    });

    writer.devNotificationSent('slack', '#sre-oncall');

    const rawOutput = (mockRes as any).chunks.join('');
    const lines = rawOutput.trim().split('\n').map((l: string) => JSON.parse(l));

    assert.ok(lines.some((l: any) => l.type === 'processing_status' && l.status_code === 103));
    assert.ok(lines.some((l: any) => l.type === 'processing_status' && l.status_code === 102));
    assert.ok(lines.some((l: any) => l.type === 'dev_notification' && l.dev_contact === '#sre-oncall'));
  });

  it('should inject crystalWriter and interactiveHealer via crystalBoxMiddleware', async () => {
    const middleware = crystalBoxMiddleware();
    const req = {
      headers: {
        accept: 'application/x-ndjson',
        'x-crystal-mode': 'interactive'
      },
      method: 'GET',
      url: '/api/v1/interactive'
    } as unknown as Request;

    const res = new MockResponse() as unknown as Response;
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.ok(nextCalled);
    assert.ok((req as any).crystalWriter);
    assert.ok((req as any).interactiveHealer);
  });
});
