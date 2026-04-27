# データモデル仕様

すべてのエンティティはリレーショナルデータベースを前提として設計されています。
フィールド名はスネークケース（DB列名）で記述します。

---

## 1. エンティティ一覧

| エンティティ | テーブル名 | 説明 |
|-------------|------------|------|
| User | users | 認証ユーザー |
| Team | teams | チーム |
| Player | players | 選手 |
| Event | events | 大会・練習会 |
| Match | matches | 試合 |
| Set | sets | セット（試合内の1セット） |
| PlayerAction | player_actions | プレーアクション記録 |
| PlayerMatchStats | player_match_stats | 試合×選手の集計スタッツ |

---

## 2. エンティティ詳細

### 2.1 User（ユーザー）

認証・認可に使用するユーザーアカウント。

| 列名 | 型 | NULL | デフォルト | 説明 |
|------|----|------|------------|------|
| id | INTEGER | NO | AUTO | 主キー（自動採番） |
| name | VARCHAR(100) | YES | NULL | 表示名 |
| email | VARCHAR(255) | NO | - | メールアドレス（一意制約） |
| password_hash | VARCHAR(255) | NO | - | bcryptハッシュ済みパスワード |
| role | ENUM('admin','viewer') | NO | 'viewer' | ユーザーロール |
| token_version | INTEGER | NO | 0 | ログアウト時にインクリメントしトークンを無効化する |
| is_active | BOOLEAN | NO | true | アカウント有効フラグ |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時（自動更新） |

**制約:**
- `email` にUNIQUEインデックス
- `role` は `'admin'` または `'viewer'` のみ許可

---

### 2.2 Team（チーム）

| 列名 | 型 | NULL | デフォルト | 説明 |
|------|----|------|------------|------|
| id | INTEGER | NO | AUTO | 主キー |
| name | VARCHAR(100) | NO | - | チーム名 |
| category | VARCHAR(50) | YES | NULL | カテゴリ（例: 'men', 'women', 'mixed'） |
| organization | VARCHAR(100) | YES | NULL | 所属組織・学校名など |
| is_deleted | BOOLEAN | NO | false | 論理削除フラグ |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**リレーション:**
- `players`（1対多）: このチームに所属する選手
- `matches`（ホーム・アウェイそれぞれ1対多）: このチームが参加した試合

---

### 2.3 Player（選手）

| 列名 | 型 | NULL | デフォルト | 説明 |
|------|----|------|------------|------|
| id | INTEGER | NO | AUTO | 主キー |
| team_id | INTEGER | NO | - | 所属チームID（外部キー: teams.id） |
| uniform_number | INTEGER | YES | NULL | 背番号 |
| name | VARCHAR(100) | NO | - | 氏名 |
| kana | VARCHAR(100) | YES | NULL | 読み仮名（日本語ふりがな） |
| position | VARCHAR(50) | YES | NULL | ポジション |
| is_deleted | BOOLEAN | NO | false | 論理削除フラグ |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**制約:**
- `team_id` が `teams.id` を参照する外部キー制約

---

### 2.4 Event（イベント）

大会・練習試合の会など、複数の試合をまとめる上位概念。

| 列名 | 型 | NULL | デフォルト | 説明 |
|------|----|------|------------|------|
| id | INTEGER | NO | AUTO | 主キー |
| name | VARCHAR(100) | NO | - | イベント名（例: 「○○地区大会」） |
| event_type | VARCHAR(20) | YES | NULL | 種別（'tournament', 'practice', 'friendly'） |
| start_date | TIMESTAMP | YES | NULL | 開始日 |
| end_date | TIMESTAMP | YES | NULL | 終了日 |
| venue | VARCHAR(100) | YES | NULL | 会場名 |
| note | TEXT | YES | NULL | 備考 |
| is_deleted | BOOLEAN | NO | false | 論理削除フラグ |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**event_type の値:**

| 値 | 意味 |
|----|------|
| `tournament` | 大会 |
| `practice` | 練習試合・練習会 |
| `friendly` | 親善試合 |

**リレーション:**
- `matches`（1対多）: このイベントに属する試合

---

### 2.5 Match（試合）

| 列名 | 型 | NULL | デフォルト | 説明 |
|------|----|------|------------|------|
| id | INTEGER | NO | AUTO | 主キー |
| event_id | INTEGER | YES | NULL | 所属イベントID（外部キー: events.id） |
| date | TIMESTAMP | YES | NULL | 試合日 |
| start_time | TIMESTAMP | YES | NULL | 開始予定時刻 |
| court | VARCHAR(50) | YES | NULL | コート名（例: 「Aコート」） |
| team_home_id | INTEGER | YES | NULL | ホームチームID（外部キー: teams.id） |
| team_away_id | INTEGER | YES | NULL | アウェイチームID（外部キー: teams.id） |
| status | VARCHAR(20) | YES | NULL | ステータス（下記参照） |
| youtube_url | VARCHAR(500) | YES | NULL | YouTube動画URL |
| note | TEXT | YES | NULL | 備考 |
| is_deleted | BOOLEAN | NO | false | 論理削除フラグ |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**status の値:**

| 値 | 意味 |
|----|------|
| `scheduled` | 予定（試合前） |
| `in-progress` | 試合中 |
| `completed` | 終了 |
| `canceled` | 中止 |

**リレーション:**
- `event`（多対1）: 所属イベント
- `teamHome`（多対1）: ホームチーム
- `teamAway`（多対1）: アウェイチーム
- `sets`（1対多）: この試合のセット一覧
- `playerActions`（1対多）: この試合のプレーアクション一覧

---

### 2.6 Set（セット）

試合内の1セット。ホーム/アウェイそれぞれの得点を持つ。

| 列名 | 型 | NULL | デフォルト | 説明 |
|------|----|------|------------|------|
| id | INTEGER | NO | AUTO | 主キー |
| match_id | INTEGER | NO | - | 対象試合ID（外部キー: matches.id） |
| set_number | INTEGER | NO | - | セット番号（1, 2, 3, ...） |
| home_score | INTEGER | YES | NULL | ホームチームの得点 |
| away_score | INTEGER | YES | NULL | アウェイチームの得点 |
| status | VARCHAR(20) | YES | NULL | セットのステータス（'live', 'finished'など） |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**制約:**
- `match_id` が `matches.id` を参照する外部キー制約

---

### 2.7 PlayerAction（プレーアクション）

試合中の選手の個別プレーを1レコードとして記録する。集計は PlayerMatchStats に別途保持する。

| 列名 | 型 | NULL | デフォルト | 説明 |
|------|----|------|------------|------|
| id | INTEGER | NO | AUTO | 主キー |
| match_id | INTEGER | NO | - | 対象試合ID（外部キー: matches.id） |
| set_id | INTEGER | YES | NULL | 対象セットID（省略可） |
| team_id | INTEGER | NO | - | 選手の所属チームID |
| player_id | INTEGER | NO | - | 選手ID |
| action_type | VARCHAR(20) | NO | - | アクション種別（下記参照） |
| result | VARCHAR(10) | NO | - | 結果（下記参照） |
| created_at | TIMESTAMP | NO | NOW() | 記録日時 |

**action_type の値:**

| 値 | 意味 |
|----|------|
| `attack` | アタック（ボールを投げる） |
| `catch` | キャッチ（ボールを捕る） |
| `cut` | カット（ボールをカットして繋ぐ） |

**result の値:**

| 値 | 意味 |
|----|------|
| `success` | 成功 |
| `fail` | 失敗 |

> **ルール:** `cut` の `result` は常に `'success'` を記録する（カットに失敗という概念は存在しない）。

---

### 2.8 PlayerMatchStats（選手試合スタッツ）

試合×選手の組み合わせで集計値を保持するキャッシュテーブル。PlayerActionが記録されるたびにUPSERT（挿入または更新）される。

| 列名 | 型 | NULL | デフォルト | 説明 |
|------|----|------|------------|------|
| id | INTEGER | NO | AUTO | 主キー |
| player_id | INTEGER | NO | - | 選手ID（外部キー: players.id） |
| match_id | INTEGER | NO | - | 試合ID（外部キー: matches.id） |
| attack_success_count | INTEGER | YES | 0 | アタック成功数 |
| attack_fail_count | INTEGER | YES | 0 | アタック失敗数 |
| catch_success_count | INTEGER | YES | 0 | キャッチ成功数 |
| catch_fail_count | INTEGER | YES | 0 | キャッチ失敗数 |
| cut_count | INTEGER | YES | 0 | カット数 |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**制約:**
- `(player_id, match_id)` に UNIQUE制約（同一選手×試合は1レコードのみ）

---

## 3. ER図（テキスト表現）

```
users
  └─（認証のみ、他テーブルへのリレーションなし）

events ──< matches >── teams (home)
                   └── teams (away)
                   └── sets
                   └── player_actions >── players >── teams
                                      └── sets

player_match_stats >── players
                   └── matches

teams ──< players
```

**多重度の凡例:**
- `──<` : 1対多（左が1、右が多）
- `>──` : 多対1（左が多、右が1）
- `──` : 1対1または多対1

---

## 4. リレーション一覧

| 親テーブル | 子テーブル | 列 | 備考 |
|-----------|-----------|-----|------|
| events | matches | matches.event_id | NULLable（イベント未所属の試合も可） |
| teams | players | players.team_id | NOT NULL |
| teams | matches | matches.team_home_id | NULLable（ホームチーム未設定可） |
| teams | matches | matches.team_away_id | NULLable（アウェイチーム未設定可） |
| matches | sets | sets.match_id | NOT NULL |
| matches | player_actions | player_actions.match_id | NOT NULL |
| players | player_match_stats | player_match_stats.player_id | NOT NULL |
| matches | player_match_stats | player_match_stats.match_id | NOT NULL |

---

## 5. インデックス推奨

| テーブル | 列 | 種別 | 理由 |
|---------|-----|------|------|
| users | email | UNIQUE | ログイン時の検索 |
| players | team_id | INDEX | チームの選手一覧取得 |
| matches | event_id | INDEX | イベントの試合一覧取得 |
| matches | team_home_id | INDEX | チームの試合検索 |
| matches | team_away_id | INDEX | チームの試合検索 |
| player_actions | match_id | INDEX | 試合のアクション一覧取得 |
| player_match_stats | (player_id, match_id) | UNIQUE | 集計のUPSERT操作 |

---

## 6. 論理削除の仕様

以下のテーブルは物理削除を行わず、`is_deleted = true` で削除済みとして扱う。

| テーブル | is_deletedフラグ |
|---------|----------------|
| teams | あり |
| players | あり |
| events | あり |
| matches | あり |

`users`・`sets`・`player_actions`・`player_match_stats` には `is_deleted` フラグはない。

**論理削除のルール:**
- 一覧取得APIは `is_deleted = false` のレコードのみ返す
- `is_deleted = true` のレコードはAPIから見えない
- 削除操作はDELETEリクエストではなく、`is_deleted` をtrueにするPATCHで実装する
