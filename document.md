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

## プロジェクト構成

```
sns-platform/
├── docker-compose.yml          # Docker環境定義
├── frontend/                   # Next.jsアプリケーション
│   ├── src/
│   │   ├── app/               # App Router
│   │   ├── components/        # React Components
│   │   └── lib/              # ユーティリティ
│   ├── package.json
│   └── next.config.js
├── backend/                    # Express APIサーバー
│   ├── src/
│   │   ├── controllers/       # ビジネスロジック
│   │   ├── routes/           # APIルート定義
│   │   ├── types/            # TypeScript型定義
│   │   ├── lib/              # 共通ライブラリ
│   │   └── server.ts         # メインサーバー
│   ├── prisma/
│   │   ├── schema.prisma     # データベーススキーマ
│   │   ├── migrations/       # マイグレーションファイル
│   │   └── seed.js          # サンプルデータ
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

    Users ||--o{ Posts : "creates"
    Users ||--o{ Follows : "follower"
    Users ||--o{ Follows : "following"
    Users ||--o{ Likes : "gives"
    Posts ||--o{ Likes : "receives"
    Users ||--o{ Comments : "writes"
    Posts ||--o{ Comments : "receives"
    Comments ||--o{ Comments : "replies to"
```

### 主要テーブル

#### Users（ユーザー）

```sql
CREATE TABLE "users" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "username" VARCHAR(50) NOT NULL UNIQUE,
  "display_name" VARCHAR(100) NOT NULL,
  "bio" TEXT,
  "profile_image_url" VARCHAR(255),
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL
);
```

#### Posts（投稿）

```sql
CREATE TABLE "posts" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT cuid(),
  "user_id" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "content" VARCHAR(280) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL,
  "deleted_at" TIMESTAMP
);
```

---

## API 仕様

### ベース URL

```
Development: http://localhost:8000/api
Production: https://your-domain.com/api
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
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### エンドポイント一覧

#### Users API

| Method | Endpoint               | Description        | Status |
| ------ | ---------------------- | ------------------ | ------ |
| `GET`  | `/users`               | ユーザー一覧取得   | ✅     |
| `GET`  | `/users/:id`           | 特定ユーザー取得   | ✅     |
| `POST` | `/users`               | ユーザー作成       | ✅     |
| `PUT`  | `/users/:id`           | ユーザー情報更新   | 🔄     |
| `GET`  | `/users/:id/posts`     | ユーザーの投稿一覧 | 🔄     |
| `GET`  | `/users/:id/followers` | フォロワー一覧     | 🔄     |
| `GET`  | `/users/:id/following` | フォロー中一覧     | 🔄     |

#### Posts API

| Method   | Endpoint     | Description  | Status |
| -------- | ------------ | ------------ | ------ |
| `GET`    | `/posts`     | 投稿一覧取得 | 🔄     |
| `GET`    | `/posts/:id` | 特定投稿取得 | 🔄     |
| `POST`   | `/posts`     | 投稿作成     | 🔄     |
| `PUT`    | `/posts/:id` | 投稿更新     | 🔄     |
| `DELETE` | `/posts/:id` | 投稿削除     | 🔄     |

#### Interactions API

| Method   | Endpoint              | Description  | Status |
| -------- | --------------------- | ------------ | ------ |
| `POST`   | `/posts/:id/like`     | いいね追加   | 🔄     |
| `DELETE` | `/posts/:id/like`     | いいね削除   | 🔄     |
| `POST`   | `/users/:id/follow`   | フォロー     | 🔄     |
| `DELETE` | `/users/:id/follow`   | フォロー解除 | 🔄     |
| `POST`   | `/posts/:id/comments` | コメント作成 | 🔄     |
| `GET`    | `/posts/:id/comments` | コメント一覧 | 🔄     |

### リクエスト・レスポンス例

#### ユーザー作成

```http
POST /api/users
Content-Type: application/json

{
  "email": "alice@example.com",
  "username": "alice",
  "displayName": "Alice Johnson",
  "bio": "Hello! Nice to meet you 😊"
}
```

```json
{
  "success": true,
  "data": {
    "id": "cl9ebqhxk00008eef652uhkxd",
    "email": "alice@example.com",
    "username": "alice",
    "displayName": "Alice Johnson",
    "bio": "Hello! Nice to meet you 😊",
    "profileImageUrl": null,
    "createdAt": "2023-12-01T10:00:00.000Z",
    "updatedAt": "2023-12-01T10:00:00.000Z"
  },
  "message": "User created successfully"
}
```

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

### 4. データベース初期化

```bash
cd backend

# Prismaクライアント生成
npx prisma generate

# マイグレーション実行
npx prisma migrate dev --name init

# サンプルデータ投入
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
- Backend API: http://localhost:8000
- Prisma Studio: http://localhost:5555

---

## 開発フロー

### 1. データベース変更

```bash
# schema.prisma を編集後
npx prisma migrate dev --name add_new_field
npx prisma generate
```

### 2. API 開発

```bash
# 1. 型定義作成
src/types/newFeature.ts

# 2. コントローラー実装
src/controllers/newFeatureController.ts

# 3. ルート定義
src/routes/newFeature.ts

# 4. server.ts にルート追加
app.use('/api/new-feature', newFeatureRouter);
```

### 3. フロントエンド開発

```bash
# 1. APIクライアント作成
src/lib/api.ts

# 2. コンポーネント作成
src/components/NewFeature.tsx

# 3. ページ作成
src/app/new-feature/page.tsx
```

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
# マイグレーション
npx prisma migrate dev --name <name>

# リセット
npx prisma migrate reset

# データベース直接接続
docker-compose exec db psql -U snsuser -d snsplatform

# Prisma Studio起動
npx prisma studio
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

#### 4. 型エラー

```bash
# 型定義インストール
npm install -D @types/node @types/express

# TypeScript設定確認
npx tsc --noEmit
```

---

## デプロイメント

### 環境変数（本番）

```bash
# Backend
DATABASE_URL="postgresql://..."
JWT_SECRET="production-secret"
NODE_ENV="production"
FRONTEND_URL="https://your-domain.com"

# Frontend
NEXT_PUBLIC_API_URL="https://api.your-domain.com"
NEXTAUTH_URL="https://your-domain.com"
```

### ビルド手順

```bash
# バックエンド
cd backend
npm run build

# フロントエンド
cd frontend
npm run build
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

### プルリクエスト

1. feature ブランチを作成
2. 変更を実装
3. テストを追加
4. プルリクエストを作成
5. レビュー後にマージ

---

## ライセンス

MIT License

---

## 更新履歴

| Date       | Version | Changes              |
| ---------- | ------- | -------------------- |
| 2023-12-01 | v0.1.0  | 初期版リリース       |
| 2023-12-01 | v0.2.0  | ユーザー管理機能追加 |

---

## サポート

### 連絡先

- Email: support@sns-platform.com
- GitHub Issues: [Issues Page](https://github.com/your-repo/issues)

### ドキュメント

- [API 仕様書](./api-docs.md)
- [データベース仕様書](./database-docs.md)
- [フロントエンド開発ガイド](./frontend-guide.md)
