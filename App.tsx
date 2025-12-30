
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { RotateCcw, Send, Sparkles, Trophy, Lightbulb, ChevronRight, Layers, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { generatePuzzle } from './utils/generator.ts';
import { CubeState } from './types.ts';
import CubeScene from './components/CubeScene.tsx';

// --- 音效管理 ---
const playSound = (type: 'correct' | 'wrong' | 'click', isMuted: boolean) => {
  if (isMuted) return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'correct') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (type === 'wrong') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  }
};

// --- 星星特效组件 ---
const StarCelebration: React.FC<{ active: boolean }> = ({ active }) => {
  const [stars, setStars] = useState<{ id: number; left: number; top: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    if (active) {
      const newStars = Array.from({ length: 30 }).map((_, i) => ({
        id: Math.random(),
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 20 + 10,
        delay: Math.random() * 0.5,
      }));
      setStars(newStars);
      const timer = setTimeout(() => setStars([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute text-yellow-400 animate-celebrate"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
          }}
        >
          <Sparkles fill="currentColor" />
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [puzzle, setPuzzle] = useState<CubeState | null>(null);
  const [userGuess, setUserGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('小朋友，数一数这里有多少个小方块？');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [triggerEffect, setTriggerEffect] = useState<boolean>(false);

  const startNewGame = useCallback(() => {
    playSound('click', isMuted);
    const newPuzzle = generatePuzzle();
    setPuzzle(newPuzzle);
    setUserGuess('');
    setFeedback('新题目来啦！看仔细哦～');
    setIsCorrect(null);
    setIsExploded(false);
    setShowHint(false);
    setTriggerEffect(false);
  }, [isMuted]);

  useEffect(() => {
    startNewGame();
  }, []);

  const layerCounts = useMemo(() => {
    if (!puzzle) return [0, 0, 0];
    const counts = [0, 0, 0];
    puzzle.positions.forEach(p => {
      if (p.z >= 0 && p.z <= 2) counts[p.z]++;
    });
    return counts;
  }, [puzzle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!puzzle || !userGuess) return;

    const guessNum = parseInt(userGuess);
    const correct = guessNum === puzzle.totalCount;

    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
      setFeedback('太棒了！你数得非常准！✨');
      playSound('correct', isMuted);
      setTriggerEffect(true);
      setTimeout(() => setTriggerEffect(false), 2000);
    } else {
      setFeedback('哎呀，差一点点，再数一遍试试？');
      playSound('wrong', isMuted);
    }
  };

  const toggleHint = () => {
    playSound('click', isMuted);
    setShowHint(!showHint);
    if (!showHint) {
      setFeedback(`悄悄提示：底层${layerCounts[0]}个，中层${layerCounts[1]}个，顶层${layerCounts[2]}个。`);
    }
  };

  if (!puzzle) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-sky-100 overflow-hidden p-4 md:p-6 gap-6 relative">
      <StarCelebration active={triggerEffect} />

      <div className="flex-1 relative">
        <CubeScene positions={puzzle.positions} isExploded={isExploded} />
        
        <div className="absolute top-6 left-6 bg-white shadow-xl px-6 py-3 rounded-[2rem] flex items-center gap-3 border-4 border-yellow-400">
          <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-200" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase leading-none">星星奖杯</span>
            <span className="text-2xl font-black text-slate-700">{score}</span>
          </div>
        </div>

        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-6 right-6 bg-white/80 backdrop-blur shadow-lg p-3 rounded-full border-4 border-white hover:bg-white transition-all text-slate-600"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>

        <div className="absolute bottom-6 right-6 flex flex-col gap-3">
           <button
            onClick={() => {
              playSound('click', isMuted);
              setIsExploded(!isExploded);
            }}
            className={`flex items-center gap-2 px-6 py-4 rounded-[2rem] shadow-xl border-4 transition-all font-black text-lg active:scale-95 ${
              isExploded 
                ? 'bg-orange-500 text-white border-orange-300' 
                : 'bg-white text-orange-600 border-orange-100 hover:bg-orange-50'
            }`}
          >
            <Layers className="w-6 h-6" />
            {isExploded ? '合在一起' : '拆开数数'}
          </button>
        </div>
      </div>

      <div className="w-full md:w-[26rem] flex flex-col gap-6">
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-b-8 border-slate-200 flex flex-col gap-8 flex-1 overflow-y-auto">
          <header className="text-center">
            <h1 className="text-4xl font-black text-blue-600 tracking-tight mb-2 drop-shadow-sm">数正方体</h1>
            <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-bold">
              数学逻辑练习
            </div>
          </header>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="text-lg font-black text-slate-600 px-1 text-center">这里一共有几个方块？</label>
              <div className="relative">
                <input
                  type="number"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  placeholder="?"
                  className="w-full px-6 py-6 bg-slate-100 border-4 border-slate-200 rounded-[2rem] focus:border-blue-500 focus:outline-none transition-all text-4xl font-black text-center text-slate-800"
                />
              </div>
              <button
                type="submit"
                disabled={!userGuess}
                className="w-full py-5 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white rounded-[2rem] transition-all shadow-[0_6px_0_rgb(21,128,61)] active:shadow-none active:translate-y-1 font-black text-2xl flex items-center justify-center gap-3"
              >
                检查答案 <Send className="w-6 h-6" />
              </button>
            </form>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={toggleHint}
                className={`flex items-center justify-center gap-2 px-4 py-4 rounded-[1.5rem] transition-all font-black text-lg border-b-4 active:border-b-0 active:translate-y-1 ${
                  showHint 
                  ? 'bg-yellow-400 text-white border-yellow-600' 
                  : 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100'
                }`}
              >
                <Lightbulb className="w-6 h-6" />
                看提示
              </button>
              <button
                onClick={startNewGame}
                className="flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 text-slate-600 rounded-[1.5rem] hover:bg-slate-200 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 transition-all font-black text-lg"
              >
                <RotateCcw className="w-6 h-6" />
                换一题
              </button>
            </div>
          </div>

          <div className={`p-6 rounded-[2rem] min-h-[140px] flex items-center justify-center transition-all duration-300 border-4 ${
            isCorrect === true ? 'bg-green-50 border-green-200' : 
            isCorrect === false ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'
          }`}>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className={`p-3 rounded-full ${
                isCorrect === true ? 'bg-green-500 text-white animate-bounce' : 
                isCorrect === false ? 'bg-red-500 text-white shake' : 'bg-blue-500 text-white'
              }`}>
                {isCorrect === true ? <Trophy className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
              </div>
              <p className={`text-xl font-black ${
                isCorrect === true ? 'text-green-700' : 
                isCorrect === false ? 'text-red-700' : 'text-blue-700'
              }`}>
                {feedback}
              </p>
              {isCorrect === true && (
                <button 
                  onClick={startNewGame}
                  className="mt-2 px-6 py-2 bg-green-600 text-white rounded-full flex items-center gap-2 hover:bg-green-700 transition-all font-bold"
                >
                  下一关 <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl">
          <h2 className="font-black text-xl mb-3 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" /> 怎么玩？
          </h2>
          <div className="space-y-2 font-bold opacity-90 text-sm">
            <p>1. 旋转方块，仔细看清楚每一层。</p>
            <p>2. 注意有些方块可能藏在后面哦！</p>
            <p>3. 数不清楚可以点“拆开数数”。</p>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes celebrate {
          0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(1.5) rotate(360deg); opacity: 0; }
        }
        .shake { animation: shake 0.2s ease-in-out 0s 2; }
        .animate-celebrate {
          --tw-translate-x: ${Math.random() * 400 - 200}px;
          --tw-translate-y: ${Math.random() * -400 - 100}px;
          animation: celebrate 1.5s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default App;
