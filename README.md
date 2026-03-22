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
3. **ブランチ作成**: `issue/xx/feature-name` 形式 ※xxは必ずIssueの番号に固定する
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

### ローカルチェック（Pre-commit フック）

Git commit 前に自動的に以下を実行：

```bash
npm run verify  # check + build + format:check
```

**Husky による自動実行**:
- Commit 時に `.husky/pre-commit` が実行
- チェック失敗時は commit がブロック
- 事前エラー検出により CI/CD の成功率を向上

### GitHub Actions - リモートチェック

`.github/workflows/ci.yml` で以下を実行：

1. **Lint & Build** (Node.js 18.x, 20.x マトリクス):
   - Biome チェック
   - TypeScript コンパイル
   - ユニットテスト

2. **Code Quality** (Node.js 20.x):
   - フォーマット検証
   - Lint チェック

3. **Build Artifacts**:
   - ビルド成果物をアップロード
   - 5日間保持

4. **PR へのレポート投稿**:
   - チェック結果をコメント投稿
   - 成功/失敗を自動判定
   - ワークフロー詳細へのリンク付き

### 利用可能なコマンド（拡張）

```bash
# チェック・ビルド・フォーマット検証をまとめて実行
npm run verify

# フォーマット検証のみ（修正なし）
npm run format:check
```

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

1. **Pre-commit チェック**: Commit 前に必ず `npm run verify` を実行
   - Husky フックで自動実行される
   - ローカルでエラーを検出してリモート CI を減らす

2. **Issue→PR**: 常に Issue 番号を PR·Commit に含める
   - `Fixes #xx` 形式で Issue 自動クローズ

3. **Branch Policy**: main ブランチへの直接 push 禁止
   - 必ず feature ブランチから PR を作成

4. **Squash Commits**: マージ時に commit をまとめる
   - 履歴を簡潔に保つ

5. **Update README**: 新機能は必ず README に記載
   - 使用方法、パラメータ、戻り値を記載

6. **CI エラー対応**: PR レポートを確認
   - GitHub Actions のワークフロー詳細を確認
   - ローカルで `npm run verify` で再現確認
   - エラー内容に基づいて修正

## 📞 サポート

問題が発生した場合：

1. [AGENTS.md](AGENTS.md) の「トラブルシューティング」セクションを確認
2. GitHub Issues で Issue を作成
3. GitHub Copilot に相談

## 📄 ライセンス

MIT License

---

**プロジェクト開始**: 2026-03-20
**最終更新**: 2026-03-22
**Biome Version**: ^1.9.0
**TypeScript Version**: ^5.3.0

## 🛍️ EC Site - 地下アイドルグッズ販売（Issue #6）

### 機能説明

地下アイドル向けECサイトの実装です。イベントチケット販売とイベント別グッズ販売を行い、カート投入から購入完了まで実現します。

### 使用方法

#### 開発環境での実行

```bash
# 依存パッケージのインストール
npm install

# TypeScript コンパイル（ウォッチモード）
npm run dev:watch

# 別ターミナルでサーバー起動
npm run build
node dist/index.js
```

ブラウザで `http://localhost:5000` にアクセスしてください。

#### API エンドポイント

**イベント関連**
| エンドポイント | メソッド | 説明 |
|------|---|----|
| `/api/events` | GET | すべてのイベント取得 |
| `/api/events/:id` | GET | イベントID でイベント取得 |

**商品関連**
| エンドポイント | メソッド | 説明 |
|------|---|----|
| `/api/products` | GET | すべての商品取得 |
| `/api/products/event/:eventId` | GET | イベント別に商品取得 |
| `/api/product/:id` | GET | 商品ID で商品取得 |

**注文関連**
| エンドポイント | メソッド | 説明 |
|------|---|----|
| `/api/orders` | GET | すべての注文取得 |
| `/api/orders/:id` | GET | 注文ID で注文を取得（アイテム含む）|
| `/api/orders` | POST | 新規注文を作成 |

#### 注文作成API の使用例

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "田中太郎",
    "customerEmail": "tanaka@example.com",
    "customerPhone": "09012345678",
    "items": [
      {"productId": 1, "quantity": 2},
      {"productId": 3, "quantity": 1}
    ]
  }'
```

### 主な機能

- ✅ 3種類のイベント サンプルが存在
- ✅ イベント毎に 20種類のグッズ サンプルが存在
- ✅ イベント一覧表示
- ✅ 商品詳細表示
- ✅ カートに商品を追加できる
- ✅ カート内で数量変更・削除ができる
- ✅ 購入者情報を入力できる（名前、メール、電話番号）
- ✅ 購入確定により注文が SQLite へ保存される
- ✅ 在庫不足時は購入できない（チェック機能付き）
- ✅ 購入完了画面が表示される
- ✅ 注文履歴を確認できる
- ✅ シンプルで見やすいUI デザイン

### 技術スタック

- **フロントエンド**: HTML5, CSS3, TypeScript
- **バックエンド**: Node.js, Express
- **データベース**: SQLite
- **ライブラリ**: better-sqlite3

### 注意事項

- カート情報はブラウザの localStorage に保存されます
- サーバー再起動時にサンプルデータが再投入されます
- 本番環境使用時は、パスワード認証やHTTPS対応が必須です
