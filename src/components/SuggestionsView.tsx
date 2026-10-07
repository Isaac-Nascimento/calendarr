import React, { useState } from 'react';
import { Lightbulb, Plus, Check, Archive, Send, Info, Vote } from 'lucide-react';
import { SuggestionIdea, Channel } from '../types';
import { TEAM_MEMBERS, CHANNELS } from '../data/initialData';

interface SuggestionsViewProps {
  ideas: SuggestionIdea[];
  onCreateIdea: (newIdea: Omit<SuggestionIdea, 'id' | 'dataCriacao'>) => void;
  onOpenApproveModal: (idea: SuggestionIdea) => void;
  onArchiveIdea: (id: string) => void;
  onSendToDebate?: (idea: SuggestionIdea) => void;
}

export const SuggestionsView: React.FC<SuggestionsViewProps> = ({
  ideas,
  onCreateIdea,
  onOpenApproveModal,
  onArchiveIdea,
  onSendToDebate
}) => {
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState<Channel>('Instagram');
  const [responsible, setResponsible] = useState(TEAM_MEMBERS[0].nome);
  const [ctaObjetivo, setCtaObjetivo] = useState('');
  const [briefing, setBriefing] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateIdea({
      titulo: title.trim(),
      canal: channel,
      responsavel: responsible,
      sugeridoPor: 'Gestor de Marketing Inovatti',
      briefing: briefing.trim() || 'Ideia submetida para avaliação editorial da equipe.',
      ctaObjetivo: ctaObjetivo.trim() || 'Geração de autoridade e engajamento'
    });

    setTitle('');
    setCtaObjetivo('');
    setBriefing('');
  };

  const filteredIdeas = ideas.filter(i => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return i.titulo.toLowerCase().includes(q) || i.briefing.toLowerCase().includes(q) || i.responsavel.toLowerCase().includes(q);
  });

  const getChannelBadge = (c: Channel) => {
    switch (c) {
      case 'Instagram':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'Blog':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Google':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'YouTube':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Informative Callout */}
      <div className="bg-gradient-to-r from-[#121438] via-[#1a1642] to-[#121438] border border-violet-500/30 border-l-4 border-l-violet-500 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3.5 shadow-xl text-slate-100">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-violet-600/25 text-violet-300 flex items-center justify-center shrink-0 border border-violet-500/30">
            <Info className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
            <strong className="font-bold text-white block mb-0.5">
              Fila de Ideias Avulsas & Triagem:
            </strong>
            Toda ideia sugerida pode ser aprovada diretamente para o calendário ou enviada para a <strong>Mesa de Votação & Debate</strong> para que todos os membros da equipe votem e discutam melhorias simultaneamente.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Submit New Idea */}
        <div className="lg:col-span-5 rounded-2xl border border-indigo-500/25 bg-[#0e1026]/90 backdrop-blur-md shadow-xl p-5 sm:p-6 sticky top-24">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center border border-violet-500/30">
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white">
              Submeter Nova Ideia Manual
            </h3>
          </div>
          <p className="text-xs text-indigo-300/70 mb-5 leading-relaxed">
            Insira conceitos, ganchos de mercado ou briefings rápidos antes de comprometer datas.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                Título do Projeto / Gancho Editorial *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Por que o custo por m² em Maricá ainda é uma oportunidade..."
                className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white placeholder:text-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                  Canal Pretendido
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as Channel)}
                  className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  {CHANNELS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                  Responsável Sugerido
                </label>
                <select
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  {TEAM_MEMBERS.map((m) => (
                    <option key={m.nome} value={m.nome}>{m.nome} ({m.cargo.split('&')[0].trim()})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                CTA / Objetivo Estratégico
              </label>
              <input
                type="text"
                value={ctaObjetivo}
                onChange={(e) => setCtaObjetivo(e.target.value)}
                placeholder="Ex.: Levar para simulação de financiamento no WhatsApp"
                className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white placeholder:text-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                Justificativa & Briefing Rápido
              </label>
              <textarea
                rows={3}
                value={briefing}
                onChange={(e) => setBriefing(e.target.value)}
                placeholder="Descreva o ângulo do conteúdo, dor do cliente em Maricá ou gancho comercial..."
                className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white placeholder:text-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Adicionar à Fila de Ideias</span>
            </button>
          </form>
        </div>

        {/* Right List: Pending Ideas Queue */}
        <div className="lg:col-span-7 rounded-2xl border border-indigo-500/25 bg-[#0e1026]/90 backdrop-blur-md shadow-xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-500/20 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Fila de Análise e Triagem</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                  {ideas.length} {ideas.length === 1 ? 'ideia' : 'ideias'}
                </span>
              </h3>
              <p className="text-xs text-indigo-300/70 mt-0.5">
                Ideias aguardando decisão para entrar no debate da equipe ou ir direto ao calendário.
              </p>
            </div>

            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filtrar ideias..."
              className="px-3 py-1.5 bg-[#0a0c20] border border-indigo-500/30 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {filteredIdeas.length === 0 ? (
            <div className="text-center py-12 px-4 bg-[#0a0c20]/60 rounded-2xl border border-dashed border-indigo-500/30 text-indigo-300/70">
              <Lightbulb className="w-10 h-10 mx-auto text-indigo-400/40 mb-2" />
              <p className="text-sm font-bold text-white">Fila de ideias vazia!</p>
              <p className="text-xs text-indigo-300/60 mt-1 max-w-sm mx-auto">
                Submeta novas ideias ao lado ou use o botão <strong>"Sugerir projeto"</strong> no Repertório Sazonal.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="p-4 rounded-xl border border-indigo-500/25 bg-[#121438]/80 hover:border-violet-500/50 hover:shadow-lg transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {idea.titulo}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${getChannelBadge(idea.canal)}`}>
                      {idea.canal}
                    </span>
                  </div>

                  <p className="text-xs text-indigo-200/90 leading-relaxed bg-[#0a0c20]/70 p-2.5 rounded-lg border border-indigo-950">
                    {idea.briefing}
                  </p>

                  {idea.ctaObjetivo && (
                    <div className="text-[11px] text-indigo-300 flex items-center gap-1.5">
                      <span className="font-semibold text-amber-400">Objetivo/CTA:</span>
                      <span className="italic text-slate-300">{idea.ctaObjetivo}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-indigo-500/20 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-300/80">
                    <div className="flex items-center gap-2">
                      <span>Origem: <strong className="text-white">{idea.sugeridoPor}</strong></span>
                      <span>•</span>
                      <span>Resp: <strong className="text-white">{idea.responsavel.split(' ')[0]}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onArchiveIdea(idea.id)}
                        className="px-2.5 py-1 text-indigo-300 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                        title="Descartar ou arquivar esta sugestão"
                      >
                        <Archive className="w-3.5 h-3.5 inline mr-1" />
                        Arquivar
                      </button>

                      {onSendToDebate && (
                        <button
                          onClick={() => onSendToDebate(idea)}
                          className="px-2.5 py-1.5 bg-[#141638] hover:bg-[#1c1f4e] text-indigo-200 border border-indigo-500/30 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Enviar para rodada de votação e debate com toda a equipe"
                        >
                          <Vote className="w-3.5 h-3.5 text-amber-400" />
                          <span>Debater & Votar</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenApproveModal(idea)}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-lg font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprovar Direto</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
