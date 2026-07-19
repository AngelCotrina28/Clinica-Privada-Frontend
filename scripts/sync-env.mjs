import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const defaultApiUrl = '/api';
const root = process.cwd();
const envPath = resolve(root, '.env');
const outputPath = resolve(root, 'src/environments/environment.ts');

const fileEnv = parseEnvFile(envPath);
const apiUrl = normalizeApiUrl(
  process.env.NG_APP_API_URL ??
    process.env.API_URL ??
    fileEnv.NG_APP_API_URL ??
    fileEnv.API_URL ??
    defaultApiUrl
);

const content = `// Synced from environment variables or an optional .env before npm start/build.
export const environment = {
  production: true,
  apiUrl: ${JSON.stringify(apiUrl)}
};
`;

const currentContent = existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : '';
if (normalizeLineEndings(currentContent) !== normalizeLineEndings(content)) {
  writeFileSync(outputPath, content, 'utf8');
  console.log(`Environment API URL updated: ${apiUrl}`);
} else {
  console.log(`Environment API URL unchanged: ${apiUrl}`);
}

function parseEnvFile(path) {
  if (!existsSync(path)) return {};

  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .reduce((values, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return values;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) return values;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = unquote(trimmed.slice(separatorIndex + 1).trim());
      if (key) values[key] = value;

      return values;
    }, {});
}

function normalizeApiUrl(value) {
  const trimmed = value.trim();
  return trimmed === '/' ? trimmed : trimmed.replace(/\/+$/, '');
}

function normalizeLineEndings(value) {
  return value.replace(/\r\n/g, '\n');
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
