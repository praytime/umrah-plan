#!/usr/bin/env node

/**
 * Schema-driven data editor for src/data/*.json
 * - Serves a small SPA that renders forms from JSON Schemas
 * - Client-side Ajv for live validation, server-side Ajv for save validation
 * - Endpoints:
 *     GET  /api/data/:file
 *     POST /api/data/:file   (body: JSON)
 *     GET  /api/schema/:file
 *     GET  /app              (editor UI)
 *     GET  /                 -> /app
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const esbuild = require('esbuild');
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

const ajvBrowserEntry = path.join(projectRoot, 'node_modules', 'ajv', 'dist', 'ajv.js');
let ajvBundle = null;

const ajv = new Ajv({ allErrors: true, strict: false });
const validators = {};

function buildAjvBundle() {
  try {
    const result = esbuild.buildSync({
      entryPoints: [ajvBrowserEntry],
      bundle: true,
      format: 'iife',
      globalName: 'Ajv7',
      platform: 'browser',
      target: ['es2018'],
      write: false,
    });
    ajvBundle = result.outputFiles[0].text;
  } catch (err) {
    console.error('Failed to build Ajv browser bundle:', err.message);
    ajvBundle = null;
  }
}

function parseArgs() {
  const opts = { host: '127.0.0.1', port: 4000 };
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--host=')) opts.host = arg.slice(7);
    if (arg.startsWith('--port=')) opts.port = Number(arg.slice(7));
  }
  return opts;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function getValidator(key) {
  if (validators[key]) return validators[key];
  const schemaPath = path.join(schemaDir, SCHEMAS[key]);
  const schema = readJson(schemaPath);
  validators[key] = ajv.compile(schema);
  return validators[key];
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
}

function handleApi(req, res, urlObj) {
  const parts = urlObj.pathname.split('/').filter(Boolean); // ['api','data','duas']
  if (parts[1] === 'data') {
    const key = parts[2];
    const filename = FILES[key];
    if (!filename) return notFound(res);
    const filePath = path.join(dataDir, filename);
    if (req.method === 'GET') {
      return sendJson(res, 200, readJson(filePath));
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 5_000_000) req.destroy();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const validate = getValidator(key);
          if (validate) {
            const ok = validate(data);
            if (!ok) {
              return sendJson(res, 400, {
                error: 'Schema validation failed',
                details: validate.errors,
              });
            }
          }
          writeJson(filePath, data);
          return sendJson(res, 200, { status: 'ok' });
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
      });
      return;
    }
  }

  if (parts[1] === 'schema') {
    const key = parts[2];
    const filename = SCHEMAS[key];
    if (!filename) return notFound(res);
    const schemaPath = path.join(schemaDir, filename);
    return sendJson(res, 200, readJson(schemaPath));
  }

  notFound(res);
}

function renderAppHtml() {
  // Serve a self-contained SPA that pulls data/schemas via fetch.
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Data Editor</title>
  <style>
    :root { color-scheme: dark; }
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; background: #0f172a; color: #e2e8f0; }
    h1 { margin: 0 0 8px; }
    .row { display: flex; gap: 16px; flex-wrap: wrap; }
    select, button, input, textarea { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; border-radius: 8px; padding: 8px 10px; font-size: 14px; }
    textarea { width: 100%; min-height: 140px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    .card { background: #0b1220; border: 1px solid #1f2937; border-radius: 12px; padding: 14px; }
    .columns { display: grid; grid-template-columns: 260px 1fr; gap: 16px; }
    .list { max-height: 70vh; overflow: auto; }
    .list button { width: 100%; text-align: left; margin-bottom: 6px; }
    .error { color: #fecdd3; background: #3d0f16; border: 1px solid #f8717133; padding: 8px 10px; border-radius: 8px; white-space: pre-wrap; }
    .success { color: #bbf7d0; background: #0f3d2e; border: 1px solid #22c55e33; padding: 8px 10px; border-radius: 8px; }
    label { display: block; margin-top: 12px; font-weight: 600; }
    small { display: block; color: #94a3b8; margin-top: 2px; }
    .inline { display: inline-block; margin-left: 6px; font-weight: 400; }
    .flex { display: flex; gap: 8px; align-items: center; }
    .chip { background: #1e293b; padding: 2px 8px; border-radius: 12px; font-size: 12px; border: 1px solid #334155; }
    .actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
    .disabled { opacity: 0.6; pointer-events: none; }
  </style>
  <script src="/static/ajv.js"></script>
</head>
<body>
  <h1>Data Editor</h1>
  <div class="row">
    <div class="flex">
      <label for="fileSelect" style="margin:0;">File</label>
      <select id="fileSelect">
        <option value="">-- choose --</option>
        <option value="duas">duas.json</option>
        <option value="themes">themes.json</option>
        <option value="rounds">rounds.json</option>
      </select>
    </div>
    <div id="status"></div>
  </div>

  <div class="columns" style="margin-top:16px;">
    <div class="card">
      <div class="flex" style="justify-content: space-between;">
        <div>Entries</div>
        <button id="addBtn" class="disabled">+ Add</button>
      </div>
      <div id="list" class="list" style="margin-top:10px;"></div>
    </div>
    <div class="card">
      <div id="formArea">Pick a file and entry.</div>
    </div>
  </div>

  <div class="card" style="margin-top:16px;">
    <details>
      <summary>Schema</summary>
      <pre id="schemaView" style="overflow:auto; max-height:300px;"></pre>
    </details>
  </div>

  <script>
    const state = {
      file: '',
      data: null,
      schema: null,
      selectedKey: '',
      dirtyEntry: null,
      ajv: new Ajv7({allErrors:true, strict:false}),
      validators: {},
    };

    const fileSelect = document.getElementById('fileSelect');
    const listEl = document.getElementById('list');
    const formArea = document.getElementById('formArea');
    const statusEl = document.getElementById('status');
    const schemaView = document.getElementById('schemaView');
    const addBtn = document.getElementById('addBtn');

    fileSelect.addEventListener('change', async () => {
      const file = fileSelect.value;
      state.file = file;
      state.selectedKey = '';
      if (!file) { listEl.innerHTML=''; formArea.textContent='Pick a file.'; addBtn.classList.add('disabled'); return; }
      await loadFile(file);
    });

    addBtn.addEventListener('click', () => {
      if (!state.file) return;
      const id = prompt('New entry ID (unique key):');
      if (!id) return;
      if (state.data[id]) return alert('ID already exists.');
      state.selectedKey = id;
      state.data[id] = { id };
      renderList();
      renderForm();
    });

    async function loadFile(file) {
      status('');
      addBtn.classList.add('disabled');
      listEl.innerHTML = 'Loading...';
      formArea.textContent = 'Loading...';
      schemaView.textContent = '';
      try {
        const [dataRes, schemaRes] = await Promise.all([
          fetch('/api/data/' + file),
          fetch('/api/schema/' + file),
        ]);
        state.data = await dataRes.json();
        state.schema = await schemaRes.json();
        schemaView.textContent = JSON.stringify(state.schema, null, 2);
        state.validators[file] = state.ajv.compile(state.schema);
        addBtn.classList.remove('disabled');
        renderList();
        formArea.textContent = 'Select an entry on the left.';
      } catch (err) {
        status('Failed to load: ' + err.message, true);
      }
    }

    function renderList() {
      const entries = Object.keys(state.data || {}).sort();
      listEl.innerHTML = entries.map(id => {
        const isActive = id === state.selectedKey;
        return '<button data-id=\"'+id+'\" style=\"'+(isActive?'border-color:#67e8f9;':'')+'\">'+id+'</button>';
      }).join('');
      listEl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          state.selectedKey = btn.dataset.id;
          renderList();
          renderForm();
        });
      });
    }

    function inputField(key, propSchema, value) {
      const required = (state.schema && state.schema.additionalProperties && state.schema.additionalProperties.required || []).includes(key);
      const label = \`\${key}\${required ? ' *' : ''}\`;
      const desc = propSchema.description || '';

      if (propSchema.enum) {
        const options = propSchema.enum.map(v => '<option '+(v===value?'selected':'')+'>'+v+'</option>').join('');
        return \`
          <label>\${label}<small>\${desc}</small></label>
          <select data-key=\"\${key}\">\${options}</select>
        \`;
      }

      if (propSchema.type === 'array') {
        const text = Array.isArray(value) ? value.join('\\n') : '';
        return \`
          <label>\${label}<small>\${desc}</small></label>
          <textarea data-key=\"\${key}\" data-type=\"array\" placeholder=\"One per line\">\${text}</textarea>
        \`;
      }

      if (propSchema.type === 'object' && propSchema.properties) {
        const inner = Object.entries(propSchema.properties).map(([k,p]) => {
          const val = value && value[k] !== undefined ? value[k] : '';
          if (p.enum) {
            return '<div style=\"margin-top:6px;\"><span class=\"chip\">'+k+'</span> <select data-sub=\"'+k+'\">'+p.enum.map(v=>'<option '+(v===val?'selected':'')+'>'+v+'</option>').join('')+'</select></div>';
          }
          return '<div style=\"margin-top:6px;\"><span class=\"chip\">'+k+'</span> <input data-sub=\"'+k+'\" value=\"'+(val||'')+'\" /></div>';
        }).join('');
        return \`
          <label>\${label}<small>\${desc}</small></label>
          <div class=\"card\" style=\"margin-top:4px;\">\${inner}</div>
        \`;
      }

      const inputType = propSchema.type === 'integer' ? 'number' : 'text';
      return \`
        <label>\${label}<small>\${desc}</small></label>
        <input data-key=\"\${key}\" type=\"\${inputType}\" value=\"\${value ?? ''}\" />
      \`;
    }

    function renderForm() {
      if (!state.selectedKey) { formArea.textContent = 'Select an entry on the left.'; return; }
      const entry = state.data[state.selectedKey] || {};
      const props = state.schema.additionalProperties.properties;
      const fields = Object.entries(props).map(([k,p]) => inputField(k, p, entry[k])).join('');
      formArea.innerHTML = \`
        <div class=\"flex\" style=\"justify-content: space-between;\">
          <div><strong>ID:</strong> \${state.selectedKey}</div>
          <div class=\"actions\">
            <button id=\"saveBtn\">Save</button>
            <button id=\"deleteBtn\" style=\"background:#3b0d0d; border-color:#7f1d1d;\">Delete</button>
          </div>
        </div>
        <div style=\"margin-top:8px;\">\${fields}</div>
        <div id=\"formError\" style=\"margin-top:10px;\"></div>
      \`;

      // attach listeners
      formArea.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('input', collectForm);
        el.addEventListener('change', collectForm);
      });
      formArea.querySelector('#saveBtn').addEventListener('click', async () => {
        if (!(await collectForm(true))) return;
        await saveAll();
      });
      formArea.querySelector('#deleteBtn').addEventListener('click', async () => {
        if (!confirm('Delete this entry?')) return;
        delete state.data[state.selectedKey];
        state.selectedKey = '';
        renderList();
        renderForm();
      });
    }

    function collectForm(validateNow=false) {
      if (!state.selectedKey) return;
      const entry = { id: state.selectedKey };
      const props = state.schema.additionalProperties.properties;
      formArea.querySelectorAll('[data-key]').forEach(el => {
        const key = el.dataset.key;
        const schema = props[key];
        if (schema.type === 'array') {
          const arr = el.value.split('\\n').map(s=>s.trim()).filter(Boolean);
          entry[key] = arr;
        } else if (schema.type === 'object') {
          const obj = {};
          el.querySelectorAll('[data-sub]').forEach(subEl => {
            const subKey = subEl.dataset.sub;
            obj[subKey] = subEl.value;
          });
          entry[key] = obj;
        } else if (schema.type === 'integer') {
          entry[key] = Number(el.value);
        } else {
          entry[key] = el.value;
        }
      });
      state.data[state.selectedKey] = entry;
      if (validateNow) {
        const ok = validateData();
        return ok;
      }
      return true;
    }

    function validateData() {
      const v = state.validators[state.file];
      const ok = v(state.data);
      const formError = document.getElementById('formError');
      if (!ok) {
        formError.innerHTML = '<div class=\"error\">'+v.errors.map(e=> (e.instancePath||'/')+' '+e.message).join('\\n')+'</div>';
        return false;
      }
      formError.innerHTML = '<div class=\"success\">Valid</div>';
      return true;
    }

    async function saveAll() {
      const vOk = validateData();
      if (!vOk) return;
      try {
        const res = await fetch('/api/data/' + state.file, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Save failed');
        status('Saved ' + state.file, false, true);
      } catch (err) {
        status('Save failed: ' + err.message, true);
      }
    }

    function status(msg, isError=false, success=false) {
      if (!msg) { statusEl.innerHTML=''; return; }
      statusEl.innerHTML = '<span class=\"'+(isError?'error':'success')+'\">'+msg+'</span>';
    }
  </script>
</body>
</html>`;
}

function startServer() {
  const { host, port } = parseArgs();
  const appHtml = renderAppHtml();
  buildAjvBundle();

  const server = http.createServer((req, res) => {
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    if (urlObj.pathname.startsWith('/api/')) {
      return handleApi(req, res, urlObj);
    }
    if (urlObj.pathname === '/static/ajv.js') {
      if (!ajvBundle) {
        res.writeHead(503, { 'Content-Type': 'text/plain' });
        return res.end('AJV bundle not loaded yet');
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      return res.end(ajvBundle);
    }
    if (urlObj.pathname === '/' || urlObj.pathname === '/app') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(appHtml);
    }
    notFound(res);
  });

  server.listen(port, host, () => {
    console.log(`Data editor running at http://${host}:${port}/`);
  });
}

startServer();
