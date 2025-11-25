'use client';'use client';'use client';'use client';'use client';'use client';'use client';'use client';



import { useParams, useRouter } from 'next/navigation';

import { useState, useEffect } from 'react';

import { useParams, useRouter } from 'next/navigation';

interface Player {

  id: number;import { useState, useEffect } from 'react';

  name: string;

  uniformNumber?: number;import { useParams, useRouter } from 'next/navigation';

}

interface Player {

interface TeamData {

  name: string;  id: number;import { useState, useEffect } from 'react';

  players?: Player[];

}  name: string;



interface Match {  uniformNumber?: number;import { useParams, useRouter } from 'next/navigation';

  id: number;

  teamHome?: TeamData;}

  teamAway?: TeamData;

}interface Player {



interface PlayerStat {interface TeamData {

  playerId: number;

  playerName: string;  name: string;  id: number;import { useState, useEffect } from 'react';

  attackSuccess: number;

  attackFail: number;  players?: Player[];

  catchSuccess: number;

  catchFail: number;}  name: string;

  cutCount: number;

}



export default function ScorePage() {interface Match {  uniformNumber?: number;import { useParams, useRouter } from 'next/navigation';

  const params = useParams();

  const matchId = params?.id as string;  id: number;

  const router = useRouter();

  teamHome?: TeamData;}

  const [match, setMatch] = useState<Match | null>(null);

  const [loading, setLoading] = useState(true);  teamAway?: TeamData;

  const [error, setError] = useState<string | null>(null);

  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');}interface Player {

  const [selectedPlayer, setSelectedPlayer] = useState<string>('');

  const [actionType, setActionType] = useState<'attack' | 'catch' | 'cut'>('attack');

  const [result, setResult] = useState<'success' | 'fail'>('success');

  const [submitting, setSubmitting] = useState(false);interface PlayerStat {interface TeamData {

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [stats, setStats] = useState<PlayerStat[]>([]);  playerId: number;



  useEffect(() => {  playerName: string;  name: string;  id: number;import { useState, useEffect } from 'react';

    if (!matchId) return;

    loadMatch();  attackSuccess: number;

    loadStats();

  }, [matchId]);  attackFail: number;  players?: Player[];



  const loadMatch = async () => {  catchSuccess: number;

    try {

      const token = localStorage.getItem('authToken');  catchFail: number;}  name: string;

      const response = await fetch(`/api/matches/${matchId}`, {

        headers: token ? { Authorization: `Bearer ${token}` } : {},  cutCount: number;

      });

      if (!response.ok) throw new Error('試合データの読み込みに失敗しました');}

      const data = await response.json();

      setMatch(data);

    } catch (err) {

      setError(err instanceof Error ? err.message : 'エラーが発生しました');export default function ScorePage() {interface Match {  uniformNumber?: number;import { useParams, useRouter } from 'next/navigation';

    } finally {

      setLoading(false);  const params = useParams();

    }

  };  const matchId = params?.id as string;  id: number;



  const loadStats = async () => {  const router = useRouter();

    try {

      const token = localStorage.getItem('authToken');  teamHome?: TeamData;}

      const response = await fetch(`/api/matches/${matchId}/stats`, {

        headers: token ? { Authorization: `Bearer ${token}` } : {},  const [match, setMatch] = useState<Match | null>(null);

      });

      if (response.ok) {  const [loading, setLoading] = useState(true);  teamAway?: TeamData;

        const data = await response.json();

        setStats(Array.isArray(data) ? data : []);  const [error, setError] = useState<string | null>(null);

      }

    } catch (err) {  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');}interface Player {

      console.error('統計の読み込みエラー:', err);

    }  const [selectedPlayer, setSelectedPlayer] = useState<string>('');

  };

  const [actionType, setActionType] = useState<'attack' | 'catch' | 'cut'>('attack');

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();  const [result, setResult] = useState<'success' | 'fail'>('success');

    if (!selectedPlayer) {

      setMessage({ type: 'error', text: 'プレイヤーを選択してください' });  const [submitting, setSubmitting] = useState(false);interface PlayerStat {interface TeamData {

      setTimeout(() => setMessage(null), 3000);

      return;  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    }

  const [stats, setStats] = useState<PlayerStat[]>([]);  playerId: number;

    setSubmitting(true);

    try {

      const token = localStorage.getItem('authToken');

      if (!token) throw new Error('認証トークンが見つかりません');  useEffect(() => {  playerName: string;  name: string;  id: number;import { useState, useEffect } from 'react';



      const response = await fetch(`/api/matches/${matchId}/player-actions`, {    if (!matchId) return;

        method: 'POST',

        headers: {    loadMatch();  attackSuccess: number;

          'Content-Type': 'application/json',

          Authorization: `Bearer ${token}`,    loadStats();

        },

        body: JSON.stringify({  }, [matchId]);  attackFail: number;  players?: Player[];

          playerId: parseInt(selectedPlayer),

          actionType,

          result,

        }),  const loadMatch = async () => {  catchSuccess: number;

      });

    try {

      if (!response.ok) throw new Error('プレーの記録に失敗しました');

      const token = localStorage.getItem('authToken');  catchFail: number;}  name: string;

      setMessage({ type: 'success', text: 'プレーを記録しました' });

      setSelectedPlayer('');      const response = await fetch(`/api/matches/${matchId}`, {

      setActionType('attack');

      setResult('success');        headers: token ? { Authorization: `Bearer ${token}` } : {},  cutCount: number;

      await loadStats();

      setTimeout(() => setMessage(null), 2000);      });

    } catch (err) {

      setMessage({      if (!response.ok) throw new Error('試合データの読み込みに失敗しました');}

        type: 'error',

        text: err instanceof Error ? err.message : 'エラーが発生しました',      const data = await response.json();

      });

      setTimeout(() => setMessage(null), 3000);      setMatch(data);

    } finally {

      setSubmitting(false);    } catch (err) {

    }

  };      setError(err instanceof Error ? err.message : 'エラーが発生しました');export default function ScorePage() {interface Match {  uniformNumber?: number;import { useParams, useRouter } from 'next/navigation';import { useParams, useRouter } from 'next/navigation';



  if (loading) {    } finally {

    return (

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">      setLoading(false);  const params = useParams();

        <p className="text-gray-600">読み込み中...</p>

      </div>    }

    );

  }  };  const matchId = params?.id as string;  id: number;



  if (error || !match) {

    return (

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">  const loadStats = async () => {  const router = useRouter();

        <div className="bg-white p-8 rounded-lg shadow-lg text-center">

          <p className="text-red-600 mb-4">エラー: {error}</p>    try {

          <button onClick={() => router.back()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">

            戻る      const token = localStorage.getItem('authToken');  teamHome?: TeamData;}

          </button>

        </div>      const response = await fetch(`/api/matches/${matchId}/stats`, {

      </div>

    );        headers: token ? { Authorization: `Bearer ${token}` } : {},  // 試合データ

  }

      });

  const players = selectedTeam === 'home' ? match.teamHome?.players || [] : match.teamAway?.players || [];

      if (response.ok) {  const [match, setMatch] = useState<Match | null>(null);  teamAway?: TeamData;

  return (

    <div className="min-h-screen bg-gray-50">        const data = await response.json();

      <header className="bg-white shadow">

        <div className="container mx-auto px-4 py-6 flex justify-between items-center">        setStats(Array.isArray(data) ? data : []);  const [loading, setLoading] = useState(true);

          <div>

            <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 text-sm font-semibold mb-2">      }

              ← 戻る

            </button>    } catch (err) {  const [error, setError] = useState<string | null>(null);}interface Player {

            <h1 className="text-3xl font-bold text-gray-800">スコア入力</h1>

          </div>      console.error('統計の読み込みエラー:', err);

          <button

            onClick={() => {    }

              localStorage.removeItem('authToken');

              window.location.href = '/';  };

            }}

            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"  // フォーム状態

          >

            ログアウト  const handleSubmit = async (e: React.FormEvent) => {

          </button>

        </div>    e.preventDefault();  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');

      </header>

    if (!selectedPlayer) {

      <main className="container mx-auto px-4 py-8 max-w-6xl">

        <div className="grid grid-cols-3 gap-8">      setMessage({ type: 'error', text: 'プレイヤーを選択してください' });  const [selectedPlayer, setSelectedPlayer] = useState<string>('');interface PlayerStat {interface Match {

          <div className="col-span-2">

            <div className="bg-white rounded-lg shadow-lg p-8">      setTimeout(() => setMessage(null), 3000);

              <h2 className="text-2xl font-bold text-gray-800 mb-6">プレー記録</h2>

      return;  const [actionType, setActionType] = useState<'attack' | 'catch' | 'cut'>('attack');

              {message && (

                <div className={`mb-6 p-4 rounded-lg font-semibold ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>    }

                  {message.text}

                </div>  const [result, setResult] = useState<'success' | 'fail'>('success');  playerId: number;

              )}

    setSubmitting(true);

              <form onSubmit={handleSubmit} className="space-y-6">

                <div>    try {  const [submitting, setSubmitting] = useState(false);

                  <label className="block text-sm font-semibold text-gray-700 mb-3">チーム選択</label>

                  <div className="grid grid-cols-2 gap-3">      const token = localStorage.getItem('authToken');

                    <button

                      type="button"      if (!token) throw new Error('認証トークンが見つかりません');  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);  playerName: string;  id: number;  id: number;import { useState, useEffect } from 'react';import Link from 'next/link';

                      onClick={() => setSelectedTeam('home')}

                      className={`py-3 px-4 rounded-lg font-bold transition ${selectedTeam === 'home' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}

                    >

                      {match.teamHome?.name || 'ホーム'}      const response = await fetch(`/api/matches/${matchId}/player-actions`, {

                    </button>

                    <button        method: 'POST',

                      type="button"

                      onClick={() => setSelectedTeam('away')}        headers: {  // 統計データ  attackSuccess: number;

                      className={`py-3 px-4 rounded-lg font-bold transition ${selectedTeam === 'away' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}

                    >          'Content-Type': 'application/json',

                      {match.teamAway?.name || 'アウェイ'}

                    </button>          Authorization: `Bearer ${token}`,  const [stats, setStats] = useState<PlayerStat[]>([]);

                  </div>

                </div>        },



                <div>        body: JSON.stringify({  attackFail: number;  teamHome?: { name: string; players?: Player[] };

                  <label className="block text-sm font-semibold text-gray-700 mb-3">プレイヤー選択</label>

                  <select          playerId: parseInt(selectedPlayer),

                    value={selectedPlayer}

                    onChange={(e) => setSelectedPlayer(e.target.value)}          actionType,  // 初期化

                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white text-gray-800 font-semibold"

                  >          result,

                    <option value="">-- プレイヤーを選択してください --</option>

                    {players.map((player) => (        }),  useEffect(() => {  catchSuccess: number;

                      <option key={player.id} value={player.id.toString()}>

                        #{player.uniformNumber || '?'} {player.name}      });

                      </option>

                    ))}    if (!matchId) return;

                  </select>

                </div>      if (!response.ok) throw new Error('プレーの記録に失敗しました');



                <div>    loadMatch();  catchFail: number;  teamAway?: { name: string; players?: Player[] };  name: string;

                  <label className="block text-sm font-semibold text-gray-700 mb-3">アクション選択</label>

                  <div className="grid grid-cols-3 gap-3">      setMessage({ type: 'success', text: 'プレーを記録しました ✓' });

                    <button type="button" onClick={() => setActionType('attack')} className={`py-3 px-4 rounded-lg font-bold transition ${actionType === 'attack' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>

                      攻撃      setSelectedPlayer('');    loadStats();

                    </button>

                    <button type="button" onClick={() => setActionType('catch')} className={`py-3 px-4 rounded-lg font-bold transition ${actionType === 'catch' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>      setActionType('attack');

                      キャッチ

                    </button>      setResult('success');  }, [matchId]);  cutCount: number;

                    <button type="button" onClick={() => setActionType('cut')} className={`py-3 px-4 rounded-lg font-bold transition ${actionType === 'cut' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>

                      カット      await loadStats();

                    </button>

                  </div>      setTimeout(() => setMessage(null), 2000);

                </div>

    } catch (err) {

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-3">結果選択</label>      setMessage({  // 試合データを読み込む}  date?: string;

                  <div className="grid grid-cols-2 gap-3">

                    <button type="button" onClick={() => setResult('success')} className={`py-3 px-4 rounded-lg font-bold transition ${result === 'success' ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>        type: 'error',

                      成功

                    </button>        text: err instanceof Error ? err.message : 'エラーが発生しました',  const loadMatch = async () => {

                    <button type="button" onClick={() => setResult('fail')} className={`py-3 px-4 rounded-lg font-bold transition ${result === 'fail' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>

                      失敗      });

                    </button>

                  </div>      setTimeout(() => setMessage(null), 3000);    try {

                </div>

    } finally {

                <button type="submit" disabled={submitting || !selectedPlayer} className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition ${submitting || !selectedPlayer ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}>

                  {submitting ? '記録中...' : 'プレーを記録する'}      setSubmitting(false);      const token = localStorage.getItem('authToken');

                </button>

              </form>    }

            </div>

          </div>  };      const response = await fetch(`/api/matches/${matchId}`, {export default function ScorePage() {}  uniformNumber?: number;import { useState, useEffect } from 'react';



          <div className="h-fit">

            <div className="bg-white rounded-lg shadow-lg p-6">

              <h2 className="text-2xl font-bold text-gray-800 mb-4">統計</h2>  if (loading) {        headers: token ? { Authorization: `Bearer ${token}` } : {},

              <div className="space-y-3 max-h-96 overflow-y-auto">

                {stats.length === 0 ? (    return (

                  <p className="text-center text-gray-500 py-8">プレーが記録されていません</p>

                ) : (      <div className="min-h-screen bg-gray-50 flex items-center justify-center">      });  const params = useParams();

                  stats.map((stat) => (

                    <div key={stat.playerId} className="p-4 bg-blue-50 rounded-lg border border-gray-200">        <div className="text-center">

                      <p className="font-bold text-gray-800 mb-2">{stat.playerName}</p>

                      <div className="text-xs space-y-1 text-gray-700">          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>

                        <p>攻撃: {stat.attackSuccess}/{stat.attackSuccess + stat.attackFail}</p>

                        <p>キャッチ: {stat.catchSuccess}/{stat.catchSuccess + stat.catchFail}</p>          <p className="text-gray-600">読み込み中...</p>

                        <p>カット: {stat.cutCount}</p>

                      </div>        </div>      if (!response.ok) {  const matchId = params?.id as string;

                    </div>

                  ))      </div>

                )}

              </div>    );        throw new Error('試合データの読み込みに失敗しました');

            </div>

          </div>  }

        </div>

      </main>      }  const router = useRouter();

    </div>

  );  if (error || !match) {

}

    return (

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="bg-white p-8 rounded-lg shadow-lg text-center">      const data = await response.json();interface PlayerStat {}

          <p className="text-red-600 mb-4">エラー: {error || 'データが見つかりません'}</p>

          <button onClick={() => router.back()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">      setMatch(data);

            戻る

          </button>    } catch (err) {  // 試合データ

        </div>

      </div>      setError(err instanceof Error ? err.message : 'エラーが発生しました');

    );

  }    } finally {  const [match, setMatch] = useState<Match | null>(null);  playerId: number;



  const players = selectedTeam === 'home' ? match.teamHome?.players || [] : match.teamAway?.players || [];      setLoading(false);



  return (    }  const [loading, setLoading] = useState(true);

    <div className="min-h-screen bg-gray-50">

      <header className="bg-white shadow">  };

        <div className="container mx-auto px-4 py-6 flex justify-between items-center">

          <div>  const [error, setError] = useState<string | null>(null);  playerName: string;interface Player {

            <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 text-sm font-semibold mb-2">

              ← 戻る  // 統計を読み込む

            </button>

            <h1 className="text-3xl font-bold text-gray-800">スコア入力</h1>  const loadStats = async () => {

            <p className="text-gray-600 mt-1">

              {match.teamHome?.name} vs {match.teamAway?.name}    try {

            </p>

          </div>      const token = localStorage.getItem('authToken');  // フォーム状態  attackSuccess: number;

          <button

            onClick={() => {      const response = await fetch(`/api/matches/${matchId}/stats`, {

              localStorage.removeItem('authToken');

              window.location.href = '/';        headers: token ? { Authorization: `Bearer ${token}` } : {},  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');

            }}

            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"      });

          >

            ログアウト  const [selectedPlayer, setSelectedPlayer] = useState<string>('');  attackFail: number;interface Match {

          </button>

        </div>      if (response.ok) {

      </header>

        const data = await response.json();  const [actionType, setActionType] = useState<'attack' | 'catch' | 'cut'>('attack');

      <main className="container mx-auto px-4 py-8 max-w-6xl">

        <div className="grid grid-cols-3 gap-8">        setStats(Array.isArray(data) ? data : []);

          <div className="col-span-2">

            <div className="bg-white rounded-lg shadow-lg p-8">      }  const [result, setResult] = useState<'success' | 'fail'>('success');  catchSuccess: number;

              <h2 className="text-2xl font-bold text-gray-800 mb-6">プレー記録</h2>

    } catch (err) {

              {message && (

                <div      console.error('統計の読み込みエラー:', err);  const [submitting, setSubmitting] = useState(false);

                  className={`mb-6 p-4 rounded-lg font-semibold ${

                    message.type === 'success'    }

                      ? 'bg-green-100 text-green-800 border border-green-300'

                      : 'bg-red-100 text-red-800 border border-red-300'  };  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);  catchFail: number;  id: number;  id: number;interface Player {

                  }`}

                >

                  {message.text}

                </div>  // プレーを記録

              )}

  const handleSubmit = async (e: React.FormEvent) => {

              <form onSubmit={handleSubmit} className="space-y-6">

                <div>    e.preventDefault();  // 統計データ  cutCount: number;

                  <label className="block text-sm font-semibold text-gray-700 mb-3">チーム選択</label>

                  <div className="grid grid-cols-2 gap-3">

                    <button

                      type="button"    if (!selectedPlayer) {  const [stats, setStats] = useState<PlayerStat[]>([]);

                      onClick={() => setSelectedTeam('home')}

                      className={`py-3 px-4 rounded-lg font-bold transition ${      setMessage({ type: 'error', text: 'プレイヤーを選択してください' });

                        selectedTeam === 'home' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

                      }`}      setTimeout(() => setMessage(null), 3000);}  teamHome?: { name: string; players?: Player[] };

                    >

                      {match.teamHome?.name || 'ホーム'}      return;

                    </button>

                    <button    }  // 初期化

                      type="button"

                      onClick={() => setSelectedTeam('away')}

                      className={`py-3 px-4 rounded-lg font-bold transition ${

                        selectedTeam === 'away' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'    setSubmitting(true);  useEffect(() => {

                      }`}

                    >

                      {match.teamAway?.name || 'アウェイ'}

                    </button>    try {    if (!matchId) return;

                  </div>

                </div>      const token = localStorage.getItem('authToken');



                <div>      if (!token) {    loadMatch();type ActionType = 'attack' | 'catch' | 'cut';  teamAway?: { name: string; players?: Player[] };  name: string;  id: number;

                  <label className="block text-sm font-semibold text-gray-700 mb-3">プレイヤー選択</label>

                  <select        throw new Error('認証トークンが見つかりません');

                    value={selectedPlayer}

                    onChange={(e) => setSelectedPlayer(e.target.value)}      }    loadStats();

                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white text-gray-800 font-semibold"

                  >

                    <option value="">-- プレイヤーを選択してください --</option>

                    {players.map((player) => (      const response = await fetch(`/api/matches/${matchId}/player-actions`, {  }, [matchId]);type Result = 'success' | 'fail';

                      <option key={player.id} value={player.id.toString()}>

                        #{player.uniformNumber || '?'} {player.name}        method: 'POST',

                      </option>

                    ))}        headers: {

                  </select>

                </div>          'Content-Type': 'application/json',



                <div>          Authorization: `Bearer ${token}`,  // 試合データを読み込む  date?: string;

                  <label className="block text-sm font-semibold text-gray-700 mb-3">アクション選択</label>

                  <div className="grid grid-cols-3 gap-3">        },

                    <button

                      type="button"        body: JSON.stringify({  const loadMatch = async () => {

                      onClick={() => setActionType('attack')}

                      className={`py-3 px-4 rounded-lg font-bold transition ${          playerId: parseInt(selectedPlayer),

                        actionType === 'attack' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

                      }`}          actionType,    try {export default function ScorePage() {

                    >

                      攻撃          result,

                    </button>

                    <button        }),      const token = localStorage.getItem('authToken');

                      type="button"

                      onClick={() => setActionType('catch')}      });

                      className={`py-3 px-4 rounded-lg font-bold transition ${

                        actionType === 'catch' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'      const response = await fetch(`/api/matches/${matchId}`, {  const params = useParams();  startTime?: string;  uniformNumber?: number;  name: string;

                      }`}

                    >      if (!response.ok) {

                      キャッチ

                    </button>        throw new Error('プレーの記録に失敗しました');        headers: token ? { Authorization: `Bearer ${token}` } : {},

                    <button

                      type="button"      }

                      onClick={() => setActionType('cut')}

                      className={`py-3 px-4 rounded-lg font-bold transition ${      });  const router = useRouter();

                        actionType === 'cut' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

                      }`}      setMessage({ type: 'success', text: 'プレーを記録しました ✓' });

                    >

                      カット      setSelectedPlayer('');

                    </button>

                  </div>      setActionType('attack');

                </div>

      setResult('success');      if (!response.ok) {  const matchId = params?.id as string;}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-3">結果選択</label>

                  <div className="grid grid-cols-2 gap-3">

                    <button      // 統計を更新        throw new Error('試合データの読み込みに失敗しました');

                      type="button"

                      onClick={() => setResult('success')}      await loadStats();

                      className={`py-3 px-4 rounded-lg font-bold transition ${

                        result === 'success' ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'      }

                      }`}

                    >      // メッセージをクリア

                      成功

                    </button>      setTimeout(() => setMessage(null), 2000);

                    <button

                      type="button"    } catch (err) {

                      onClick={() => setResult('fail')}

                      className={`py-3 px-4 rounded-lg font-bold transition ${      setMessage({      const data = await response.json();  const [match, setMatch] = useState<Match | null>(null);}  uniformNumber?: number;

                        result === 'fail' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

                      }`}        type: 'error',

                    >

                      失敗        text: err instanceof Error ? err.message : 'エラーが発生しました',      setMatch(data);

                    </button>

                  </div>      });

                </div>

      setTimeout(() => setMessage(null), 3000);    } catch (err) {  const [loading, setLoading] = useState(true);

                <button

                  type="submit"    } finally {

                  disabled={submitting || !selectedPlayer}

                  className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition ${      setSubmitting(false);      setError(err instanceof Error ? err.message : 'エラーが発生しました');

                    submitting || !selectedPlayer ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'

                  }`}    }

                >

                  {submitting ? '記録中...' : 'プレーを記録する'}  };    } finally {  const [error, setError] = useState<string | null>(null);interface PlayerMatchStat {

                </button>

              </form>

            </div>

          </div>  // ロード中の表示      setLoading(false);



          <div className="h-fit">  if (loading) {

            <div className="bg-white rounded-lg shadow-lg p-6">

              <h2 className="text-2xl font-bold text-gray-800 mb-4">統計</h2>    return (    }

              <div className="space-y-3 max-h-96 overflow-y-auto">

                {stats.length === 0 ? (      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

                  <p className="text-center text-gray-500 py-8">プレーが記録されていません</p>

                ) : (        <div className="text-center">  };

                  stats.map((stat) => (

                    <div key={stat.playerId} className="p-4 bg-blue-50 rounded-lg border border-gray-200">          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>

                      <p className="font-bold text-gray-800 mb-2">{stat.playerName}</p>

                      <div className="text-xs space-y-1 text-gray-700">          <p className="text-gray-600">読み込み中...</p>  // フォーム状態  playerId: number;}

                        <p>攻撃: {stat.attackSuccess}/{stat.attackSuccess + stat.attackFail}</p>

                        <p>キャッチ: {stat.catchSuccess}/{stat.catchSuccess + stat.catchFail}</p>        </div>

                        <p>カット: {stat.cutCount}</p>

                      </div>      </div>  // 統計を読み込む

                    </div>

                  ))    );

                )}

              </div>  }  const loadStats = async () => {  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');

            </div>

          </div>

        </div>

      </main>  // エラー表示    try {

    </div>

  );  if (error || !match) {

}

    return (      const token = localStorage.getItem('authToken');  const [selectedPlayer, setSelectedPlayer] = useState<string>('');  playerName: string;

      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="bg-white p-8 rounded-lg shadow-lg text-center">      const response = await fetch(`/api/matches/${matchId}/stats`, {

          <p className="text-red-600 mb-4">❌ {error || 'エラーが発生しました'}</p>

          <button        headers: token ? { Authorization: `Bearer ${token}` } : {},  const [actionType, setActionType] = useState<ActionType>('attack');

            onClick={() => router.back()}

            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"      });

          >

            戻る  const [result, setResult] = useState<Result>('success');  attackSuccessCount: number;interface Match {

          </button>

        </div>      if (response.ok) {

      </div>

    );        const data = await response.json();  const [submitting, setSubmitting] = useState(false);

  }

        setStats(Array.isArray(data) ? data : []);

  // プレイヤーリスト取得

  const players = selectedTeam === 'home' ? match.teamHome?.players || [] : match.teamAway?.players || [];      }  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);  attackFailCount: number;



  return (    } catch (err) {

    <div className="min-h-screen bg-gray-50">

      {/* ヘッダー */}      console.error('統計の読み込みエラー:', err);

      <header className="bg-white shadow">

        <div className="container mx-auto px-4 py-6 flex justify-between items-center">    }

          <div>

            <button  };  // 統計  catchSuccessCount: number;  id: number;interface Match {

              onClick={() => router.back()}

              className="text-blue-600 hover:text-blue-800 text-sm font-semibold mb-2"

            >

              ← 戻る  // プレーを記録  const [stats, setStats] = useState<PlayerStat[]>([]);

            </button>

            <h1 className="text-3xl font-bold text-gray-800">スコア入力</h1>  const handleSubmit = async (e: React.FormEvent) => {

            <p className="text-gray-600 mt-1">

              {match.teamHome?.name} vs {match.teamAway?.name}    e.preventDefault();  const [statsLoading, setStatsLoading] = useState(false);  catchFailCount: number;

            </p>

          </div>

          <button

            onClick={() => {    if (!selectedPlayer) {

              localStorage.removeItem('authToken');

              window.location.href = '/';      setMessage({ type: 'error', text: 'プレイヤーを選択してください' });

            }}

            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"      setTimeout(() => setMessage(null), 3000);  useEffect(() => {  cutCount: number;  eventId?: number;  id: number;

          >

            ログアウト      return;

          </button>

        </div>    }    if (!matchId) return;

      </header>



      {/* メインコンテンツ */}

      <main className="container mx-auto px-4 py-8 max-w-6xl">    setSubmitting(true);    loadMatch();  attackRate?: number;

        <div className="grid grid-cols-3 gap-8">

          {/* フォーム部分 */}

          <div className="col-span-2">

            <div className="bg-white rounded-lg shadow-lg p-8">    try {    loadStats();

              <h2 className="text-2xl font-bold text-gray-800 mb-6">プレー記録</h2>

      const token = localStorage.getItem('authToken');

              {/* メッセージ表示 */}

              {message && (      if (!token) {  }, [matchId]);  catchRate?: number;  teamHomeId?: number;  eventId?: number;

                <div

                  className={`mb-6 p-4 rounded-lg font-semibold ${        throw new Error('認証トークンが見つかりません');

                    message.type === 'success'

                      ? 'bg-green-100 text-green-800 border border-green-300'      }

                      : 'bg-red-100 text-red-800 border border-red-300'

                  }`}

                >

                  {message.text}      const response = await fetch(`/api/matches/${matchId}/player-actions`, {  const loadMatch = async () => {}

                </div>

              )}        method: 'POST',



              <form onSubmit={handleSubmit} className="space-y-6">        headers: {    try {

                {/* チーム選択 */}

                <div>          'Content-Type': 'application/json',

                  <label className="block text-sm font-semibold text-gray-700 mb-3">

                    チーム選択          Authorization: `Bearer ${token}`,      setLoading(true);  teamAwayId?: number;  teamHomeId?: number;

                  </label>

                  <div className="grid grid-cols-2 gap-3">        },

                    <button

                      type="button"        body: JSON.stringify({      const res = await fetch(`/api/matches/${matchId}`);

                      onClick={() => setSelectedTeam('home')}

                      className={`py-3 px-4 rounded-lg font-bold transition ${          playerId: parseInt(selectedPlayer),

                        selectedTeam === 'home'

                          ? 'bg-blue-600 text-white shadow-lg'          actionType,      if (!res.ok) throw new Error('試合を読み込めません');type ActionType = 'attack' | 'catch' | 'cut';

                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

                      }`}          result,

                    >

                      🏠 {match.teamHome?.name || 'ホーム'}        }),      const data = await res.json();

                    </button>

                    <button      });

                      type="button"

                      onClick={() => setSelectedTeam('away')}      setMatch(data);type Result = 'success' | 'fail';  teamHome?: { name: string; players?: Player[] };  teamAwayId?: number;

                      className={`py-3 px-4 rounded-lg font-bold transition ${

                        selectedTeam === 'away'      if (!response.ok) {

                          ? 'bg-red-600 text-white shadow-lg'

                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'        throw new Error('プレーの記録に失敗しました');    } catch (err) {

                      }`}

                    >      }

                      ✈️ {match.teamAway?.name || 'アウェイ'}

                    </button>      setError(err instanceof Error ? err.message : 'エラー');

                  </div>

                </div>      setMessage({ type: 'success', text: 'プレーを記録しました ✓' });



                {/* プレイヤー選択 */}      setSelectedPlayer('');    } finally {

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-3">      setActionType('attack');

                    プレイヤー選択

                  </label>      setResult('success');      setLoading(false);export default function ScorePage() {  teamAway?: { name: string; players?: Player[] };  teamHome?: { name: string; players?: Player[] };

                  <select

                    value={selectedPlayer}

                    onChange={(e) => setSelectedPlayer(e.target.value)}

                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white text-gray-800 font-semibold"      // 統計を更新    }

                  >

                    <option value="">-- プレイヤーを選択してください --</option>      await loadStats();

                    {players.map((player) => (

                      <option key={player.id} value={player.id.toString()}>  };  const params = useParams();

                        {player.uniformNumber ? `#${player.uniformNumber}` : ''} {player.name}

                      </option>      // メッセージをクリア

                    ))}

                  </select>      setTimeout(() => setMessage(null), 2000);

                </div>

    } catch (err) {

                {/* アクション選択 */}

                <div>      setMessage({  const loadStats = async () => {  const router = useRouter();  date?: string;  teamAway?: { name: string; players?: Player[] };

                  <label className="block text-sm font-semibold text-gray-700 mb-3">

                    アクション選択        type: 'error',

                  </label>

                  <div className="grid grid-cols-3 gap-3">        text: err instanceof Error ? err.message : 'エラーが発生しました',    try {

                    {[

                      { value: 'attack', label: '攻撃', emoji: '⚡' },      });

                      { value: 'catch', label: 'キャッチ', emoji: '🤲' },

                      { value: 'cut', label: 'カット', emoji: '✋' },      setTimeout(() => setMessage(null), 3000);      setStatsLoading(true);  const matchId = params?.id as string;

                    ].map((action) => (

                      <button    } finally {

                        key={action.value}

                        type="button"      setSubmitting(false);      const res = await fetch(`/api/matches/${matchId}/stats`);

                        onClick={() => setActionType(action.value as 'attack' | 'catch' | 'cut')}

                        className={`py-3 px-4 rounded-lg font-bold transition ${    }

                          actionType === action.value

                            ? 'bg-purple-600 text-white shadow-lg'  };      if (res.ok) {  startTime?: string;  date?: string;

                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

                        }`}

                      >

                        {action.emoji} {action.label}  // ロード中の表示        const data = await res.json();

                      </button>

                    ))}  if (loading) {

                  </div>

                </div>    return (        setStats(data);  const [match, setMatch] = useState<Match | null>(null);



                {/* 結果選択 */}      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-3">        <div className="text-center">      }

                    結果選択

                  </label>          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>

                  <div className="grid grid-cols-2 gap-3">

                    <button          <p className="text-gray-600">読み込み中...</p>    } catch (err) {  const [loading, setLoading] = useState(true);}  startTime?: string;

                      type="button"

                      onClick={() => setResult('success')}        </div>

                      className={`py-3 px-4 rounded-lg font-bold transition ${

                        result === 'success'      </div>      console.error('統計読み込みエラー:', err);

                          ? 'bg-green-600 text-white shadow-lg'

                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'    );

                      }`}

                    >  }    } finally {  const [error, setError] = useState<string | null>(null);

                      ✅ 成功

                    </button>

                    <button

                      type="button"  // エラー表示      setStatsLoading(false);

                      onClick={() => setResult('fail')}

                      className={`py-3 px-4 rounded-lg font-bold transition ${  if (error || !match) {

                        result === 'fail'

                          ? 'bg-orange-600 text-white shadow-lg'    return (    }  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A');}

                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

                      }`}      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

                    >

                      ❌ 失敗        <div className="bg-white p-8 rounded-lg shadow-lg text-center">  };

                    </button>

                  </div>          <p className="text-red-600 mb-4">❌ {error || 'エラーが発生しました'}</p>

                </div>

          <button  const [selectedPlayer, setSelectedPlayer] = useState<string>('');

                {/* 送信ボタン */}

                <button            onClick={() => router.back()}

                  type="submit"

                  disabled={submitting || !selectedPlayer}            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"  const handleSubmit = async (e: React.FormEvent) => {

                  className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition ${

                    submitting || !selectedPlayer          >

                      ? 'bg-gray-400 cursor-not-allowed'

                      : 'bg-blue-600 hover:bg-blue-700 active:scale-95'            戻る    e.preventDefault();  const [actionType, setActionType] = useState<ActionType>('attack');interface PlayerMatchStat {

                  }`}

                >          </button>

                  {submitting ? '記録中...' : '📝 プレーを記録する'}

                </button>        </div>    if (!selectedPlayer) {

              </form>

            </div>      </div>

          </div>

    );      setMessage({ type: 'error', text: 'プレイヤーを選択してください' });  const [result, setResult] = useState<Result>('success');

          {/* 統計パネル */}

          <div className="h-fit">  }

            <div className="bg-white rounded-lg shadow-lg p-6">

              <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 統計</h2>      return;



              <div className="space-y-3 max-h-96 overflow-y-auto">  // プレイヤーリスト取得

                {stats.length === 0 ? (

                  <p className="text-center text-gray-500 py-8">  const players = selectedTeam === 'home' ? match.teamHome?.players || [] : match.teamAway?.players || [];    }  const [submitting, setSubmitting] = useState(false);  playerId: number;interface PlayerMatchStat {

                    プレーが記録されていません

                  </p>

                ) : (

                  stats.map((stat) => (  return (

                    <div

                      key={stat.playerId}    <div className="min-h-screen bg-gray-50">

                      className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition"

                    >      {/* ヘッダー */}    try {  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

                      <p className="font-bold text-gray-800 mb-2">{stat.playerName}</p>

                      <div className="text-xs space-y-1 text-gray-700">      <header className="bg-white shadow">

                        <p>

                          ⚡ 攻撃: {stat.attackSuccess}/{stat.attackSuccess + stat.attackFail}        <div className="container mx-auto px-4 py-6 flex justify-between items-center">      setSubmitting(true);

                        </p>

                        <p>          <div>

                          🤲 キャッチ: {stat.catchSuccess}/{stat.catchSuccess + stat.catchFail}

                        </p>            <button      const token = localStorage.getItem('authToken');  const [stats, setStats] = useState<PlayerMatchStat[]>([]);  playerName: string;  playerId: number;

                        <p>✋ カット: {stat.cutCount}</p>

                      </div>              onClick={() => router.back()}

                    </div>

                  ))              className="text-blue-600 hover:text-blue-800 text-sm font-semibold mb-2"      const res = await fetch(`/api/matches/${matchId}/player-actions`, {

                )}

              </div>            >

            </div>

          </div>              ← 戻る        method: 'POST',  const [statsLoading, setStatsLoading] = useState(false);

        </div>

      </main>            </button>

    </div>

  );            <h1 className="text-3xl font-bold text-gray-800">スコア入力</h1>        headers: {

}

            <p className="text-gray-600 mt-1">

              {match.teamHome?.name} vs {match.teamAway?.name}          'Content-Type': 'application/json',  attackSuccessCount: number;  playerName: string;

            </p>

          </div>          ...(token ? { Authorization: `Bearer ${token}` } : {}),

          <button

            onClick={() => {        },  useEffect(() => {

              localStorage.removeItem('authToken');

              window.location.href = '/';        body: JSON.stringify({

            }}

            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"          playerId: parseInt(selectedPlayer),    if (!matchId) return;  attackFailCount: number;  attackSuccessCount: number;

          >

            ログアウト          actionType,

          </button>

        </div>          result,    loadMatchData();

      </header>

        }),

      {/* メインコンテンツ */}

      <main className="container mx-auto px-4 py-8 max-w-6xl">      });    loadStats();  catchSuccessCount: number;  attackFailCount: number;

        <div className="grid grid-cols-3 gap-8">

          {/* フォーム部分 */}

          <div className="col-span-2">

            <div className="bg-white rounded-lg shadow-lg p-8">      if (!res.ok) {  }, [matchId]);

              <h2 className="text-2xl font-bold text-gray-800 mb-6">プレー記録</h2>

        const data = await res.json();

              {/* メッセージ表示 */}

              {message && (        throw new Error(data.error || 'プレーを記録できません');  catchFailCount: number;  catchSuccessCount: number;

                <div

                  className={`mb-6 p-4 rounded-lg font-semibold ${      }

                    message.type === 'success'

                      ? 'bg-green-100 text-green-800 border border-green-300'  const loadMatchData = async () => {

                      : 'bg-red-100 text-red-800 border border-red-300'

                  }`}      setMessage({ type: 'success', text: 'プレーを記録しました' });

                >

                  {message.text}      setSelectedPlayer('');    try {  cutCount: number;  catchFailCount: number;

                </div>

              )}      setActionType('attack');



              <form onSubmit={handleSubmit} className="space-y-6">      setResult('success');      setLoading(true);

                {/* チーム選択 */}

                <div>      await loadStats();

                  <label className="block text-sm font-semibold text-gray-700 mb-3">

                    チーム選択      setTimeout(() => setMessage(null), 2000);      const res = await fetch(`/api/matches/${matchId}`);  attackRate?: number;  cutCount: number;

                  </label>

                  <div className="grid grid-cols-2 gap-3">    } catch (err) {

                    <button

                      type="button"      setMessage({      if (!res.ok) throw new Error(`Failed to load match`);

                      onClick={() => setSelectedTeam('home')}

                      className={`py-3 px-4 rounded-lg font-bold transition ${        type: 'error',

                        selectedTeam === 'home'

                          ? 'bg-blue-600 text-white shadow-lg'        text: err instanceof Error ? err.message : '記録に失敗しました',      const data = await res.json();  catchRate?: number;  attackRate?: number;

                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

                      }`}      });

                    >

                      🏠 {match.teamHome?.name || 'ホーム'}    } finally {      setMatch(data);

                    </button>

                    <button      setSubmitting(false);

                      type="button"

                      onClick={() => setSelectedTeam('away')}    }      setSelectedTeam('A');}  catchRate?: number;

                      className={`py-3 px-4 rounded-lg font-bold transition ${

                        selectedTeam === 'away'  };

                          ? 'bg-red-600 text-white shadow-lg'

                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'      setSelectedPlayer('');

                      }`}

                    >  if (loading) {

                      ✈️ {match.teamAway?.name || 'アウェイ'}

                    </button>    return (    } catch (err) {}

                  </div>

                </div>      <div className="min-h-screen bg-gray-50 p-4">



                {/* プレイヤー選択 */}        <div className="text-center text-gray-500">試合データを読み込み中...</div>      setError(err instanceof Error ? err.message : 'Unknown error');

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-3">      </div>

                    プレイヤー選択

                  </label>    );    } finally {type ActionType = 'attack' | 'catch' | 'cut';

                  <select

                    value={selectedPlayer}  }

                    onChange={(e) => setSelectedPlayer(e.target.value)}

                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white text-gray-800 font-semibold"      setLoading(false);

                  >

                    <option value="">-- プレイヤーを選択してください --</option>  if (error || !match) {

                    {players.map((player) => (

                      <option key={player.id} value={player.id.toString()}>    return (    }type Result = 'success' | 'fail';type ActionType = 'attack' | 'catch' | 'cut';

                        {player.uniformNumber ? `#${player.uniformNumber}` : ''} {player.name}

                      </option>      <div className="min-h-screen bg-gray-50 p-4">

                    ))}

                  </select>        <div className="text-center text-red-600">  };

                </div>

          エラー: {error || '試合が見つかりません'}

                {/* アクション選択 */}

                <div>        </div>type Result = 'success' | 'fail';

                  <label className="block text-sm font-semibold text-gray-700 mb-3">

                    アクション選択        <button

                  </label>

                  <div className="grid grid-cols-3 gap-3">          onClick={() => router.back()}  const loadStats = async () => {

                    {[

                      { value: 'attack', label: '攻撃', emoji: '⚡' },          className="mt-4 block mx-auto px-4 py-2 bg-blue-600 text-white rounded"

                      { value: 'catch', label: 'キャッチ', emoji: '🤲' },

                      { value: 'cut', label: 'カット', emoji: '✋' },        >    if (!matchId) return;export default function ScorePage() {

                    ].map((action) => (

                      <button          戻る

                        key={action.value}

                        type="button"        </button>    try {

                        onClick={() => setActionType(action.value as 'attack' | 'catch' | 'cut')}

                        className={`py-3 px-4 rounded-lg font-bold transition ${      </div>

                          actionType === action.value

                            ? 'bg-purple-600 text-white shadow-lg'    );      setStatsLoading(true);  const params = useParams();export default function ScorePage() {

                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

                        }`}  }

                      >

                        {action.emoji} {action.label}      const res = await fetch(`/api/matches/${matchId}/stats`);

                      </button>

                    ))}  const currentTeamPlayers = selectedTeam === 'home' 

                  </div>

                </div>    ? match.teamHome?.players || []       if (res.ok) {  const router = useRouter();  const params = useParams();



                {/* 結果選択 */}    : match.teamAway?.players || [];

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-3">        const data = await res.json();

                    結果選択

                  </label>  return (

                  <div className="grid grid-cols-2 gap-3">

                    <button    <div className="min-h-screen bg-gray-50">        setStats(data);  const matchId = params?.id as string;  const router = useRouter();

                      type="button"

                      onClick={() => setResult('success')}      {/* ヘッダー */}

                      className={`py-3 px-4 rounded-lg font-bold transition ${

                        result === 'success'      <header className="bg-white shadow">      }

                          ? 'bg-green-600 text-white shadow-lg'

                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'        <div className="container mx-auto px-4 py-6 flex items-center justify-between">

                      }`}

                    >          <div>    } catch (err) {  const matchId = params?.id as string;

                      ✅ 成功

                    </button>            <button

                    <button

                      type="button"              onClick={() => router.back()}      console.error('Failed to load stats:', err);

                      onClick={() => setResult('fail')}

                      className={`py-3 px-4 rounded-lg font-bold transition ${              className="text-blue-600 hover:text-blue-800 text-sm mb-2"

                        result === 'fail'

                          ? 'bg-orange-600 text-white shadow-lg'            >    } finally {  const [match, setMatch] = useState<Match | null>(null);

                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

                      }`}              ← 戻る

                    >

                      ❌ 失敗            </button>      setStatsLoading(false);

                    </button>

                  </div>            <h1 className="text-3xl font-bold">スコア・プレー入力</h1>

                </div>

          </div>    }  const [loading, setLoading] = useState(true);  const [match, setMatch] = useState<Match | null>(null);

                {/* 送信ボタン */}

                <button          <button

                  type="submit"

                  disabled={submitting || !selectedPlayer}            onClick={() => {  };

                  className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition ${

                    submitting || !selectedPlayer              localStorage.removeItem('authToken');

                      ? 'bg-gray-400 cursor-not-allowed'

                      : 'bg-blue-600 hover:bg-blue-700 active:scale-95'              window.location.href = '/';  const [error, setError] = useState<string | null>(null);  const [loading, setLoading] = useState(true);

                  }`}

                >            }}

                  {submitting ? '記録中...' : '📝 プレーを記録する'}

                </button>            className="text-red-600 hover:text-red-800 font-medium"  const handleSubmitAction = async (e: React.FormEvent) => {

              </form>

            </div>          >

          </div>

            ログアウト    e.preventDefault();  const [error, setError] = useState<string | null>(null);

          {/* 統計パネル */}

          <div className="h-fit">          </button>

            <div className="bg-white rounded-lg shadow-lg p-6">

              <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 統計</h2>        </div>    if (!selectedPlayer) {



              <div className="space-y-3 max-h-96 overflow-y-auto">      </header>

                {stats.length === 0 ? (

                  <p className="text-center text-gray-500 py-8">      setMessage({ type: 'error', text: 'プレイヤーを選択してください' });  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A');

                    プレーが記録されていません

                  </p>      <main className="container mx-auto px-4 py-8 max-w-6xl">

                ) : (

                  stats.map((stat) => (        {/* 試合情報 */}      return;

                    <div

                      key={stat.playerId}        <div className="mb-8 p-6 bg-white rounded-lg shadow">

                      className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition"

                    >          <h2 className="text-2xl font-bold mb-4">試合情報</h2>    }  const [selectedPlayer, setSelectedPlayer] = useState<string>('');  // Form state

                      <p className="font-bold text-gray-800 mb-2">{stat.playerName}</p>

                      <div className="text-xs space-y-1 text-gray-700">          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <p>

                          ⚡ 攻撃: {stat.attackSuccess}/{stat.attackSuccess + stat.attackFail}            <div className="text-center">

                        </p>

                        <p>              <p className="text-gray-600 mb-2">ホームチーム</p>

                          🤲 キャッチ: {stat.catchSuccess}/{stat.catchSuccess + stat.catchFail}

                        </p>              <p className="text-2xl font-bold text-blue-600">{match.teamHome?.name}</p>    try {  const [actionType, setActionType] = useState<ActionType>('attack');  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A');

                        <p>✋ カット: {stat.cutCount}</p>

                      </div>              <p className="text-sm text-gray-600 mt-2">

                    </div>

                  ))                {match.teamHome?.players?.length || 0} 選手      setSubmitting(true);

                )}

              </div>              </p>

            </div>

          </div>            </div>      const res = await fetch(`/api/matches/${matchId}/player-actions`, {  const [result, setResult] = useState<Result>('success');  const [selectedPlayer, setSelectedPlayer] = useState<string>('');

        </div>

      </main>            <div className="text-center flex items-center justify-center">

    </div>

  );              <div className="text-4xl font-bold text-gray-400">VS</div>        method: 'POST',

}

            </div>

            <div className="text-center">        headers: { 'Content-Type': 'application/json' },  const [submitting, setSubmitting] = useState(false);  const [actionType, setActionType] = useState<ActionType>('attack');

              <p className="text-gray-600 mb-2">アウェイチーム</p>

              <p className="text-2xl font-bold text-red-600">{match.teamAway?.name}</p>        body: JSON.stringify({ playerId: selectedPlayer, actionType, result }),

              <p className="text-sm text-gray-600 mt-2">

                {match.teamAway?.players?.length || 0} 選手      });  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);  const [result, setResult] = useState<Result>('success');

              </p>

            </div>

          </div>

        </div>      if (!res.ok) throw new Error('Failed to record action');  const [submitting, setSubmitting] = useState(false);



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* プレー記録フォーム */}

          <div className="lg:col-span-2">      setMessage({ type: 'success', text: 'アクションを記録しました' });  const [stats, setStats] = useState<PlayerMatchStat[]>([]);  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

            <div className="bg-white rounded-lg shadow p-6">

              <h2 className="text-2xl font-bold mb-6">プレー記録</h2>      setSelectedPlayer('');



              {message && (      setActionType('attack');  const [statsLoading, setStatsLoading] = useState(false);

                <div

                  className={`mb-6 p-4 rounded-lg ${      setResult('success');

                    message.type === 'success'

                      ? 'bg-green-100 text-green-800 border border-green-300'      await loadStats();  // Stats

                      : 'bg-red-100 text-red-800 border border-red-300'

                  }`}      setTimeout(() => setMessage(null), 2000);

                >

                  {message.text}    } catch (err) {  useEffect(() => {  const [stats, setStats] = useState<PlayerMatchStat[]>([]);

                </div>

              )}      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to record' });



              <form onSubmit={handleSubmit} className="space-y-6">    } finally {    if (!matchId) return;  const [statsLoading, setStatsLoading] = useState(false);

                {/* チーム選択 */}

                <div>      setSubmitting(false);

                  <label className="block text-sm font-semibold text-gray-700 mb-3">

                    チーム選択    }

                  </label>

                  <div className="grid grid-cols-2 gap-4">  };

                    <button

                      type="button"    const loadMatchData = async () => {  // Load match and stats on mount

                      onClick={() => setSelectedTeam('home')}

                      className={`p-4 rounded-lg font-semibold transition ${  if (loading) {

                        selectedTeam === 'home'

                          ? 'bg-blue-600 text-white'    return <div className="container mx-auto p-4"><p>試合データを読み込み中...</p></div>;      try {  useEffect(() => {

                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

                      }`}  }

                    >

                      🏠 {match.teamHome?.name}        setLoading(true);    if (!matchId) return;

                    </button>

                    <button  if (error || !match) {

                      type="button"

                      onClick={() => setSelectedTeam('away')}    return (        const res = await fetch(`/api/matches/${matchId}`);

                      className={`p-4 rounded-lg font-semibold transition ${

                        selectedTeam === 'away'      <div className="container mx-auto p-4">

                          ? 'bg-red-600 text-white'

                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'        <p className="text-red-600">エラー: {error || 'Match not found'}</p>        if (!res.ok) throw new Error(`Failed to load match (${res.status})`);    const loadMatchData = async () => {

                      }`}

                    >        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">戻る</button>

                      🚗 {match.teamAway?.name}

                    </button>      </div>        const data = await res.json();      try {

                  </div>

                </div>    );



                {/* プレイヤー選択 */}  }        setMatch(data);        setLoading(true);

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-3">

                    プレイヤー

                  </label>  const teamHome = match.teamHome;        setSelectedTeam('A');        const res = await fetch(`/api/matches/${matchId}`);

                  <select

                    required  const teamAway = match.teamAway;

                    value={selectedPlayer}

                    onChange={(e) => setSelectedPlayer(e.target.value)}  const currentTeam = selectedTeam === 'A' ? teamHome : teamAway;        setSelectedPlayer('');        if (!res.ok) throw new Error(`Failed to load match (${res.status})`);

                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"

                  >  const players = currentTeam?.players || [];

                    <option value="">-- 選択してください --</option>

                    {currentTeamPlayers.map((player: Player) => (      } catch (err) {        const data = await res.json();

                      <option key={player.id} value={player.id}>

                        {player.uniformNumber ? `#${player.uniformNumber}` : ''} {player.name}  return (

                      </option>

                    ))}    <div className="min-h-screen bg-gray-50">        setError(err instanceof Error ? err.message : 'Unknown error');        setMatch(data);

                  </select>

                </div>      <div className="bg-white shadow mb-6">



                {/* アクション選択 */}        <div className="container mx-auto p-4 max-w-4xl flex items-center justify-between">      } finally {        setSelectedTeam('A');

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-3">          <div>

                    アクション

                  </label>            <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 text-sm mb-2">        setLoading(false);        setSelectedPlayer('');

                  <div className="grid grid-cols-3 gap-3">

                    {(['attack', 'catch', 'cut'] as const).map((action) => (              ← 戻る

                      <button

                        key={action}            </button>      }      } catch (err) {

                        type="button"

                        onClick={() => setActionType(action)}            <h1 className="text-3xl font-bold">スコア・プレー入力</h1>

                        className={`p-3 rounded-lg font-semibold transition ${

                          actionType === action          </div>    };        setError(err instanceof Error ? err.message : 'Unknown error');

                            ? 'bg-green-600 text-white'

                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'          <button

                        }`}

                      >            onClick={() => {      } finally {

                        {action === 'attack' ? '🎯 攻撃' : action === 'catch' ? '🤲 キャッチ' : '✋ カット'}

                      </button>              localStorage.removeItem('authToken');

                    ))}

                  </div>              window.location.href = '/';    loadMatchData();        setLoading(false);

                </div>

            }}

                {/* 結果選択 */}

                <div>            className="text-red-600 hover:text-red-800 font-medium"    loadStats();      }

                  <label className="block text-sm font-semibold text-gray-700 mb-3">

                    結果          >

                  </label>

                  <div className="grid grid-cols-2 gap-3">            ログアウト  }, [matchId]);    };

                    <button

                      type="button"          </button>

                      onClick={() => setResult('success')}

                      className={`p-3 rounded-lg font-semibold transition ${        </div>

                        result === 'success'

                          ? 'bg-emerald-600 text-white'      </div>

                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

                      }`}  const loadStats = async () => {    loadMatchData();

                    >

                      ✓ 成功      <div className="container mx-auto p-4 max-w-4xl">

                    </button>

                    <button        <div className="mb-6 p-4 bg-gray-100 rounded">    if (!matchId) return;    loadStats();

                      type="button"

                      onClick={() => setResult('fail')}          <h2 className="text-xl font-semibold mb-2">試合情報</h2>

                      className={`p-3 rounded-lg font-semibold transition ${

                        result === 'fail'          <p className="text-sm text-gray-700">{match.teamHome?.name} vs {match.teamAway?.name}</p>    try {  }, [matchId]);

                          ? 'bg-orange-600 text-white'

                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'          <p className="text-sm text-gray-700">

                      }`}

                    >            {match.date ? new Date(match.date).toLocaleDateString('ja-JP') : ''}{' '}      setStatsLoading(true);

                      ✗ 失敗

                    </button>            {match.startTime ? new Date(match.startTime).toLocaleTimeString('ja-JP') : ''}

                  </div>

                </div>          </p>      const res = await fetch(`/api/matches/${matchId}/stats`);  const loadStats = async () => {



                {/* 送信ボタン */}        </div>

                <button

                  type="submit"      if (res.ok) {    if (!matchId) return;

                  disabled={submitting || !selectedPlayer}

                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition"        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                >

                  {submitting ? '記録中...' : 'プレーを記録'}          <div className="bg-white border rounded-lg p-6">        const data = await res.json();    try {

                </button>

              </form>            <h3 className="text-lg font-semibold mb-4">プレー記録</h3>

            </div>

          </div>            {message && (        setStats(data);      setStatsLoading(true);



          {/* 統計表示 */}              <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>

          <div className="lg:col-span-1">

            <div className="bg-white rounded-lg shadow p-6 sticky top-4">                {message.text}      }      const res = await fetch(`/api/matches/${matchId}/stats`);

              <h2 className="text-2xl font-bold mb-6">試合統計</h2>

              </div>

              {statsLoading ? (

                <p className="text-gray-500 text-center">読み込み中...</p>            )}    } catch (err) {      if (res.ok) {

              ) : stats.length === 0 ? (

                <p className="text-gray-500 text-center">まだプレーが記録されていません</p>            <form onSubmit={handleSubmitAction} className="space-y-4">

              ) : (

                <div className="space-y-4 max-h-96 overflow-y-auto">              <div>      console.error('Failed to load stats:', err);        const data = await res.json();

                  {stats.map((stat) => (

                    <div                <label className="block text-sm font-medium mb-2">チーム</label>

                      key={stat.playerId}

                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"                <div className="flex gap-4">    } finally {        setStats(data);

                    >

                      <p className="font-bold text-gray-900">{stat.playerName}</p>                  {(['A', 'B'] as const).map((team) => (

                      <div className="text-xs text-gray-600 mt-2 space-y-1">

                        <p>                    <label key={team} className="flex items-center">      setStatsLoading(false);      }

                          🎯 攻撃:{' '}

                          <span className="font-semibold text-green-600">                      <input

                            {stat.attackSuccess}

                          </span>                        type="radio"    }    } catch (err) {

                          /

                          <span className="text-gray-600">                        name="team"

                            {stat.attackSuccess + stat.attackFail}

                          </span>                        value={team}  };      console.error('Failed to load stats:', err);

                        </p>

                        <p>                        checked={selectedTeam === team}

                          🤲 キャッチ:{' '}

                          <span className="font-semibold text-green-600">                        onChange={(e) => {    } finally {

                            {stat.catchSuccess}

                          </span>                          setSelectedTeam(e.target.value as 'A' | 'B');

                          /

                          <span className="text-gray-600">                          setSelectedPlayer('');  const handleSubmitAction = async (e: React.FormEvent) => {      setStatsLoading(false);

                            {stat.catchSuccess + stat.catchFail}

                          </span>                        }}

                        </p>

                        <p>                        className="mr-2"    e.preventDefault();    }

                          ✋ カット:{' '}

                          <span className="font-semibold text-yellow-600">{stat.cutCount}</span>                      />

                        </p>

                      </div>                      <span className="text-sm">チーム{team}: {team === 'A' ? teamHome?.name : teamAway?.name}</span>    if (!selectedPlayer) {  };

                    </div>

                  ))}                    </label>

                </div>

              )}                  ))}      setMessage({ type: 'error', text: 'プレイヤーを選択してください' });

            </div>

          </div>                </div>

        </div>

              </div>      return;  const handleSubmitAction = async (e: React.FormEvent) => {

        {/* 戻るボタン */}

        <div className="mt-8 text-center">

          <button

            onClick={() => router.back()}              <div>    }    e.preventDefault();

            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition"

          >                <label htmlFor="player" className="block text-sm font-medium mb-2">プレイヤー</label>

            ← 試合一覧に戻る

          </button>                <select id="player" value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)} className="w-full px-3 py-2 border rounded">    if (!selectedPlayer) {

        </div>

      </main>                  <option value="">-- 選択してください --</option>

    </div>

  );                  {players.map((p: Player) => (    try {      setMessage({ type: 'error', text: 'プレイヤーを選択してください' });

}

                    <option key={p.id} value={p.id}>{p.uniformNumber ? `#${p.uniformNumber} ` : ''}{p.name}</option>

                  ))}      setSubmitting(true);      return;

                </select>

              </div>      const res = await fetch(`/api/matches/${matchId}/player-actions`, {    }



              <div>        method: 'POST',

                <label className="block text-sm font-medium mb-2">アクション</label>

                <div className="flex gap-4">        headers: { 'Content-Type': 'application/json' },    try {

                  {(['attack', 'catch', 'cut'] as const).map((action) => (

                    <label key={action} className="flex items-center">        body: JSON.stringify({      setSubmitting(true);

                      <input

                        type="radio"          playerId: selectedPlayer,      const res = await fetch(`/api/matches/${matchId}/player-actions`, {

                        name="actionType"

                        value={action}          actionType,        method: 'POST',

                        checked={actionType === action}

                        onChange={(e) => setActionType(e.target.value as ActionType)}          result,        headers: { 'Content-Type': 'application/json' },

                        className="mr-2"

                      />        }),        body: JSON.stringify({

                      <span className="text-sm">{action === 'attack' ? '攻撃' : action === 'catch' ? 'キャッチ' : 'カット'}</span>

                    </label>      });          playerId: selectedPlayer,

                  ))}

                </div>          actionType,

              </div>

      if (!res.ok) throw new Error(`Failed to record action (${res.status})`);          result,

              <div>

                <label className="block text-sm font-medium mb-2">結果</label>        }),

                <div className="flex gap-4">

                  {(['success', 'fail'] as const).map((res) => (      setMessage({ type: 'success', text: 'アクションを記録しました' });      });

                    <label key={res} className="flex items-center">

                      <input      setSelectedPlayer('');

                        type="radio"

                        name="result"      setActionType('attack');      if (!res.ok) throw new Error(`Failed to record action (${res.status})`);

                        value={res}

                        checked={result === res}      setResult('success');

                        onChange={(e) => setResult(e.target.value as Result)}

                        className="mr-2"      setMessage({ type: 'success', text: 'アクションを記録しました' });

                      />

                      <span className="text-sm">{res === 'success' ? '成功' : '失敗'}</span>      await loadStats();      setSelectedPlayer('');

                    </label>

                  ))}      setTimeout(() => setMessage(null), 2000);      setActionType('attack');

                </div>

              </div>    } catch (err) {      setResult('success');



              <button type="submit" disabled={submitting || !selectedPlayer} className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-400">      setMessage({

                {submitting ? '記録中...' : 'プレーを記録'}

              </button>        type: 'error',      // Reload stats

            </form>

          </div>        text: err instanceof Error ? err.message : 'Failed to record action',      await loadStats();



          <div className="bg-white border rounded-lg p-6">      });

            <h3 className="text-lg font-semibold mb-4">試合統計</h3>

            {statsLoading ? (    } finally {      // Clear message after 2s

              <p className="text-gray-500">読み込み中...</p>

            ) : stats.length === 0 ? (      setSubmitting(false);      setTimeout(() => setMessage(null), 2000);

              <p className="text-gray-500">まだプレーが記録されていません</p>

            ) : (    }    } catch (err) {

              <div className="space-y-4">

                {stats.map((stat) => (  };      setMessage({

                  <div key={stat.playerId} className="border-b pb-3">

                    <p className="font-medium">{stat.playerName}</p>        type: 'error',

                    <div className="text-sm text-gray-600 mt-1 grid grid-cols-2 gap-2">

                      <div>攻撃: {stat.attackSuccessCount}/{stat.attackSuccessCount + stat.attackFailCount}  if (loading) {        text: err instanceof Error ? err.message : 'Failed to record action',

                        {stat.attackRate !== undefined && <span className="ml-1 font-semibold">({(stat.attackRate * 100).toFixed(1)}%)</span>}

                      </div>    return (      });

                      <div>キャッチ: {stat.catchSuccessCount}/{stat.catchSuccessCount + stat.catchFailCount}

                        {stat.catchRate !== undefined && <span className="ml-1 font-semibold">({(stat.catchRate * 100).toFixed(1)}%)</span>}      <div className="container mx-auto p-4">    } finally {

                      </div>

                      <div>カット: {stat.cutCount}</div>        <p>試合データを読み込み中...</p>      setSubmitting(false);

                    </div>

                  </div>      </div>    }

                ))}

              </div>    );  };

            )}

          </div>  }

        </div>

  if (loading) {

        <div className="mt-6">

          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">戻る</button>  if (error || !match) {    return (

        </div>

      </div>    return (      <div className="container mx-auto p-4">

    </div>

  );      <div className="container mx-auto p-4">        <p>試合データを読み込み中...</p>

}

        <p className="text-red-600">エラー: {error || 'Match not found'}</p>      </div>

        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">    );

          戻る  }

        </button>

      </div>  if (error || !match) {

    );    return (

  }      <div className="container mx-auto p-4">

        <p className="text-red-600">エラー: {error || 'Match not found'}</p>

  const teamHome = match.teamHome;        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">

  const teamAway = match.teamAway;          戻る

  const currentTeam = selectedTeam === 'A' ? teamHome : teamAway;        </button>

  const players = currentTeam?.players || [];      </div>

    );

  return (  }

    <div className="min-h-screen bg-gray-50">

      <div className="bg-white shadow mb-6">  const teamHome = match.teamHome;

        <div className="container mx-auto p-4 max-w-4xl flex items-center justify-between">  const teamAway = match.teamAway;

          <div>  const currentTeam = selectedTeam === 'A' ? teamHome : teamAway;

            <button  const players = currentTeam?.players || [];

              onClick={() => router.back()}

              className="text-blue-600 hover:text-blue-800 text-sm mb-2"  return (

            >    <div>

              ← 戻る      <div className="bg-white shadow mb-6">

            </button>        <div className="container mx-auto p-4 max-w-4xl flex items-center justify-between">

            <h1 className="text-3xl font-bold">スコア・プレー入力</h1>          <div>

          </div>            <button

          <button              onClick={() => router.back()}

            onClick={() => {              className="text-blue-600 hover:text-blue-800 text-sm mb-2"

              localStorage.removeItem('authToken');            >

              window.location.href = '/';              ← 戻る

            }}            </button>

            className="text-red-600 hover:text-red-800 font-medium"            <h1 className="text-3xl font-bold">スコア・プレー入力</h1>

          >          </div>

            ログアウト          <button

          </button>            onClick={() => {

        </div>              localStorage.removeItem('authToken');

      </div>              window.location.href = '/';

            }}

      <div className="container mx-auto p-4 max-w-4xl">            className="text-red-600 hover:text-red-800 font-medium"

        <div className="mb-6 p-4 bg-gray-100 rounded">          >

          <h2 className="text-xl font-semibold mb-2">試合情報</h2>            ログアウト

          <p className="text-sm text-gray-700">          </button>

            {match.teamHome?.name} vs {match.teamAway?.name}        </div>

          </p>      </div>

          <p className="text-sm text-gray-700">

            {match.date ? new Date(match.date).toLocaleDateString('ja-JP') : ''}{' '}      <div className="container mx-auto p-4 max-w-4xl">

            {match.startTime ? new Date(match.startTime).toLocaleTimeString('ja-JP') : ''}

          </p>      <div className="mb-6 p-4 bg-gray-100 rounded">

        </div>        <h2 className="text-xl font-semibold mb-2">試合情報</h2>

        <p className="text-sm text-gray-700">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">          {match.teamHome?.name} vs {match.teamAway?.name}

          <div className="bg-white border rounded-lg p-6">        </p>

            <h3 className="text-lg font-semibold mb-4">プレー記録</h3>        <p className="text-sm text-gray-700">

          {match.date ? new Date(match.date).toLocaleDateString('ja-JP') : ''}{' '}

            {message && (          {match.startTime ? new Date(match.startTime).toLocaleTimeString('ja-JP') : ''}

              <div        </p>

                className={`mb-4 p-3 rounded ${      </div>

                  message.type === 'success'

                    ? 'bg-green-100 text-green-700'      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    : 'bg-red-100 text-red-700'        {/* Form */}

                }`}        <div className="bg-white border rounded-lg p-6">

              >          <h3 className="text-lg font-semibold mb-4">プレー記録</h3>

                {message.text}

              </div>          {message && (

            )}            <div

              className={`mb-4 p-3 rounded ${

            <form onSubmit={handleSubmitAction} className="space-y-4">                message.type === 'success'

              <div>                  ? 'bg-green-100 text-green-700'

                <label className="block text-sm font-medium mb-2">チーム</label>                  : 'bg-red-100 text-red-700'

                <div className="flex gap-4">              }`}

                  {(['A', 'B'] as const).map((team) => (            >

                    <label key={team} className="flex items-center">              {message.text}

                      <input            </div>

                        type="radio"          )}

                        name="team"

                        value={team}          <form onSubmit={handleSubmitAction} className="space-y-4">

                        checked={selectedTeam === team}            {/* Team Selection */}

                        onChange={(e) => {            <div>

                          setSelectedTeam(e.target.value as 'A' | 'B');              <label className="block text-sm font-medium mb-2">チーム</label>

                          setSelectedPlayer('');              <div className="flex gap-4">

                        }}                {(['A', 'B'] as const).map((team) => (

                        className="mr-2"                  <label key={team} className="flex items-center">

                      />                    <input

                      <span className="text-sm">                      type="radio"

                        チーム{team}: {team === 'A' ? teamHome?.name : teamAway?.name}                      name="team"

                      </span>                      value={team}

                    </label>                      checked={selectedTeam === team}

                  ))}                      onChange={(e) => {

                </div>                        setSelectedTeam(e.target.value as 'A' | 'B');

              </div>                        setSelectedPlayer('');

                      }}

              <div>                      className="mr-2"

                <label htmlFor="player" className="block text-sm font-medium mb-2">                    />

                  プレイヤー                    <span className="text-sm">

                </label>                      チーム{team}: {team === 'A' ? teamHome?.name : teamAway?.name}

                <select                    </span>

                  id="player"                  </label>

                  value={selectedPlayer}                ))}

                  onChange={(e) => setSelectedPlayer(e.target.value)}              </div>

                  className="w-full px-3 py-2 border rounded"            </div>

                >

                  <option value="">-- 選択してください --</option>            {/* Player Selection */}

                  {players.map((p: Player) => (            <div>

                    <option key={p.id} value={p.id}>              <label htmlFor="player" className="block text-sm font-medium mb-2">

                      {p.uniformNumber ? `#${p.uniformNumber} ` : ''}                プレイヤー

                      {p.name}              </label>

                    </option>              <select

                  ))}                id="player"

                </select>                value={selectedPlayer}

              </div>                onChange={(e) => setSelectedPlayer(e.target.value)}

                className="w-full px-3 py-2 border rounded"

              <div>              >

                <label className="block text-sm font-medium mb-2">アクション</label>                <option value="">-- 選択してください --</option>

                <div className="flex gap-4">                {players.map((p: Player) => (

                  {(['attack', 'catch', 'cut'] as const).map((action) => (                  <option key={p.id} value={p.id}>

                    <label key={action} className="flex items-center">                    {p.uniformNumber ? `#${p.uniformNumber} ` : ''}

                      <input                    {p.name}

                        type="radio"                  </option>

                        name="actionType"                ))}

                        value={action}              </select>

                        checked={actionType === action}            </div>

                        onChange={(e) => setActionType(e.target.value as ActionType)}

                        className="mr-2"            {/* Action Type */}

                      />            <div>

                      <span className="text-sm">              <label className="block text-sm font-medium mb-2">アクション</label>

                        {action === 'attack' ? '攻撃' : action === 'catch' ? 'キャッチ' : 'カット'}              <div className="flex gap-4">

                      </span>                {(['attack', 'catch', 'cut'] as const).map((action) => (

                    </label>                  <label key={action} className="flex items-center">

                  ))}                    <input

                </div>                      type="radio"

              </div>                      name="actionType"

                      value={action}

              <div>                      checked={actionType === action}

                <label className="block text-sm font-medium mb-2">結果</label>                      onChange={(e) => setActionType(e.target.value as ActionType)}

                <div className="flex gap-4">                      className="mr-2"

                  {(['success', 'fail'] as const).map((res) => (                    />

                    <label key={res} className="flex items-center">                    <span className="text-sm">

                      <input                      {action === 'attack' ? '攻撃' : action === 'catch' ? 'キャッチ' : 'カット'}

                        type="radio"                    </span>

                        name="result"                  </label>

                        value={res}                ))}

                        checked={result === res}              </div>

                        onChange={(e) => setResult(e.target.value as Result)}            </div>

                        className="mr-2"

                      />            {/* Result */}

                      <span className="text-sm">{res === 'success' ? '成功' : '失敗'}</span>            <div>

                    </label>              <label className="block text-sm font-medium mb-2">結果</label>

                  ))}              <div className="flex gap-4">

                </div>                {(['success', 'fail'] as const).map((res) => (

              </div>                  <label key={res} className="flex items-center">

                    <input

              <button                      type="radio"

                type="submit"                      name="result"

                disabled={submitting || !selectedPlayer}                      value={res}

                className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"                      checked={result === res}

              >                      onChange={(e) => setResult(e.target.value as Result)}

                {submitting ? '記録中...' : 'プレーを記録'}                      className="mr-2"

              </button>                    />

            </form>                    <span className="text-sm">{res === 'success' ? '成功' : '失敗'}</span>

          </div>                  </label>

                ))}

          <div className="bg-white border rounded-lg p-6">              </div>

            <h3 className="text-lg font-semibold mb-4">試合統計</h3>            </div>



            {statsLoading ? (            {/* Submit */}

              <p className="text-gray-500">読み込み中...</p>            <button

            ) : stats.length === 0 ? (              type="submit"

              <p className="text-gray-500">まだプレーが記録されていません</p>              disabled={submitting || !selectedPlayer}

            ) : (              className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"

              <div className="space-y-4">            >

                {stats.map((stat) => (              {submitting ? '記録中...' : 'プレーを記録'}

                  <div key={stat.playerId} className="border-b pb-3">            </button>

                    <p className="font-medium">{stat.playerName}</p>          </form>

                    <div className="text-sm text-gray-600 mt-1 grid grid-cols-2 gap-2">        </div>

                      <div>

                        攻撃: {stat.attackSuccessCount}/{stat.attackSuccessCount + stat.attackFailCount}        {/* Stats */}

                        {stat.attackRate !== undefined && (        <div className="bg-white border rounded-lg p-6">

                          <span className="ml-1 font-semibold">          <h3 className="text-lg font-semibold mb-4">試合統計</h3>

                            ({(stat.attackRate * 100).toFixed(1)}%)

                          </span>          {statsLoading ? (

                        )}            <p className="text-gray-500">読み込み中...</p>

                      </div>          ) : stats.length === 0 ? (

                      <div>            <p className="text-gray-500">まだプレーが記録されていません</p>

                        キャッチ: {stat.catchSuccessCount}/          ) : (

                        {stat.catchSuccessCount + stat.catchFailCount}            <div className="space-y-4">

                        {stat.catchRate !== undefined && (              {stats.map((stat) => (

                          <span className="ml-1 font-semibold">                <div key={stat.playerId} className="border-b pb-3">

                            ({(stat.catchRate * 100).toFixed(1)}%)                  <p className="font-medium">{stat.playerName}</p>

                          </span>                  <div className="text-sm text-gray-600 mt-1 grid grid-cols-2 gap-2">

                        )}                    <div>

                      </div>                      攻撃: {stat.attackSuccessCount}/{stat.attackSuccessCount + stat.attackFailCount}

                      <div>カット: {stat.cutCount}</div>                      {stat.attackRate !== undefined && (

                    </div>                        <span className="ml-1 font-semibold">

                  </div>                          ({(stat.attackRate * 100).toFixed(1)}%)

                ))}                        </span>

              </div>                      )}

            )}                    </div>

          </div>                    <div>

        </div>                      キャッチ: {stat.catchSuccessCount}/

                      {stat.catchSuccessCount + stat.catchFailCount}

        <div className="mt-6">                      {stat.catchRate !== undefined && (

          <button                        <span className="ml-1 font-semibold">

            onClick={() => router.back()}                          ({(stat.catchRate * 100).toFixed(1)}%)

            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"                        </span>

          >                      )}

            戻る                    </div>

          </button>                    <div>カット: {stat.cutCount}</div>

        </div>                  </div>

      </div>                </div>

    </div>              ))}

  );            </div>

}          )}

        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          戻る
        </button>
      </div>
    </div>
      </div>
    </div>
  );
}
