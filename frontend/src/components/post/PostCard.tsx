// src/components/post/PostCard.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Bookmark,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import type { PostCardProps } from "@/types";

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onLike,
  onDelete,
  onComment,
}) => {
  // React フックを最初に配置（条件付きにならないように）
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser || false);
  const [likeCount, setLikeCount] = useState(post._count?.likedBy || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 安全性チェック: post.postedBy が存在しない場合の対処
  if (!post || !post.postedBy) {
    console.error("PostCard: Invalid post data", post);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">投稿データが不正です</p>
        <pre className="text-xs mt-2 text-gray-600">
          {JSON.stringify(post, null, 2)}
        </pre>
      </div>
    );
  }

  const handleLike = async () => {
    const newIsLiked = !isLiked;
    const oldLikeCount = likeCount;

    // 楽観的アップデート
    setIsLiked(newIsLiked);
    setLikeCount((prev: number) =>
      newIsLiked ? prev + 1 : Math.max(0, prev - 1)
    );

    try {
      if (onLike) {
        await onLike(post.id, newIsLiked);
      }
    } catch (error) {
      // エラーの場合は元に戻す
      setIsLiked(!newIsLiked);
      setLikeCount(oldLikeCount);
      console.error("Like error:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("この投稿を削除しますか？この操作は取り消せません。")) {
      return;
    }

    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(post.id);
      }
    } catch (error) {
      console.error("Delete error:", error);
      setIsDeleting(false);
    }
  };

  const handleComment = () => {
    if (onComment) {
      onComment(post.id);
    }
  };

  const isOwner = currentUserId === post.userId;
  const createdAt = new Date(post.createdAt);
  const timeAgo = formatDistanceToNow(createdAt, {
    addSuffix: true,
    locale: ja,
  });

  // ユーザー情報の安全なアクセス
  const userName = post.postedBy?.displayName || "Unknown User";
  const userHandle = post.postedBy?.username || "unknown";
  const userBio = post.postedBy?.bio || "";
  const profileImageUrl = post.postedBy?.profileImageUrl;

  if (isDeleting) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
          <span className="ml-2 text-gray-500">削除中...</span>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* ヘッダー */}
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="flex items-center space-x-3 flex-1">
          {/* プロフィール画像 */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden relative">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt={userName}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.parentElement
                      ?.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.classList.remove("hidden");
                    }
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg ${
                  profileImageUrl ? "hidden" : ""
                }`}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* ユーザー情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {userName}
              </h3>
              <span className="text-gray-500 text-sm">@{userHandle}</span>
              <span className="text-gray-400 text-sm">•</span>
              <span
                className="text-gray-500 text-sm"
                title={createdAt.toLocaleString()}
              >
                {timeAgo}
              </span>
            </div>
            {userBio && (
              <p className="text-sm text-gray-600 mt-1 truncate">{userBio}</p>
            )}
          </div>
        </div>

        {/* メニューボタン */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {/* ドロップダウンメニュー */}
          {showMenu && (
            <>
              {/* オーバーレイ */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                {isOwner && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    削除
                  </button>
                )}
                <button
                  onClick={() => setShowMenu(false)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  報告
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 投稿内容 */}
      <div className="px-6 pb-4">
        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
          {post.content || ""}
        </p>

        {/* 画像ギャラリー */}
        {post.images && post.images.length > 0 && (
          <div
            className={`mt-4 rounded-lg overflow-hidden ${
              post.images.length === 1
                ? "max-h-96"
                : post.images.length === 2
                ? "grid grid-cols-2 gap-1 max-h-64"
                : "grid grid-cols-2 gap-1 max-h-80"
            }`}
          >
            {post.images?.slice(0, 4).map((image, index) => (
              <div
                key={image.id}
                className={`relative ${
                  post.images && post.images.length === 3 && index === 0
                    ? "row-span-2"
                    : ""
                }`}
              >
                <Image
                  src={image.imageUrl}
                  alt=""
                  fill
                  className="object-cover hover:opacity-95 transition-opacity cursor-pointer"
                  onClick={() => {
                    window.open(image.imageUrl, "_blank");
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEyVjdBMiAyIDAgMCAwIDE5IDVINUEyIDIgMCAwIDAgMyA3VjEyIiBzdHJva2U9IiM2QjczODAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0zIDEyVjE3QTIgMiAwIDAgMCA1IDE5SDE5QTIgMiAwIDAgMCAyMSAxN1YxMiIgc3Ryb2tlPSIjNkI3MzgwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K";
                  }}
                />
                {post.images && post.images.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      +{post.images.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
        <div className="flex items-center space-x-8">
          {/* いいねボタン */}
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 group transition-colors ${
              isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
            }`}
          >
            <div
              className={`p-2 rounded-full transition-colors ${
                isLiked ? "bg-red-50" : "group-hover:bg-red-50"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            </div>
            <span className="text-sm font-medium">{likeCount}</span>
          </button>

          {/* コメントボタン */}
          <button
            onClick={handleComment}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 group transition-colors"
          >
            <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">
              {post._count?.comments || 0}
            </span>
          </button>

          {/* リツイートボタン */}
          <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 group transition-colors">
            <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
              <Repeat2 className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">0</span>
          </button>

          {/* シェアボタン */}
          <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 group transition-colors">
            <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
              <Share className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* ブックマークボタン */}
        <button className="text-gray-500 hover:text-yellow-500 group transition-colors">
          <div className="p-2 rounded-full group-hover:bg-yellow-50 transition-colors">
            <Bookmark className="w-5 h-5" />
          </div>
        </button>
      </div>
    </article>
  );
};
