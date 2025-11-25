'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      {/* ナビゲーション */}
      <header className="bg-white bg-opacity-10 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">🏐 ドジロウ</h1>
          <nav className="flex gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-white hover:text-purple-100 font-medium transition"
                >
                  ダッシュボード
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    window.location.reload();
                  }}
                  className="text-white hover:text-purple-100 font-medium transition"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-white hover:text-purple-100 font-medium transition"
              >
                ログイン
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* ヒーロー */}
          <div className="mb-12">
            <h2 className="text-5xl font-bold text-white mb-4">
              ドッジボール スコア管理
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              リアルタイムでドッジボールの試合スコアを記録・管理できます
            </p>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-purple-50 transition shadow-lg"
              >
                ダッシュボードへ →
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-purple-50 transition shadow-lg"
              >
                ログインする →
              </Link>
            )}
          </div>

          {/* 機能紹介 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 text-white">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-bold mb-2">スコア管理</h3>
              <p className="text-purple-100">
                試合のスコアをリアルタイムで記録・更新
              </p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 text-white">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-bold mb-2">イベント管理</h3>
              <p className="text-purple-100">
                複数のイベントと試合を一元管理
              </p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 text-white">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-bold mb-2">チーム管理</h3>
              <p className="text-purple-100">
                チームとプレイヤーの情報を管理
              </p>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="mt-16 bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">プラットフォーム</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold">🔧</p>
                <p className="text-sm mt-2">TypeScript</p>
              </div>
              <div>
                <p className="text-2xl font-bold">⚡</p>
                <p className="text-sm mt-2">Next.js 14</p>
              </div>
              <div>
                <p className="text-2xl font-bold">🗄️</p>
                <p className="text-sm mt-2">Prisma ORM</p>
              </div>
              <div>
                <p className="text-2xl font-bold">🔒</p>
                <p className="text-sm mt-2">JWT Auth</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-black bg-opacity-30 text-center py-6 mt-16 text-white text-sm">
        <p>© 2024 ドジロウ - ドッジボール スコア管理システム</p>
      </footer>
    </div>
  );
}
