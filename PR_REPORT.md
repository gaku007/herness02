## 関連するIssue

Fixes #1

## 変更内容

`npm run dev` が実行されない問題を解決するため、開発環境を改善しました。

### 実施した対応

1. **問題の診断**
   - TypeScript のコンパイルは正常に動作していることを確認
   - `npm run dev` は単にファイルをコンパイルするだけの機能であることが判明

2. **開発環境の改善**
   - 初期段階で Vite のセットアップを試行→ Node.js バージョン互換性エラーで失敗
   - `live-server` による軽量な開発サーバーに切り替え
   - ホットリロード機能を追加

3. **package.json の更新**
   - `npm run dev` → `tsc && live-server --port=5173 --entry-file=index.html`
   - `npm run dev:watch` を追加（TypeScript watch 単体用）
   - `live-server` を devDependencies に追加

4. **index.html の修正**
   - スクリプト参照を `dist/index.js` に変更

## 種類

- [x] 新機能 (New feature)

## テスト内容

- ✅ `npm run dev` 実行確認 → ブラウザ自動起動、ホットリロード動作確認
- ✅ `npm run check` パス確認
- ✅ `npm run build` 成功確認
- ✅ live-server が localhost:5173 で起動確認

## チェックリスト

- [x] コードをレビューしました
- [x] `npm run check` がパスしました
- [x] `npm run build` が成功しました
- [x] TypeScript strict mode に准拠しています
- [x] コミットメッセージに Issue# を含めました

## その他の注意事項

- ブラウザで http://localhost:5173 にアクセスするとアプリケーションが自動起動されます
- コードの変更時に自動的にリロードされます
- Node.js バージョンの制約がなくなったため運用がシンプルになりました
