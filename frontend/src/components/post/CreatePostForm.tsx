"use client";

import React, { useState } from "react";
import { Image, Smile, MapPin, Calendar } from "lucide-react";
import type { CreatePostFormProps } from "@/types";

export const CreatePostForm: React.FC<CreatePostFormProps> = ({
  onSubmit,
  isLoading = false,
  placeholder = "今何してる？",
}) => {
  const [content, setContent] = useState("");
  const [charCount, setCharCount] = useState(0);
  const maxChars = 280;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setCharCount(newContent.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    if (trimmedContent && !isLoading) {
      onSubmit(trimmedContent);
      setContent("");
      setCharCount(0);
    }
  };

  const isDisabled = !content.trim() || isLoading || charCount > maxChars;
  const isNearLimit = charCount > maxChars * 0.8;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <form onSubmit={handleSubmit}>
        {/* メインコンテンツ */}
        <div className="p-6">
          <div className="flex items-start space-x-4">
            {/* プロフィール画像 */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">A</span>
              </div>
            </div>

            {/* 入力エリア */}
            <div className="flex-1">
              <textarea
                value={content}
                onChange={handleContentChange}
                placeholder={placeholder}
                rows={3}
                disabled={isLoading}
                className={`w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                  charCount > maxChars
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300"
                }`}
              />

              {/* 文字数とアクション */}
              <div className="flex items-center justify-between mt-3">
                {/* 添付オプション */}
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    title="画像を添付"
                    disabled
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    title="絵文字"
                    disabled
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    title="位置情報"
                    disabled
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    title="予約投稿"
                    disabled
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                </div>

                {/* 文字数と投稿ボタン */}
                <div className="flex items-center space-x-4">
                  {/* 文字数インジケーター */}
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm ${
                        charCount > maxChars
                          ? "text-red-500"
                          : isNearLimit
                          ? "text-yellow-500"
                          : "text-gray-500"
                      }`}
                    >
                      {charCount}/{maxChars}
                    </span>

                    {/* 円形プログレスバー */}
                    <div className="relative w-6 h-6">
                      <svg
                        className="w-6 h-6 transform -rotate-90"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          className="text-gray-200"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 10}`}
                          strokeDashoffset={`${
                            2 *
                            Math.PI *
                            10 *
                            (1 - Math.min(charCount / maxChars, 1))
                          }`}
                          className={`transition-all duration-300 ${
                            charCount > maxChars
                              ? "text-red-500"
                              : isNearLimit
                              ? "text-yellow-500"
                              : "text-blue-500"
                          }`}
                        />
                      </svg>
                    </div>
                  </div>

                  {/* 投稿ボタン */}
                  <button
                    type="submit"
                    disabled={isDisabled}
                    className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[80px]"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      "投稿"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {charCount > maxChars && (
          <div className="px-6 pb-4">
            <p className="text-sm text-red-500 flex items-center">
              <span className="mr-2">⚠️</span>
              投稿は{maxChars}文字以内で入力してください
            </p>
          </div>
        )}
      </form>
    </div>
  );
};
