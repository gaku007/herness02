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

## 🎪 元気になるEC - 地下アイドルグッズ販売サイト

若者の地下アイドル需要に対応したECサイト機能を実装しました。イベントのチケット販売やグッズ販売を実現します。

### 機能説明

- **複数イベント対応**: 3種類のイベント（ライブイベント、ファンミーティング、グッズ販売展）をサンプルで提供
- **豊富なグッズ展開**: 各イベント毎に20種類のグッズを提供
- **ボタンクリック処理**: イベント選択でグッズ一覧が動的に切り替わる
- **ショッピングカート**: グッズをカートに追加して合計金額を表示
- **シンプルなUI**: 見やすくシンプルなデザインで直感的に操作可能

### 使用方法

#### ローカル開発環境での起動

```bash
# 開発サーバー起動
npm run dev

# ブラウザで以下にアクセス
http://localhost:5173
```

#### HTML ファイルの確認

```bash
# コンパイル済みの JavaScript を確認
# index.html で EC サイトが起動
dist/ec-site.js  # コンパイル後の JavaScript
```

#### TypeScript 実装コード

**メインファイル**: [src/ec-site.ts](src/ec-site.ts)

```typescript
import { ECSite } from './dist/ec-site.js';

const ecSite = new ECSite();
ecSite.init();
```

#### クラスとインターフェース

| 要素 | 説明 |
|------|------|
| `ECSite` | EC サイト全体を管理するメインクラス |
| `Goods` | グッズ情報（ID、名前、価格、絵文字） |
| `Event` | イベント情報（ID、名前、説明、グッズリスト） |
| `CartItem` | カートアイテム（グッズID、名前、価格、数量） |

#### 主要メソッド

| メソッド | 説明 |
|---------|------|
| `init()` | EC サイトの初期化 |
| `renderGoods()` | 現在のイベントのグッズを表示 |
| `addToCart(goods)` | グッズをカートに追加 |
| `updateCartDisplay()` | カート情報を更新・表示 |

#### サンプルイベント

1. **ライブイベント**: 推し活の最高の瞬間をグッズで応援
   - 20種類のライブグッズを提供
   - 価格: ¥1,000 ～ ¥2,900

2. **ファンミーティング**: 推しとの一期一会の思い出を永遠に
   - 20種類のファンミ記念品を提供
   - 価格: ¥1,000 ～ ¥2,900

3. **グッズ販売展**: 限定グッズが一堂に集結
   - 20種類の限定グッズを提供
   - 価格: ¥1,000 ～ ¥2,900

#### 技術スタック

- **HTML5**: マークアップ
- **TypeScript**: ビジネスロジック実装
- **CSS3**: レスポンシブデザイン
- **ES2020 Module**: モジュール管理

#### 画面構成

1. **ヘッダー**: サイトタイトルと説明
2. **イベント選択ボタン**: 3つのイベントボタン
3. **グッズグリッド**: イベント毎の20種類のグッズ表示
4. **カート表示**: 右下に固定表示、現在のカート内容と合計金額

#### ユーザーインタラクション

1. イベントボタンをクリック → グッズ一覧が切り替わる
2. 「カートに追加」ボタン → グッズをカートに追加
3. カート情報が右下に自動更新される
4. 複数のグッズを追加可能、合計金額を自動計算

## 📄 ライセンス

MIT License

---

**プロジェクト開始**: 2026-03-20
**最終更新**: 2026-03-22
**Biome Version**: ^1.9.0
**TypeScript Version**: ^5.3.0
