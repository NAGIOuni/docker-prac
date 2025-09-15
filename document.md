# SNS プラットフォーム 開発ドキュメント

## 概要

TypeScript + Next.js + Express + PostgreSQL + Docker で構築するモダンな SNS プラットフォーム

### 技術スタック

| レイヤー           | 技術                    | バージョン |
| ------------------ | ----------------------- | ---------- |
| **フロントエンド** | Next.js + TypeScript    | 14.0.0     |
| **バックエンド**   | Express + TypeScript    | 4.18.2     |
| **データベース**   | PostgreSQL              | 15-alpine  |
| **ORM**            | Prisma                  | 5.x        |
| **コンテナ**       | Docker + Docker Compose | -          |
| **スタイリング**   | Tailwind CSS            | 3.3.0      |
| **認証**           | NextAuth.js             | 4.24.0     |

---

## 現在の進捗状況

### ✅ 完了済み項目

- [x] プロジェクト構造セットアップ
- [x] Docker 環境構築（PostgreSQL コンテナ起動済み）
- [x] データベース設計（Prisma スキーマ）
- [x] マイグレーション実行完了
- [x] サンプルデータ投入済み
- [x] Express サーバー基盤設定
- [x] **User Controller 完全実装**

### 🔄 現在作業中

- [ ] 型定義ファイルの作成 (`backend/src/types/user.ts`)
- [ ] ルート定義の実装 (`backend/src/routes/users.ts`)
- [ ] サーバーへのルート接続 (`backend/src/server.ts`)

---

## プロジェクト構成

```
sns-platform/
├── docker-compose.yml          # Docker環境定義 ✅
├── frontend/                   # Next.jsアプリケーション
│   ├── src/
│   │   ├── app/               # App Router
│   │   ├── components/        # React Components
│   │   └── lib/              # ユーティリティ
│   ├── package.json
│   └── next.config.js
├── backend/                    # Express APIサーバー
│   ├── src/
│   │   ├── controllers/       # ✅ userController.ts 実装済み
│   │   ├── routes/           # 🔄 作成済み（空）
│   │   ├── types/            # 🔄 作成済み（空）
│   │   ├── lib/              # ✅ prisma.ts 完成
│   │   └── server.ts         # ✅ 基盤完成、ルート接続待ち
│   ├── prisma/
│   │   ├── schema.prisma     # ✅ 完成
│   │   ├── migrations/       # ✅ 実行済み
│   │   └── seed.js          # ✅ 実行済み
│   └── package.json
└── README.md
```

---

## データベース設計

### ER 図

```mermaid
erDiagram
    Users {
        string id PK
        string email UK
        string username UK
        string displayName
        string bio
        string profileImageUrl
        datetime createdAt
        datetime updatedAt
    }

    Posts {
        string id PK
        string userId FK
        string content
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    Follows {
        string id PK
        string followerId FK
        string followingId FK
        datetime createdAt
    }

    Likes {
        string id PK
        string userId FK
        string postId FK
        datetime createdAt
    }

    Comments {
        string id PK
        string userId FK
        string postId FK
        string parentCommentId FK
        string content
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    PostImages {
        string id PK
        string postId FK
        string imageUrl
        datetime createdAt
    }

    Users ||--o{ Posts : "creates"
    Users ||--o{ Follows : "follower"
    Users ||--o{ Follows : "following"
    Users ||--o{ Likes : "gives"
    Posts ||--o{ Likes : "receives"
    Users ||--o{ Comments : "writes"
    Posts ||--o{ Comments : "receives"
    Comments ||--o{ Comments : "replies to"
    Posts ||--o{ PostImages : "has"
```

### 実装済みテーブル（Prisma Schema）

#### Users（ユーザー）

```prisma
model User {
  id               String   @id @default(cuid())
  email            String   @unique
  username         String   @unique
  displayName      String
  bio              String?
  profileImageUrl  String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  // リレーション
  posts            Post[]
  likes            Like[]
  comments         Comment[]
  followers        Follow[] @relation("UserFollowers")
  following        Follow[] @relation("UserFollowing")

  @@map("users")
}
```

#### Posts（投稿）

```prisma
model Post {
  id        String    @id @default(cuid())
  userId    String
  content   String    @db.VarChar(280)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  // リレーション
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  likes     Like[]
  comments  Comment[]
  images    PostImage[]

  @@map("posts")
}
```

---

## 実装済み User API 仕様

### ベース URL

```
Development: http://localhost:8000/api
```

### 共通レスポンス形式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: {
    users: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}
```

### 実装完了済みエンドポイント

#### 1. ユーザー作成

| Method | Endpoint     | Status  |
| ------ | ------------ | ------- |
| `POST` | `/api/users` | ✅ 完了 |

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "displayName": "John Doe",
  "bio": "Hello, I'm John!" // optional
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "clxxx123456789",
    "email": "user@example.com",
    "username": "johndoe",
    "displayName": "John Doe",
    "bio": "Hello, I'm John!",
    "profileImageUrl": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "User created successfully"
}
```

#### 2. ユーザー情報取得

| Method | Endpoint         | Status  |
| ------ | ---------------- | ------- |
| `GET`  | `/api/users/:id` | ✅ 完了 |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "clxxx123456789",
    "username": "johndoe",
    "displayName": "John Doe",
    "bio": "Hello, I'm John!",
    "profileImageUrl": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "_count": {
      "posts": 5,
      "followers": 10,
      "following": 8
    }
  }
}
```

#### 3. ユーザー一覧取得（ページネーション付き）

| Method | Endpoint                     | Status  |
| ------ | ---------------------------- | ------- |
| `GET`  | `/api/users?page=1&limit=10` | ✅ 完了 |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "clxxx123456789",
        "username": "johndoe",
        "displayName": "John Doe",
        "bio": "Hello, I'm John!",
        "profileImageUrl": null,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "_count": {
          "posts": 5,
          "followers": 10
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### 4. ユーザー情報更新

| Method | Endpoint         | Status  |
| ------ | ---------------- | ------- |
| `PUT`  | `/api/users/:id` | ✅ 完了 |

**Request Body:**

```json
{
  "displayName": "John Smith", // optional
  "bio": "Updated bio", // optional
  "profileImageUrl": "https://example.com/image.jpg" // optional
}
```

#### 5. ユーザー削除

| Method   | Endpoint         | Status  |
| -------- | ---------------- | ------- |
| `DELETE` | `/api/users/:id` | ✅ 完了 |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 実装待ちエンドポイント

| Method | Endpoint               | Description        | Status  |
| ------ | ---------------------- | ------------------ | ------- |
| `GET`  | `/users/:id/posts`     | ユーザーの投稿一覧 | 🔄 待機 |
| `GET`  | `/users/:id/followers` | フォロワー一覧     | 🔄 待機 |
| `GET`  | `/users/:id/following` | フォロー中一覧     | 🔄 待機 |
| `GET`  | `/users/search`        | ユーザー検索       | 🔄 待機 |

---

## その他の API（今後実装予定）

### Posts API

| Method   | Endpoint     | Description  | Status    |
| -------- | ------------ | ------------ | --------- |
| `GET`    | `/posts`     | 投稿一覧取得 | ❌ 未実装 |
| `GET`    | `/posts/:id` | 特定投稿取得 | ❌ 未実装 |
| `POST`   | `/posts`     | 投稿作成     | ❌ 未実装 |
| `PUT`    | `/posts/:id` | 投稿更新     | ❌ 未実装 |
| `DELETE` | `/posts/:id` | 投稿削除     | ❌ 未実装 |

### Interactions API

| Method   | Endpoint              | Description  | Status    |
| -------- | --------------------- | ------------ | --------- |
| `POST`   | `/posts/:id/like`     | いいね追加   | ❌ 未実装 |
| `DELETE` | `/posts/:id/like`     | いいね削除   | ❌ 未実装 |
| `POST`   | `/users/:id/follow`   | フォロー     | ❌ 未実装 |
| `DELETE` | `/users/:id/follow`   | フォロー解除 | ❌ 未実装 |
| `POST`   | `/posts/:id/comments` | コメント作成 | ❌ 未実装 |
| `GET`    | `/posts/:id/comments` | コメント一覧 | ❌ 未実装 |

---

## 実装の特徴・ベストプラクティス

### セキュリティ対策

- **DoS 攻撃防止**: `Math.min(limit, 50)` による上限設定
- **機密情報保護**: レスポンスから email フィールドを除外
- **適切なエラーハンドリング**: Prisma エラー（P2002, P2025）の処理

### パフォーマンス最適化

- **並列処理**: `Promise.all` による効率的なデータ取得
- **選択的取得**: `select` による必要フィールドのみの取得
- **効率的ページネーション**: skip/take による実装

### TypeScript 実装

- **型安全性**: `unknown` 型によるエラーハンドリング
- **ES Module**: 適切なモジュール構成
- **型定義**: 今後 `types/user.ts` で強化予定

---

## 開発環境セットアップ

### 前提条件

- Docker Desktop
- Node.js 18+
- npm or yarn

### 1. プロジェクトクローン

```bash
git clone <repository-url>
cd sns-platform
```

### 2. 環境変数設定

```bash
# backend/.env
DATABASE_URL="postgresql://snsuser:snspassword@localhost:5432/snsplatform"
JWT_SECRET="your-super-secret-jwt-key"
PORT=8000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# frontend/.env.local
NEXT_PUBLIC_API_URL="http://localhost:8000/api"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### 3. Docker 環境起動

```bash
# データベース起動
docker-compose up -d db

# 全サービス起動
docker-compose up -d
```

### 4. データベース初期化（完了済み）

```bash
cd backend

# Prismaクライアント生成
npx prisma generate

# マイグレーション実行（完了済み）
npx prisma migrate dev --name init

# サンプルデータ投入（完了済み）
npm run db:seed
```

### 5. 開発サーバー起動

```bash
# バックエンド
cd backend && npm run dev

# フロントエンド（別ターミナル）
cd frontend && npm run dev
```

### 6. 動作確認

- Frontend: http://localhost:3000
- Backend Health Check: http://localhost:8000/health
- Prisma Studio: `npx prisma studio` → http://localhost:5555

---

## 次の実装ステップ

### 🔄 最優先タスク

1. **型定義ファイルの作成**

   ```typescript
   // backend/src/types/user.ts
   export interface CreateUserRequest {
     email: string;
     username: string;
     displayName: string;
     bio?: string;
   }

   export interface UpdateUserRequest {
     displayName?: string;
     bio?: string;
     profileImageUrl?: string;
   }
   ```

2. **ルート定義の実装**

   ```typescript
   // backend/src/routes/users.ts
   import express from "express";
   import * as userController from "../controllers/userController.js";

   const router = express.Router();

   router.post("/", userController.createUser);
   router.get("/:id", userController.getUserById);
   router.get("/", userController.getAllUsers);
   router.put("/:id", userController.updateUser);
   router.delete("/:id", userController.deleteUser);

   export default router;
   ```

3. **サーバーへのルート接続**
   ```typescript
   // backend/src/server.ts に追加
   import userRoutes from "./routes/users.js";
   app.use("/api/users", userRoutes);
   ```

### 🚀 Phase 1: API 完成

- [ ] Post Controller 実装
- [ ] Follow Controller 実装
- [ ] Like Controller 実装
- [ ] Comment Controller 実装

### 🔐 Phase 2: 認証機能

- [ ] JWT 認証の実装
- [ ] ユーザー登録・ログイン機能
- [ ] ミドルウェア認証

### 🎨 Phase 3: フロントエンド実装

- [ ] Next.js + TailwindCSS での UI 実装
- [ ] API 連携
- [ ] リアルタイム機能（WebSocket）

---

## コマンド一覧

### Docker 操作

```bash
# 環境起動
docker-compose up -d

# ログ確認
docker-compose logs -f [service-name]

# 環境停止
docker-compose down

# 完全リセット
docker-compose down -v
```

### データベース操作

```bash
# Prisma Studio起動
npx prisma studio

# マイグレーション
npx prisma migrate dev --name <name>

# リセット
npx prisma migrate reset

# データベース直接接続
docker-compose exec db psql -U snsuser -d snsplatform
```

### 開発用

```bash
# バックエンド開発サーバー
npm run dev

# フロントエンド開発サーバー
npm run dev

# 型チェック
npm run type-check

# ビルド
npm run build
```

### API 動作確認

```bash
# ヘルスチェック
curl http://localhost:8000/health

# ユーザー一覧取得（実装後）
curl http://localhost:8000/api/users

# ユーザー作成（実装後）
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","displayName":"Test User"}'
```

---

## 実装済みサンプルデータ

データベースには以下のサンプルデータが投入済みです：

- **ユーザー**: Alice, Bob
- **投稿**: 各ユーザーの投稿
- **フォロー関係**: Alice ↔ Bob
- **いいね**: 相互いいね

Prisma Studio で確認可能です。

---

## トラブルシューティング

### よくある問題

#### 1. データベース接続エラー

```bash
# データベース状態確認
docker-compose ps
docker-compose logs db

# 再起動
docker-compose restart db
```

#### 2. ポート競合

```bash
# ポート使用状況確認
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# プロセス終了後に再起動
```

#### 3. Prisma エラー

```bash
# クライアント再生成
npx prisma generate

# マイグレーション再実行
npx prisma migrate reset
npx prisma migrate dev --name init
```

---

## 貢献方法

### ブランチ戦略

- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 新機能開発
- `fix/*`: バグ修正

### コミット規約

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードフォーマット
refactor: リファクタリング
test: テスト追加
chore: その他の変更
```

---

## ライセンス

MIT License

---

## 更新履歴

| Date       | Version | Changes                      |
| ---------- | ------- | ---------------------------- |
| 2023-12-01 | v0.1.0  | 初期版リリース               |
| 2023-12-01 | v0.2.0  | ユーザー管理機能実装完了     |
| 2023-12-01 | v0.2.1  | User Controller 完全実装完了 |

---

## サポート

### 連絡先

- Email: support@sns-platform.com
- GitHub Issues: [Issues Page](https://github.com/your-repo/issues)

### ドキュメント

- [API 仕様書](./api-docs.md)
- [データベース仕様書](./database-docs.md)
- [フロントエンド開発ガイド](./frontend-guide.md)
