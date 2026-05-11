import { useState, useEffect, Fragment } from 'react';
import { Play, Sun, Moon } from 'lucide-react';
import { cn } from './lib/utils';
import { generatePuzzle, solveWithAlgorithm, type GridSize, type Algorithm, type Difficulty, type Puzzle } from './lib/engine';

export type DatasetItem = {
  name: string;
  n: number;
  difficulty: string;
  ct: number[];
  cb: number[];
  cl: number[];
  cr: number[];
  grid: number[][];
  solution_gold: number[][];
};

interface RunResult {
  id: number;
  puzzleId: number | string;
  algo: Algorithm;
  size: GridSize;
  timeMs: number;
  success: boolean;
}

export default function App() {
  const [size, setSize] = useState<GridSize>(6);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [algo, setAlgo] = useState<Algorithm>('Branch & Bound');
  
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [history, setHistory] = useState<RunResult[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const [dataset, setDataset] = useState<DatasetItem[]>([]);
  const [isLoadingDataset, setIsLoadingDataset] = useState(true);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    setIsLoadingDataset(true);
    fetch('/skyscrapers_dataset_1500.json')
      .then(res => res.json())
      .then(data => {
        setDataset(data);
        setIsLoadingDataset(false);
      })
      .catch(err => {
        console.error('Failed to load dataset:', err);
        setIsLoadingDataset(false);
      });
  }, []);

  useEffect(() => {
    if (!isLoadingDataset) {
      handleGenerate();
    }
  }, [size, difficulty, isLoadingDataset]);

  const handleGenerate = () => {
    if (dataset.length > 0) {
      const filtered = dataset.filter(
        d => d.n === size && d.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
      if (filtered.length > 0) {
        const item = filtered[Math.floor(Math.random() * filtered.length)];
        // Extract id from name if format is name_XXX, otherwise use random
        const idMatch = item.name.match(/_(\d+)$/);
        const pid = idMatch ? parseInt(idMatch[1], 10) : Math.floor(Math.random() * 10000);
        
        setPuzzle({
          id: pid,
          size: size,
          clues: {
            top: item.ct,
            bottom: item.cb,
            left: item.cl,
            right: item.cr
          },
          grid: item.grid.map(row => [...row]),
          solution: item.solution_gold.map(row => [...row]),
          isVerified: item.unique !== false
        });
        setTimeElapsed(0);
        return;
      }
    }
    
    // Fallback if dataset is not available or has no matching puzzles
    setPuzzle({ ...generatePuzzle(size, difficulty), isVerified: false });
    setTimeElapsed(0);
  };

  const handleSolve = () => {
    if (!puzzle) return;
    setIsSolving(true);
    
    // Use timeout to allow UI update before blocking main thread
    setTimeout(() => {
      const result = solveWithAlgorithm(puzzle, algo);
      
      setPuzzle((prev) => prev ? { ...prev, grid: result.grid } : null);
      setTimeElapsed(result.time);
      
      const newHistoryItem: RunResult = {
        id: Date.now(),
        puzzleId: puzzle.id,
        algo,
        size,
        timeMs: result.time,
        success: result.success,
      };
      
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
      setIsSolving(false);
    }, 10);
  };

  const remaining = puzzle ? puzzle.size * puzzle.size - puzzle.grid.flat().filter(x => x !== 0).length : 0;
  const totalCells = puzzle ? puzzle.size * puzzle.size : 0;

  return (
    <div className="flex flex-col h-screen w-full bg-th-base text-th-text transition-colors duration-300 font-sans overflow-hidden">
      {/* Header Section */}
      <header className="h-16 border-b border-th-border bg-th-header backdrop-blur-md transition-colors duration-300 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-900/20">A</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-th-bold leading-none">Anhxzje <span className="text-blue-500">x</span> HUS</h1>
            <p className="text-[10px] uppercase tracking-widest text-th-muted font-semibold">Skyscrapers Solver</p>
          </div>
        </div>
        <nav className="flex gap-6 text-sm font-medium text-th-muted">
          <a href="#" className="text-blue-400 border-b-2 border-blue-500 pb-1">Solver</a>
        </nav>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-th-panel-solid transition-colors text-th-muted hover:text-th-bold"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            System Online
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 p-6 min-h-0 overflow-y-auto overflow-x-hidden">
        {/* Left Sidebar: Controls */}
        <aside className="col-span-1 md:col-span-3 flex flex-col gap-4">
          <div className="bg-th-panel rounded-xl border border-th-border p-5 flex-1 shadow-xl flex flex-col">
            <h2 className="text-xs font-bold text-th-muted uppercase tracking-widest mb-4">Configuration</h2>
            
            <div className="space-y-4 flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-th-text">Grid Size</label>
                <select 
                  value={size} 
                  onChange={(e) => setSize(Number(e.target.value) as GridSize)}
                  className="w-full bg-th-base border border-th-input rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={4}>4 x 4 Grid</option>
                  <option value={5}>5 x 5 Grid</option>
                  <option value={6}>6 x 6 Grid</option>
                  <option value={7}>7 x 7 Grid</option>
                  <option value={8}>8 x 8 Grid</option>
                  <option value={9}>9 x 9 Grid</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-th-text">Difficulty</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setDifficulty('Easy')}
                    className={cn(
                      "px-3 py-2 text-xs rounded border transition-colors",
                      difficulty === 'Easy' ? "bg-blue-600 border-blue-500 font-semibold" : "bg-th-panel-solid border-th-input hover:bg-th-border"
                    )}
                  >Easy</button>
                  <button 
                    onClick={() => setDifficulty('Hard')}
                    className={cn(
                      "px-3 py-2 text-xs rounded border transition-colors",
                      difficulty === 'Hard' ? "bg-blue-600 border-blue-500 font-semibold" : "bg-th-panel-solid border-th-input hover:bg-th-border"
                    )}
                  >Hard</button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-th-text">Solving Algorithm</label>
                <div className="space-y-2">
                  {['Branch & Bound', 'ILP (Gurobi/Cplex)', 'Google OR-Tools'].map((a) => (
                    <label key={a} className="flex items-center gap-3 p-3 rounded-lg bg-th-base border border-th-border cursor-pointer hover:border-blue-500/50 transition-colors">
                      <input 
                        type="radio" 
                        name="algo" 
                        className="accent-blue-500" 
                        checked={algo === a}
                        onChange={() => setAlgo(a as Algorithm)}
                      />
                      <span className="text-xs">{a.replace(' (Gurobi/Cplex)', '')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button 
                onClick={handleSolve}
                disabled={isSolving || remaining === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:opacity-50 disabled:bg-th-border text-th-bold rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                {isSolving ? 'SOLVING...' : 'SOLVE PUZZLE'}
              </button>
              <button 
                onClick={handleGenerate}
                className="w-full py-3 bg-th-panel-solid hover:bg-th-border text-th-text rounded-xl font-bold transition-all"
              >
                RANDOM GENERATE
              </button>
            </div>
          </div>
        </aside>

        {/* Center: Puzzle Grid */}
        <section className="col-span-1 md:col-span-6 flex flex-col items-center justify-center bg-th-panel rounded-xl border border-th-border p-4 md:p-8 shadow-inner min-h-[500px] md:min-h-[600px] overflow-hidden relative">
          
          {puzzle && (
            <div className="relative w-full max-w-[800px] flex justify-center items-center p-6 md:p-12">
              {/* Glow background behind grid */}
              <div className="absolute inset-0 bg-blue-500/10 rounded-[60px] blur-3xl pointer-events-none -z-10"></div>
              
              <div 
                className="grid w-full aspect-square relative bg-th-panel rounded-3xl p-4 md:p-8 border border-th-border shadow-2xl"
                style={{ 
                  gridTemplateColumns: `minmax(20px, 10%) repeat(${puzzle.size}, minmax(0, 1fr)) minmax(20px, 10%)`,
                  gridTemplateRows: `minmax(20px, 10%) repeat(${puzzle.size}, minmax(0, 1fr)) minmax(20px, 10%)`,
                  gap: '6px'
                }}
              >
                {/* Top Row: empty corner, top clues, empty corner */}
                <div></div>
                {puzzle.clues.top.map((c, i) => (
                  <div key={`t-${i}`} className={cn("flex items-end justify-center pb-1 md:pb-2 font-bold text-blue-500", puzzle.size >= 8 ? "text-sm md:text-lg lg:text-xl" : puzzle.size >= 6 ? "text-base md:text-xl lg:text-3xl" : "text-lg md:text-2xl lg:text-4xl")}>
                    {c > 0 ? c : ''}
                  </div>
                ))}
                <div></div>

                {/* Middle Rows: left clue, cells, right clue */}
                {puzzle.grid.map((row, r) => (
                  <Fragment key={`row-${r}`}>
                    {/* Left clue */}
                    <div className={cn("flex items-center justify-end pr-1 md:pr-2 font-bold text-blue-500", puzzle.size >= 8 ? "text-sm md:text-lg lg:text-xl" : puzzle.size >= 6 ? "text-base md:text-xl lg:text-3xl" : "text-lg md:text-2xl lg:text-4xl")}>
                      {puzzle.clues.left[r] > 0 ? puzzle.clues.left[r] : ''}
                    </div>

                    {/* Cells */}
                    {row.map((val, c) => (
                      <div 
                        key={`${r}-${c}`}
                        className={cn(
                          "rounded-md md:rounded-lg flex items-center justify-center font-bold transition-all duration-300",
                          puzzle.size >= 8 ? "text-lg md:text-xl lg:text-3xl" : puzzle.size >= 6 ? "text-xl md:text-3xl lg:text-4xl" : "text-2xl md:text-4xl lg:text-5xl",
                          val !== 0 
                            ? "bg-th-cell-filled border-th-cell-b-f text-th-cell-text shadow-sm border-[1.5px]" 
                            : "bg-th-cell-empty border-th-cell-b-e border box-border shadow-inner text-transparent"
                        )}
                      >
                        {val !== 0 ? val : ''}
                      </div>
                    ))}

                    {/* Right clue */}
                    <div className={cn("flex items-center justify-start pl-1 md:pl-2 font-bold text-blue-500", puzzle.size >= 8 ? "text-sm md:text-lg lg:text-xl" : puzzle.size >= 6 ? "text-base md:text-xl lg:text-3xl" : "text-lg md:text-2xl lg:text-4xl")}>
                      {puzzle.clues.right[r] > 0 ? puzzle.clues.right[r] : ''}
                    </div>
                  </Fragment>
                ))}

                {/* Bottom Row: empty corner, bottom clues, empty corner */}
                <div></div>
                {puzzle.clues.bottom.map((c, i) => (
                  <div key={`b-${i}`} className={cn("flex items-start justify-center pt-1 md:pt-2 font-bold text-blue-500", puzzle.size >= 8 ? "text-sm md:text-lg lg:text-xl" : puzzle.size >= 6 ? "text-base md:text-xl lg:text-3xl" : "text-lg md:text-2xl lg:text-4xl")}>
                    {c > 0 ? c : ''}
                  </div>
                ))}
                <div></div>

              </div>
            </div>
          )}
          
          <div className="mt-8 flex gap-8 w-full max-w-lg justify-between border-t border-th-border pt-6">
            <div className="text-center">
              <p className="text-[10px] uppercase text-th-muted font-bold tracking-widest">Remaining</p>
              <p className="text-xl md:text-2xl font-light text-th-bold">{remaining}/{totalCells}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase text-th-muted font-bold tracking-widest">Time Elapsed</p>
              <p className="text-xl md:text-2xl font-light text-th-bold">{timeElapsed.toFixed(2)}ms</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <p className="text-[10px] uppercase text-th-muted font-bold tracking-widest">Puzzle ID</p>
              <p className="text-xl md:text-2xl font-light text-th-bold leading-none mt-1">#{puzzle?.id ?? '---'}</p>
              {puzzle && (
                puzzle.isVerified ? (
                  <span className="text-[8px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded mt-1 border border-emerald-500/20 tracking-widest font-semibold flex items-center gap-1">
                    <svg className="w-2 h-2 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    VERIFIED
                  </span>
                ) : (
                  <span className="text-[8px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded mt-1 border border-amber-500/20 tracking-widest font-semibold">UNVERIFIED CANDIDATE</span>
                )
              )}
            </div>
          </div>
        </section>

        {/* Right Sidebar: History & Results */}
        <aside className="col-span-1 md:col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="bg-th-panel rounded-xl border border-th-border p-5 flex-1 flex flex-col shadow-xl overflow-hidden">
            <h2 className="text-xs font-bold text-th-muted uppercase tracking-widest mb-4">Run History</h2>
            
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {history.length > 0 ? history.map((item) => (
                <div key={item.id} className={cn(
                  "p-3 rounded bg-th-base border-l-4",
                  item.success ? "border-emerald-500" : "border-red-500 opacity-80"
                )}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold">Puzzle #{item.puzzleId}</span>
                    <span className={cn("text-[10px]", item.success ? "text-emerald-500" : "text-red-500")}>
                      {item.success ? 'Success' : 'Timeout'}
                    </span>
                  </div>
                  <p className="text-[10px] text-th-muted mt-1">
                    {item.algo.replace(/ \(.*\)/, '')} • {item.size}x{item.size} • {item.timeMs}ms
                  </p>
                </div>
              )) : (
                <div className="text-xs text-th-muted italic text-center mt-10">No runs yet</div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-th-border shrink-0">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-th-muted">Total Solved:</span>
                <span className="text-th-bold font-mono">{history.filter(h => h.success).length} / 1500</span>
              </div>
              <div className="w-full bg-th-base h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (history.filter(h => h.success).length / 1500) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-th-panel-solid border border-th-border p-4 rounded-xl shrink-0">
            <h3 className="text-xs font-bold text-th-muted uppercase mb-2">System Status</h3>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="text-th-muted">CPU LOAD:</div>
              <div className="text-blue-400 text-right">{isSolving ? '89%' : '14%'}</div>
              <div className="text-th-muted">RAM USE:</div>
              <div className="text-blue-400 text-right">242MB</div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Bar */}
      <footer className="h-10 border-t border-th-border bg-th-base flex items-center justify-between px-8 text-[10px] text-th-muted font-medium shrink-0">
        <div>&copy; 2026 Anhxzje & HUS Mathematics Department. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className={cn("w-1.5 h-1.5 rounded-full", isSolving ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse")}></span>
            Engine: {isSolving ? 'COMPUTING' : 'READY'}
          </span>
          <span>v2.0.1-stable</span>
        </div>
      </footer>
    </div>
  );
}
