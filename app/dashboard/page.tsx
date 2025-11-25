'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Event {
  id: number;
  name: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
}

interface Match {
  id: number;
  eventId?: number;
  date?: string;
  startTime?: string;
  teamHome?: { name: string };
  teamAway?: { name: string };
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Note: これらのエンドポイントは認証が必要です
        // トークンはローカルストレージまたはセッションから取得する必要があります
        const token = localStorage.getItem('authToken');

        const [eventsRes, matchesRes] = await Promise.all([
          fetch('/api/events', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          fetch('/api/matches', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
        ]);

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
        }

        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setMatches(matchesData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データ読み込みエラー');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ドジロウ！ダッシュボード</h1>
            <p className="text-gray-600 mt-2">ドッジボールスコア管理システム</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              ホーム
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('authToken');
                window.location.href = '/';
              }}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* クイックアクションボタン */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/events"
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-medium text-center transition"
          >
            📅 イベント管理
          </Link>
          <Link
            href="/teams"
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-medium text-center transition"
          >
            👥 チーム管理
          </Link>
          <Link
            href="/matches"
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-medium text-center transition"
          >
            🏐 試合管理
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            エラー: {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500">読み込み中...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* イベント一覧 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">📅 イベント</h2>
              {events.length === 0 ? (
                <p className="text-gray-500">イベントはまだ登録されていません</p>
              ) : (
                <div className="space-y-4">
                  {events.slice(0, 5).map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <div className="text-sm text-gray-600 mt-2">
                        <p>タイプ: {event.eventType || '不明'}</p>
                        <p>会場: {event.venue || '-'}</p>
                        {event.startDate && (
                          <p>開始: {formatDate(event.startDate)}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {events.length > 5 && (
                <Link href="/events" className="text-blue-600 hover:text-blue-800 text-sm mt-4 inline-block">
                  すべて表示 →
                </Link>
              )}
            </div>

            {/* 試合一覧 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">🏐 試合</h2>
              {matches.length === 0 ? (
                <p className="text-gray-500">試合はまだ登録されていません</p>
              ) : (
                <div className="space-y-4">
                  {matches.slice(0, 5).map((match) => (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}/score`}
                      className="block p-4 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {match.teamHome?.name || 'チームA'} vs{' '}
                            {match.teamAway?.name || 'チームB'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {match.date ? formatDate(match.date) : '日時未定'}
                          </p>
                        </div>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition">
                          スコア入力
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {matches.length > 5 && (
                <Link href="/matches" className="text-blue-600 hover:text-blue-800 text-sm mt-4 inline-block">
                  すべて表示 →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{events.length}</div>
            <p className="text-gray-600 mt-2">イベント</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{matches.length}</div>
            <p className="text-gray-600 mt-2">試合</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">-</div>
            <p className="text-gray-600 mt-2">進行中</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">-</div>
            <p className="text-gray-600 mt-2">完了</p>
          </div>
        </div>
      </main>
    </div>
  );
}
