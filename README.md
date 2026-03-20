# Harness Engineering - AI協働開発プロジェクト

TypeScriptを使用したハーネスエンジニアリング開発プロジェクトです。GitHub Copilotと協働しながら、品質を保証された開発を実現します。

## 📋 プロジェクト概要

このプロジェクトは、以下の原則に基づいています：

- **AI Copilot との協働**: GitHub Copilot を活用した効率的な開発
- **Code Quality**: Biome によるコード品質の自動検証
- **Workflow Automation**: AGENTS.md に従った体系的なワークフロー
- **Standards Compliance**: シングルクォーテーション、1行100文字以内の実装規約

## 🚀 クイックスタート

### 環境要件

- Node.js 18.0 以上
- npm 9.0 以上

### セットアップ手順

```bash
# リポジトリをクローン
git clone <repository-url>
cd herness02

# 依存パッケージをインストール
npm install

# コード品質チェック
npm run check

# ビルド
npm run build
```

## 📚 開発ワークフロー

詳細なワークフローは [AGENTS.md](AGENTS.md) を参照してください。

### 基本フロー

1. **Issue 作成**: `.github/ISSUE_TEMPLATE/feature.md` を使用
2. **Copilot に依頼**: Issue 番号を指定して機能実装を依頼
3. **ブランチ作成**: `issue/xx/feature-name` 形式
4. **実装・検証**: Biome チェックを通す
5. **README 更新**: 新機能を記載
6. **PR 作成**: `.github/pull_request_template.md` を使用
7. **マージ・完了**: レビュー承認後にマージ

## 🛠 利用可能なコマンド

```bash
# 開発ウォッチモード（TypeScript コンパイル監視）
npm run dev

# コード品質チェック（Biome）
npm run check

# コード自動修正（Biome）
npm run lint

# コードフォーマット
npm run format

# TypeScript ビルド
npm run build

# pre-commit チェック
npm run pre-commit
```

## 📋 実装規約

### 必須事項

| 項目 | 内容 |
|------|------|
| **Quote Style** | シングルクォーテーション ('string') |
| **Line Width** | 最大100文字 |
| **Semicolons** | 常に付与 |
| **Trailing Commas** | ES5互換 |
| **Mode** | TypeScript strict: true |
| **Linter** | Biome (biome.json) |

### コード例

```typescript
import { helper } from '@/utils/helper';

export const processData = (
  inputData: string,
): string => {
  const result = helper(inputData);
  return 'Processed: ' + result;
};
```

## 🔍 Biome 設定

biome.json でコード品質のガードレールを設定しています：

```json
{
  "formatter": {
    "quoteStyle": "single",
    "lineWidth": 100,
    "semicolons": "always"
  }
}
```

### ガードレールの役割

- **不正なコードの生成防止**: biome check がルール違反を検出
- **自動修正**: npm run lint で問題を自動解決
- **CI/CD 統合**: PR時に自動チェック実行

## 📁 プロジェクト構成

```
herness02/
├── src/
│   └── index.ts          # エントリーポイント
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── feature.md    # Issue テンプレート
│   ├── pull_request_template.md  # PR テンプレート
│   └── workflows/
│       └── ci.yml        # CI/CD ワークフロー
├── AGENTS.md             # 開発ワークフロー定義
├── package.json          # npm 依存パッケージ
├── tsconfig.json         # TypeScript 設定
├── biome.json            # Biome コード品質設定
├── .gitignore            # Git 無視対象
└── README.md             # このファイル
```

## 🤖 GitHub Copilot の活用

### 依頼形式

```
@copilot Fix issue #xx: [IssueTitle]

以下の要件に従ってください：
1. AGENTS.md ワークフローに従う
2. biome チェックを通す
3. シングルクォーテーション使用
4. 1行最大100文字以内
5. TypeScript strict mode に準拠
6. ユニットテスト を作成
```

### Copilot の責務

- ✅ コード生成
- ✅ ロジック実装
- ✅ テスト作成
- ✅ コメント・ドキュメント作成
- ❌ Commit/Push (手動実施)

## 📊 品質メトリクス

BiomeによるCode Quality チェック項目：

- TypeScript 型チェック
- コード スタイル（Quote, Semicolon）
- 行数制限（100文字）
- Import Organization
- Unused Variables Detection

## 🔄 CI/CD パイプライン

.github/workflows/ci.yml で以下を実行：

1. Biome チェック
2. TypeScript コンパイル
3. ユニットテスト
4. ビルド検証

## 📝 ドキュメント

- [AGENTS.md](AGENTS.md) - 詳細ワークフロー定義
- [biome.json](biome.json) - コード品質設定
- [package.json](package.json) - 依存パッケージ・スクリプト

## 🐛 トラブルシューティング

### Biome エラーが出た場合

```bash
# 自動修正を適用
npm run lint

# エラー詳細を確認
npm run check
```

### TypeScript コンパイルエラー

```bash
# ビルドしてエラーを確認
npm run build

# strict mode で全エラーを検出
# tsconfig.json の strict: true で有効
```

### Git コンフリクト

ブランチマージ時にコンフリクトが発生した場合：

```bash
# 手動で競合ファイルを解決
git mergetool

# 解決後に biome チェック
npm run check
npm run build
```

## 💡 ベストプラクティス

1. **Pre-commit チェック**: Commit 前に必ず npm run check
2. **Issue→PR**: 常に Issue 番号を PR·Commit に含める
3. **Branch Policy**: main ブランチへの直接 push 禁止
4. **Squash Commits**: マージ時に commit をまとめる
5. **Update README**: 新機能は必ず README に記載

## 📞 サポート

問題が発生した場合：

1. [AGENTS.md](AGENTS.md) の「トラブルシューティング」セクションを確認
2. GitHub Issues で Issue を作成
3. GitHub Copilot に相談

## 📄 ライセンス

MIT License

---

**プロジェクト開始**: 2026-03-20
**最終更新**: 2026-03-20
**Biome Version**: ^1.9.0
**TypeScript Version**: ^5.3.0
