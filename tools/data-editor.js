#!/usr/bin/env node

/**
 * Lightweight JSON data editor for project data files.
 * Serves a single HTML page that lets you view/edit duas/themes/rounds JSON.
 * Usage: node tools/data-editor.js [--host=127.0.0.1] [--port=4000]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const querystring = require('querystring');
const Ajv = require('ajv');

const projectRoot = path.join(__dirname, '..');
const dataDir = path.join(projectRoot, 'src', 'data');
const schemaDir = path.join(dataDir, 'schemas');

const FILES = {
  duas: 'duas.json',
  themes: 'themes.json',
  rounds: 'rounds.json',
};

const SCHEMAS = {
  duas: 'duas.schema.json',
  themes: 'themes.schema.json',
  rounds: 'rounds.schema.json',
};

const ajv = new Ajv({ allErrors: true, strict: false });
const validators = {};

function loadSchema(key) {
  const filename = SCHEMAS[key];
  if (!filename) return null;
  const filePath = path.join(schemaDir, filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function getValidator(key) {
  if (validators[key]) return validators[key];
  const schema = loadSchema(key);
  if (!schema) return null;
  validators[key] = ajv.compile(schema);
  return validators[key];
}

function parseArgs() {
  const opts = { host: '127.0.0.1', port: 4000 };
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--host=')) opts.host = arg.slice(7);
    if (arg.startsWith('--port=')) opts.port = Number(arg.slice(7));
  }
  return opts;
}

function esc(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readFileSafe(key) {
  const filename = FILES[key];
  if (!filename) return null;
  const filePath = path.join(dataDir, filename);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return raw;
  } catch (err) {
    return null;
  }
}

function saveFile(key, content) {
  const filename = FILES[key];
  if (!filename) throw new Error('Invalid file key');
  const filePath = path.join(dataDir, filename);
  // Validate JSON before writing
  const parsed = JSON.parse(content);
  const validate = getValidator(key);
  if (validate) {
    const ok = validate(parsed);
    if (!ok) {
      const msg = validate.errors
        .map(e => `${e.instancePath || '/'} ${e.message}`)
        .join('; ');
      throw new Error(`Schema validation failed: ${msg}`);
    }
  }
  const pretty = JSON.stringify(parsed, null, 2);
  fs.writeFileSync(filePath, pretty + '\n', 'utf8');
}

function renderPage({ fileKey, status, error }) {
  const fileRaw = fileKey ? readFileSafe(fileKey) : '';
  const fileDisplay = fileRaw ? esc(fileRaw) : '';
  const title = 'Umrah Plan Data Editor';
  const statusHtml = status
    ? `<div class="status success">Saved ${FILES[fileKey]} successfully.</div>`
    : '';
  const errorHtml = error
    ? `<div class="status error">${esc(error)}</div>`
    : '';

  const fileOptions = Object.entries(FILES)
    .map(
      ([key, name]) =>
        `<option value="${key}" ${key === fileKey ? 'selected' : ''}>${name}</option>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 960px; margin: 32px auto; padding: 0 16px; background: #0f172a; color: #e2e8f0; }
    h1 { margin-bottom: 12px; }
    .controls { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
    select, button { padding: 8px 12px; border-radius: 6px; border: 1px solid #334155; background: #1e293b; color: #e2e8f0; }
    textarea { width: 100%; min-height: 420px; border: 1px solid #334155; border-radius: 10px; padding: 12px; background: #0b1220; color: #e2e8f0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 13px; }
    .status { margin-bottom: 12px; padding: 10px 12px; border-radius: 8px; }
    .status.success { background: #0f3d2e; border: 1px solid #22c55e33; color: #bbf7d0; }
    .status.error { background: #3d0f16; border: 1px solid #f8717133; color: #fecdd3; white-space: pre-wrap; }
    .footer { margin-top: 12px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${statusHtml}${errorHtml}
  <form class="controls" method="get">
    <label for="file">Choose file:</label>
    <select id="file" name="file" onchange="this.form.submit()">
      <option value="">-- select --</option>
      ${fileOptions}
    </select>
    <noscript><button type="submit">Load</button></noscript>
  </form>

  <form method="post" action="/save">
    <input type="hidden" name="file" value="${fileKey || ''}" />
    <textarea name="content" spellcheck="false" placeholder="Select a file to load its JSON..." ${fileKey ? '' : 'disabled'}>${fileDisplay}</textarea>
    <div style="margin-top: 12px;">
      <button type="submit" ${fileKey ? '' : 'disabled'}>Save JSON</button>
    </div>
  </form>

  <div class="footer">Runs on Node built-ins (no deps). Validates JSON before writing back to src/data/*.json.</div>
</body>
</html>`;
}

function startServer() {
  const { host, port } = parseArgs();

  const server = http.createServer((req, res) => {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && urlObj.pathname === '/') {
      const fileKey = urlObj.searchParams.get('file') || '';
      const status = urlObj.searchParams.get('status') === 'ok';
      const error = urlObj.searchParams.get('error') || '';
      const html = renderPage({ fileKey, status, error });
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    if (req.method === 'POST' && urlObj.pathname === '/save') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        // guard against huge payloads
        if (body.length > 2_000_000) req.destroy();
      });
      req.on('end', () => {
        const parsed = querystring.parse(body);
        const fileKey = parsed.file;
        const content = parsed.content;
        try {
          if (!fileKey || !FILES[fileKey]) throw new Error('Unknown file selected.');
          saveFile(fileKey, content);
          res.writeHead(303, { Location: `/?file=${encodeURIComponent(fileKey)}&status=ok` });
          res.end();
        } catch (err) {
          const msg = encodeURIComponent(err.message);
          res.writeHead(303, { Location: `/?file=${encodeURIComponent(fileKey || '')}&error=${msg}` });
          res.end();
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  server.listen(port, host, () => {
    console.log(`Data editor running at http://${host}:${port}/ (files: ${Object.values(FILES).join(', ')})`);
  });
}

startServer();
