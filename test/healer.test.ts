import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAONHealer } from '../index.js';

describe('AON Healer', () => {
  it('should track healing attempts and calculate stats accurately', async () => {
    const healer = createAONHealer();

    healer.registerHealingAttempt('refresh_token', 'medium');
    healer.registerHealingAttempt('refresh_token', 'medium');
    healer.registerHealingAttempt('recover_db_connection', 'high');

    const stats = healer.getHealingStats();

    assert.equal(stats.totalAttempts, 3);
    assert.equal(stats.actionStats.refresh_token.attempts, 2);
    assert.equal(stats.actionStats.recover_db_connection.attempts, 1);
  });

  it('should execute registered healing actions successfully', async () => {
    const healer = createAONHealer();

    (healer as any).registerAction({
      name: 'deterministic_heal',
      description: 'Reliable test healing action',
      handler: async () => true,
      maxRetries: 1,
      timeout: 1000
    });

    const success = await healer.heal(
      'deterministic_heal',
      'Executing deterministic recovery action'
    );

    assert.equal(success, true);
    const stats = healer.getHealingStats();
    assert.equal(stats.successfulHealing, 1);
    assert.equal(stats.successRate, 100);
  });
});
