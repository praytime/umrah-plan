import { describe, it, expect } from 'vitest';
import { renderInfoHtml } from '../tools/render-info.js';

describe('renderInfoHtml', () => {
  it('keeps simple paragraphs as translations', () => {
    const html = renderInfoHtml('Line one\n\nLine two');
    expect(html).toContain('translation text-accent');
    expect(html).not.toContain('<ul');
  });

  it('converts bullet lines into dua-list items', () => {
    const html = renderInfoHtml('Lead sentence.\n• Bullet one\n• Bullet two');
    expect(html).toContain('<ul class="dua-list">');
    expect(html).toContain('<li>Bullet one</li>');
    expect(html).toContain('<li>Bullet two</li>');
    expect(html).toContain('Lead sentence.');
  });
});
