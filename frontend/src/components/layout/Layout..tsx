"use client";

import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import type { LayoutProps } from "@/types";

export const Layout: React.FC<LayoutProps> = ({
  children,
  title = "SNS Platform",
  hideNavigation = false,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavigation && <Header />}

      <div className="flex">
        {!hideNavigation && <Sidebar />}

        <main className={`flex-1 ${!hideNavigation ? "ml-64 pt-16" : ""}`}>
          <div className="container mx-auto px-4">{children}</div>
        </main>
      </div>
    </div>
  );
};
