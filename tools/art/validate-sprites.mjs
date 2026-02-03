import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');

const assets = [
  {
    name: 'sprites',
    variable: 'SPRITES',
    metadata: path.join(projectRoot, 'images', 'sprites.js'),
    sheet: path.join(projectRoot, 'images', 'sprites.png'),
    palette: path.join(projectRoot, 'images', 'palette.json')
  },
  {
    name: 'background',
    variable: 'BACKGROUND',
    metadata: path.join(projectRoot, 'images', 'background.js'),
    sheet: path.join(projectRoot, 'images', 'background.png')
  }
];

function loadMetadata(metadataPath, variable) {
  const sandbox = {};
  const code = fs.readFileSync(metadataPath, 'utf8');
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: metadataPath });

  const value = sandbox[variable];
  if (!value || typeof value !== 'object') {
    throw new Error(`${variable} not defined in ${metadataPath}`);
  }

  return value;
}

function readSheet(sheetPath) {
  const buffer = fs.readFileSync(sheetPath);
  return PNG.sync.read(buffer);
}

function validateEntries(name, entries, sheet) {
  const errors = [];
  const { width, height } = sheet;

  if (!Object.keys(entries).length) {
    errors.push(`${name}: metadata object is empty.`);
    return errors;
  }

  for (const [key, rect] of Object.entries(entries)) {
    if (!/^[A-Z0-9_]+$/.test(key)) {
      errors.push(`${name}: invalid key ${key} (use uppercase and underscores).`);
    }

    const numericFields = ['x', 'y', 'w', 'h'];
    const hasInvalidField = numericFields.some(
      (field) => typeof rect[field] !== 'number' || Number.isNaN(rect[field])
    );

    if (hasInvalidField) {
      numericFields.forEach((field) => {
        if (typeof rect[field] !== 'number' || Number.isNaN(rect[field])) {
          errors.push(`${name}: ${key}.${field} must be a number.`);
        }
      });
      continue;
    }

    if (rect.w <= 0 || rect.h <= 0) {
      errors.push(`${name}: ${key} has non-positive dimensions.`);
    }

    if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > width || rect.y + rect.h > height) {
      errors.push(`${name}: ${key} exceeds sheet bounds (${width}x${height}).`);
    }
  }

  return errors;
}

function validatePalette(name, sheet, palettePath) {
  const errors = [];
  if (!palettePath) return errors;

  const allowed = JSON.parse(fs.readFileSync(palettePath, 'utf8')).map((color) => color.toUpperCase());
  const palette = new Set(allowed);
  const missing = new Set();

  for (let i = 0; i < sheet.data.length; i += 4) {
    const alpha = sheet.data[i + 3];
    if (alpha === 0) continue;
    const color = `#${sheet.data[i].toString(16).padStart(2, '0')}${sheet.data[i + 1]
      .toString(16)
      .padStart(2, '0')}${sheet.data[i + 2].toString(16).padStart(2, '0')}`.toUpperCase();
    if (!palette.has(color)) {
      missing.add(color);
      if (missing.size >= 10) break;
    }
  }

  if (missing.size) {
    errors.push(`${name}: found colors outside palette (${Array.from(missing).join(', ')}).`);
  }

  return errors;
}

async function main() {
  const errors = [];

  for (const asset of assets) {
    if (!fs.existsSync(asset.metadata)) {
      throw new Error(`Missing metadata file: ${asset.metadata}`);
    }

    if (!fs.existsSync(asset.sheet)) {
      throw new Error(`Missing sprite sheet: ${asset.sheet}`);
    }

    const metadata = loadMetadata(asset.metadata, asset.variable);
    const sheet = readSheet(asset.sheet);

    errors.push(...validateEntries(asset.name, metadata, sheet));
    if (asset.palette) {
      errors.push(...validatePalette(asset.name, sheet, asset.palette));
    }
  }

  if (errors.length) {
    errors.forEach((message) => console.error(message));
    process.exit(1);
  }

  console.log('Art metadata validation passed.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
