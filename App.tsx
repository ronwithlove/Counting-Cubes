
import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Send, Sparkles, Trophy, BrainCircuit, ChevronRight, Layers } from 'lucide-react';
import { generatePuzzle } from './utils/generator';
import { getHint } from './services/gemini';
import { CubeState } from './types';
import CubeScene from './components/CubeScene';

const App: React.FC = () => {
  const [puzzle, setPuzzle] = useState<CubeState | null>(null);
  const [userGuess, setUserGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('欢迎！仔细数数有多少个正方体。');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loadingHint, setLoadingHint] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isExploded, setIsExploded] = useState<boolean>(false);

  const startNewGame = useCallback(() => {
    const newPuzzle = generatePuzzle();
    setPuzzle(newPuzzle);
    setUserGuess('');
    setFeedback('新一轮开始！仔细观察被挡住的部分。');
    setIsCorrect(null);
    setIsExploded(false);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puzzle || !userGuess) return;

    const guessNum = parseInt(userGuess);
    const correct = guessNum === puzzle.totalCount;

    setIsCorrect(correct);
    setLoadingHint(true);

    if (correct) {
      setScore(s => s + 1);
    }

    const aiMsg = await getHint(puzzle.positions, userGuess, puzzle.totalCount);
    setFeedback(aiMsg);
    setLoadingHint(false);
  };

  const handleHint = async () => {
    if (!puzzle) return;
    setLoadingHint(true);
    const aiMsg = await getHint(puzzle.positions, userGuess, puzzle.totalCount);
    setFeedback(aiMsg);
    setLoadingHint(false);
  };

  if (!puzzle) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden p-4 md:p-8 gap-6">
      {/* 3D Viewport Section */}
      <div className="flex-1 relative">
        <CubeScene positions={puzzle.positions} isExploded={isExploded} />
        
        {/* Score Overlay */}
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur shadow-lg px-4 py-2 rounded-full flex items-center gap-2 border border-slate-200">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-slate-700">分数: {score}</span>
        </div>

        {/* Floating View Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
           <button
            onClick={() => setIsExploded(!isExploded)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl border-2 transition-all font-bold ${
              isExploded 
                ? 'bg-blue-600 text-white border-blue-400' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-5 h-5" />
            {isExploded ? '合拢观察' : '分层观察'}
          </button>
        </div>
      </div>

      {/* Controls Section */}
      <div className="w-full md:w-96 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex flex-col gap-6 overflow-y-auto">
          <header className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">数正方体</h1>
            <p className="text-slate-500 text-sm">观察 3x3x3 的空间，找出所有方块。</p>
          </header>

          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-slate-600 px-1">你的答案</label>
              <div className="relative group">
                <input
                  type="number"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  placeholder="请输入数字..."
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all text-xl font-bold text-slate-800"
                />
                <button
                  type="submit"
                  disabled={!userGuess || loadingHint}
                  className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleHint}
                disabled={loadingHint}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-2xl hover:bg-indigo-100 transition-colors font-semibold text-sm border border-indigo-100"
              >
                <BrainCircuit className="w-4 h-4" />
                AI 提示
              </button>
              <button
                onClick={startNewGame}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-colors font-semibold text-sm border border-slate-200"
              >
                <RotateCcw className="w-4 h-4" />
                换一个
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Feedback Section */}
          <div className={`p-5 rounded-2xl min-h-[120px] transition-all duration-500 ${
            isCorrect === true ? 'bg-emerald-50 border border-emerald-100' : 
            isCorrect === false ? 'bg-rose-50 border border-rose-100' : 'bg-slate-50 border border-slate-100'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`mt-1 p-1 rounded-full ${
                isCorrect === true ? 'bg-emerald-500 text-white' : 
                isCorrect === false ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {loadingHint ? 'AI 正在思考...' : 'AI 老师'}
                </span>
                <p className="text-slate-700 leading-relaxed text-sm font-medium italic">
                  {loadingHint ? '让我康康你的答案...' : `"${feedback}"`}
                </p>
              </div>
            </div>
            
            {isCorrect === true && (
              <button 
                onClick={startNewGame}
                className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all font-bold"
              >
                挑战下一关 <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Rules Card */}
        <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg flex flex-col gap-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            构造规则
          </h2>
          <ul className="text-sm space-y-2 opacity-90 leading-tight">
            <li className="flex items-start gap-2">
              <span className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
              <span><strong>重力原则：</strong> 正方体不能悬空。</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
              <span><strong>相邻原则：</strong> 每一层超过2个方块必须相邻。</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
              <span><strong>提示：</strong> 使用“分层观察”可以展开图层。</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
