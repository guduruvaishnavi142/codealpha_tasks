import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Copy, Check, Loader2, RefreshCw, Trash2, Sparkles, AlertCircle, WifiOff } from 'lucide-react';
import { LANGUAGES, getLanguage } from '@/lib/languages';
import { translateText, TranslationError } from '@/lib/translate';

const MAX_CHARS = 500;

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Translator() {
  const [source, setSource] = useState('en');
  const [target, setTarget] = useState('te');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [recentTranslations, setRecentTranslations] = useState<
    Array<{ input: string; output: string; source: string; target: string }>
  >([]);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const swap = useCallback(() => {
    setSource((prev) => {
      setTarget(prev);
      return target;
    });
    setInput(output);
    setOutput(input);
    setStatus('idle');
    setError('');
  }, [target, output, input]);

  const clear = useCallback(() => {
    setInput('');
    setOutput('');
    setStatus('idle');
    setError('');
    inputRef.current?.focus();
  }, []);

  const handleTranslate = useCallback(async () => {
    const text = input.trim();
    if (!text) {
      setStatus('error');
      setError('Please enter some text to translate.');
      return;
    }

    setStatus('loading');
    setError('');
    setOutput('');
    setCopied(false);

    try {
      const result = await translateText(input, source, target);
      setOutput(result.text);
      setStatus('success');
      setRecentTranslations((prev) => [
        { input: input.trim(), output: result.text, source, target },
        ...prev.slice(0, 2),
      ]);
    } catch (e) {
      const msg = e instanceof TranslationError ? e.message : 'Something went wrong while translating. Please try again.';
      setStatus('error');
      setError(msg);
    }
  }, [input, source, target]);

  const copyOutput = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [output]);

  // Ctrl/Cmd+Enter to translate
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (status !== 'loading') handleTranslate();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleTranslate, status]);

  const charCount = input.length;
  const isTeluguOutput = target === 'te';
  const srcLang = getLanguage(source);
  const tgtLang = getLanguage(target);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* Language selector bar */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-200/70 p-3 sm:p-4 mb-4">
        <div className="flex items-stretch gap-2 sm:gap-3">
          <LanguageSelect
            value={source}
            onChange={setSource}
            label="From"
            id="source-lang"
          />
          <button
            type="button"
            onClick={swap}
            aria-label="Swap languages"
            className="shrink-0 self-end mb-1 grid place-items-center w-10 h-10 rounded-xl border border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 transition-all active:scale-90"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <LanguageSelect
            value={target}
            onChange={setTarget}
            label="To"
            id="target-lang"
          />
        </div>
      </div>

      {/* Translation panels */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-200/70 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {srcLang.flag} {srcLang.name}
            </span>
            {input && (
              <button
                onClick={clear}
                className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value.slice(0, MAX_CHARS));
              if (status === 'error') {
                setStatus('idle');
                setError('');
              }
            }}
            placeholder="Type or paste text here…"
            maxLength={MAX_CHARS}
            rows={6}
            className="w-full flex-1 resize-none px-4 py-4 text-slate-800 text-base sm:text-lg leading-relaxed focus:outline-none placeholder:text-slate-300 bg-transparent"
          />
          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="hidden sm:inline">Tip: press Ctrl/⌘ + Enter to translate</span>
            <span className={charCount > MAX_CHARS - 50 ? 'text-amber-500 font-medium' : ''}>
              {charCount} / {MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Output */}
        <div className="bg-gradient-to-br from-brand-50/60 to-white rounded-2xl shadow-soft border border-slate-200/70 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-brand-100/70 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-500">
              {tgtLang.flag} {tgtLang.name}
            </span>
            {output && (
              <button
                onClick={copyOutput}
                className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1.5 transition-colors font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 px-4 py-4 min-h-[168px] flex flex-col">
            {status === 'loading' && <LoadingState />}
            {status === 'error' && <ErrorState message={error} onRetry={handleTranslate} />}
            {status === 'success' && (
              <p
                className={`text-slate-800 text-base sm:text-lg leading-relaxed animate-fade-in-up ${
                  isTeluguOutput ? 'font-telugu' : ''
                }`}
              >
                {output}
              </p>
            )}
            {status === 'idle' && (
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed m-0">
                Translation will appear here…
              </p>
            )}
          </div>

          {status === 'success' && output && (
            <div className="px-4 py-2.5 border-t border-brand-100/70 text-xs text-slate-400">
              Translated via MyMemory API
            </div>
          )}
        </div>
      </div>

      {/* Translate button */}
      <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handleTranslate}
          disabled={status === 'loading'}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 text-white font-semibold shadow-glow hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Translating…
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" /> Translate
            </>
          )}
        </button>

        {recentTranslations.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            {recentTranslations.length} recent translation{recentTranslations.length > 1 ? 's' : ''} this session
          </div>
        )}
      </div>

      {/* Recent translations */}
      {recentTranslations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Recent
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {recentTranslations.map((r, i) => {
              const sLang = getLanguage(r.source);
              const tLang = getLanguage(r.target);
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSource(r.source);
                    setTarget(r.target);
                    setInput(r.input);
                    setOutput(r.output);
                    setStatus('success');
                    setError('');
                  }}
                  className="text-left bg-white border border-slate-200 rounded-xl p-3.5 hover:border-brand-300 hover:shadow-soft transition-all group"
                >
                  <div className="text-xs text-slate-400 mb-1.5">
                    {sLang.flag} {sLang.name} → {tLang.flag} {tLang.name}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-1 mb-1">{r.input}</p>
                  <p className={`text-sm text-slate-800 font-medium line-clamp-1 ${tLang.code === 'te' ? 'font-telugu' : ''}`}>
                    {r.output}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function LanguageSelect({
  value,
  onChange,
  label,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  id: string;
}) {
  return (
    <div className="flex-1">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-9 text-slate-800 font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 hover:border-slate-300 transition-colors cursor-pointer"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.name} — {l.nativeName}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 7l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-2 text-brand-500 text-sm font-medium">
        <Loader2 className="w-4 h-4 animate-spin" /> Translating…
      </div>
      <div className="h-4 rounded animate-shimmer w-full" />
      <div className="h-4 rounded animate-shimmer w-11/12" />
      <div className="h-4 rounded animate-shimmer w-3/4" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const isNetwork = message.includes('internet') || message.includes('reach');
  return (
    <div className="flex flex-col items-start gap-3 w-full">
      <div className="flex items-start gap-2.5 text-rose-600">
        {isNetwork ? <WifiOff className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
        <p className="text-sm leading-relaxed text-rose-600 font-medium">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Try again
      </button>
    </div>
  );
}
