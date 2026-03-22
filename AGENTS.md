# AGENTS.md - ワークフロー定義

ハーネスエンジニアリングの開発ワークフローです。以下の手順に従い、AI Agents（GitHub Copilot）と協働するプロセスを実行してください。

## 開発フロー全体像

```
Issue作成 → Branch作成 → 実装・検証 → PR作成 → レビュー・マージ → 完了
   ↓
Copilotに依頼
```

## ステップ1: Issue#xx の作成

### 手順
1. GitHubで新規Issueを作成。
2. Issue Templateを使用して、以下項目を記載：
   - **Title**: 機能名（例: `feat: ユーザー認証機能の実装`）
   - **Description**: 詳細な説明、背景、受け入れ条件
   - **Labels**: `enhancement`, `bug`, `documentation` など
   - **Assignee**: 自分をアサイン

### Issue Templateの例

```markdown
## 機能説明
簡潔に機能を説明してください。

## 背景
なぜこの機能が必要なのか説明してください。

## 受け入れ条件
- [ ] 要件1
- [ ] 要件2
- [ ] biomeチェックがパスすること
- [ ] ユニットテスト作成・パス

## 実装詳細
実装の概要を記載してください。
```

## ステップ2: Copilot チャットに依頼

### 依頼内容の形式

```
@copilot Fix issue #xx: [Issue Title]

以下に従ってください：
- AGENTS.md のワークフロー定義に従う
- ブランチ作成・実装・検証・README 更新・Commit・Push・PR 作成まで
- PR 作成時は .github/pull_request_template.md を使用
- 処理完了後、main ブランチに戻る
```

### Copilot がやること

- ✅ main ブランチを最新化
- ✅ ブランチ作成 (`git checkout -b issue/xx/feature-name`)
- ✅ ブランチに移動して処理開始
- ✅ コード生成・実装
- ✅ ロジック実装
- ✅ コメント・ドキュメント作成
- ✅ ユニットテスト作成
- ✅ npm run check で biomeチェック
- ✅ npm run lint で自動修正（必要に応じて）
- ✅ README.md に使用方法を記載
- ✅ git add/commit/push
- ✅ GitHub CLI で PR を自動作成（レポート含む）
- ✅ 処理完了後、main ブランチに戻る

**Note**: ブランチ作成から PR 作成まで、すべての処理を自動実行します。

### 人間がやること

- ⚙️ コードレビュー・承認
- ⚙️ PR をマージ（main ブランチへ）
- ⚙️ Issue を close
- ⚙️ ブランチ削除（GitHub UI から）

## ステップ3: ブランチ命名規則と処理フロー

### ブランチ命名規則

```
issue/issue-xx/brief-description
feature/issue-xx/feature-name
bugfix/issue-xx/bug-name
```

### 処理フロー（Copilot が実行）

```bash
# 1. main を最新化
git fetch origin
git checkout main
git pull origin main

# 2. 新規ブランチ作成・移動　xxには必ず関連するIssue番号を付与すること。
git checkout -b issue/xx/feature-name

# 3. 実装・検証・テスト作成
# （コード生成・ロジック実装）

# 4. コード品質チェック
npm run check
npm run lint    # 必要に応じて自動修正

# 5. README.md にドキュメント追記
# （使用方法、パラメータ、戻り値を記載）

# 6. ファイルをステージング・コミット・プッシュ
git add .
git commit -m "feat(#xx): [機能説明]"
git push origin issue/xx/feature-name

# 7. GitHub CLI で PR を自動作成（レポート含む）
gh pr create --title "feat(#xx): [機能説明]" --template .github/pull_request_template.md

# 8. 処理完了後、元のブランチに戻る
git checkout main
```

## ステップ4: 実装・検証・動作確認（参考）

以下は、Copilot 処理時に実施される検証内容の参考です：

### 実装規約

**必須項目:**
- ✅ シングルクォーテーション（`'string'`）
- ✅ 1行最大100文字以内
- ✅ `strict: true` を満たす
- ✅ biome check がパスすること

### コード品質チェック

```bash
# Biomeチェック（不正なコード検出＆自動修正）
npm run check

# 自動修正を適用
npm run lint

# フォーマット
npm run format

# ビルド検証
npm run build
```

### ガードレール

biome.json で以下を設定済み：
- **Quote Style**: `single` （シングルクォート強制）
- **Line Width**: `100` （100文字超え検出）
- **Semicolons**: `always` （セミコロン必須）
- **Trailing Commas**: `es5` （ES5互換）

ルール違反は CI/CD で検出され、PRマージはブロックされます。

### テスト実施

```bash
# ユニットテスト実行（Jest など）
npm test

# ウォッチモード
npm run dev
```

## ステップ5: README.md に実行手順を記載

新機能に対して、以下を追記してください：

```markdown
### 機能名

#### 使用方法
```typescript
import { functionName } from '@/modules/moduleName';

const result = functionName(param);
```

#### パラメータ
| 項目 | 型 | 説明 |
|------|---|----|
| param | string | 説明 |

#### 戻り値
説明

#### 注意事項
- 注意点1
- 注意点2
```

## ステップ6: Copilot がやることの詳細フロー（参考）

以下は、上記のステップ2-5で自動実行される処理の詳細です：

### ブランチ作成から PR 作成までの全フロー

```bash
# 1. 最新に更新
git fetch origin
git checkout main
git pull origin main

# 2. 新規ブランチ作成・移動
git checkout -b issue/xx/feature-name

# 3. 実装・検証・テスト作成
# （コード生成・ロジック実装）

# 4. コード品質チェック
npm run check
npm run lint    # 必要に応じて自動修正

# 5. README.md にドキュメント追記
# （使用方法、パラメータ、戻り値を記載）

# 6. ファイルをステージング・コミット・プッシュ
git add .
git commit -m "feat(#xx): [機能説明]"
git push origin issue/xx/feature-name

# 7. GitHub CLI で PR を自動作成（レポート含む）
gh pr create --title "feat(#xx): [機能説明]" --template .github/pull_request_template.md

# 8. 処理完了後、元のブランチに戻る
git checkout main
```

### GitHub CLI でのレポート作成

PR 作成時に Copilot が自動的に以下をレポートに含めます：

- **変更内容**: 実装した機能の説明
- **テスト内容**: 実施したテストと結果
- **biome チェック**: 結果（✅ OK / ❌ NG）
- **ビルド検証**: 結果（✅ OK / ❌ NG）
- **Issue 参照**: `Fixes #xx `

## ステップ7: 人間がやること（レビュー・マージ・完了）

### 手順

1. **PR をレビュー**: GitHub で PR をチェック
   - Copilot が作成したレポートを確認
   - コード品質・ロジックを確認
   - CI/CD 結果を確認（`.github/workflows/ci.yml`）

2. **承認・マージ**:
   ```bash
   # GitHub UI から PR をマージ
   # または CLI の場合：
   gh pr merge 99 --squash  # Squash merge を推奨
   ```

3. **Issue を Close**:
   - GitHub Issues で Issue #xx を close
   - または PR にて自動 close（Fixes #xx を含む場合）

4. **ブランチ削除**（オプション）:
   - GitHub UI から `issue/xx/feature-name` ブランチを削除
   - ローカル：`git fetch origin --prune`

### マージ完了後

```bash
# ローカル環境を最新化
git checkout main
git pull origin main

# ローカルブランチ削除
git branch -d issue/xx/feature-name

# リモートブランチの追跡を削除
git fetch origin --prune
```

## コマンドリファレンス

### よく使うコマンド

```bash
# 開発環境セットアップ
npm install

# コード品質チェック（Biome）
npm run check

# 自動修正
npm run lint

# TypeScript コンパイル
npm run build

# ウォッチモード
npm run dev

# テスト実行
npm test
```

### Git コマンド

```bash
# ブランチ一覧表示
git branch -a

# ブランチ切り替え
git checkout -b branch-name

# 変更状況確認
git status

# 変更を確認
git diff

# イテージング
git add .

# コミット
git commit -m "message"

# プッシュ
git push origin branch-name

# ブランチ削除
git branch -d branch-name
git push origin --delete branch-name
```

## 注意事項

1. **Always lint before commit**: biome check を必ず実行
2. **Keep commits clean**: 1つのcommitは1つの変更に
3. **Reference Issue numbers**: コミットメッセージに Issue# を含める
4. **Update README**: 新機能は必ず README.md に記載
5. **No force push**: main ブランチには force push 禁止
6. **Squash if needed**: マージ前に commit をまとめることもある

## トラブルシューティング

### biome check でエラーが出た場合
```bash
# 自動修正を試す
npm run lint

# それでも解決しない場合は、エラー内容をコピーして Copilot に相談
```

### コンフリクトが発生した場合
```bash
# mainの最新を取得
git fetch origin
git rebase origin/main

# コンフリクトを手動解決
# → biome check → コミット → push
```

### 作業をやり直したい場合
```bash
# 最新コミットを取り消し（コミット前）
git reset --soft HEAD~1

# ファイルの変更を取り消し
git checkout -- file-name
```

---

**Version**: 1.0  
**Last Updated**: 2026-03-20
