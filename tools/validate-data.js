#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const Ajv = require('ajv');

const projectRoot = path.join(__dirname, '..');
const dataDir = path.join(projectRoot, 'src', 'data');
const schemaDir = path.join(dataDir, 'schemas');

const ajv = new Ajv({ allErrors: true, strict: false });

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function validate(fileKey, dataFile, schemaFile) {
  const data = loadJson(path.join(dataDir, dataFile));
  const schema = loadJson(path.join(schemaDir, schemaFile));
  const validateFn = ajv.compile(schema);
  const valid = validateFn(data);
  if (!valid) {
    const details = validateFn.errors
      .map(err => `${fileKey}${err.instancePath || '/'} ${err.message}`)
      .join('\n');
    throw new Error(`Validation failed for ${fileKey}:\n${details}`);
  }
}

try {
  validate('duas', 'duas.json', 'duas.schema.json');
  validate('themes', 'themes.json', 'themes.schema.json');
  validate('rounds', 'rounds.json', 'rounds.schema.json');
  console.log('✅ Data validation passed');
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
