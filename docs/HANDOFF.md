# 引き継ぎドキュメント — anken-search-sakusaku / Capy AI

最終更新: 2026-09-08  
作成元エージェント: Cursor Cloud `bc-019fc4fb-2b0c-7930-b6d4-87edcb96f38e`（Release candidate status）  
リポジトリ: https://github.com/ikenagibot/anken-search-sakusaku  
公開サイト: https://ikenagibot.github.io/anken-search-sakusaku/

---

## 1. このドキュメントの目的

次のエージェントが **ここまでの成果物を読み取り、制作を継続できる** ように、現状・未反映差分・検証結果・推奨作業をまとめたもの。

ユーザー直近の意図:

1. RC（公開候補）ステータス確認 → **RC OK** と判定済み
2. この後の制作を別エージェントへ引き継ぎたい

---

## 2. プロジェクト概要

| 項目 | 内容 |
|------|------|
| リポジトリ説明 | Workspace for setting up **Anken Search Sakusaku** with **Capy AI** |
| 現状の公開物 | 「Capy AI × クリエイターツール集」（スタンドアロン HTML ツール群） |
| 設計方針 | ブラウザ完結・データ外部送信なし |
| オーナー | QLab Studio（info@qlabstudio.jp） |

**重要:** `main` には README のみ。実体の制作物はすべて **`gh-pages` ブランチ** にある。GitHub Pages の source も `gh-pages` / `/`。

「案件検索サクサク（Anken Search Sakusaku）」本体アプリは、このリポジトリ上では **まだ未着手／未配置**。現状は周辺クリエイターツールが先に公開されている状態。

---

## 3. ブランチ状態（必読）

| ブランチ | 役割 | 先端コミット | 備考 |
|----------|------|--------------|------|
| `main` | デフォルト | `cd5da2b` Initial commit | README のみ。Pages より **9 commits behind** |
| `gh-pages` | **本番公開** | `1794aaa` | Pages デプロイ元。CI 最新は success |
| `claude/premiere-pro-text-styles-tq9xy2` | 未マージ改善 | `e41c516` | `gh-pages` より **5 commits ahead**（未公開） |

### 未マージ差分（claude ブランチ → まだ Pages に出ていない）

対象ファイル:

- `premiere-pro-text-styles/telop_analyzer.html`（+大幅）
- `web-seisaku-sheet/index.html`（クリップボード fallback 等）

コミット要約:

1. `39c6541` 画像からスタイル自動再現（カラー量子化・フォントサイズ推定・比較ストリップ）
2. `23b3db4` Web制作手順書: `navigator.clipboard` 失敗時の `execCommand` fallback
3. `d96c930` プレビューテキストを textarea 化し複数行対応、フォントリアルタイム反映
4. `4aa05a6` スタイル名・ファイル名・プリセット行 UI 削除（1行目から自動生成）
5. `e41c516` 画像内の領域ドラッグ選択 → 選択範囲のみ解析

**推奨ファーストタスク:** 上記 claude ブランチの差分をレビューし、問題なければ `gh-pages` へマージ／反映して Pages を更新する。

---

## 4. 公開コンテンツ構成（`gh-pages`）

```
index.html                          # ランディング（ツール一覧）
premiere-pro-text-styles/
  telop_analyzer.html               # テロップスタイル解析ツール Premium
  telop_style_manager.jsx           # Premiere Pro 用 ExtendScript
  styles.json                       # 6カテゴリ・26スタイル定義
web-seisaku-sheet/
  index.html                        # Web制作手順書（7フェーズ・タスクチェックリスト）
README.md
```

### 4.1 ランディング

- URL: https://ikenagibot.github.io/anken-search-sakusaku/
- タイトル: Capy AI × クリエイターツール集
- カード2枚: テロップ解析 / Web制作手順書

### 4.2 テロップスタイル解析ツール Premium

- URL: .../premiere-pro-text-styles/telop_analyzer.html
- 単一 HTML（Canvas 解析・プレビュー・`.prtextstyle` / JSX 書き出し）
- 主な関数: `autoAnalyze`, `estimateFontSize`, `buildPrtextstyle`, `buildJsx`, `drawPreview`, `exportFile`, `renderComparison` など
- `styles.json`: 1920×1080 基準、フォントはヒラギノ系（Windows は置換前提）
- カテゴリ例: バラエティ、ドキュメンタリー、タイトル、ビジネス、YouTube/SNS、ニュース

### 4.3 Premiere Pro スクリプト

- `telop_style_manager.jsx` — `#target "premierepro"`
- 使い方: Premiere Pro > ファイル > スクリプト > スクリプトファイルを実行
- 選択クリップへのスタイル適用試行、仕様テキスト書き出し

### 4.4 Web制作手順書シート

- URL: .../web-seisaku-sheet/
- `PHASES` 配列でフェーズ管理（受注・ヒアリング → … → テスト・検証 等）
- AI活用ポイント、テンプレ（ヒアリング・見積・スケジュール・納品チェック等）
- コピーボタンあり（claude 側で clipboard fallback 済み／Pages 側は古い可能性）

---

## 5. RC 検証結果（2026-08-03 実施 / 再確認時点でも有効な前提）

| チェック | 結果 |
|----------|------|
| GitHub Pages status | `built` |
| ランディング HTTP | 200 |
| テロップ解析 HTTP | 200 |
| Web制作手順書 HTTP | 200 |
| 最新 Pages Actions | success（2026-06-14 付近） |
| GitHub Releases | なし（タグ運用なし） |
| PR / Issue | なし |

判定: **RC OK（公開中の gh-pages 成果物は到達可能）**  
ただし **claude ブランチの改善は未反映**。

---

## 6. 技術・運用上の注意

1. **作業ブランチは `gh-pages` を正とする**（または claude を取り込んでから `gh-pages` を更新）。`main` だけ触っても公開に反映されない。
2. ツールは **静的 HTML/JS/JSON/JSX**。ビルドツール・パッケージマネージャは現状なし。
3. 日本語 UI。コメント・コミットメッセージ方針（この環境のルール）:
   - コードコメントは日本語可
   - コミットは Conventional Commits の prefix は英語、本文は日本語（例: `feat: 領域選択解析を追加`）
4. 外部 MCP（Slack / Notion / Linear / Atlassian）はこのエージェント実行時は **未認証 or エラー** で使えなかった。引き継ぎ先でも認証状態を確認すること。
5. デザインルール（ユーザー指定のフロント方針）がある場合は Cursor の user rules を優先。既存ツールはダーク紫系 UI だが、**新規ランディングを作り直すなら** 既存を踏襲するか、ルールに合わせて刷新するかを明示的に決めること。

---

## 7. 次エージェントへの指示（推奨バックログ）

優先度順。スコープが曖昧な場合はユーザーに確認してから実装。

### P0 — 未公開改善の反映

1. `origin/claude/premiere-pro-text-styles-tq9xy2` を checkout
2. テロップ解析の領域選択・複数行プレビュー・UI簡略化を手動確認
3. 問題なければ `gh-pages` にマージ（または同等差分を適用）して push → Pages 更新確認
4. ランディングの説明文が新機能とズレていれば `index.html` を更新

### P1 — リポジトリ健全化

1. `gh-pages` の最新を `main` に同期するか、`main` をドキュメント専用・`gh-pages` を成果物専用と明文化する
2. 必要なら GitHub Release / バージョンタグ（例: `styles.json` の `meta.version` と揃える）
3. 本ファイル `docs/HANDOFF.md` を `main` または `gh-pages` の分かりやすい場所に残す

### P2 — 「案件検索サクサク」本体

リポジトリ名の本命機能。現状未実装のため、着手前に要件確認が必要:

- 検索対象（案件 DB / 外部 API / ローカル JSON 等）
- Capy AI との連携範囲（要約・タグ付け・チャット等）
- 既存クリエイターツール集との情報設計（同一ランディングに載せるか別プロダクトか）

### P3 — 既存ツールの深化（候補）

- テロップ解析: OCR 連携、プリセット再設計、Windows フォントマッピング UI
- JSX: Premiere バージョン差異の検証、適用成功率の改善
- Web制作手順書: タスク数表記の整合（コピーに「62」「60」混在の気配）、印刷/エクスポート強化

---

## 8. 作業開始時のコマンド例

```bash
git fetch origin
# 公開中の正
git checkout -B work-gh-pages origin/gh-pages
# 未マージ改善の確認
git log --oneline origin/gh-pages..origin/claude/premiere-pro-text-styles-tq9xy2
git diff --stat origin/gh-pages...origin/claude/premiere-pro-text-styles-tq9xy2

# ローカル確認（静的）
python3 -m http.server 8080
# → http://localhost:8080/index.html
```

公開確認:

```bash
curl -sI https://ikenagibot.github.io/anken-search-sakusaku/ | head -5
```

---

## 9. 関連セッション

- Claude Code セッション（過去の制作）: `https://claude.ai/code/session_01TREnp2Sha14DkpXAAJuCgh`（コミットメッセージに記載）
- 本 Cursor Cloud ラン: https://cursor.com/agents/bc-019fc4fb-2b0c-7930-b6d4-87edcb96f38e

---

## 10. 次エージェント向けプロンプト（コピー用）

```
リポジトリ: github.com/ikenagibot/anken-search-sakusaku
必ず docs/HANDOFF.md を読んでから作業すること。

現状:
- 公開は gh-pages（GitHub Pages）。main は README のみ。
- RC 確認済みで公開 URL は 200。
- origin/claude/premiere-pro-text-styles-tq9xy2 に未公開の改善が 5 commits ある。

やってほしいこと:
1) claude ブランチの差分をレビューし、問題なければ gh-pages に反映して Pages を更新
2) 反映後、ランディングと2ツールの動作確認
3) その後、ユーザーと相談のうえ「案件検索サクサク」本体または既存ツール改善に進む

制約:
- 静的 HTML ツールはブラウザ完結・外部送信なしを維持
- 日本語でコミュニケーション
- コミットは Conventional Commits（prefix 英語・本文日本語）
```
