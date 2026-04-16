# GitHub Repo Viewer

GitHubリポジトリの中身をスマートフォンから素早く閲覧できるPWA（Progressive Web App）。Markdown・HTML・コード・画像を美しく表示し、フォルダ階層・検索・お気に入りでモバイル最適化された操作感を提供します。

**privateリポ対応** — GitHub APIトークン認証でプライベートリポジトリも閲覧可能です。

---

## ✨ 特長

- 📂 フォルダ階層ナビゲーション（パンくずリスト付き）
- 📝 Markdownの美しいレンダリング（見出し・表・コードブロック・リスト対応）
- 🌐 HTMLファイルのインラインプレビュー
- 📥 バイナリファイル（PPTX・PDF等）のダウンロード
- 🔍 **グローバル検索**（ファイル名・本文の両方、結果をセクション分け表示）
- ⭐ お気に入り登録（よく見るファイルへ即アクセス）
- 🕐 最近のコミット一覧
- 📱 **PWA対応** — ホーム画面に追加してアプリのように利用可能
- 🌙 モバイル最適化ダークUI
- ↩️ スワイプバック・ハードウェアバック対応
- 🔒 トークンはlocalStorageに保存（サーバーに送信されない）

---

## 🚀 クイックスタート

### 1. このテンプレートから自分用のリポを作成

1. このリポジトリ上部の緑の **「Use this template」** ボタン → **Create a new repository**
2. 新しいリポジトリ名を入力（例: `my-repo-viewer`）
3. **Public** を選択（GitHub Pages Freeプランでは public のみ対応）
4. **Create repository from template**

### 2. GitHub Pages を有効化

1. 新しく作ったリポジトリ → **Settings** → **Pages**
2. **Source**: `Deploy from a branch`
3. **Branch**: `main` / `(root)` → **Save**
4. 1〜2分後に `https://YOUR-USERNAME.github.io/REPO-NAME/` でアクセス可能に

### 3. 閲覧用GitHubトークンを作成

#### 方法A: Fine-grained PAT（推奨・最小権限）
1. https://github.com/settings/personal-access-tokens/new
2. **Token name**: `repo-viewer-read`
3. **Expiration**: 1 year
4. **Repository access**: `Only select repositories` → 閲覧したい対象リポを選択
5. **Permissions** → **Repository permissions** → **Contents**: `Read-only`
6. **Generate token** → トークンをコピー

※ Fine-grained PATは**ファイル名検索**は可能ですが、**本文検索は privateリポでは非対応**（GitHub仕様）です。本文検索も必要な場合は方法Bを使用してください。

#### 方法B: Classic PAT（本文検索も使いたい場合）
1. https://github.com/settings/tokens/new?scopes=repo&description=repo-viewer-read-classic
2. スコープ: `repo` にチェック
3. **Generate token** → トークンをコピー

### 4. スマホでアクセス

1. スマホのブラウザで `https://YOUR-USERNAME.github.io/REPO-NAME/` を開く
2. 認証画面で以下を入力:
   - **Owner**: 閲覧したいリポのオーナー名（例: `octocat`）
   - **Repository**: リポジトリ名（例: `hello-world`）
   - **Branch**: デフォルトは `main`（古いリポは `master`）
   - **Token**: ステップ3でコピーしたトークン
3. **接続テスト & 保存** → 成功を確認
4. ブラウザメニューから **ホーム画面に追加** でPWA化

完了です。以降はホーム画面アイコンからアプリのように起動できます。

---

## 🏗️ アーキテクチャ

```
スマホ (PWA)
   │
   │ GitHub API + Token (HTTPS)
   ▼
api.github.com ──▶ 対象リポジトリ（publicまたはprivate）
```

すべてクライアントサイドで完結。サーバーは不要です（GitHub Pagesは静的ファイルをホストするだけ）。

### 使用しているGitHub API
- `GET /repos/{owner}/{repo}/contents/{path}` — フォルダ・ファイル一覧
- `GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1` — ファイル名検索用の全パス取得
- `GET /repos/{owner}/{repo}/git/blobs/{sha}` — バイナリファイル取得
- `GET /repos/{owner}/{repo}/commits` — 最近のコミット
- `GET /search/code` — 本文検索（Classic PATのみ対応）

---

## 🔒 セキュリティ

- **トークンの保管**: ブラウザのlocalStorageにのみ保存されます。第三者サーバーには送信されません
- **通信**: すべてHTTPS
- **HTMLプレビュー**: `sandbox="allow-scripts allow-same-origin"` 属性付きiframeで隔離
- **推奨権限**: Fine-grained PATの `Contents: Read-only` が最小権限
- **共有端末では使用しない**: トークンがlocalStorageに残るため

---

## 🛠️ カスタマイズ

### UIの色を変える
`index.html` の `:root` CSS変数を編集:

```css
:root {
  --bg: #0f172a;      /* 背景 */
  --accent: #818cf8;  /* アクセント */
  --green: #34d399;
  --red: #f87171;
  /* ... */
}
```

### PWAアイコン・名前を変える
- `manifest.json` の `name` / `short_name` / `description` を編集
- `icon-192.svg` / `icon-512.svg` を差し替え

### デフォルトブランチ
`main` 以外を使う場合、Branch欄に入力すればOK。グローバル設定は `index.html` の `state.branch` で変更可能。

---

## ❓ FAQ

### Q. privateリポを公開リポ経由で閲覧して大丈夫？
A. ビューア自体（HTML/JS）は公開されていますが、**リポジトリのコンテンツはユーザーのトークン経由で直接GitHub APIから取得**されます。リポの中身そのものがGitHub Pagesに公開されるわけではありません。

### Q. トークンが流出したらどうする？
A. https://github.com/settings/tokens で該当トークンを **Delete** すれば即座に無効化されます。

### Q. 複数人で使いたい
A. 各自が自分のトークンを作成して、それぞれのデバイスで入力します。トークンは共有しないでください。

### Q. 大きいリポで動く？
A. Git Tree APIは100,000ファイル程度までキャッシュ可能ですが、**50万ファイル以上**のリポでは一部が truncated として扱われます。

### Q. PWAが古いまま更新されない
A. スマホでPWAを**完全にキル**→再起動してください。Service Workerが新版を取得します。

---

## 🧰 技術スタック

- **フレームワーク**: なし（バニラHTML/CSS/JS、外部依存ゼロ）
- **Markdown**: 自前の軽量パーサー
- **ホスティング**: GitHub Pages
- **API**: GitHub REST API v3
- **PWA**: Service Worker（Network-first）+ Web App Manifest

ファイルサイズ: index.html 約45KB（minifyなし）

---

## 📄 ライセンス

MIT License — 自由に使用・改変・再配布できます。

---

## 🙌 フィードバック

Issues・Pull Requests歓迎です。
