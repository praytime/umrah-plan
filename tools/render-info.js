function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInfoHtml(text = '') {
  const blocks = text.split('\n\n');
  const renderBlock = (block) => {
    const lines = block.split('\n').filter(l => l.trim().length > 0);
    const bullets = lines.filter(l => l.trim().startsWith('•'));
    const lead = lines.filter(l => !l.trim().startsWith('•')).join(' ');

    if (bullets.length === 0) {
      return `<div class="translation text-accent mb-10">${escapeHtml(block)}</div>`;
    }

    const leadHtml = lead
      ? `<div class="translation text-accent mb-10">${escapeHtml(lead)}</div>`
      : '';

    const bulletHtml = `<ul class="dua-list">${bullets
      .map(b => `<li>${escapeHtml(b.replace(/^\s*•\s*/, ''))}</li>`)
      .join('')}</ul>`;

    return `${leadHtml}${bulletHtml}`;
  };

  return blocks.map(renderBlock).join('');
}

module.exports = { renderInfoHtml, escapeHtml };
