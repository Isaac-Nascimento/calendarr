import React from 'react';
import { ShieldAlert, Play, CheckCircle2, BellRing, Sparkles, Vote } from 'lucide-react';

interface BannerRuleProps {
  riskCount: number;
  onRunCheck: () => void;
  onOpenDebate?: () => void;
  lastCheckedTime?: string;
}

export const BannerRule: React.FC<BannerRuleProps> = ({
  riskCount,
  onRunCheck,
  onOpenDebate,
  lastCheckedTime
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#0c0e29] via-[#12143b] to-[#0a0a1a] border-l-4 border-l-amber-500 border border-indigo-500/25 rounded-2xl p-4 sm:p-5 shadow-xl text-slate-100 mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-violet-600/20 border border-violet-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse text-amber-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Previsibilidade Ativa de Produção (Regra das 24 Horas)
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 shadow-xs">
                <Sparkles className="w-3 h-3" />
                Motor Ativo ⚡
              </span>
              {riskCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white animate-bounce shadow-xs">
                  <BellRing className="w-3 h-3" />
                  {riskCount} {riskCount === 1 ? 'Projeto em Risco' : 'Projetos em Risco'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Nenhum gargalo ativo
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed max-w-4xl">
              Se faltarem <strong>24 horas para a Data Limite de Produção</strong> e o status ainda for <strong>"Ideia"</strong>, o sistema emite alerta automático com agrupamento por responsável — evitando que a equipe descubra atrasos no dia da publicação.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-indigo-900/40">
          <button
            onClick={onRunCheck}
            className="flex-1 lg:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            title="Executa a verificação dos prazos de 24h em todos os projetos"
          >
            <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>Rodar Verificação 24h</span>
          </button>

          {onOpenDebate && (
            <button
              onClick={onOpenDebate}
              className="flex-1 lg:flex-none px-3.5 py-2 rounded-xl bg-[#141638] hover:bg-[#1c1f4e] text-indigo-200 border border-indigo-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Vote className="w-4 h-4 text-amber-400" />
              <span>Ir para Mesa de Debate</span>
            </button>
          )}
        </div>
      </div>

      {lastCheckedTime && (
        <div className="mt-3 pt-3 border-t border-indigo-900/40 flex flex-wrap items-center justify-between text-[11px] text-indigo-300/70">
          <span>Última checagem do motor: <strong className="text-white">{lastCheckedTime}</strong></span>
          <span className="text-amber-400/90 font-medium">Monitoramento contínuo com proteção contra atrasos</span>
        </div>
      )}
    </div>
  );
};
