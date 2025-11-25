# ドジロウ！ — TypeScript + Prisma + Next.js

ドッジボールスコア管理アプリの開発版です。

## 技術スタック

- **フロントエンド/フルスタック**: Next.js 14 (App Router) + React 18 + TypeScript
- **バックエンド API**: Next.js Route Handlers (`app/api/**/route.ts`)
- **データベース**: MariaDB 11 + Prisma 5.x ORM
- **認証**: JWT (Bearer Token)
- **環境**: Docker + Docker Compose + Dev Container

## 開発環境のセットアップ

### 前提条件

- Docker / Docker Compose
- VS Code with Dev Container extension

### クイックスタート（Dev Container で開く場合）

1. VS Code でこのプロジェクトを開く
2. コマンドパレット `Ctrl+Shift+P` → "Dev Container: Reopen in Container"
3. コンテナが起動後、ターミナルで実行：
   ```bash
   npm install
   npx prisma db push --accept-data-loss
   npx prisma db seed
   npm run dev
   ```
4. ブラウザで http://localhost:3000 を開く

### ローカルセットアップ（Docker Compose で MariaDB を起動する場合）

```bash
# 1. MariaDB コンテナを起動
docker-compose up -d

# 2. 依存関係をインストール
npm install

# 3. .env ファイルを作成（.env.example をコピー）
cp .env.example .env

# 4. Prisma スキーマを DB に反映
npx prisma db push --accept-data-loss

# 5. サンプルデータを投入
npx prisma db seed

# 6. 開発サーバを起動
npm run dev
```

## API エンドポイント

### 認証不要（公開）

- `GET /api/health` — ヘルスチェック
- `POST /api/auth/login` — ログイン（JWT 発行）

### 認証必須（JWT Bearer Token）

- `GET /api/events`, `POST /api/events` — イベント CRUD
- `GET /api/teams`, `POST /api/teams` — チーム CRUD
- `GET /api/matches`, `POST /api/matches` — 試合 CRUD
- `GET /api/matches/[id]` — 試合詳細取得
- `POST /api/matches/[id]/player-actions` — プレー記録作成
- `GET /api/matches/[id]/player-actions` — プレー一覧
- `GET /api/matches/[id]/stats` — スタッツ集計

### 認証の使用方法

1. **ログイン** — JWT トークンを取得

   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"changeme"}'

   # レスポンス:
   # {"user":{"id":1,"name":null,"email":"admin@example.com"},"token":"eyJhbGciOiJIUzI1NiIs..."}
   ```

2. **API呼び出し** — `Authorization: Bearer <token>` ヘッダで認証
   ```bash
   curl -X GET http://localhost:3000/api/matches \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
   ```

## 主要コマンド

```bash
npm run dev              # 開発サーバ起動
npm run build            # 本番ビルド
npm run lint             # Lint 実行
npm run format           # Prettier で整形
npm run test             # Vitest 実行（Watch モード）
npm run test:ui          # Vitest UI で実行
npm run test:integration # 統合テスト実行
npx prisma db seed      # シード実行
npx prisma studio      # DB GUI
```

## サンプルデータ

Seed 実行後、以下のサンプルが投入されます：

- **ユーザー**: `admin@example.com` / `changeme`
- **チーム**: チームA、チームB
- **選手**: サンプル選手 2 名

## トラブルシューティング

- **DB 接続エラー**: `.env` の `DATABASE_URL` を確認、Docker Compose が起動しているか確認
- **Prisma エラー**: `npx prisma generate && npx prisma db push` を再実行
- **ポート 3000 が使用中**: `docker-compose.yml` で別ポートに変更するか既存プロセスを終了
