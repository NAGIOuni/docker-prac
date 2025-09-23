"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  Bell,
  Settings,
  Edit3,
  TrendingUp,
  Bookmark,
} from "lucide-react";

const navItems = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/profile", label: "プロフィール", icon: User },
  { href: "/notifications", label: "通知", icon: Bell, badge: 3 },
  { href: "/bookmarks", label: "ブックマーク", icon: Bookmark },
  { href: "/trending", label: "トレンド", icon: TrendingUp },
  { href: "/settings", label: "設定", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="w-6 h-6" />
                  <span className="font-medium">{item.label}</span>
                </div>

                {item.badge && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 投稿ボタン */}
        <div className="mt-8">
          <button className="w-full bg-blue-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center space-x-2">
            <Edit3 className="w-5 h-5" />
            <span>投稿する</span>
          </button>
        </div>

        {/* ユーザー情報カード */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Alice Johnson
              </p>
              <p className="text-xs text-gray-500 truncate">@alice</p>
            </div>
          </div>

          {/* フォロー統計 */}
          <div className="mt-3 flex justify-between text-xs text-gray-600">
            <div>
              <span className="font-semibold text-gray-900">123</span>
              <span className="ml-1">フォロー中</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">456</span>
              <span className="ml-1">フォロワー</span>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © 2024 SNS Platform
          </p>
        </div>
      </div>
    </div>
  );
};
