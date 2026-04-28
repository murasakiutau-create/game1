// 配布ZIPを生成する：dist/{index.html, game.js, game.css} を
// game1-play/ という単一フォルダにまとめてZIP化する。
// spck エディタなど「設定ファイルを含む親フォルダを project とみなす」系の
// 編集環境で開きやすいように、設定ファイル類は意図的に除外している。

import { execSync } from 'node:child_process';
import { mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const distDir = join(root, 'dist');
const required = ['index.html', 'game.js', 'game.css'];
for (const f of required) {
  if (!existsSync(join(distDir, f))) {
    console.error(`dist/${f} が見つかりません。先に \`npm run build\` を実行してください。`);
    process.exit(1);
  }
}

const stage = join(tmpdir(), `game1-play-${Date.now()}`);
const playDir = join(stage, 'game1-play');
mkdirSync(playDir, { recursive: true });
for (const f of required) copyFileSync(join(distDir, f), join(playDir, f));

const zipPath = join(root, 'game1-slice.zip');
rmSync(zipPath, { force: true });
execSync(`zip -r "${zipPath}" game1-play`, { cwd: stage, stdio: 'inherit' });
rmSync(stage, { recursive: true, force: true });

console.log(`\n→ ${zipPath}`);
