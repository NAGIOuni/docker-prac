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
- [x] **全 Controller 完全実装** ✨
- [x] **全型定義ファイル実装完了** ✨
- [x] **全 Routes 実装完了** ✨
- [x] **完全な SNS API システム** 🎉

### 🔄 現在作業中

- [ ] **フロントエンド実装** - Next.js + TypeScript + Tailwind CSS

---

## プロジェクト構成

```
sns-platform/
├── docker-compose.yml          # Docker環境定義 ✅
├── frontend/                   # Next.jsアプリケーション 🔄
│   ├── src/
│   │   ├── app/               # App Router
│   │   ├── components/        # React Components
│   │   └── lib/              # ユーティリティ
│   ├── package.json
│   └── next.config.js
├── backend/                    # Express APIサーバー ✅
│   ├── src/
│   │   ├── controllers/       # ✅ 全Controller完全実装
│   │   │   ├── userController.ts
│   │   │   ├── postController.ts
│   │   │   ├── followController.ts
│   │   │   └── likeController.ts
│   │   ├── routes/           # ✅ 全Routes実装
│   │   │   ├── users.ts
│   │   │   ├── posts.ts
│   │   │   ├── follows.ts
│   │   │   └── likes.ts
│   │   ├── types/            # ✅ 完全な型定義システム
│   │   │   ├── user.ts
│   │   │   ├── post.ts
│   │   │   ├── follow.ts
│   │   │   └── like.ts
│   │   ├── lib/              # ✅ prisma.ts 完成
│   │   └── server.ts         # ✅ 全ルート統合完了
│   ├── prisma/
│   │   ├── schema.prisma     # ✅ 完成
│   │   ├── migrations/       # ✅ 実行済み
│   │   └── seed.ts          # ✅ 実行済み
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

    PostImages {
        string id PK
        string postId FK
        string imageUrl
        int imageOrder
        datetime createdAt
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
    Posts ||--o{ PostImages : "has"
    Users ||--o{ Comments : "writes"
    Posts ||--o{ Comments : "receives"
    Comments ||--o{ Comments : "replies to"
```

---

## 完全実装済み API システム

### ベース URL

```
Development: http://localhost:8000/api
Production: https://yourdomain.com/api
```

### 📊 実装済みエンドポイント一覧

| 分野        | エンドポイント                      | Method | 説明             | 実装状況 |
| ----------- | ----------------------------------- | ------ | ---------------- | -------- |
| **Users**   | `/api/users`                        | GET    | ユーザー一覧取得 | ✅ 完了  |
|             | `/api/users/:id`                    | GET    | 特定ユーザー取得 | ✅ 完了  |
|             | `/api/users`                        | POST   | ユーザー作成     | ✅ 完了  |
|             | `/api/users/:id`                    | PUT    | ユーザー更新     | ✅ 完了  |
|             | `/api/users/:id`                    | DELETE | ユーザー削除     | ✅ 完了  |
| **Posts**   | `/api/posts`                        | GET    | 投稿一覧取得     | ✅ 完了  |
|             | `/api/posts/:id`                    | GET    | 特定投稿取得     | ✅ 完了  |
|             | `/api/posts`                        | POST   | 投稿作成         | ✅ 完了  |
|             | `/api/posts/:id`                    | PUT    | 投稿更新         | ✅ 完了  |
|             | `/api/posts/:id`                    | DELETE | 投稿削除         | ✅ 完了  |
| **Follows** | `/api/follows`                      | POST   | フォロー作成     | ✅ 完了  |
|             | `/api/follows/:followingId`         | DELETE | アンフォロー     | ✅ 完了  |
|             | `/api/follows/status/:targetUserId` | GET    | フォロー状態確認 | ✅ 完了  |
| **Likes**   | `/api/likes`                        | POST   | いいね作成       | ✅ 完了  |
|             | `/api/likes`                        | DELETE | いいね削除       | ✅ 完了  |
|             | `/api/likes`                        | GET    | いいね状態確認   | ✅ 完了  |

**合計: 16 エンドポイント** 🎉

---

## 型定義システム

### 完全実装済み型定義ファイル

#### 1. User Types (`types/user.ts`)

```typescript
// Core Types
export interface User { ... }
export interface PublicUser { ... }
export interface UserCount { ... }

// Request/Response Types
export interface CreateUserRequest { ... }
export interface UpdateUserRequest { ... }
export interface GetUsersResponse { ... }
export interface GetUserResponse { ... }
export interface CreateUserResponse { ... }
export interface UpdateUserResponse { ... }
export interface DeleteUserResponse { ... }
```

#### 2. Post Types (`types/post.ts`)

```typescript
// Core Types
export interface Post { ... }
export interface PostWithUser { ... }
export interface PostCount { ... }
export interface PostImage { ... }
export interface FullPost { ... }

// Request/Response Types
export interface CreatePostRequest { ... }
export interface UpdatePostRequest { ... }
export interface GetPostsResponse { ... }
export interface GetPostResponse { ... }
export interface CreatePostResponse { ... }
export interface UpdatePostResponse { ... }
export interface DeletePostResponse { ... }
```

#### 3. Follow Types (`types/follow.ts`)

```typescript
// Core Types
export interface Follow { ... }
export interface FollowerInfo { ... }
export interface FollowingInfo { ... }

// Request/Response Types
export interface CreateFollowRequest { ... }
export interface CreateFollowResponse { ... }
export interface DeleteFollowResponse { ... }
export interface FollowStatusResponse { ... }
export interface GetFollowersResponse { ... }
export interface GetFollowingResponse { ... }
export interface FollowStatsResponse { ... }
```

#### 4. Like Types (`types/like.ts`)

```typescript
// Core Types
export interface Like { ... }
export interface LikeWithUser { ... }
export interface LikeWithPost { ... }

// Request/Response Types
export interface CreateLikeRequest { ... }
export interface CreateLikeResponse { ... }
export interface DeleteLikeResponse { ... }
export interface LikeStatusResponse { ... }
export interface GetPostLikesResponse { ... }
export interface GetUserLikesResponse { ... }
export interface LikeStatsResponse { ... }
```

---

## API 使用例

### 1. Users API

#### ユーザー一覧取得

```bash
curl "http://localhost:8000/api/users?page=1&limit=10"
```

#### ユーザー作成

```bash
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "username": "alice",
    "displayName": "Alice Johnson",
    "bio": "Hello! Nice to meet you 😊"
  }'
```

### 2. Posts API

#### 投稿一覧取得

```bash
curl "http://localhost:8000/api/posts?page=1&limit=10"
```

#### 投稿作成

```bash
curl -X POST http://localhost:8000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_HERE",
    "content": "Hello, this is my first post! 🎉",
    "imageUrls": ["https://example.com/image1.jpg"]
  }'
```

### 3. Follows API

#### フォロー作成

```bash
curl -X POST http://localhost:8000/api/follows \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_1",
    "followingId": "USER_ID_2"
  }'
```

#### フォロー状態確認

```bash
curl "http://localhost:8000/api/follows/status/TARGET_USER_ID?userId=CURRENT_USER_ID"
```

### 4. Likes API

#### いいね作成

```bash
curl -X POST http://localhost:8000/api/likes \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "postId": "POST_ID"
  }'
```

#### いいね状態確認

```bash
curl "http://localhost:8000/api/likes?postId=POST_ID&userId=USER_ID"
```

---

## 実装の特徴・ベストプラクティス

### 🔒 型安全性

- **完全な型定義システム**: 全 API 対応の型定義
- **Type Guards**: 実行時型チェック
- **Request/Response 型パラメータ**: Express 完全対応

### 🛡️ セキュリティ対策

- **DoS 攻撃防止**: limit 上限設定
- **機密情報保護**: email 除外機能
- **入力値サニタイゼーション**: trim 処理

### ⚡ パフォーマンス最適化

- **並列処理**: Promise.all 活用
- **選択的取得**: 必要フィールドのみ
- **効率的ページネーション**: skip/take 実装
- **ソフトデリート**: 論理削除対応

### 🚨 堅牢なエラーハンドリング

- **Prisma エラー詳細処理**: P2002, P2025 等
- **型安全なエラーレスポンス**: 一貫した形式
- **HTTP ステータスコード**: 適切な使い分け

---

## サンプルデータ

データベースには以下のテストデータが投入済みです：

### Users

- **Alice** (@alice) - "Hello! Nice to meet you 😊"
- **Bob** (@bob) - "Software developer and coffee lover ☕"
- **Carol** (@carol) - "Photographer | Travel enthusiast 📸"

### Posts

- Alice: "Hello world! This is my first post on this platform! 🎉"
- Bob: "Just finished working on a new React project. TypeScript is amazing! 🚀"
- Alice: "Beautiful sunset today. Nature never fails to amaze me 🌅"

### Social Data

- **Follows**: Alice ↔ Bob, Carol → Alice
- **Likes**: 相互いいね、複数投稿へのいいね
- **Comments**: 返信コメント含む

---

## 開発環境セットアップ

### 前提条件

- Docker Desktop
- Node.js 18+
- npm or yarn

### 1. 環境変数設定

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

### 2. 環境起動

```bash
# Docker環境起動
docker-compose up -d

# バックエンド起動
cd backend && npm run dev

# フロントエンド起動（別ターミナル）
cd frontend && npm run dev
```

### 3. 動作確認

| サービス      | URL                          | 説明           |
| ------------- | ---------------------------- | -------------- |
| Frontend      | http://localhost:3000        | Next.js アプリ |
| Backend API   | http://localhost:8000/health | Express API    |
| Prisma Studio | http://localhost:5555        | DB 管理画面    |

---

## フロントエンド実装計画

### 🎯 実装優先度

#### Phase 1: 基本構造

- [x] **API Client 作成** - バックエンド連携
- [ ] **レイアウトシステム** - ヘッダー、ナビゲーション
- [ ] **ルーティング** - ページ遷移設計

#### Phase 2: コア機能

- [ ] **投稿表示** - タイムライン、投稿詳細
- [ ] **ユーザープロフィール** - プロフィール表示・編集
- [ ] **投稿作成** - テキスト投稿、画像アップロード

#### Phase 3: ソーシャル機能

- [ ] **いいね機能** - ハート機能、カウント表示
- [ ] **フォロー機能** - フォロー/アンフォロー
- [ ] **ユーザー検索** - ユーザー発見機能

#### Phase 4: 拡張機能

- [ ] **コメント機能** - 投稿への返信
- [ ] **通知システム** - リアルタイム通知
- [ ] **認証システム** - ログイン・サインアップ

### 🛠️ 技術スタック (フロントエンド)

| 用途               | 技術                  | 備考                           |
| ------------------ | --------------------- | ------------------------------ |
| **フレームワーク** | Next.js 14            | App Router 使用                |
| **言語**           | TypeScript            | 完全型安全                     |
| **スタイリング**   | Tailwind CSS          | モダン UI                      |
| **状態管理**       | React Query + Zustand | サーバー状態・クライアント状態 |
| **フォーム**       | React Hook Form       | バリデーション                 |
| **アイコン**       | Lucide React          | 軽量アイコンセット             |
| **認証**           | NextAuth.js           | JWT 対応                       |

---

## API レスポンス形式

### 成功レスポンス

```typescript
{
  "success": true,
  "data": T,
  "message"?: string
}
```

### エラーレスポンス

```typescript
{
  "success": false,
  "error": string
}
```

### ページネーション付きレスポンス

```typescript
{
  "success": true,
  "data": {
    "data": T[],
    "pagination": {
      "currentPage": number,
      "totalPages": number,
      "totalItems": number,
      "hasNext": boolean,
      "hasPrev": boolean
    }
  }
}
```

---

## トラブルシューティング

### よくある問題

#### 1. Docker 関連

```bash
# コンテナ状態確認
docker-compose ps

# ログ確認
docker-compose logs -f [service-name]

# 再起動
docker-compose restart
```

#### 2. データベース関連

```bash
# Prisma Studio起動
npx prisma studio

# マイグレーション
npx prisma migrate dev

# リセット
npx prisma migrate reset
```

#### 3. API 動作確認

```bash
# ヘルスチェック
curl http://localhost:8000/health

# API テスト
curl http://localhost:8000/api/test
```

---

## プロジェクト特徴まとめ

### ✅ **完全実装済み**

- **16 エンドポイント** の完全な REST API
- **4 つの型定義ファイル** による完全な型安全性
- **Docker 環境** による開発環境の一貫性
- **Prisma ORM** による型安全な DB 操作
- **サンプルデータ** による即座のテスト可能

### 🎯 **設計思想**

- **型安全性重視** - TypeScript 完全活用
- **セキュリティ重視** - 適切な認証・認可設計
- **パフォーマンス重視** - 効率的な DB 操作
- **保守性重視** - 拡張可能な設計
- **開発体験重視** - 快適な開発環境

### 🚀 **次のステップ**

バックエンド API が完全に準備できているため、**フロントエンド実装に集中**できます！

---

## 更新履歴

| Date       | Version | Changes                                |
| ---------- | ------- | -------------------------------------- |
| 2024-01-01 | v0.1.0  | 初期版リリース                         |
| 2024-01-15 | v0.2.0  | ユーザー管理機能実装完了               |
| 2024-01-20 | v0.3.0  | 型定義システム実装完了                 |
| 2024-01-25 | v1.0.0  | **完全な SNS API システム実装完了** 🎉 |

---

## サポート・リソース

### 📚 ドキュメント

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### 🔗 便利リンク

- Prisma Studio: http://localhost:5555
- API Health Check: http://localhost:8000/health
- API Test Endpoint: http://localhost:8000/api/test

このドキュメントをフロントエンド実装の開始点として活用してください！ 🚀
