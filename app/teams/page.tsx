'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Team {
  id: number;
  name: string;
  category?: string;
  organization?: string;
  isDeleted: boolean;
  players?: Player[];
}

interface Player {
  id: number;
  name: string;
  uniformNumber?: number;
  position?: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'men',
    organization: '',
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/teams', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setTeams(data.filter((t: Team) => !t.isDeleted));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadTeams();
        setShowForm(false);
        setFormData({
          name: '',
          category: 'men',
          organization: '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'チーム作成に失敗しました');
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'men':
        return '男性';
      case 'women':
        return '女性';
      case 'mixed':
        return 'ミックス';
      default:
        return '-';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm">
              ← ダッシュボード
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">👥 チーム管理</h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              + 新規チーム
            </button>
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {/* 新規チームフォーム */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">新規チーム</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  チーム名 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="例：ドジロウA"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    カテゴリー
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="men">男性</option>
                    <option value="women">女性</option>
                    <option value="mixed">ミックス</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    所属団体
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) =>
                      setFormData({ ...formData, organization: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="例：ドジロウ協会"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  作成
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* チーム一覧 */}
        {loading ? (
          <div className="text-center text-gray-500">読み込み中...</div>
        ) : teams.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">チームはまだ登録されていません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{team.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>カテゴリー: {getCategoryLabel(team.category)}</p>
                  <p>所属: {team.organization || '-'}</p>
                  <p className="mt-3 font-medium text-gray-700">
                    選手数: {team.players?.length || 0}
                  </p>
                </div>

                {team.players && team.players.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500 mb-2">選手一覧:</p>
                    <ul className="space-y-1 text-xs">
                      {team.players.slice(0, 3).map((player) => (
                        <li key={player.id} className="text-gray-700">
                          {player.uniformNumber ? `#${player.uniformNumber} ` : ''}
                          {player.name}
                        </li>
                      ))}
                      {team.players.length > 3 && (
                        <li className="text-gray-500 italic">
                          他 {team.players.length - 3} 人
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
