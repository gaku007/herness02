# 開発ガイド

ハーネスエンジニアリング プロジェクトの開発者向けガイドです。

## はじめに

このプロジェクトは、GitHub Copilot を活用した AI 協働開発を実現します。
以下のドキュメントを確認してから開発を開始してください：

- [README.md](README.md) - プロジェクト概要
- [AGENTS.md](AGENTS.md) - ワークフロー定義

## 開発環境のセットアップ

### 必須ツール

- Node.js 18.0 以上
- npm 9.0 以上
- Git
- Visual Studio Code（推奨）
- GitHub Copilot 拡張機能

### インストール手順

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd herness02

# 2. 依存パッケージをインストール
npm install

# 3. 動作確認
npm run check
npm run build
```

## 実装規約の詳細

### 1. シングルクォーテーション

❌ **NG パターン**
```typescript
const message = "Hello, World!";
const name = `User`;
```

✅ **OK パターン**
```typescript
const message = 'Hello, World!';
const name = 'User';
```

**例外**: テンプレートリテラル内は許可
```typescript
const greeting = 'Hello, ' + name;
const template = `Value: ${value}`;  // ✅ OK
```

### 2. 1行100文字以内

❌ **NG パターン**
```typescript
export const veryLongFunctionNameWithManyParametersAndComplexLogic = (param1, param2, param3) => {
  return someLongExpressionThatExceedsBoundaryLimitForReadability;
};
```

✅ **OK パターン**
```typescript
export const functionName = (
  param1: Type1,
  param2: Type2,
  param3: Type3,
): ReturnType => {
  const result = complexLogic(
    param1,
    param2,
    param3,
  );
  return result;
};
```

Line Width の判定は Biome が行います：
```bash
npm run check  # 100文字超えを検出
```

### 3. 型安全性 (TypeScript strict mode)

❌ **NG パターン**
```typescript
const value: any = getData();  // ✖️ any は禁止
let result;  // ✖️ 型推論ができない可能性
```

✅ **OK パターン**
```typescript
const value: DataType = getData();
let result: ResultType = initialValue;
```

設定は `tsconfig.json` で適用：
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

## コードを書く前のチェックリスト

```bash
# ✓ 依存関係が最新
npm install

# ✓ 既存コードが valid
npm run check

# ✓ ビルド確認
npm run build
```

## 実装手順

### ステップ1: Issue を作成

GitHub で新規 Issue を作成します。
テンプレート: `.github/ISSUE_TEMPLATE/feature.md`

```markdown
タイトル: feat: [機能名]
説明: 詳細な要件と受け入れ条件を記載
```

### ステップ2: ブランチを作成

```bash
git checkout main
git pull origin main
git checkout -b issue/XX/feature-name
```

### ステップ3: Copilot に依頼

Copilot Chat で以下のように依頼します：

```
@copilot Fix issue #XX: [Issue Title]

以下の要件に従ってください：
1. AGENTS.mdワークフローに従う
2. npm run check を通す
3. シングルクォーテーション使用
4. 1行最大100文字以内
5. TypeScript strict mode 対応
6. 新機能は README.md に記載
```

### ステップ4: コード品質チェック

```bash
# Issue 別にブランチに移動
git checkout issue/XX/feature-name

# Copilot が生成したコードを確認
ls -la src/

# コード品質チェック（Biome）
npm run check

# エラーがあれば自動修正
npm run lint

# ビルド検証
npm run build

# 型チェック
npm run build  # tsc が strict mode で検証
```

### ステップ5: README.md を更新

新機能の使用方法を追記してください：

```markdown
### 新機能名

#### 使用方法
\`\`\`typescript
import { functionName } from '@/modules/moduleName';

const result = functionName(params);
\`\`\`

#### パラメータ
| 項目 | 型 | 説明 |
|------|-----|------|
| param | string | 説明 |

#### 戻り値
説明

#### 例
\`\`\`typescript
// 例
result = functionName('input');
\`\`\`
```

### ステップ6: Commit & Push

```bash
# ファイルをステージング
git add .

# コミット（Issue参照を含める）
git commit -m "feat(#XX): 機能名の説明"

# プッシュ
git push origin issue/XX/feature-name
```

### ステップ7: PR を作成

GitHub で PR を作成します：

```markdown
タイトル: fix(#XX): Issue タイトル
説明: 変更内容、テスト内容を記載
テンプレート: .github/pull_request_template.md を使用
```

チェックリスト：
- [ ] npm run check OK
- [ ] npm run build OK
- [ ] README.md 更新済み
- [ ] Issue #XX を参照

### ステップ8: レビュー・マージ・完了

1. メンバーによるコードレビュー
2. CI/CD パイプラインが全て green
3. PR を Squash Merge
4. Issue を close
5. ブランチを削除

```bash
git checkout main
git pull origin main
git branch -D issue/XX/feature-name
```

## 日常的に使うコマンド

```bash
# 開発ウォッチモード
npm run dev

# コード品質チェック
npm run check

# 自動修正
npm run lint

# フォーマット
npm run format

# ビルド
npm run build

# テスト（設定後）
npm test
```

## Biome トラブルシューティング

### シングルクォーテーション エラー

```
error[1]: String must use single quotes
  ┌─ src/file.ts:1:10
  │
1 │ const x = "hello";
  │           ^^^^^^^^
  │
  = Use single quotes instead.
```

**→ 修正**
```bash
npm run lint  # 自動修正
```

### 行数超過 エラー

```
error[2]: Line is too long （102 chars）
  ┐ src/file.ts:5:100
  │
5 │ const veryLongVariableName = functionCall(param1, param2, param3, param4, param5);
  │ ^^^^^^...^^^^^^
```

**→ 修正** 改行する
```typescript
const result = functionCall(
  param1,
  param2,
  param3,
  param4,
  param5,
);
```

### TypeScript 型エラー

```
error TS2531: Object is possibly 'undefined'
  src/file.ts:10 - error TS2531
10   const value = obj.prop;
          ^^^^^^^^^^^^
```

**→ 修正** strict mode に対応
```typescript
const value = obj?.prop ?? defaultValue;
```

## PR マージ時の注意事項

- [ ] Commit は squash
- [ ] Issue 番号を参照
- [ ] CI/CD が全て pass
- [ ] Code review 済み
- [ ] README.md 更新済み

## パフォーマンス・セキュリティ

### パフォーマンス

- 不要なインポートは削除（Biome が検査）
- 箱物な処理は避ける
- メモリリークの可能性を check

### セキュリティ

- 秘密情報は `.env` に
- 外部入力は検証
- 依存パッケージは定期更新

## サポート

問題が発生した場合：

1. [AGENTS.md](AGENTS.md) を確認
2. GitHub Issues で Issue を作成
3. GitHub Copilot に相談

---

**Last Updated**: 2026-03-20
