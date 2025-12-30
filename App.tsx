
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RotateCcw, Send, Sparkles, Trophy, Lightbulb, ChevronRight, Layers, HelpCircle, Volume2, VolumeX, Delete } from 'lucide-react';
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
        <div key={star.id} className="absolute text-yellow-400 animate-celebrate"
          style={{ left: `${star.left}%`, top: `${star.top}%`, width: `${star.size}px`, height: `${star.size}px`, animationDelay: `${star.delay}s` }}>
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
  const [hasAwardedScore, setHasAwardedScore] = useState<boolean>(false);
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
    setHasAwardedScore(false);
    setIsExploded(false);
    setShowHint(false);
    setTriggerEffect(false);
  }, [isMuted]);

  useEffect(() => { startNewGame(); }, []);

  const layerCounts = useMemo(() => {
    if (!puzzle) return [0, 0, 0];
    const counts = [0, 0, 0];
    puzzle.positions.forEach(p => { if (p.z >= 0 && p.z <= 2) counts[p.z]++; });
    return counts;
  }, [puzzle]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!puzzle || !userGuess) return;
    const guessNum = parseInt(userGuess);
    const correct = guessNum === puzzle.totalCount;
    
    setIsCorrect(correct);
    if (correct) {
      if (!hasAwardedScore) {
        setScore(s => s + 1);
        setHasAwardedScore(true);
      }
      setFeedback('太棒了！你数得非常准！✨');
      playSound('correct', isMuted);
      setTriggerEffect(true);
      setTimeout(() => setTriggerEffect(false), 2000);
    } else {
      setFeedback('哎呀，差一点点，再数一遍试试？');
      playSound('wrong', isMuted);
      setUserGuess(''); // 答案错误直接清空
    }
  };

  const handleKeyPress = (num: string) => {
    playSound('click', isMuted);
    // 0 不可以作为第一位数
    if (userGuess === '' && num === '0') return;
    if (userGuess.length < 2) {
      setUserGuess(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    playSound('click', isMuted);
    setUserGuess(prev => prev.slice(0, -1));
  };

  const toggleHint = () => {
    playSound('click', isMuted);
    const nextShowHint = !showHint;
    setShowHint(nextShowHint);
    if (nextShowHint) {
      setFeedback(`悄悄提示：底层${layerCounts[0]}个，中层${layerCounts[1]}个，顶层${layerCounts[2]}个。`);
    } else {
      // 隐藏提示时恢复默认反馈
      setFeedback('小朋友，数一数这里有多少个小方块？');
    }
  };

  if (!puzzle) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-b from-sky-50 to-blue-100 overflow-hidden p-3 md:p-6 lg:p-8 gap-4 md:gap-6 relative">
      <StarCelebration active={triggerEffect} />

      {/* 版本号 */}
      <div className="absolute top-1 right-2 text-[10px] font-bold text-slate-400 select-none pointer-events-none z-[60]">
        v1.4.3
      </div>

      {/* 3D视图区 */}
      <div className="flex-[1.2] md:flex-[1.5] lg:flex-[2] relative overflow-hidden">
        <CubeScene positions={puzzle.positions} isExploded={isExploded} />
        
        <div className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-3">
          <div className="bg-white/90 backdrop-blur shadow-xl px-4 py-2 md:px-6 md:py-3 rounded-full flex items-center gap-2 md:gap-3 border-2 md:border-4 border-yellow-400 animate-in fade-in slide-in-from-left duration-500">
            <Trophy className="w-5 h-5 md:w-8 md:h-8 text-yellow-500 fill-yellow-200" />
            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-black text-slate-700 leading-none">{score}</span>
            </div>
          </div>
          
          <button onClick={() => setIsMuted(!isMuted)} className="bg-white/80 backdrop-blur shadow-lg p-2 md:p-3 rounded-full border-2 md:border-4 border-white hover:bg-white transition-all text-slate-600 active:scale-90">
            {isMuted ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
        </div>

        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6">
           <button onClick={() => { playSound('click', isMuted); setIsExploded(!isExploded); }}
            className={`flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 rounded-full shadow-2xl border-2 md:border-4 transition-all font-black text-sm md:text-lg active:scale-95 ${
              isExploded ? 'bg-orange-500 text-white border-orange-300' : 'bg-white text-orange-600 border-orange-100 hover:bg-orange-50'
            }`}>
            <Layers className="w-5 h-5 md:w-6 md:h-6" />
            <span>{isExploded ? '合在一起' : '拆开数数'}</span>
          </button>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="flex-1 md:w-[350px] lg:w-[420px] xl:w-[480px] flex flex-col gap-3 overflow-y-auto no-scrollbar pb-2">
        <div className="bg-white/90 backdrop-blur-sm p-5 md:p-6 rounded-[2rem] md:rounded-[3rem] shadow-2xl border-b-8 border-slate-200 flex flex-col gap-4">
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-center text-slate-500 font-black text-sm md:text-base tracking-wide">
                一共有几个小正方体？
              </label>
              <div className="w-full py-4 bg-slate-50 border-4 border-slate-100 rounded-2xl text-5xl md:text-6xl font-black text-center text-slate-800 h-24 flex items-center justify-center">
                {userGuess || <span className="text-slate-200">?</span>}
              </div>
            </div>

            {/* 自定义键盘 */}
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num.toString())}
                  className={`py-4 md:py-5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-2xl text-2xl md:text-3xl font-black text-slate-700 transition-all border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 ${num === 0 ? 'col-span-2' : ''}`}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleBackspace}
                className="py-4 md:py-5 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-500 rounded-2xl flex items-center justify-center transition-all border-b-4 border-red-200 active:border-b-0 active:translate-y-1"
              >
                <Delete className="w-8 h-8" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!userGuess}
              className="w-full py-4 md:py-5 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white rounded-3xl transition-all shadow-[0_6px_0_rgb(21,128,61)] active:shadow-none active:translate-y-1 font-black text-xl md:text-2xl flex items-center justify-center gap-3"
            >
              检查答案 <Send className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={toggleHint} className={`flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-black text-sm md:text-base border-b-4 active:border-b-0 active:translate-y-1 ${
              showHint ? 'bg-yellow-400 text-white border-yellow-600' : 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100'
            }`}>
              <Lightbulb className="w-4 h-4 md:w-5 md:h-5" /> 提示
            </button>
            <button onClick={startNewGame} className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 transition-all font-black text-sm md:text-base">
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" /> 换一题
            </button>
          </div>

          <div className={`p-4 rounded-3xl min-h-[80px] flex flex-col items-center justify-center text-center transition-all duration-300 border-4 ${
            isCorrect === true ? 'bg-green-50 border-green-200' : isCorrect === false ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'
          }`}>
             <div className="flex flex-col items-center gap-2">
                <p className={`text-sm md:text-base font-black ${isCorrect === true ? 'text-green-700' : isCorrect === false ? 'text-red-700' : 'text-blue-700'}`}>
                  {feedback}
                </p>
                {isCorrect === true && (
                  <button onClick={startNewGame} className="mt-1 px-5 py-1.5 bg-green-600 text-white rounded-full flex items-center gap-2 hover:bg-green-700 transition-all font-bold text-xs shadow-md active:scale-95">
                    下一关 <ChevronRight className="w-4 h-4" />
                  </button>
                )}
             </div>
          </div>
        </div>

        <div className="bg-indigo-600/95 p-4 md:p-5 rounded-[2rem] text-white shadow-xl flex items-start gap-4">
          <div className="p-2 bg-indigo-400/30 rounded-xl shrink-0"><Sparkles className="w-5 h-5 text-yellow-300" /></div>
          <div className="space-y-1">
            <h2 className="font-black text-base">玩法小贴士</h2>
            <p className="text-[10px] md:text-xs font-medium opacity-80 leading-relaxed">
              拖动方块旋转观察，注意底层！数不清可以“拆开数数”。
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        @keyframes celebrate { 0% { transform: translate(0, 0) scale(0) rotate(0deg); opacity: 1; } 50% { opacity: 1; } 100% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(1.5) rotate(360deg); opacity: 0; } }
        .shake { animation: shake 0.2s ease-in-out 0s 2; }
        .animate-celebrate { --tw-translate-x: ${Math.random() * 400 - 200}px; --tw-translate-y: ${Math.random() * -400 - 100}px; animation: celebrate 1.5s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default App;
