"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout.";
import { PostCard } from "@/components/post/PostCard";
import { CreatePostForm } from "@/components/post/CreatePostForm";
import { postsApi } from "@/lib/api-client";
import type { PostWithUser } from "@/types";

// ダミーユーザーID（認証システム実装まで使用）
const DUMMY_USER_ID = "cm4hxz21j0000mi08l46x5r8g"; // Alice

export default function HomePage() {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // 投稿一覧を取得
  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await postsApi.getPosts(pageNum, 10);

      if (response.success) {
        const newPosts = response.data.data;
        const pagination = response.data.pagination;

        if (append) {
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }

        setHasMore(pagination.hasNext);
        setPage(pagination.currentPage);
      } else {
        setError("投稿の取得に失敗しました");
      }
    } catch (err) {
      console.error("Posts fetch error:", err);
      setError(err instanceof Error ? err.message : "投稿の取得に失敗しました");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    fetchPosts();
  }, []);

  // 投稿作成
  const handleCreatePost = async (content: string, imageUrls?: string[]) => {
    setCreateLoading(true);
    try {
      const response = await postsApi.createPost({
        userId: DUMMY_USER_ID,
        content,
        imageUrls: imageUrls || [],
      });

      if (response.success) {
        // 投稿成功後、一覧を再取得
        await fetchPosts();
        // 成功メッセージを表示（簡易版）
        console.log("投稿が作成されました！");
      } else {
        throw new Error("投稿の作成に失敗しました");
      }
    } catch (err) {
      console.error("Post creation error:", err);
      setError(err instanceof Error ? err.message : "投稿の作成に失敗しました");
    } finally {
      setCreateLoading(false);
    }
  };

  // いいね処理（TODO: 実装予定）
  const handleLike = async (postId: string, isLiked: boolean) => {
    console.log(`Like ${isLiked ? "added" : "removed"} for post:`, postId);
    // TODO: likesApi を使って実際のいいね処理を実装
  };

  // 投稿削除
  const handleDelete = async (postId: string) => {
    try {
      const response = await postsApi.deletePost(postId);

      if (response.success) {
        // 投稿をリストから削除
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        console.log("投稿が削除されました");
      } else {
        throw new Error("投稿の削除に失敗しました");
      }
    } catch (err) {
      console.error("Post deletion error:", err);
      setError(err instanceof Error ? err.message : "投稿の削除に失敗しました");
    }
  };

  // もっと読み込む
  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchPosts(page + 1, true);
    }
  };

  // エラー状態の表示
  if (error && posts.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  エラーが発生しました
                </h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setError(null);
                      fetchPosts();
                    }}
                    className="bg-red-100 px-4 py-2 rounded-md text-red-800 text-sm hover:bg-red-200 transition-colors"
                  >
                    再試行
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6 py-6">
        {/* 投稿作成フォーム */}
        <CreatePostForm onSubmit={handleCreatePost} isLoading={createLoading} />

        {/* エラーメッセージ（投稿は表示したまま） */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">エラー</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ローディング状態（初回） */}
        {loading && posts.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">投稿を読み込み中...</span>
          </div>
        ) : (
          /* タイムライン */
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h6a2 2 0 002-2V8M9 12h6"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  投稿がありません
                </h3>
                <p className="text-gray-500">最初の投稿をしてみましょう！</p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={DUMMY_USER_ID}
                    onLike={handleLike}
                    onDelete={handleDelete}
                  />
                ))}

                {/* もっと読み込むボタン */}
                {hasMore && (
                  <div className="text-center py-6">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 inline-block mr-2"></div>
                          読み込み中...
                        </>
                      ) : (
                        "もっと見る"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
