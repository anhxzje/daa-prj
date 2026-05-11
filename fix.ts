import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Base structural replaces
content = content.replace('bg-slate-950 text-slate-200', 'bg-th-base text-th-text transition-colors duration-300');
content = content.replace('border-slate-800 bg-slate-900/50', 'border-th-border bg-th-header backdrop-blur-md transition-colors duration-300');

// Typography
content = content.replace(/text-white/g, 'text-th-bold');
content = content.replace(/text-slate-200/g, 'text-th-text');
content = content.replace(/text-slate-300/g, 'text-th-text');
content = content.replace(/text-slate-400/g, 'text-th-muted');
content = content.replace(/text-slate-500/g, 'text-th-muted');

// Panels
content = content.replace(/bg-slate-900\/80/g, 'bg-th-panel');
content = content.replace(/bg-slate-900\/40/g, 'bg-th-panel');
content = content.replace(/bg-slate-900/g, 'bg-th-panel-solid');
content = content.replace(/bg-slate-950\/50/g, 'bg-th-base');
content = content.replace(/bg-slate-950/g, 'bg-th-base');
content = content.replace(/bg-slate-800\/30/g, 'bg-th-panel');

// Borders
content = content.replace(/border-slate-800\/50/g, 'border-th-border');
content = content.replace(/border-slate-800/g, 'border-th-border');
content = content.replace(/border-slate-700\/50/g, 'border-th-border');
content = content.replace(/border-slate-700/g, 'border-th-input');

// Buttons / Controls
content = content.replace(/bg-slate-800/g, 'bg-th-panel-solid');
content = content.replace(/hover:bg-slate-700/g, 'hover:bg-th-border');
content = content.replace(/disabled:bg-slate-700/g, 'disabled:opacity-50 disabled:bg-th-border');

// The Grid styling dynamically adjusted
content = content.replace(
  `"rounded-md md:rounded-lg flex items-center justify-center text-xl md:text-4xl lg:text-5xl font-bold transition-all duration-300",`,
  `"rounded-md md:rounded-lg flex items-center justify-center font-bold transition-all duration-300",`
);
content = content.replace(
  `val !== 0 `,
  `puzzle.size >= 8 ? "text-lg md:text-xl lg:text-3xl" : puzzle.size >= 6 ? "text-xl md:text-3xl lg:text-4xl" : "text-2xl md:text-4xl lg:text-5xl",
                          val !== 0 `
);

// Empty cell classes
content = content.replace(
  `"bg-slate-900/40 border-slate-800/60 border box-border shadow-inner text-transparent"`,
  `"bg-th-cell-empty border-th-cell-b-e border box-border shadow-inner text-transparent"`
);
// Filled cell classes
content = content.replace(
  `"bg-slate-800/80 border-slate-600 text-white shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] border-[1.5px]"`,
  `"bg-th-cell-filled border-th-cell-b-f text-th-cell-text shadow-[inset_0_0_15px_var(--color-cell-shadow)] border-[1.5px]"`
);

// Clues sizes
content = content.replace(
  /<div key={`t-\${i}`} className="flex items-end justify-center pb-2 font-bold text-blue-400 text-lg md:text-3xl lg:text-4xl">/g,
  `<div key={\`t-\${i}\`} className={cn("flex items-end justify-center pb-1 md:pb-2 font-bold text-blue-500", puzzle.size >= 8 ? "text-sm md:text-lg lg:text-xl" : puzzle.size >= 6 ? "text-base md:text-xl lg:text-3xl" : "text-lg md:text-2xl lg:text-4xl")}>`
);
content = content.replace(
  /<div className="flex items-center justify-end pr-2 font-bold text-blue-400 text-lg md:text-3xl lg:text-4xl">/g,
  `<div className={cn("flex items-center justify-end pr-1 md:pr-2 font-bold text-blue-500", puzzle.size >= 8 ? "text-sm md:text-lg lg:text-xl" : puzzle.size >= 6 ? "text-base md:text-xl lg:text-3xl" : "text-lg md:text-2xl lg:text-4xl")}>`
);
content = content.replace(
  /<div className="flex items-center justify-start pl-2 font-bold text-blue-400 text-lg md:text-3xl lg:text-4xl">/g,
  `<div className={cn("flex items-center justify-start pl-1 md:pl-2 font-bold text-blue-500", puzzle.size >= 8 ? "text-sm md:text-lg lg:text-xl" : puzzle.size >= 6 ? "text-base md:text-xl lg:text-3xl" : "text-lg md:text-2xl lg:text-4xl")}>`
);
content = content.replace(
  /<div key={`b-\${i}`} className="flex items-start justify-center pt-2 font-bold text-blue-400 text-lg md:text-3xl lg:text-4xl">/g,
  `<div key={\`b-\${i}\`} className={cn("flex items-start justify-center pt-1 md:pt-2 font-bold text-blue-500", puzzle.size >= 8 ? "text-sm md:text-lg lg:text-xl" : puzzle.size >= 6 ? "text-base md:text-xl lg:text-3xl" : "text-lg md:text-2xl lg:text-4xl")}>`
);

fs.writeFileSync('src/App.tsx', content);
