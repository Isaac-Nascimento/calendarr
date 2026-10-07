import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { SuggestionIdea, Channel, ProjetoStatus } from '../types';
import { TEAM_MEMBERS, CHANNELS } from '../data/initialData';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: SuggestionIdea | null;
  onConfirmApprove: (
    ideaId: string,
    details: {
      dataPublicacao: string;
      dataLimiteProducao: string;
      status: ProjetoStatus;
      canal: Channel;
      responsavel: string;
      ctaObjetivo: string;
    }
  ) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  idea,
  onConfirmApprove
}) => {
  const [dataPublicacao, setDataPublicacao] = useState('2026-10-18');
  const [dataLimiteProducao, setDataLimiteProducao] = useState('2026-10-16');
  const [status, setStatus] = useState<ProjetoStatus>('Em produção');
  const [canal, setCanal] = useState<Channel>('Instagram');
  const [responsavel, setResponsavel] = useState(TEAM_MEMBERS[0].nome);
  const [ctaObjetivo, setCtaObjetivo] = useState('');

  useEffect(() => {
    if (idea) {
      setCanal(idea.canal);
      setResponsavel(idea.responsavel);
      setCtaObjetivo(idea.ctaObjetivo || '');
      setDataPublicacao('2026-10-18');
      setDataLimiteProducao('2026-10-16');
      setStatus('Em produção');
    }
  }, [idea, isOpen]);

  const handlePubDateChange = (newDate: string) => {
    setDataPublicacao(newDate);
    const d = new Date(newDate);
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() - 2);
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      setDataLimiteProducao(`${d.getFullYear()}-${mStr}-${dStr}`);
    }
  };

  if (!isOpen || !idea) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmApprove(idea.id, {
      dataPublicacao,
      dataLimiteProducao,
      status,
      canal,
      responsavel,
      ctaObjetivo
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0e1026] text-white rounded-2xl max-w-lg w-full shadow-2xl border border-indigo-500/30 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#14163c] p-4 sm:p-5 flex items-center justify-between border-b border-indigo-500/20">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
              Validação Editorial & Agendamento
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Aprovar Ideia como Projeto Oficial
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-400 hover:text-white rounded-lg hover:bg-violet-600/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected idea preview card */}
        <div className="p-4 bg-[#0a0c20] border-b border-indigo-500/20 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white line-clamp-1">{idea.titulo}</span>
          </div>
          <p className="text-xs text-indigo-200/80 line-clamp-2">
            {idea.briefing}
          </p>
          <div className="text-[11px] text-indigo-400 flex items-center gap-2 pt-1">
            <span>Sugerido por: <strong className="text-white">{idea.sugeridoPor}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1">
                Data de Publicação *
              </label>
              <input
                type="date"
                required
                value={dataPublicacao}
                onChange={(e) => handlePubDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1">
                Data Limite de Produção *
              </label>
              <input
                type="date"
                required
                value={dataLimiteProducao}
                onChange={(e) => setDataLimiteProducao(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <span className="text-[10px] text-indigo-400 mt-0.5 block">
                Calculado com 48h de margem de segurança.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1">
                Canal
              </label>
              <select
                value={canal}
                onChange={(e) => setCanal(e.target.value as Channel)}
                className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1">
                Status Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjetoStatus)}
                className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="Em produção">Em produção (Recomendado)</option>
                <option value="Aprovado">Aprovado (Fila de projetos)</option>
                <option value="Ideia">Ideia (Gatilho de risco ativo)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-200 mb-1">
              Responsável pela Execução
            </label>
            <select
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              {TEAM_MEMBERS.map((m) => (
                <option key={m.nome} value={m.nome}>{m.nome} ({m.cargo.split(' ')[0]})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-200 mb-1">
              CTA / Objetivo Estratégico
            </label>
            <input
              type="text"
              value={ctaObjetivo}
              onChange={(e) => setCtaObjetivo(e.target.value)}
              placeholder="Ex.: Levar clientes para visita presencial em Maricá"
              className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div className="pt-3 border-t border-indigo-500/20 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-indigo-300 hover:bg-[#141638] rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirmar e Agendar Projeto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
