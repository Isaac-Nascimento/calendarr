import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { ProjetoStatus } from '../types';

interface KpiCardsProps {
  publishedCount: number;
  inProgressCount: number;
  riskCount: number;
  sazonalCount: number;
  onFilterStatus?: (status: ProjetoStatus | 'TODOS' | 'RISCO') => void;
  activeFilter?: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  publishedCount,
  inProgressCount,
  riskCount,
  sazonalCount,
  onFilterStatus,
  activeFilter
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Publicados */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('Publicado')}
        className={`rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer backdrop-blur-md ${
          activeFilter === 'Publicado' || activeFilter === 'Publicada'
            ? 'bg-[#14163c] border-emerald-500/60 ring-2 ring-emerald-500/30'
            : 'bg-[#0e1026]/85 border-indigo-500/20 hover:border-indigo-400/40 hover:bg-[#121435]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {publishedCount}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-300/70 mt-1">
              Projetos Publicados
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Conteúdo no ar e validado</span>
        </div>
      </div>

      {/* 2. Em Produção */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('Em produção')}
        className={`rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer backdrop-blur-md ${
          activeFilter === 'Em produção'
            ? 'bg-[#14163c] border-violet-500/60 ring-2 ring-violet-500/30'
            : 'bg-[#0e1026]/85 border-indigo-500/20 hover:border-violet-400/40 hover:bg-[#121435]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {inProgressCount}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-300/70 mt-1">
              Projetos em Produção
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center border border-violet-500/25">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-violet-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-violet-400"></span>
          <span>Copy & Design em andamento</span>
        </div>
      </div>

      {/* 3. Em Risco de Atraso (Amarelo-Laranja & Rose Alert) */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('RISCO')}
        className={`rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer backdrop-blur-md ${
          activeFilter === 'RISCO'
            ? 'bg-[#1e1124] border-amber-500/70 ring-2 ring-amber-500/30'
            : 'bg-[#130f24] border-amber-500/30 hover:border-amber-400/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight flex items-center gap-2">
              {riskCount}
              {riskCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                  ALERTA
                </span>
              )}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-300/80 mt-1">
              Em Risco (&lt;24h)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>{riskCount > 0 ? 'Status "Ideia" próximo ao prazo' : 'Nenhum projeto em risco'}</span>
        </div>
      </div>

      {/* 4. Oportunidades Sazonais */}
      <div
        className="rounded-2xl p-4 sm:p-5 border border-indigo-500/20 bg-[#0e1026]/85 backdrop-blur-md transition-all hover:border-indigo-400/40"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
              {sazonalCount}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-300/70 mt-1">
              Oportunidades Sazonais
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center border border-violet-500/30">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-violet-400"></span>
          <span>Datas estratégicas & mercado</span>
        </div>
      </div>
    </div>
  );
};
