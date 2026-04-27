# 認証・認可仕様

---

## 1. 認証方式

メールアドレス＋パスワードによる認証。認証成功後にJWTトークンを発行する。

| 項目 | 仕様 |
|------|------|
| 認証方式 | メールアドレス＋パスワード |
| パスワードハッシュ | bcrypt（コストファクター: 10） |
| トークン形式 | JWT（JSON Web Token） |
| 署名アルゴリズム | HS256（HMAC SHA-256） |
| トークン有効期限 | 7日間 |
| シークレットキー | 環境変数 `JWT_SECRET`（32バイト以上のランダム文字列を推奨） |

---

## 2. JWTペイロード仕様

```json
{
  "userId": 1,
  "email": "admin@example.com",
  "role": "admin",
  "tokenVersion": 0,
  "iat": 1714550400,
  "exp": 1715155200
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| userId | integer | ユーザーのID（DBのusers.idと一致） |
| email | string | ユーザーのメールアドレス |
| role | string | 'admin' または 'viewer' |
| tokenVersion | integer | ログアウト無効化に使用するバージョン番号 |
| iat | integer | 発行日時（Unix timestamp） |
| exp | integer | 有効期限（Unix timestamp、iatの7日後） |

---

## 3. ログインフロー

```
クライアント                          サーバー
    │                                     │
    │  POST /api/auth/login               │
    │  { email, password }                │
    │────────────────────────────────────>│
    │                                     │  1. usersテーブルからemailで検索
    │                                     │  2. is_active = true を確認
    │                                     │  3. bcryptでpassword照合
    │                                     │  4. JWT生成（ペイロード: userId, email, role, tokenVersion）
    │                                     │  5. httpOnly Cookie "auth-token" をセット
    │  200 OK                             │
    │  { user: {...}, token: "xxx..." }   │
    │<────────────────────────────────────│
    │                                     │
    │  tokenをlocalStorageに保存          │
```

**ログイン失敗の条件:**
- メールアドレスが存在しない → 401
- パスワードが一致しない → 401
- `is_active = false` のユーザー → 401

---

## 4. トークンの使用

### APIリクエスト（Bearer Token）

保護されたAPIエンドポイントへのリクエストには `Authorization` ヘッダが必要。

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ページアクセス（Cookie）

ブラウザからの保護されたページアクセスには `auth-token` httpOnly Cookieが必要。

```
Cookie: auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. トークン検証フロー

リクエストごとにミドルウェアで以下を検証する。

```
リクエスト受信
    │
    ├─ パブリックルートか？（/api/health, POST /api/auth/login, /, /login）
    │   YES → 認証をスキップしてリクエストを処理
    │
    ├─ APIルート（/api/*）か？
    │   YES → Authorizationヘッダから Bearer トークンを取得
    │         └─ トークンがない → 401 Unauthorized
    │
    ├─ ページルート（/dashboard/*, /events/*, /teams/*, /matches/*）か？
    │   YES → auth-token Cookieからトークンを取得
    │         └─ トークンがない → /login にリダイレクト
    │
    ↓
    JWTをJWT_SECRETで署名検証
    │   失敗 → 401 / リダイレクト
    │
    ↓
    exp（有効期限）チェック
    │   期限切れ → 401 / リダイレクト
    │
    ↓
    DBからusersレコードを取得してtoken_versionを確認
    │   JWTのtokenVersion ≠ DBのtoken_version → 401（ログアウト済み）
    │
    ↓
    認証成功
    トークンのクレームをリクエストコンテキスト（またはヘッダ）に注入
    │   x-user-id    = userId
    │   x-user-email = email
    │   x-user-role  = role
    │
    ↓
    ルートハンドラへ処理を委譲
```

---

## 6. ログアウトフロー

```
クライアント                          サーバー
    │                                     │
    │  POST /api/auth/logout              │
    │  Authorization: Bearer xxx          │
    │────────────────────────────────────>│
    │                                     │  1. トークン検証
    │                                     │  2. usersテーブルの token_version を +1 更新
    │                                     │  3. "auth-token" Cookieをクリア
    │  200 OK                             │
    │  { message: "Logged out" }          │
    │<────────────────────────────────────│
    │                                     │
    │  localStorageからtokenを削除        │
```

**ポイント:** `token_version` をインクリメントすることで、同じユーザーが複数デバイスでログイン中の場合も、すべてのトークンが即時無効化される。

---

## 7. 認可（ロールベースアクセス制御）

### ロール定義

| ロール | 説明 |
|--------|------|
| admin | 管理者。全リソースの読み書きが可能 |
| viewer | 閲覧者。全リソースの読み取りのみ可能。書き込みは403 |

### アクセスマトリクス

| 操作 | admin | viewer | 未認証 |
|------|-------|--------|--------|
| GET /api/health | ○ | ○ | ○ |
| POST /api/auth/login | ○ | ○ | ○ |
| POST /api/auth/logout | ○ | ○ | ✕（401） |
| GET 系（一覧・詳細） | ○ | ○ | ✕（401） |
| POST 系（作成） | ○ | ✕（403） | ✕（401） |
| PATCH 系（更新） | ○ | ✕（403） | ✕（401） |
| DELETE 系（論理削除） | ○ | ✕（403） | ✕（401） |

### 実装上のポイント

ルートハンドラで認証ユーザーのロールを確認し、不適切なロールからのアクセスは403を返す。

```
// 疑似コード
function requireAdmin(context):
    user = getAuthenticatedUser(context)
    if user is null:
        return Response(403, { error: "Forbidden" })
    return user
```

---

## 8. 環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| JWT_SECRET | JWT署名に使用するシークレットキー | `openssl rand -base64 32` で生成 |

---

## 9. セキュリティ上の注意事項

1. **JWT_SECRET は最低32バイトのランダム文字列を使用する**
2. `auth-token` Cookieは httpOnly + Secure（HTTPS環境）フラグを付与する
3. APIからのレスポンスでパスワードハッシュを含めない
4. ログイン失敗時の401エラーメッセージは、メールアドレスが存在するかどうかを区別しない（列挙攻撃対策）
5. ブルートフォース対策としてログイン試行回数の制限を実装することを推奨（現行未実装）
