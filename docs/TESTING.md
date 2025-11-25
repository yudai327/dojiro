# テスト実行ガイド

このプロジェクトには、ユニットテストと統合テストの 2 種類のテストスイートが含まれています。

## ユニットテスト

プロジェクト構造、設定、API ルートの存在を検証します。dev server の起動が不要です。

```bash
# 単一実行
npm run test

# Watch モード（ファイル変更時に自動再実行）
npm run test:watch

# UI で実行
npm run test:ui
```

**出力例:**

```
✓ Project Structure (3)
✓ Configuration Validation (3)
✓ API Routes (3)
✓ Documentation (3)

Test Files  1 passed (1)
Tests       12 passed (12)
```

## 統合テスト

実際の API エンドポイントをテストします。**dev server が起動している必要があります**。

### 前提条件

1. **dev server を起動**

   ```bash
   npm run dev
   # ポート 3000（または 3001, 3002）で起動確認
   ```

2. **別のターミナルで統合テストを実行**
   ```bash
   npm run test:integration
   ```

### 統合テストの内容

- ✅ ヘルスチェック (`GET /api/health`)
- ✅ Events CRUD
- ✅ Teams CRUD
- ✅ Matches CRUD
- ✅ 認証テスト（ログイン成功/失敗）

### 統合テスト実行例

```bash
# Terminal 1: dev server
$ npm run dev
# ⚠ Port 3000 is in use, trying 3001 instead.
# ▲ Next.js 14.0.0
# - Local: http://localhost:3001
# ✓ Ready in 20.8s

# Terminal 2: 統合テスト実行
$ npm run test:integration

# 出力:
# ✓ Health Check (1)
# ✓ Events CRUD (2)
# ✓ Teams CRUD (2)
# ✓ Matches CRUD (2)
# ✓ Authentication (3)
#
# Test Files  1 passed (1)
# Tests       10 passed (10)
```

## CI/CD での自動テスト実行

GitHub Actions ワークフロー（`.github/workflows/ci.yml`）では以下が自動実行されます：

1. **Lint 検査** — ESLint で構文チェック
2. **ビルド** — `npm run build`
3. **DB マイグレーション** — `npx prisma db push`
4. **DB シード** — `npx prisma db seed`
5. **統合テスト** — `npm run test:integration`

統合テストは GitHub Actions 内の MariaDB サービスに対して実行されます。

### ワークフローの詳細

```yaml
- name: Setup Prisma Database
  env:
    DATABASE_URL: mysql://dojiro:dojiro_pass@localhost:3306/dojiro_test
  run: |
    npx prisma db push --accept-data-loss
    npx prisma db seed

- name: Run Unit & Integration Tests
  run: npm run test:integration
  env:
    DATABASE_URL: mysql://dojiro:dojiro_pass@localhost:3306/dojiro_test
```

## トラブルシューティング

### 統合テストで接続エラーが出る

**エラー:**

```
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**解決方法:**

1. dev server が起動しているか確認

   ```bash
   curl http://localhost:3000/api/health
   ```

2. dev server が別のポートで起動している場合、テストファイルを修正
   ```typescript
   const API_BASE = 'http://localhost:3001/api'; // ポート 3001 に変更
   ```

### テストのポート競合

複数のターミナルで dev server が起動している場合：

```bash
# 既存プロセスを終了
pkill -f "next dev"

# 再度起動
npm run dev
```

## テストの追加方法

### ユニットテストを追加

`__tests__/unit.test.ts` に新しいテストブロックを追加：

```typescript
describe('新しい機能', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### 統合テストを追加

`__tests__/api.integration.test.ts` に新しいテストを追加：

```typescript
describe('新しい API', () => {
  it('should return data', async () => {
    const res = await fetch('http://localhost:3000/api/new-endpoint');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('id');
  });
});
```

## ベストプラクティス

1. **ユニットテストを優先実行** — `npm run test` で基本検証
2. **dev server 起動後に統合テスト実行** — `npm run test:integration`
3. **CI では全自動実行** — GitHub Actions が DB 設定から実行
4. **テストコードも TypeScript で** — 型安全性を確保

## 関連コマンド

```bash
npm run test              # ユニットテスト実行
npm run test:watch       # ユニットテスト Watch モード
npm run test:ui          # ユニットテスト UI
npm run test:integration # 統合テスト（要 dev server）
npm run lint             # Lint 検査
npm run build            # 本番ビルド
```
