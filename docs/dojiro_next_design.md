# ドッジボールスコア管理アプリ「ドジロウ！」設計書

Next.js + MariaDB + Dev Container 版（TypeScript + Prisma / .devcontainer + docker-compose）

---

## 1. 概要

### 1.1 アプリ概要

- 名称

  - ドッジボールスコア管理アプリ「ドジロウ！」

- 目的

  - ドッジボールの **試合スコア** をブラウザから簡単に管理する。
  - チーム・選手の **スタッツ（アタック／キャッチ／カット）** を試合単位で記録・参照できるようにする。
  - **試合の上位概念として「大会」や「練習試合」を持ち、試合をグルーピング** する。
  - 各試合に対応する **YouTube 動画リンクを登録し、アプリから視聴** できるようにする。

- 想定利用者
  - チーム関係者（コーチ・スタッフ・スコアラーなど）
  - 将来的には保護者や選手本人が閲覧することも想定

### 1.2 非機能的な前提

- 認証・権限は **必要最低限**

  - v1 では「ログインしたユーザーは全員、編集可能」としてシンプルにする
  - 将来、ロール（Admin / Coach / Viewer など）を追加できる前提の構成にする

- スケール要件
  - 利用者は数チーム〜数十チーム規模
  - 同時編集ユーザーは多くても十数人程度を想定

---

## 2. 技術スタックとシステム構成

### 2.1 技術スタック

- フロントエンド / フルスタックフレームワーク

  - **Next.js（App Router / app ディレクトリ構成）**
  - React 18
  - 言語：**TypeScript（プロジェクト全体を TypeScript 化）**

- バックエンド

  - Next.js の Route Handlers（`app/api/**/route.ts`）で REST 風 API を実装
  - Node.js LTS

- データベース

  - **MariaDB**

    - ストレージエンジン：InnoDB
    - 文字コード：utf8mb4

  - Prisma を ORM として採用する。`prisma/schema.prisma` を用いてスキーマを定義し、`DATABASE_URL` 環境変数経由で接続する。開発時は `npx prisma migrate dev` / `npx prisma db seed` を利用する想定。

- 認証
  - シンプルなメールアドレス + パスワード認証
  - JWT またはセッションクッキー（実装時に選択）  
    本設計では「API を JWT で保護する」想定で記述

### 2.2 開発環境構成（Dev Container + docker-compose）

- VS Code の **Dev Containers** を利用
- `.devcontainer` ディレクトリ配下に設定ファイルを配置
- ルートに `docker-compose.yml` を配置し、Next.js アプリ＋ MariaDB を起動

#### 2.2.1 ディレクトリ構成（例）

```text
project-root/
  app/               # Next.js app ディレクトリ
  public/
  package.json
  docker-compose.yml
  Dockerfile         # Next.js アプリ用（必要に応じて）
  .devcontainer/
    devcontainer.json
```

#### 2.2.2 devcontainer.json（設計方針）

- 役割

  - `docker-compose.yml` を使って、アプリコンテナ + DB コンテナを起動
  - VS Code からアプリコンテナにアタッチして開発する

- 想定設定（イメージ）

```jsonc
{
  "name": "dojiro-next-dev",
  "dockerComposeFile": ["../docker-compose.yml"],
  "service": "app",
  "workspaceFolder": "/workspace",
  "features": {},
  "settings": {
    "terminal.integrated.defaultProfile.linux": "bash"
  },
  "extensions": ["esbenp.prettier-vscode", "dbaeumer.vscode-eslint"],
  "remoteUser": "node"
}
```

#### 2.2.3 docker-compose.yml（設計方針）

- サービス

  - `app`：Next.js アプリ（開発サーバ）
  - `db`：MariaDB

- 役割イメージ

```yaml
services:
  app:
    build: .
    container_name: dojiro-app
    volumes:
      - .:/workspace
    working_dir: /workspace
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - DB_PORT=3306
      - DB_USER=dojiro
      - DB_PASSWORD=dojiro_pass
      - DB_NAME=dojiro
    depends_on:
      - db

  db:
    image: mariadb:11
    container_name: dojiro-db
    environment:
      - MARIADB_ROOT_PASSWORD=local_root_pass
      - MARIADB_DATABASE=dojiro
      - MARIADB_USER=dojiro
      - MARIADB_PASSWORD=dojiro_pass
    volumes:
      - db-data:/var/lib/mysql
    ports:
      - "3307:3306" # ローカルから接続したい場合

volumes:
  db-data:
```

※ 実際の値は `.env` 等で外出しする。

---

## 3. ドメイン設計

### 3.1 上位概念：大会／練習試合

#### 3.1.1 Event（イベント）概念

- 試合（Match）の **上位概念として Event を導入** する
- Event は、「大会」「練習試合の会」「交流戦」などを表す
- Match は必ず 1 つの Event に属する

#### 3.1.2 Event 種別

- `event_type`
  - `tournament` : 大会
  - `practice` : 練習試合（練習会）
  - 将来拡張：`league`, `friendly` など追加可能

### 3.2 ドメインモデル一覧

- User
- Team
- Player
- **Event**（大会・練習試合単位のまとまり）
- Match（試合）
- Set（セット）
- PlayerAction（選手ごとのプレー：アタック／キャッチ／カット）
- （任意）PlayerMatchStats（試合 × 選手の集計結果）

---

## 4. プレースタッツ仕様（詳細）

### 4.1 記録対象

1. アタック

   - 成功（アタック成功）
   - 失敗（アウト／ミス）

2. キャッチ

   - 成功（キャッチ成功）
   - 失敗（キャッチミス）

3. カット
   - ボールをカットして味方につなぐなど
   - **キャッチ成功の一種として扱う**

### 4.2 集計指標

- アタック

  - `attack_success_count`
  - `attack_fail_count`
  - `attack_attempt_count = attack_success_count + attack_fail_count`
  - **アタック率**  
    `attack_rate = attack_success_count / attack_attempt_count`

- キャッチ
  - `catch_success_count`
  - `catch_fail_count`
  - `cut_count` （キャッチ成功に含める）
  - `catch_attempt_count = catch_success_count + catch_fail_count + cut_count`
  - **キャッチ率**  
    `catch_rate = (catch_success_count + cut_count) / (catch_success_count + catch_fail_count + cut_count)`

---

## 5. 画面設計（Next.js ページ構成）

### 5.1 ページ構成（論理）

```text
app/
  layout.jsx         # 共通レイアウト
  page.jsx           # ログイン後ダッシュボード

  login/
    page.jsx         # ログインページ

  events/
    page.jsx         # イベント一覧（大会・練習会の一覧）
    [id]/
      page.jsx       # イベント詳細（イベント内の試合一覧）

  matches/
    page.jsx         # 試合一覧（フィルタ付き）
    [id]/
      page.jsx       # 試合詳細（スコア・スタッツ・YouTube）
      score/
        page.jsx     # 試合のスコア・プレー入力画面

  teams/
    page.jsx         # チーム一覧
    [id]/
      page.jsx       # チーム詳細（試合・選手一覧）

  players/
    [id]/
      page.jsx       # 選手詳細（試合別スタッツ・累計スタッツ）

  stats/
    teams/
      page.jsx       # チーム集計
    players/
      page.jsx       # 選手集計
```

### 5.2 ログイン画面 `/login`

- 入力
  - メールアドレス
  - パスワード
- 動作
  - `/api/auth/login` に POST
  - 成功時：JWT を Cookie or localStorage に保存
  - `/`（ダッシュボード）へリダイレクト
- 認証が必要なページでは、ミドルウェアまたはサーバコンポーネント側でトークン確認

### 5.3 ダッシュボード `/`

- 表示
  - 直近（今日・明日など）の Event 一覧
  - 自チームが関わる次の試合
  - 最近終了した試合（リンク付き）
- 操作
  - Event 追加（大会／練習会の登録）
  - 試合一覧へのリンク

### 5.4 イベント一覧・詳細 `/events`, `/events/[id]`

- 一覧
  - イベント名
  - 種別（大会／練習）
  - 開催日（開始〜終了）
  - 会場（任意）
- 詳細
  - イベントの基本情報
  - このイベントに属する試合一覧（`/matches` と同様項目）
  - イベントに紐づく試合を追加

### 5.5 試合詳細 `/matches/[id]`

- 上部

  - イベント名（リンク）
  - 試合日・開始時間・コート
  - チーム（ホーム vs アウェイ）
  - ステータス（予定／進行中／終了）

- 中央：タブ構成

  1. **スコア**
     - セットごとのスコア一覧
     - 合計スコア
  2. **選手スタッツ**
     - 選手ごとのアタック／キャッチ／カット回数と成功率
  3. **動画**
     - YouTube 埋め込みプレーヤ（`youtube_url` がある場合のみ表示）

- 下部 or ボタン
  - 「スコア・プレー入力」 → `/matches/[id]/score`

### 5.6 スコア・プレー入力 `/matches/[id]/score`

- 上部

  - 試合情報（イベント名、チーム名、現在のセット）

- 左側：セット・スコア管理

  - 現在セット番号、ホーム／アウェイの点数
  - 「セット開始」「セット終了」「試合終了」ボタン

- 右側：プレー入力（PlayerAction）

  - チーム選択（ホーム／アウェイ）
  - 選手選択（ドロップダウン or 背番号ボタン）
  - アクションボタン
    - アタック成功／アタック失敗
    - キャッチ成功／キャッチ失敗
    - カット成功
  - クリックで `/api/matches/[id]/player-actions` に POST

- 下部：簡易スタッツ
  - 選手一覧と現在のカウント・率を表示し、入力のフィードバックに使う

---

## 6. API 設計（Next Route Handlers）

### 6.1 認証（必要最低限）

- `POST /api/auth/login`
  - 入力：`{ email, password }`
  - 処理：
    - users テーブルから該当レコード取得
    - パスワードハッシュとの照合
    - 成功時：JWT 発行
  - 出力例：
    ```json
    {
      "user": {
        "id": 1,
        "name": "山田コーチ"
      },
      "token": "xxxxx.yyyyy.zzzzz"
    }
    ```
- API 側では Authorization ヘッダ（Bearer）を検証するミドルウェアを用意

### 6.2 Event（大会／練習会）

- `GET /api/events`
  - クエリ：`event_type`, `date_from`, `date_to`
- `POST /api/events`
  - 入力例：
    ```json
    {
      "name": "○○地区大会",
      "event_type": "tournament",
      "start_date": "2025-05-01",
      "end_date": "2025-05-03",
      "venue": "市民体育館",
      "note": "6年生大会"
    }
    ```
- `GET /api/events/[id]`
- `PATCH /api/events/[id]`
- `DELETE /api/events/[id]`（論理削除）

### 6.3 Team / Player

- `GET /api/teams`
- `POST /api/teams`
- `GET /api/teams/[id]`
- `PATCH /api/teams/[id]`
- `GET /api/teams/[id]/players`
- `POST /api/teams/[id]/players`
- `GET /api/players/[id]`
- `PATCH /api/players/[id]`

### 6.4 Match / Set / YouTube

- `GET /api/matches`
  - クエリ：`event_id`, `date_from`, `date_to`, `team_id`, `status`
- `POST /api/matches`
  - 入力例：
    ```json
    {
      "event_id": 1,
      "date": "2025-05-01",
      "start_time": "10:00:00",
      "court": "Aコート",
      "team_home_id": 1,
      "team_away_id": 2,
      "status": "scheduled",
      "youtube_url": "https://www.youtube.com/watch?v=XXXX",
      "note": "予選リーグ第1試合"
    }
    ```
- `GET /api/matches/[id]`
- `PATCH /api/matches/[id]`
  - YouTube URL の更新もここで行う
- `DELETE /api/matches/[id]`（論理削除）

- `GET /api/matches/[id]/sets`
- `POST /api/matches/[id]/sets`
  - 新規セット開始
- `PATCH /api/sets/[setId]`
  - セット終了、スコア修正

### 6.5 PlayerAction（プレー記録）

- `POST /api/matches/[id]/player-actions`
  - 入力例：
    ```json
    {
      "set_id": 10,
      "team_id": 1,
      "player_id": 123,
      "action_type": "attack", // 'attack' | 'catch' | 'cut'
      "result": "success" // 'success' | 'fail'（cut は 'success' 固定でよい）
    }
    ```
- `GET /api/matches/[id]/player-actions`
  - 試合内のプレーイベント一覧（デバッグ・詳細分析用）

### 6.6 スタッツ API

- `GET /api/matches/[id]/stats`

  - 試合 × 選手のスタッツを返却
  - レスポンス例：
    ```json
    [
      {
        "player_id": 123,
        "player_name": "山田太郎",
        "attack_success_count": 5,
        "attack_fail_count": 3,
        "attack_rate": 0.625,
        "catch_success_count": 4,
        "catch_fail_count": 2,
        "cut_count": 1,
        "catch_rate": 0.714
      }
    ]
    ```

- `GET /api/stats/teams`

  - チーム別の累計スタッツ（イベント・期間でフィルタ可能）

- `GET /api/stats/players`
  - 選手別の累計スタッツ

---

## 7. データベース設計（MariaDB）

### 7.1 users

| カラム        | 型           | 備考           |
| ------------- | ------------ | -------------- |
| id            | BIGINT PK    | AUTO_INCREMENT |
| name          | VARCHAR(100) |                |
| email         | VARCHAR(255) | UNIQUE         |
| password_hash | VARCHAR(255) |                |
| is_active     | TINYINT(1)   | 0/1            |
| created_at    | DATETIME     |                |
| updated_at    | DATETIME     |                |

### 7.2 teams

| カラム       | 型           | 備考             |
| ------------ | ------------ | ---------------- |
| id           | BIGINT PK    |                  |
| name         | VARCHAR(100) |                  |
| category     | VARCHAR(50)  | 学年・クラス等   |
| organization | VARCHAR(100) | 学校・クラブ名等 |
| is_deleted   | TINYINT(1)   | 0/1              |
| created_at   | DATETIME     |                  |
| updated_at   | DATETIME     |                  |

### 7.3 players

| カラム         | 型           | 備考     |
| -------------- | ------------ | -------- |
| id             | BIGINT PK    |          |
| team_id        | BIGINT FK    | teams.id |
| uniform_number | INT          | 背番号   |
| name           | VARCHAR(100) |          |
| kana           | VARCHAR(100) | 読み仮名 |
| position       | VARCHAR(50)  | 任意     |
| is_deleted     | TINYINT(1)   | 0/1      |
| created_at     | DATETIME     |          |
| updated_at     | DATETIME     |          |

### 7.4 events

| カラム     | 型           | 備考                         |
| ---------- | ------------ | ---------------------------- |
| id         | BIGINT PK    |                              |
| name       | VARCHAR(100) | 「○○ 大会」「練習会」など    |
| event_type | VARCHAR(20)  | 'tournament','practice' など |
| start_date | DATE         | 開始日                       |
| end_date   | DATE         | 終了日                       |
| venue      | VARCHAR(100) | 会場（任意）                 |
| note       | VARCHAR(255) | 備考                         |
| is_deleted | TINYINT(1)   | 0/1                          |
| created_at | DATETIME     |                              |
| updated_at | DATETIME     |                              |

### 7.5 matches

| カラム       | 型           | 備考                                       |
| ------------ | ------------ | ------------------------------------------ |
| id           | BIGINT PK    |                                            |
| event_id     | BIGINT FK    | events.id                                  |
| date         | DATE         | 試合日                                     |
| start_time   | TIME         | 開始予定時刻                               |
| court        | VARCHAR(50)  | コート名                                   |
| team_home_id | BIGINT FK    | teams.id                                   |
| team_away_id | BIGINT FK    | teams.id                                   |
| status       | VARCHAR(20)  | 'scheduled','live','finished','canceled'等 |
| youtube_url  | VARCHAR(255) | YouTube 動画 URL（任意）                   |
| note         | VARCHAR(255) | 備考                                       |
| is_deleted   | TINYINT(1)   | 0/1                                        |
| created_at   | DATETIME     |                                            |
| updated_at   | DATETIME     |                                            |

### 7.6 sets

| カラム     | 型          | 備考                 |
| ---------- | ----------- | -------------------- |
| id         | BIGINT PK   |                      |
| match_id   | BIGINT FK   | matches.id           |
| set_number | INT         | 1,2,3,...            |
| home_score | INT         |                      |
| away_score | INT         |                      |
| status     | VARCHAR(20) | 'live','finished' 等 |
| created_at | DATETIME    |                      |
| updated_at | DATETIME    |                      |

### 7.7 player_actions

| カラム      | 型          | 備考                                      |
| ----------- | ----------- | ----------------------------------------- |
| id          | BIGINT PK   |                                           |
| match_id    | BIGINT FK   | matches.id                                |
| set_id      | BIGINT FK   | sets.id（紐付け不要なら NULL 可）         |
| team_id     | BIGINT FK   | teams.id                                  |
| player_id   | BIGINT FK   | players.id                                |
| action_type | VARCHAR(20) | 'attack','catch','cut'                    |
| result      | VARCHAR(10) | 'success','fail'（cut は 'success' 固定） |
| created_at  | DATETIME    |                                           |

### 7.8 （任意）player_match_stats

| カラム               | 型        | 備考       |
| -------------------- | --------- | ---------- |
| id                   | BIGINT PK |            |
| player_id            | BIGINT FK | players.id |
| match_id             | BIGINT FK | matches.id |
| attack_success_count | INT       |            |
| attack_fail_count    | INT       |            |
| catch_success_count  | INT       |            |
| catch_fail_count     | INT       |            |
| cut_count            | INT       |            |
| created_at           | DATETIME  |            |
| updated_at           | DATETIME  |            |

---

## 8. 認証・権限制約（v1）

- v1 では **簡易ログインのみ** を提供
  - ログインユーザーは全員、Event / Match / Team / Player / PlayerAction の作成・編集が可能とする
  - ロールベースアクセス制御（RBAC）は将来実装予定
- 画面上では「ログインしていない場合は `/login` にリダイレクト」するだけの最低限の制御

---

## 9. 今後の実装ステップ

1. TypeScript 環境の整備

- `tsconfig.json` を追加し、Next.js を `.ts` / `.tsx` で動かせるようにする。
- ESLint / Prettier の TypeScript 設定を追加する。

2. Dev Container と docker-compose の確認

- `.devcontainer/devcontainer.json` と `docker-compose.yml` を使って、Next.js(app) コンテナと MariaDB コンテナが起動することを確認する。

3. Prisma スキーマ設計と初期マイグレーション

- `prisma/schema.prisma` を作成し、設計書のモデルを Prisma のスキーマに落とす。
- `npx prisma migrate dev` で初期マイグレーションを作成し、`prisma/seed.ts` で開発用データを用意する。

4. Prisma Client 用ユーティリティ作成

- `lib/prisma.ts` を作成して、開発時のホットリロードに耐える Prisma Client のシングルトンを実装する。

5. 最低限の Next.js ページ（TypeScript）作成

- `app/layout.tsx`, `app/page.tsx`, `app/login/page.tsx` などの最小ページを作成して動作確認する。

6. API 実装（Prisma を使用）

- `POST /api/auth/login` → `GET/POST /api/events` → `GET/POST /api/matches` → `POST /api/matches/[id]/player-actions` の順で実装する。

7. スコア・プレー入力画面とスタッツ集計

- `/matches/[id]/score` を実装し、`/api/matches/[id]/stats` で集計結果を返す。

8. テスト・CI・README の整備

- Vitest / Jest の導入、GitHub Actions の CI 設定、README に開発手順を記載する。
