# 認証とロールベースアクセス制御（RBAC）

このドキュメントでは、ドジロウの認証とアクセス制御システムを説明します。

## 認証フロー

### 1. ログイン

ユーザーはメールアドレスとパスワードでログインして JWT トークンを取得します。

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "changeme"
  }'
```

**レスポンス:**

```json
{
  "user": {
    "id": 1,
    "name": null,
    "email": "admin@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MzI1NTAwMDAsImV4cCI6MTczMzE1MDAwMH0...."
}
```

### 2. トークンの使用

すべての認証が必要な API リクエストで、`Authorization` ヘッダに `Bearer <token>` を含めます。

```bash
curl -X GET http://localhost:3000/api/matches \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## ミドルウェア

`middleware.ts` は以下の役割を担います：

1. **ルートの分類**
   - 公開ルート（`/api/health`, `/api/auth/login` など）：認証不要
   - 保護ルート（`/api/matches/*` など）：JWT 検証必須

2. **JWT トークン検証**
   - `Bearer` スキーム から token を抽出
   - `JWT_SECRET` を使用して署名を検証
   - 無効なトークン → 401 Unauthorized

3. **ユーザー情報の注入**
   - 検証済みトークンから `userId` と `email` を抽出
   - リクエストヘッダに `x-user-id` と `x-user-email` を追加
   - Route Handler で使用可能に

## Route Handler での使用

### 認証ユーザーの取得

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ユーザー情報を使用
  console.log(`User ${user.userId} (${user.email}) accessed this endpoint`);

  // ... rest of handler
}
```

### 認証チェック

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // ... rest of handler
}
```

## 環境変数

### `JWT_SECRET`

JWT トークンの署名に使用するシークレットキー。

**開発環境:**

```env
JWT_SECRET=dev-secret-key-change-in-production
```

**本番環境:**

```env
JWT_SECRET=your-secure-random-key-here
```

⚠️ **本番環境では必ず強力なシークレットを設定してください**

## トークン有効期限

ログイン時に発行される JWT トークンの有効期限は **7日間** です。

- **ヘッダ**: `{ alg: 'HS256', typ: 'JWT' }`
- **ペイロード**: `{ userId, email, iat, exp }`
- **署名**: `HMAC-SHA256(header.payload, JWT_SECRET)`

## 実装例

### パブリック API（認証不要）

```typescript
export async function GET(req: NextRequest) {
  // 公開ルート：認証不要
  return NextResponse.json({ ok: true });
}
```

### プライベート API（認証必須）

```typescript
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // user.userId, user.email を使用
  const event = await prisma.event.create({
    data: {
      name: req.body.name,
      // ... 作成者として userId を記録可能
    },
  });

  return NextResponse.json(event);
}
```

## ロールベースアクセス制御（RBAC）の拡張

将来的には、`lib/auth.ts` の `canAccessResource()` を拡張してロール機能を実装できます：

```typescript
export async function canAccessResource(
  userId: number,
  resourceType: string,
  resourceId?: number
): Promise<boolean> {
  // DB からユーザーのロールを取得
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // ロール別のアクセス制御
  if (user?.role === 'admin') return true;
  if (resourceType === 'match' && user?.role === 'organizer') return true;

  // その他のチェック
  return false;
}
```

## テスト

認証付き API のテスト例：

```typescript
describe('Authenticated Endpoints', () => {
  it('should reject request without token', async () => {
    const res = await fetch('http://localhost:3000/api/matches');
    expect(res.status).toBe(401);
  });

  it('should accept request with valid token', async () => {
    // 1. ログイン
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'changeme',
      }),
    });
    const { token } = await loginRes.json();

    // 2. トークン付きリクエスト
    const res = await fetch('http://localhost:3000/api/matches', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });
});
```
