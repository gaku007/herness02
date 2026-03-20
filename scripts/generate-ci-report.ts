#!/usr/bin/env node

/**
 * CI チェック結果レポート生成スクリプト
 * npm run check/build/format の結果をレポート化
 */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface CheckResult {
  name: string;
  command: string;
  success: boolean;
  output: string;
  duration: number;
}

const results: CheckResult[] = [];

function runCheck(name: string, command: string): CheckResult {
  const startTime = Date.now();
  let success = true;
  let output = '';

  try {
    output = execSync(command, { encoding: 'utf-8' });
  } catch (error: unknown) {
    success = false;
    if (error instanceof Error) {
      output = error.message;
    }
  }

  const duration = Date.now() - startTime;
  const result: CheckResult = { name, command, success, output, duration };
  results.push(result);
  return result;
}

// チェック実行
console.log('🔍 CI チェックを実行中...\n');

runCheck('Biome チェック', 'npm run check');
runCheck('TypeScript ビルド', 'npm run build');
runCheck('フォーマット検証', 'npm run format -- --check');

// レポート生成
const timestamp = new Date().toISOString();
const report = generateMarkdownReport(results, timestamp);
const reportPath = resolve('CI_REPORT.md');
writeFileSync(reportPath, report);

console.log('\n✅ CI レポート生成完了');
console.log(`📄 ${reportPath}`);

function generateMarkdownReport(results: CheckResult[], timestamp: string): string {
  const allSuccess = results.every(r => r.success);
  const statusEmoji = allSuccess ? '✅' : '❌';
  const statusText = allSuccess ? 'PASSED' : 'FAILED';

  let markdown = `# CI チェック結果レポート

**実行時刻**: ${timestamp}  
**総合結果**: ${statusEmoji} ${statusText}

---

## チェック結果サマリー

| チェック | 結果 | 実行時間 |
|---------|------|--------|
`;

  for (const result of results) {
    const resultEmoji = result.success ? '✅' : '❌';
    const duration = `${result.duration}ms`;
    markdown += `| ${result.name} | ${resultEmoji} ${result.success ? 'PASS' : 'FAIL'} | ${duration} |\n`;
  }

  markdown += '\n---\n\n## 詳細結果\n\n';

  for (const result of results) {
    const resultEmoji = result.success ? '✅' : '❌';
    markdown += `### ${resultEmoji} ${result.name}\n\n`;
    markdown += '```\n';
    markdown += result.command;
    markdown += '\n```\n\n';

    if (result.output) {
      markdown += '**出力**:\n\n```\n';
      markdown += result.output.substring(0, 1000);
      if (result.output.length > 1000) {
        markdown += '\n... (省略)\n';
      }
      markdown += '\n```\n\n';
    }
  }

  markdown += '---\n\n';
  markdown += '**自動生成**: このレポートは CI パイプラインにより自動生成されました。\n';

  return markdown;
}
