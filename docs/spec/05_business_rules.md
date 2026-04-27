# ビジネスルール・ドメインロジック仕様

---

## 1. プレーアクション記録ルール

### 1.1 アクション種別と結果の組み合わせ

| action_type | result | 許可 | 説明 |
|-------------|--------|------|------|
| attack | success | ○ | アタック成功 |
| attack | fail | ○ | アタック失敗 |
| catch | success | ○ | キャッチ成功 |
| catch | fail | ○ | キャッチ失敗 |
| cut | success | ○ | カット（常に成功扱い） |
| cut | fail | △ | 受け入れても無視するか、バリデーションエラーにすること |

**ルール:** `cut` は常に成功（`result = 'success'`）として記録する。`cut` を `fail` で送信した場合は、サーバー側でエラーにするか `success` に変換する（どちらでもよいが一貫していること）。

### 1.2 team_id の自動解決

プレーアクション記録時に `team_id` はリクエストボディに含めない。サーバー側で `player_id` からプレーヤーレコードを取得し、`team_id` を自動で解決する。

```
POST /api/matches/:id/player-actions
{
  "playerId": 1,
  "actionType": "attack",
  "result": "success"
}
↓
サーバー: SELECT team_id FROM players WHERE id = 1
↓
player_actions に {match_id, team_id, player_id, action_type, result} を挿入
```

### 1.3 player_match_stats の自動更新

PlayerActionを記録するたびに、対応する PlayerMatchStats レコードを UPSERT で更新する。

**UPSERT ロジック（疑似SQL）:**

```sql
INSERT INTO player_match_stats (player_id, match_id, <counter_column>)
VALUES (:player_id, :match_id, 1)
ON CONFLICT (player_id, match_id)
DO UPDATE SET
  <counter_column> = player_match_stats.<counter_column> + 1,
  updated_at = NOW();
```

**カウンター列のマッピング:**

| action_type | result | インクリメントする列 |
|-------------|--------|---------------------|
| attack | success | attack_success_count |
| attack | fail | attack_fail_count |
| catch | success | catch_success_count |
| catch | fail | catch_fail_count |
| cut | success | cut_count |

---

## 2. スタッツ計算式

### 2.1 集計項目

| 指標 | 計算式 | 備考 |
|------|--------|------|
| アタック試行数 | attack_success_count + attack_fail_count | |
| アタック率 (attack_rate) | attack_success_count ÷ アタック試行数 | 試行数が0の場合は0を返す |
| キャッチ試行総数 | catch_success_count + catch_fail_count + cut_count | カットをキャッチ成功に含める |
| キャッチ率 (catch_rate) | (catch_success_count + cut_count) ÷ キャッチ試行総数 | 試行数が0の場合は0を返す |

### 2.2 計算例

```
選手: 山田太郎
  attack_success_count = 5
  attack_fail_count    = 3
  catch_success_count  = 4
  catch_fail_count     = 2
  cut_count            = 1

→ アタック試行数  = 5 + 3 = 8
→ アタック率      = 5 / 8 = 0.625（62.5%）

→ キャッチ試行総数 = 4 + 2 + 1 = 7
→ キャッチ率      = (4 + 1) / 7 ≈ 0.714（71.4%）
```

### 2.3 ゼロ除算の処理

試行数が0の場合、率は `0`（または `null`）を返す。

```
アタック試行数 = 0 → attack_rate = 0
キャッチ試行総数 = 0 → catch_rate = 0
```

---

## 3. 論理削除のルール

### 3.1 対象エンティティ

| テーブル | is_deleted列 |
|---------|-------------|
| teams | あり |
| players | あり |
| events | あり |
| matches | あり |

### 3.2 動作ルール

1. **一覧取得:** `WHERE is_deleted = false` のレコードのみ返す
2. **詳細取得:** `is_deleted = true` のレコードは404として扱う（または `is_deleted` チェックなし。実装依存）
3. **削除操作:** `is_deleted` を `true` に更新する。物理DELETEは行わない
4. **関連エンティティ:** 親が論理削除された場合、子は自動では削除しない（子のis_deletedは変更しない）

### 3.3 選手一覧の除外ルール

試合詳細（GET /api/matches/:id）のチームの選手リストでは、`is_deleted = false` の選手のみ含める。

---

## 4. バリデーションルール

### 4.1 ユーザー

| フィールド | ルール |
|-----------|--------|
| email | 必須。一意（重複不可）。メールアドレス形式 |
| password | 必須。bcryptでハッシュ化して保存 |
| role | 'admin' または 'viewer' のみ |

### 4.2 チーム

| フィールド | ルール |
|-----------|--------|
| name | 必須 |
| category | 任意。空文字またはnull可 |
| organization | 任意。空文字またはnull可 |

### 4.3 選手

| フィールド | ルール |
|-----------|--------|
| team_id | 必須。存在するteamのIDであること |
| name | 必須 |
| uniform_number | 任意。整数 |

### 4.4 イベント

| フィールド | ルール |
|-----------|--------|
| name | 必須 |
| event_type | 任意。'tournament', 'practice', 'friendly' が推奨値 |
| start_date | 任意。ISO 8601形式 |
| end_date | 任意。ISO 8601形式。start_date以降であること |

### 4.5 試合

| フィールド | ルール |
|-----------|--------|
| event_id | 任意。存在するeventのIDであること |
| team_home_id | 任意。存在するteamのIDであること |
| team_away_id | 任意。存在するteamのIDであること。team_home_idと異なることが望ましい |
| status | 任意。'scheduled', 'in-progress', 'completed', 'canceled' が推奨値 |

### 4.6 プレーアクション

| フィールド | ルール |
|-----------|--------|
| player_id | 必須。存在するplayerのIDであること |
| action_type | 必須。'attack', 'catch', 'cut' のいずれか |
| result | 必須。'success' または 'fail' のいずれか |

---

## 5. 試合ステータス管理

試合の `status` フィールドは以下の値を持つ。状態遷移の強制はないが、推奨する遷移フローを示す。

```
scheduled
    │
    ▼
in-progress  ←→ （試合中。スコア・アクション入力が可能）
    │
    ▼
completed
```

`canceled` はいつでも遷移可能。

**現行実装:** statusの自動更新は実装されていない。APIを通じて手動で更新する。

---

## 6. セット管理ルール

### 6.1 セット番号

- セット番号（set_number）は1から始まる整数
- 同一試合内で重複するset_numberは避ける（制約は実装依存）
- 新しいセットを開始する際に set_number を +1 してINSERTする

### 6.2 スコア

- home_score と away_score はNULL許容（試合開始前）
- スコアは0以上の整数
- セット終了時に確定スコアをPATCHで更新する

---

## 7. YouTube URL 管理

- `youtube_url` フィールドは試合（matches）に持つ
- YouTube動画のURLをそのまま保存する（例: `https://www.youtube.com/watch?v=XXXX`）
- フォーマットバリデーションは任意（現行実装なし）
- URLが存在する場合、フロントエンドは動画プレーヤーを表示する

---

## 8. トークン無効化ルール

- ログアウト時に `users.token_version` を +1 インクリメントする
- トークン検証時に JWT の `tokenVersion` と DB の `token_version` を比較する
- `JWT.tokenVersion < DB.token_version` の場合、トークンは無効（ログアウト済み）
- これにより、同一ユーザーの全デバイスのセッションを一括無効化できる

---

## 9. シードデータ仕様

開発・テスト環境の初期データとして以下を投入する。

### 管理者ユーザー

| フィールド | 値 |
|-----------|-----|
| name | 管理者 |
| email | admin@example.com |
| password | password123（bcryptハッシュで保存） |
| role | admin |

### 閲覧者ユーザー

| フィールド | 値 |
|-----------|-----|
| name | 閲覧者 |
| email | viewer@example.com |
| password | password123（bcryptハッシュで保存） |
| role | viewer |

### サンプルチームと選手

シードスクリプトで作成するサンプルデータの構成例:

- チームA（選手: 山田太郎/10番, 鈴木次郎/7番, 佐藤三郎/3番）
- チームB（選手: 田中四郎/1番, 伊藤五郎/5番）
