import { Languages, Github, Heart } from 'lucide-react';
import Translator from '@/components/Translator';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-brand-50/40 flex flex-col">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl animate-floaty" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-sky-200/20 rounded-full blur-3xl animate-floaty" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Header */}
      <header className="w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center w-9 h-9 rounded-xl bg-brand-600 text-white shadow-glow">
              <Languages className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base sm:text-lg font-bold text-slate-800">TranslateAI</h1>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">Language Translation Tool</p>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 rounded-full px-3 py-1 hidden sm:inline">
            CodeAlpha · Task 1
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-10 px-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Translate between languages
          </h2>
          <p className="mt-2 text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
            Enter text, pick your source and target languages, and click Translate. Supports English, Telugu, and more.
          </p>
        </div>

        <Translator />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/60 bg-white/70 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p className="flex items-center gap-1.5">
            Built for CodeAlpha AI Internship
          </p>
          <p className="flex items-center gap-1.5">
            <Github className="w-3.5 h-3.5" /> Powered by MyMemory Translation API
          </p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> for learners
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
