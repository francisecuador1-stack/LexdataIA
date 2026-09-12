import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
    client = new Anthropic({ apiKey, maxRetries: 3, timeout: 60000 });
  }
  return client;
}

export function getModelConfig() {
  return {
    model: process.env['ANTHROPIC_MODEL'] ?? 'claude-sonnet-4-20250514',
    maxTokens: parseInt(process.env['ANTHROPIC_MAX_TOKENS'] ?? '4096', 10),
    temperature: parseFloat(process.env['ANTHROPIC_TEMPERATURE'] ?? '0.3'),
  };
}
