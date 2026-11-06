#!/usr/bin/env node
/**
 * Build the browser bundle.
 *
 * `src/client.js` is authored as plain JavaScript (no JSX) with three build
 * markers:
 *   - `/*__TOKENS__*\/`   the 113-token alias palette, inlined from tokens.json
 *   - `/*__CSS__*\/`      the signature stylesheet, inlined from style.css
 *   - `__BA_ASSETS__`     the artwork/font data-URI table
 *
 * All three are inlined so `lib/client.js` is a single self-contained
 * module-table artifact: the browser loader never fetches a second file, and
 * the theme still works when the profile is moved or the original assets
 * directory is gone.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(root, 'assets');

const read = (name) => readFileSync(join(root, name), 'utf8');
const asset = (file, mime) =>
  `data:${mime};base64,${readFileSync(join(assetsDir, file)).toString('base64')}`;

const assets = {
  bgClassroom: asset('bg-classroom.jpg', 'image/jpeg'),
  bgSunset: asset('bg-sunset.jpg', 'image/jpeg'),
  bgTwilight: asset('bg-twilight.jpg', 'image/jpeg'),
  arona: asset('arona.png', 'image/png'),
  plana: asset('plana.png', 'image/png'),
  card: asset('card.png', 'image/png'),
  schale: asset('schale.png', 'image/png'),
  banner: asset('banner.webp', 'image/webp'),
  pattern: asset('pattern.svg', 'image/svg+xml'),
  deco: asset('deco2.svg', 'image/svg+xml'),
  fontRegular: asset('blueaka.woff2', 'font/woff2'),
  fontBold: asset('blueaka-bold.woff2', 'font/woff2'),
};

// ba-click-fx is distributed as a self-contained ESM file. The DSH client
// bundle is a classic script, so strip the final `export { ... }` and expose
// the class on globalThis instead of using dynamic import (which can be
// blocked by a strict CSP).
const clickFxSource = readFileSync(join(assetsDir, 'ba-click-fx.slim.js'), 'utf8')
  .replaceAll('#4ca7ff', '#128afa')
  // The slim preset ships with zero contrast for light canvases. The theme's
  // daytime sky is nearly white, so enable a soft dark backing under the
  // additive canvas; otherwise the click ring is invisible in light mode.
  .replace('lightBackgroundContrastAlpha:0', 'lightBackgroundContrastAlpha:0.55');
const clickFxExport = clickFxSource.match(/export\s*\{([^}]*)\}\s*;?\s*$/);
if (!clickFxExport) throw new Error('ba-click-fx: final export statement not found');
const clickFxEntries = clickFxExport[1].split(',').map((entry) => entry.trim());
const clickFxDefault = clickFxEntries.find((entry) => /\bas\s+default$/.test(entry));
const clickFxLocal = (clickFxDefault || clickFxEntries[0]).split(/\s+as\s+/)[0].trim();
if (!/^[A-Za-z_$][\w$]*$/.test(clickFxLocal)) throw new Error('ba-click-fx: cannot resolve class binding');
const clickFxBlock =
  `/*! ba-click-fx v1.3.15 | MIT | (c) 2026 CialloKing | https://github.com/CialloKing/ba-click-fx */\n` +
  `(function () {\n${clickFxSource.slice(0, clickFxExport.index)}\n` +
  `globalThis.__baClickFX = ${clickFxLocal};\n})();\n\n`;

const tokens = JSON.parse(read('src/tokens.json'));
const tokenBlock =
  `const LIGHT = ${JSON.stringify(tokens.light)};\n` +
  `  const DARK = ${JSON.stringify(tokens.dark)};`;

let source = read('src/client.js');
const css = read('src/style.css');

for (const marker of ['/*__TOKENS__*/', '/*__CSS__*/', '__BA_ASSETS__']) {
  if (!source.includes(marker)) throw new Error(`marker missing: ${marker}`);
}

source = source.replace('/*__TOKENS__*/', tokenBlock);
source = source.replace('/*__CSS__*/', () => css);
source = source.replace('__BA_ASSETS__', JSON.stringify(assets));
source = clickFxBlock + source;

writeFileSync(join(root, 'lib/client.js'), source);

const kb = (n) => `${(n / 1024).toFixed(1)} KiB`;
console.log(`built lib/client.js (${kb(Buffer.byteLength(source))})`);
