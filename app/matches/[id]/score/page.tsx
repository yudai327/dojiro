'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Player {
  id: number;
  name: string;
  uniformNumber?: number;
}

interface TeamData {
  id: number;
  name: string;
  players?: Player[];
}

interface Match {
  id: number;
  teamHome?: TeamData;
  teamAway?: TeamData;
}

interface PlayerStat {
  playerId: number;
  playerName: string;
  attackSuccessCount: number;
  attackFailCount: number;
  catchSuccessCount: number;
  catchFailCount: number;
  cutCount: number;
  attackRate: number;
  catchRate: number;
}

export default function ScorePage() {
  const params = useParams();
  const matchId = params?.id as string;
  const router = useRouter();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [actionType, setActionType] = useState<'attack' | 'catch' | 'cut'>('attack');
  const [result, setResult] = useState<'success' | 'fail'>('success');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState<PlayerStat[]>([]);

  useEffect(() => {
    if (!matchId) return;
    loadMatch();
    loadStats();
  }, [matchId]);

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadMatch = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('試合データの読み込みに失敗しました');
      const data = await response.json();
      setMatch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}/stats`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) return;
      const data = await response.json();
      setStats(data);
    } catch {
      // stats load failure is non-critical
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) {
      setMessage({ type: 'error', text: 'プレイヤーを選択してください' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/matches/${matchId}/player-actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          playerId: selectedPlayer,
          actionType,
          result,
        }),
      });

      if (!response.ok) throw new Error('記録に失敗しました');

      setMessage({ type: 'success', text: '記録しました' });
      await loadStats();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'エラーが発生しました' });
    } finally {
      setSubmitting(false);
    }
  };

  const currentTeam = selectedTeam === 'home' ? match?.teamHome : match?.teamAway;

  if (loading) return <div className="p-8">読み込み中...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!match) return <div className="p-8">試合が見つかりません</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800">
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold">スコア入力</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedTeam('home')}
            className={`flex-1 py-2 rounded font-medium ${
              selectedTeam === 'home' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            {match.teamHome?.name ?? 'ホーム'}
          </button>
          <button
            onClick={() => setSelectedTeam('away')}
            className={`flex-1 py-2 rounded font-medium ${
              selectedTeam === 'away' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            {match.teamAway?.name ?? 'アウェイ'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">プレイヤー</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">選択してください</option>
              {currentTeam?.players?.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.uniformNumber} {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">アクション</label>
            <div className="flex gap-2">
              {(['attack', 'catch', 'cut'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActionType(type)}
                  className={`flex-1 py-2 rounded font-medium ${
                    actionType === type ? 'bg-blue-600 text-white' : 'bg-gray-100'
                  }`}
                >
                  {type === 'attack' ? '攻撃' : type === 'catch' ? 'キャッチ' : 'カット'}
                </button>
              ))}
            </div>
          </div>

          {actionType !== 'cut' && (
            <div>
              <label className="block text-sm font-medium mb-1">結果</label>
              <div className="flex gap-2">
                {(['success', 'fail'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setResult(r)}
                    className={`flex-1 py-2 rounded font-medium ${
                      result === r ? 'bg-blue-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {r === 'success' ? '成功' : '失敗'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {message && (
            <div
              className={`p-3 rounded text-sm ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded font-medium disabled:opacity-50"
          >
            {submitting ? '記録中...' : '記録する'}
          </button>
        </form>
      </div>

      {stats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">スタッツ</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">選手</th>
                <th className="text-right py-2">攻撃</th>
                <th className="text-right py-2">キャッチ</th>
                <th className="text-right py-2">カット</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.playerId} className="border-b">
                  <td className="py-2">{s.playerName}</td>
                  <td className="text-right py-2">
                    {s.attackSuccessCount}/{s.attackSuccessCount + s.attackFailCount}
                  </td>
                  <td className="text-right py-2">
                    {s.catchSuccessCount}/{s.catchSuccessCount + s.catchFailCount}
                  </td>
                  <td className="text-right py-2">{s.cutCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
