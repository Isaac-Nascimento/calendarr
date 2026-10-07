import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, Mail, CheckCircle2, History, RefreshCw } from 'lucide-react';
import { Projeto } from '../types';
import { formatBRDate } from '../utils/dateUtils';

interface AlertsSidebarProps {
  riskProjetos: Projeto[];
  onAdvanceToProduction: (projetoId: string) => void;
  onSelectProjeto: (projeto: Projeto) => void;
  onPreviewEmailForProjeto: (projeto: Projeto) => void;
  onRunCheck: () => void;
  lastCheckedTime?: string;
  totalAlertsDispatched: number;
}

export const AlertsSidebar: React.FC<AlertsSidebarProps> = ({
  riskProjetos,
  onAdvanceToProduction,
  onSelectProjeto,
  onPreviewEmailForProjeto,
  onRunCheck,
  lastCheckedTime,
  totalAlertsDispatched
}) => {
  return (
    <aside className="space-y-4">
      {/* Active Alerts Panel */}
      <div className="rounded-2xl border border-indigo-500/25 bg-[#0e1026]/90 backdrop-blur-md shadow-xl p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-indigo-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Alertas de Previsibilidade
              </h3>
              <p className="text-[11px] text-indigo-300/70">
                Gatilho ativo das 24 horas
              </p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            riskProjetos.length > 0
              ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm animate-pulse'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {riskProjetos.length > 0 ? `${riskProjetos.length} Ativo${riskProjetos.length > 1 ? 's' : ''}` : '0 Ativos'}
          </span>
        </div>

        <p className="text-xs text-indigo-200/80 leading-relaxed mb-4">
          Projetos cujo prazo limite de produção está a <strong>menos de 24h</strong> e o status ainda permanece em <strong>"Ideia"</strong>. O robô emite notificação para evitar atrasos na publicação.
        </p>

        {/* List of Alerts */}
        <div className="space-y-3">
          {riskProjetos.length === 0 ? (
            <div className="text-center py-6 px-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <p className="text-xs font-bold">Nenhum gargalo detectado!</p>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                Todos os projetos estão em andamento ou dentro da margem segura de produção.
              </p>
            </div>
          ) : (
            riskProjetos.map((projeto) => (
              <div
                key={projeto.id}
                className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#18112e] to-[#120f26] border border-amber-500/35 transition-all hover:border-amber-400 shadow-md space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                    <AlertTriangle className="w-3 h-3 text-slate-950" />
                    Risco Ativo: &lt;24h
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-300">
                    {projeto.canal}
                  </span>
                </div>

                <div>
                  <h4
                    onClick={() => onSelectProjeto(projeto)}
                    className="text-xs font-bold text-white leading-snug cursor-pointer hover:text-amber-300 line-clamp-2 transition-colors"
                  >
                    {projeto.titulo}
                  </h4>
                  <p className="text-[11px] text-indigo-200/80 mt-1 leading-normal">
                    <strong>Gargalo:</strong> Limite vence em <strong>{formatBRDate(projeto.dataLimiteProducao)}</strong> e o item continuava sem produção iniciada.
                  </p>
                </div>

                <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-indigo-300">
                  <span>Resp: <strong className="text-white">{projeto.responsavel.split(' ')[0]}</strong></span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onPreviewEmailForProjeto(projeto)}
                      className="p-1 rounded bg-[#16183e] text-indigo-200 hover:text-white border border-indigo-500/30 transition-colors"
                      title="Ver notificação registrada para este responsável"
                    >
                      <Mail className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onAdvanceToProduction(projeto.id)}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                    >
                      <span>Destravar</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Monitoring Execution Log Box */}
      <div className="rounded-2xl border border-indigo-500/25 bg-[#08091a]/95 text-indigo-200 p-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-500/20">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <History className="w-3.5 h-3.5" />
            <span>Log de Monitoramento Contínuo</span>
          </div>
          <button
            onClick={onRunCheck}
            className="p-1 text-indigo-400 hover:text-white rounded hover:bg-[#141638] transition-colors cursor-pointer"
            title="Executar verificação manual agora"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1.5 text-[11px] text-indigo-200 font-mono">
          <div className="flex items-start gap-1.5 text-indigo-300/80">
            <span className="text-amber-400 font-bold">›</span>
            <span>Gatilho temporal: varredura programada a cada 12h</span>
          </div>
          <div className="flex items-start gap-1.5 text-indigo-300/80">
            <span className="text-amber-400 font-bold">›</span>
            <span>Última checagem: <strong className="text-white">{lastCheckedTime || 'Hoje às 08:00'}</strong></span>
          </div>
          <div className="flex items-start gap-1.5 text-indigo-300/80">
            <span className="text-amber-400 font-bold">›</span>
            <span>Projetos em risco detectados: <strong className="text-amber-400">{riskProjetos.length}</strong></span>
          </div>
          <div className="flex items-start gap-1.5 text-indigo-300/80">
            <span className="text-amber-400 font-bold">›</span>
            <span>Total alertas despachados (sessão): <strong className="text-violet-300">{totalAlertsDispatched}</strong></span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-indigo-900/40 text-[10px] text-indigo-300/60 leading-normal">
          💡 <em>Regra de ouro:</em> Notificações são agrupadas por responsável (1 e-mail consolidado por autor) e não repetem disparos para o mesmo projeto.
        </div>
      </div>
    </aside>
  );
};
