# API仕様

## 共通仕様

### ベースURL

```
/api
```

### 認証

- 保護されたエンドポイントはリクエストヘッダに以下が必要:

```
Authorization: Bearer <JWT_TOKEN>
```

- 詳細は [04_auth.md](./04_auth.md) を参照

### レスポンス形式

- Content-Type: `application/json`
- 文字コード: UTF-8

### エラーレスポンス共通形式

```json
{
  "error": "エラーメッセージ"
}
```

### HTTPステータスコード

| コード | 意味 |
|--------|------|
| 200 | 成功（GET, POST一部） |
| 201 | 作成成功（POST） |
| 400 | リクエスト不正（バリデーションエラー） |
| 401 | 未認証（トークンなし・無効） |
| 403 | 権限なし（viewerがPOSTを試みたなど） |
| 404 | リソースが存在しない |
| 500 | サーバー内部エラー |

---

## エンドポイント一覧

| メソッド | パス | 認証 | ロール | 説明 |
|---------|------|------|--------|------|
| GET | /api/health | 不要 | - | ヘルスチェック |
| POST | /api/auth/login | 不要 | - | ログイン |
| POST | /api/auth/logout | 必要 | any | ログアウト |
| GET | /api/events | 必要 | any | イベント一覧 |
| POST | /api/events | 必要 | admin | イベント作成 |
| GET | /api/teams | 必要 | any | チーム一覧 |
| POST | /api/teams | 必要 | admin | チーム作成 |
| GET | /api/matches | 必要 | any | 試合一覧 |
| POST | /api/matches | 必要 | admin | 試合作成 |
| GET | /api/matches/:id | 必要 | any | 試合詳細 |
| POST | /api/matches/:id/player-actions | 必要 | admin | プレーアクション記録 |
| GET | /api/matches/:id/player-actions | 必要 | any | プレーアクション一覧 |
| GET | /api/matches/:id/stats | 必要 | any | 試合スタッツ取得 |

---

## 各エンドポイント詳細

---

### GET /api/health

**概要:** サーバーの稼働確認。認証不要。

**リクエスト:** なし

**レスポンス例（200）:**
```json
{
  "status": "ok"
}
```

---

### POST /api/auth/login

**概要:** メールアドレスとパスワードでログインし、JWTトークンを取得する。

**認証:** 不要

**リクエストボディ:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| email | string | YES | ユーザーのメールアドレス |
| password | string | YES | 平文パスワード |

**レスポンス（200）:**
```json
{
  "user": {
    "id": 1,
    "name": "管理者",
    "email": "admin@example.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**副作用:**
- `auth-token` という名前のhttpOnly Cookieにトークンをセットする（ページルート認証用）

**エラーケース:**
| ステータス | 条件 |
|-----------|------|
| 400 | email または password が未指定 |
| 401 | メールアドレスが存在しない、または パスワード不一致 |

---

### POST /api/auth/logout

**概要:** ログアウトし、現在のトークンを無効化する。

**認証:** 必要（Bearer Token）

**リクエストボディ:** なし

**レスポンス（200）:**
```json
{
  "message": "Logged out successfully"
}
```

**副作用:**
- DBのユーザーレコードの `token_version` を+1インクリメントする（既存トークンを全て無効化）
- `auth-token` Cookieをクリアする

---

### GET /api/events

**概要:** 論理削除されていないイベント一覧を返す。

**認証:** 必要

**クエリパラメータ:** なし（現行実装）

**レスポンス（200）:**
```json
[
  {
    "id": 1,
    "name": "○○地区大会",
    "eventType": "tournament",
    "startDate": "2025-05-01T00:00:00.000Z",
    "endDate": "2025-05-03T00:00:00.000Z",
    "venue": "市民体育館",
    "note": "6年生大会",
    "isDeleted": false,
    "createdAt": "2025-04-01T10:00:00.000Z",
    "updatedAt": "2025-04-01T10:00:00.000Z"
  }
]
```

---

### POST /api/events

**概要:** 新しいイベントを作成する。

**認証:** 必要（adminのみ）

**リクエストボディ:**
```json
{
  "name": "○○地区大会",
  "eventType": "tournament",
  "startDate": "2025-05-01",
  "endDate": "2025-05-03",
  "venue": "市民体育館",
  "note": "6年生大会"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| name | string | YES | イベント名 |
| eventType | string | NO | 'tournament', 'practice', 'friendly' のいずれか |
| startDate | string (ISO 8601) | NO | 開始日 |
| endDate | string (ISO 8601) | NO | 終了日 |
| venue | string | NO | 会場名 |
| note | string | NO | 備考 |

**レスポンス（201）:**
```json
{
  "id": 1,
  "name": "○○地区大会",
  "eventType": "tournament",
  "startDate": "2025-05-01T00:00:00.000Z",
  "endDate": "2025-05-03T00:00:00.000Z",
  "venue": "市民体育館",
  "note": "6年生大会",
  "isDeleted": false,
  "createdAt": "2025-04-01T10:00:00.000Z",
  "updatedAt": "2025-04-01T10:00:00.000Z"
}
```

**エラーケース:**
| ステータス | 条件 |
|-----------|------|
| 400 | name が未指定 |
| 403 | adminロールでない |

---

### GET /api/teams

**概要:** 論理削除されていないチーム一覧を返す。各チームの選手リストを含む。

**認証:** 必要

**レスポンス（200）:**
```json
[
  {
    "id": 1,
    "name": "Aチーム",
    "category": "men",
    "organization": "○○スポーツクラブ",
    "isDeleted": false,
    "createdAt": "2025-04-01T10:00:00.000Z",
    "updatedAt": "2025-04-01T10:00:00.000Z",
    "players": [
      {
        "id": 1,
        "teamId": 1,
        "uniformNumber": 10,
        "name": "山田太郎",
        "kana": "やまだたろう",
        "position": null,
        "isDeleted": false,
        "createdAt": "2025-04-01T10:00:00.000Z",
        "updatedAt": "2025-04-01T10:00:00.000Z"
      }
    ]
  }
]
```

---

### POST /api/teams

**概要:** 新しいチームを作成する。

**認証:** 必要（adminのみ）

**リクエストボディ:**
```json
{
  "name": "Aチーム",
  "category": "men",
  "organization": "○○スポーツクラブ"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| name | string | YES | チーム名 |
| category | string | NO | カテゴリ（'men', 'women', 'mixed' など） |
| organization | string | NO | 所属組織・クラブ名 |

**レスポンス（201）:**
```json
{
  "id": 1,
  "name": "Aチーム",
  "category": "men",
  "organization": "○○スポーツクラブ",
  "isDeleted": false,
  "createdAt": "2025-04-01T10:00:00.000Z",
  "updatedAt": "2025-04-01T10:00:00.000Z"
}
```

**エラーケース:**
| ステータス | 条件 |
|-----------|------|
| 400 | name が未指定 |
| 403 | adminロールでない |

---

### GET /api/matches

**概要:** 論理削除されていない試合一覧を返す。各試合のイベント情報を含む。

**認証:** 必要

**レスポンス（200）:**
```json
[
  {
    "id": 1,
    "eventId": 1,
    "date": "2025-05-01T00:00:00.000Z",
    "startTime": "2025-05-01T10:00:00.000Z",
    "court": "Aコート",
    "teamHomeId": 1,
    "teamAwayId": 2,
    "status": "scheduled",
    "youtubeUrl": null,
    "note": "予選リーグ第1試合",
    "isDeleted": false,
    "createdAt": "2025-04-01T10:00:00.000Z",
    "updatedAt": "2025-04-01T10:00:00.000Z",
    "event": {
      "id": 1,
      "name": "○○地区大会",
      "eventType": "tournament"
    }
  }
]
```

---

### POST /api/matches

**概要:** 新しい試合を作成する。

**認証:** 必要（adminのみ）

**リクエストボディ:**
```json
{
  "eventId": 1,
  "date": "2025-05-01",
  "startTime": "2025-05-01T10:00:00.000Z",
  "court": "Aコート",
  "teamHomeId": 1,
  "teamAwayId": 2,
  "status": "scheduled",
  "youtubeUrl": "https://www.youtube.com/watch?v=XXXX",
  "note": "予選リーグ第1試合"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| eventId | integer | NO | 所属イベントID |
| date | string (ISO 8601) | NO | 試合日 |
| startTime | string (ISO 8601) | NO | 開始時刻 |
| court | string | NO | コート名 |
| teamHomeId | integer | NO | ホームチームID |
| teamAwayId | integer | NO | アウェイチームID |
| status | string | NO | 'scheduled', 'in-progress', 'completed', 'canceled' |
| youtubeUrl | string | NO | YouTube動画URL |
| note | string | NO | 備考 |

**レスポンス（201）:** 作成された試合オブジェクト（GET /api/matchesの1要素と同形式）

**エラーケース:**
| ステータス | 条件 |
|-----------|------|
| 403 | adminロールでない |

---

### GET /api/matches/:id

**概要:** 指定した試合の詳細を取得する。イベント・ホーム/アウェイチーム（選手リスト含む）を含む。

**認証:** 必要

**パスパラメータ:**
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | integer | 試合ID |

**レスポンス（200）:**
```json
{
  "id": 1,
  "eventId": 1,
  "date": "2025-05-01T00:00:00.000Z",
  "startTime": "2025-05-01T10:00:00.000Z",
  "court": "Aコート",
  "teamHomeId": 1,
  "teamAwayId": 2,
  "status": "scheduled",
  "youtubeUrl": null,
  "note": null,
  "isDeleted": false,
  "createdAt": "2025-04-01T10:00:00.000Z",
  "updatedAt": "2025-04-01T10:00:00.000Z",
  "event": {
    "id": 1,
    "name": "○○地区大会",
    "eventType": "tournament"
  },
  "teamHome": {
    "id": 1,
    "name": "Aチーム",
    "category": "men",
    "organization": "○○スポーツクラブ",
    "players": [
      {
        "id": 1,
        "uniformNumber": 10,
        "name": "山田太郎",
        "kana": "やまだたろう",
        "position": null
      }
    ]
  },
  "teamAway": {
    "id": 2,
    "name": "Bチーム",
    "category": "men",
    "organization": "△△クラブ",
    "players": [
      {
        "id": 5,
        "uniformNumber": 7,
        "name": "鈴木次郎",
        "kana": "すずきじろう",
        "position": null
      }
    ]
  }
}
```

**注意:**
- チームの `players` は `uniformNumber` の昇順でソートされる
- `is_deleted = true` の選手は除外される

**エラーケース:**
| ステータス | 条件 |
|-----------|------|
| 404 | 指定IDの試合が存在しない |

---

### POST /api/matches/:id/player-actions

**概要:** 試合中に選手のプレーアクションを記録する。記録と同時にPlayerMatchStatsを更新する。

**認証:** 必要（adminのみ）

**パスパラメータ:**
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | integer | 試合ID |

**リクエストボディ:**
```json
{
  "playerId": 1,
  "actionType": "attack",
  "result": "success"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| playerId | integer | YES | 選手ID |
| actionType | string | YES | 'attack', 'catch', 'cut' のいずれか |
| result | string | YES | 'success' または 'fail'。cutの場合は常に'success' |

**レスポンス（201）:**
```json
{
  "id": 100,
  "matchId": 1,
  "setId": null,
  "teamId": 1,
  "playerId": 1,
  "actionType": "attack",
  "result": "success",
  "createdAt": "2025-05-01T10:15:00.000Z"
}
```

**副作用:**
- `player_match_stats` に対して `(player_id, match_id)` のキーでUPSERT処理を実行
- 対応するカウンター列を+1インクリメント

| actionType | result | インクリメントされる列 |
|-----------|--------|----------------------|
| attack | success | attack_success_count |
| attack | fail | attack_fail_count |
| catch | success | catch_success_count |
| catch | fail | catch_fail_count |
| cut | success | cut_count |

**エラーケース:**
| ステータス | 条件 |
|-----------|------|
| 400 | playerId, actionType, result のいずれかが未指定または不正値 |
| 403 | adminロールでない |
| 404 | 指定のplayerIdが存在しない |

---

### GET /api/matches/:id/player-actions

**概要:** 指定試合のプレーアクション一覧を返す。

**認証:** 必要

**パスパラメータ:**
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | integer | 試合ID |

**レスポンス（200）:**
```json
[
  {
    "id": 100,
    "matchId": 1,
    "setId": null,
    "teamId": 1,
    "playerId": 1,
    "actionType": "attack",
    "result": "success",
    "createdAt": "2025-05-01T10:15:00.000Z"
  }
]
```

---

### GET /api/matches/:id/stats

**概要:** 指定試合の選手別スタッツ集計を返す。PlayerMatchStatsから取得し、選手名を付与して返す。

**認証:** 必要

**パスパラメータ:**
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| id | integer | 試合ID |

**レスポンス（200）:**
```json
[
  {
    "playerId": 1,
    "playerName": "山田太郎",
    "matchId": 1,
    "attackSuccessCount": 5,
    "attackFailCount": 3,
    "catchSuccessCount": 4,
    "catchFailCount": 2,
    "cutCount": 1,
    "attackRate": 0.625,
    "catchRate": 0.714
  }
]
```

**計算式:**

| フィールド | 計算式 |
|-----------|--------|
| attackRate | attackSuccessCount ÷ (attackSuccessCount + attackFailCount)。試行数が0の場合は0 |
| catchRate | (catchSuccessCount + cutCount) ÷ (catchSuccessCount + catchFailCount + cutCount)。試行数が0の場合は0 |

**注意:**
- PlayerMatchStatsが存在する選手のみ返す（アクションが1件もない選手は含まない）
- `playerName` はPlayersテーブルから引いた `name` 列の値

---

## 未実装エンドポイント（将来実装予定）

以下は設計書には存在するが現行実装にはないエンドポイント。

```
GET    /api/events/:id
PATCH  /api/events/:id
DELETE /api/events/:id  (is_deleted = true に更新)

GET    /api/teams/:id
PATCH  /api/teams/:id
DELETE /api/teams/:id   (is_deleted = true に更新)

GET    /api/teams/:id/players
POST   /api/teams/:id/players

GET    /api/players/:id
PATCH  /api/players/:id

GET    /api/matches/:id/sets
POST   /api/matches/:id/sets
PATCH  /api/sets/:setId

PATCH  /api/matches/:id
DELETE /api/matches/:id  (is_deleted = true に更新)

GET    /api/stats/teams
GET    /api/stats/players
```
