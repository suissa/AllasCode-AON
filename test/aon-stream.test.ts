import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { 
  aonMiddleware, 
  createAONEvent, 
  isAONEvent, 
  createAONStreamWriter 
} from '../index.js';
import type { Request, Response, AONStatusEvent } from '../index.js';

class MockResponse extends EventEmitter {
  statusCode = 200;
  headers: Record<string, string> = {};
  chunks: string[] = [];
  ended = false;

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

  json(data: any) {
    this.setHeader('content-type', 'application/json');
    this.end(JSON.stringify(data));
    return this;
  }
}

describe('AON Stream & Events', () => {
  it('should validate and create AON events', () => {
    const event = createAONEvent<AONStatusEvent>('status', {
      message: 'Processing query...'
    });

    assert.equal(event.type, 'status');
    assert.equal(event.message, 'Processing query...');
    assert.equal(typeof event.timestamp, 'number');
    assert.ok(isAONEvent(event));
  });

  it('should stream NDJSON events in Glass Box mode', async () => {
    const mockRes = new MockResponse() as unknown as Response;
    const writer = createAONStreamWriter(mockRes as any);

    assert.ok(writer.isActive());

    writer.status('Resolving database connection...', 150);
    writer.healing('recover_db_connection', 'Reconnecting to replica pool', 'medium');
    writer.end({ id: 'user_123', status: 'active' });

    assert.ok(!writer.isActive());

    const rawOutput = (mockRes as any).chunks.join('');
    const lines = rawOutput.trim().split('\n').map((l: string) => JSON.parse(l));

    assert.equal(lines.length, 4);
    assert.equal(lines[0].type, 'status');
    assert.equal(lines[0].message, 'AON stream initialized - Glass Box mode active');
    assert.equal(lines[1].type, 'status');
    assert.equal(lines[1].message, 'Resolving database connection...');
    assert.equal(lines[2].type, 'healing');
    assert.equal(lines[2].action, 'recover_db_connection');
    assert.equal(lines[3].type, 'result');
    assert.equal(lines[3].data.id, 'user_123');
  });

  it('should negotiate Black Box mode when Accept header is application/json', async () => {
    const middleware = aonMiddleware();
    const req = {
      headers: { accept: 'application/json' },
      method: 'GET',
      url: '/api/v1/resource'
    } as unknown as Request;

    const res = new MockResponse() as unknown as Response;
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.ok(nextCalled);
    assert.equal((req as any).aon?.mode, 'blackbox');
    assert.equal((res as any).isAONStreaming, false);

    // Test res.json interception in blackbox mode
    res.json!({ message: 'Success' });
    assert.equal(res.getHeader('content-type'), 'application/json');
    assert.equal((res as any).chunks.join(''), JSON.stringify({ message: 'Success' }));
  });

  it('should negotiate Glass Box mode when Accept header is application/x-ndjson', async () => {
    const middleware = aonMiddleware();
    const req = {
      headers: { accept: 'application/x-ndjson' },
      method: 'GET',
      url: '/api/v1/resource'
    } as unknown as Request;

    const res = new MockResponse() as unknown as Response;
    let nextCalled = false;

    await middleware(req, res, () => {
      nextCalled = true;
    });

    assert.ok(nextCalled);
    assert.equal((req as any).aon?.mode, 'glassbox');
    assert.equal((res as any).isAONStreaming, true);
    assert.equal(res.getHeader('content-type'), 'application/x-ndjson');
    assert.equal(res.getHeader('transfer-encoding'), 'chunked');

    // Terminal result via res.json
    res.json!({ id: 'done' });
    const rawOutput = (res as any).chunks.join('');
    const lines = rawOutput.trim().split('\n').map((l: string) => JSON.parse(l));

    // First line is connection init status, second is the terminal result
    assert.ok(lines.some((l: any) => l.type === 'result' && l.data.id === 'done'));
  });
});
