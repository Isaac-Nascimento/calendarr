import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  Award,
  TrendingUp,
  Plus,
  Send,
  Calendar,
  CheckCircle2,
  Users,
  BarChart3,
  Flame,
  Check,
  ChevronDown,
  User,
  Clock,
  ArrowRight,
  Lock,
  Crown,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  ClipboardCheck,
  FileSpreadsheet,
  Film,
  Palette,
  Target,
  PenTool,
  BadgeAlert
} from 'lucide-react';
import { DebateProjeto, UserProfile, Channel, WriterAnalytics, ParecerViabilidade } from '../types';
import { CHANNELS } from '../data/initialData';

interface DebateViewProps {
  debateProjetos: DebateProjeto[];
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onVote: (projetoId: string, voteType: 'aprovar' | 'revisar' | 'rejeitar') => void;
  onAddComment: (projetoId: string, content: string) => void;
  onAddParecerViabilidade: (projetoId: string, parecer: Omit<ParecerViabilidade, 'id' | 'projetoId' | 'timestamp'>) => void;
  onCreateDebateProjeto: (newProjeto: Omit<DebateProjeto, 'id' | 'dataCriacao' | 'votosAprovar' | 'votosRevisar' | 'votosRejeitar' | 'comments' | 'statusDebate' | 'pareceresViabilidade'>) => void;
  onPromoteToCalendar: (projeto: DebateProjeto, overrideInviabilidade?: boolean) => void;
  onOpenLoginModal: () => void;
}

export const DebateView: React.FC<DebateViewProps> = ({
  debateProjetos,
  currentUser,
  allUsers,
  onVote,
  onAddComment,
  onAddParecerViabilidade,
  onCreateDebateProjeto,
  onPromoteToCalendar,
  onOpenLoginModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'debate' | 'analytics' | 'resumo'>('debate');
  const [showNewProjetoModal, setShowNewProjetoModal] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [projetoId: string]: string }>({});

  // Viability form state per project (expanded state)
  const [activeViabilityFormProjetoId, setActiveViabilityFormProjetoId] = useState<string | null>(null);
  const [viabStatus, setViabStatus] = useState<'viavel' | 'ressalva' | 'inviavel'>('viavel');
  const [viabJustificativa, setViabJustificativa] = useState('');
  const [viabRecursos, setViabRecursos] = useState('');
  const [viabUserRole, setViabUserRole] = useState(currentUser.cargo);

  // New projeto form state
  const [newTitle, setNewTitle] = useState('');
  const [newChannel, setNewChannel] = useState<Channel>('Instagram');
  const [newBriefing, setNewBriefing] = useState('');
  const [newCta, setNewCta] = useState('');

  // Check if current user is Coordenador Geral (Lucas Fontes)
  const isCoordenadorGeral =
    currentUser.id === 'user-5' ||
    currentUser.nome.toLowerCase().includes('lucas') ||
    currentUser.email.toLowerCase().includes('lucas') ||
    currentUser.cargo.toLowerCase().includes('coordenador');

  const lucasUser = allUsers.find(
    (u) =>
      u.id === 'user-5' ||
      u.nome.toLowerCase().includes('lucas') ||
      u.cargo.toLowerCase().includes('coordenador')
  ) || allUsers[4];

  // Handle comment submit
  const handleSendComment = (projetoId: string) => {
    const text = commentInputs[projetoId]?.trim();
    if (!text) return;
    onAddComment(projetoId, text);
    setCommentInputs((prev) => ({ ...prev, [projetoId]: '' }));
  };

  // Handle viability submit
  const handleSaveParecer = (projetoId: string) => {
    if (!viabJustificativa.trim()) return;

    onAddParecerViabilidade(projetoId, {
      userId: currentUser.id,
      userName: currentUser.nome,
      userRole: viabUserRole || currentUser.cargo,
      userColor: currentUser.cor,
      status: viabStatus,
      justificativa: viabJustificativa.trim(),
      recursosNecessarios: viabRecursos.trim() || undefined,
    });

    setViabJustificativa('');
    setViabRecursos('');
    setActiveViabilityFormProjetoId(null);
  };

  // Handle submit new debate projeto
  const handleCreateProjeto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateDebateProjeto({
      titulo: newTitle.trim(),
      autorNome: currentUser.nome,
      autorEmail: currentUser.email,
      autorRole: currentUser.cargo,
      canal: newChannel,
      briefing: newBriefing.trim() || 'Projeto proposto na mesa de debate e brainstorm.',
      ctaObjetivo: newCta.trim() || 'Engajamento e captação comercial',
    });

    setNewTitle('');
    setNewBriefing('');
    setNewCta('');
    setShowNewProjetoModal(false);
  };

  // Global Session Metrics
  const totalProjetos = debateProjetos.length;
  const totalVotesCast = debateProjetos.reduce(
    (acc, p) => acc + p.votosAprovar.length + p.votosRevisar.length + p.votosRejeitar.length,
    0
  );
  const totalApprovedVotes = debateProjetos.reduce((acc, p) => acc + p.votosAprovar.length, 0);
  const approvalRate = totalVotesCast > 0 ? Math.round((totalApprovedVotes / totalVotesCast) * 100) : 0;
  const consensuadosCount = debateProjetos.filter(
    (p) => p.statusDebate === 'consensuado' || p.votosAprovar.length >= 3
  ).length;

  // Compute Writer Analytics (Influence & Ranking)
  const writerStatsMap: { [email: string]: WriterAnalytics } = {};

  allUsers.forEach((u) => {
    writerStatsMap[u.email] = {
      nome: u.nome,
      role: u.cargo,
      email: u.email,
      totalProjetosSubmetidos: 0,
      totalVotosAprovar: 0,
      taxaAprovacao: 0,
      pontuacaoInfluencia: 0,
      projetosAprovados: 0,
      projetosComInviabilidade: 0,
    };
  });

  debateProjetos.forEach((p) => {
    if (!writerStatsMap[p.autorEmail]) {
      writerStatsMap[p.autorEmail] = {
        nome: p.autorNome,
        role: p.autorRole,
        email: p.autorEmail,
        totalProjetosSubmetidos: 0,
        totalVotosAprovar: 0,
        taxaAprovacao: 0,
        pontuacaoInfluencia: 0,
        projetosAprovados: 0,
        projetosComInviabilidade: 0,
      };
    }
    const stat = writerStatsMap[p.autorEmail];
    stat.totalProjetosSubmetidos += 1;
    stat.totalVotosAprovar += p.votosAprovar.length;

    const temInviabilidade = (p.pareceresViabilidade || []).some((pv) => pv.status === 'inviavel');
    if (temInviabilidade) {
      stat.projetosComInviabilidade += 1;
    }

    if (p.statusDebate === 'consensuado' || p.promovidaParaCalendario || p.votosAprovar.length >= 3) {
      stat.projetosAprovados += 1;
    }
  });

  const writerRanking: WriterAnalytics[] = Object.values(writerStatsMap)
    .map((w) => {
      const taxa =
        w.totalProjetosSubmetidos > 0
          ? Math.round((w.projetosAprovados / w.totalProjetosSubmetidos) * 100)
          : 0;
      // Pontuação: votos a favor * 10 + projetos aprovados * 25
      const score = w.totalVotosAprovar * 10 + w.projetosAprovados * 25;
      return {
        ...w,
        taxaAprovacao: taxa,
        pontuacaoInfluencia: score,
      };
    })
    .sort((a, b) => b.pontuacaoInfluencia - a.pontuacaoInfluencia);

  return (
    <div className="space-y-6">
      {/* Session Top Banner & Active User Status */}
      <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-[#0c0e29] via-[#12143b] to-[#0a0a1a] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-indigo-500/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Sessão Colaborativa • Brainstorm & Viabilidade
              </span>
              <span className="text-xs text-indigo-300/80 font-mono">
                Mesa Editorial Ativa
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Votação, Debate de Projetos & Estudo de Viabilidade
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-3xl mt-1 leading-relaxed">
              Membros cadastrados debatem projetos simultaneamente, votam em tempo real, avaliam viabilidade técnica (videomaker, design, tráfego) e constroem consenso para o marketing imobiliário da Inovatti em Maricá.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-[#141638] text-amber-300 border border-amber-500/30">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Alçada de Promoção Oficial: Exclusiva do Coordenador Geral (Lucas Fontes)</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20">
                <ClipboardCheck className="w-3 h-3 text-violet-400" />
                <span>Estudo de Viabilidade bloqueia projetos inviáveis</span>
              </span>
            </div>
          </div>

          {/* Active User Pill & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              onClick={onOpenLoginModal}
              className="px-3.5 py-2 rounded-xl bg-[#141638] border border-indigo-500/30 flex items-center gap-2.5 cursor-pointer hover:border-violet-400 transition-all"
              title="Clique para alternar ou gerenciar usuários"
            >
              <div
                className={`w-7 h-7 rounded-lg bg-gradient-to-br ${currentUser.cor} flex items-center justify-center text-[11px] font-extrabold text-white`}
              >
                {currentUser.avatar}
              </div>
              <div className="text-left text-xs">
                <div className="font-bold text-white flex items-center gap-1">
                  <span>{currentUser.nome}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-[10px] text-indigo-300/70">{currentUser.cargo}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-400 ml-1" />
            </div>

            <button
              onClick={() => setShowNewProjetoModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Novo Projeto</span>
            </button>
          </div>
        </div>

        {/* Global Session Counters & Sub-Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-2">
          <div className="p-3 rounded-xl bg-[#141638]/70 border border-indigo-500/20">
            <div className="text-lg sm:text-xl font-extrabold text-white">{totalProjetos}</div>
            <div className="text-[11px] text-indigo-300 font-semibold">Projetos em Brainstorm</div>
          </div>
          <div className="p-3 rounded-xl bg-[#141638]/70 border border-indigo-500/20">
            <div className="text-lg sm:text-xl font-extrabold text-amber-400">{totalVotesCast}</div>
            <div className="text-[11px] text-indigo-300 font-semibold">Votos Computados</div>
          </div>
          <div className="p-3 rounded-xl bg-[#141638]/70 border border-indigo-500/20">
            <div className="text-lg sm:text-xl font-extrabold text-emerald-400">{approvalRate}%</div>
            <div className="text-[11px] text-indigo-300 font-semibold">Aprovação Global</div>
          </div>
          <div className="p-3 rounded-xl bg-[#141638]/70 border border-indigo-500/20">
            <div className="text-lg sm:text-xl font-extrabold text-violet-400">{consensuadosCount}</div>
            <div className="text-[11px] text-indigo-300 font-semibold">Com Consenso de Votos</div>
          </div>
        </div>

        {/* Navigation between Debate / Analytics / Executive Summary */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-indigo-500/20 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('debate')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'debate'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-indigo-300 hover:text-white bg-[#141638]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Projetos em Debate & Viabilidade ({debateProjetos.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'analytics'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-indigo-300 hover:text-white bg-[#141638]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Ranking & Influência dos Autores</span>
          </button>

          <button
            onClick={() => setActiveSubTab('resumo')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeSubTab === 'resumo'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'text-indigo-300 hover:text-white bg-[#141638]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Resumo Executivo & Tendências</span>
          </button>
        </div>
      </div>

      {/* ==================== SUB-TAB 1: PROJETOS EM DEBATE & ESTUDO DE VIABILIDADE ==================== */}
      {activeSubTab === 'debate' && (
        <div className="space-y-6">
          {debateProjetos.map((projeto) => {
            const totalProjetoVotes =
              projeto.votosAprovar.length +
              projeto.votosRevisar.length +
              projeto.votosRejeitar.length;
            const pctAprovar =
              totalProjetoVotes > 0
                ? Math.round((projeto.votosAprovar.length / totalProjetoVotes) * 100)
                : 0;
            const pctRevisar =
              totalProjetoVotes > 0
                ? Math.round((projeto.votosRevisar.length / totalProjetoVotes) * 100)
                : 0;
            const pctRejeitar =
              totalProjetoVotes > 0
                ? Math.round((projeto.votosRejeitar.length / totalProjetoVotes) * 100)
                : 0;

            const userVotedAprovar = projeto.votosAprovar.includes(currentUser.id);
            const userVotedRevisar = projeto.votosRevisar.includes(currentUser.id);
            const userVotedRejeitar = projeto.votosRejeitar.includes(currentUser.id);

            const isConsenso =
              projeto.statusDebate === 'consensuado' || projeto.votosAprovar.length >= 3;

            // Feasibility study analysis
            const pareceres = projeto.pareceresViabilidade || [];
            const parecerInviavel = pareceres.find((p) => p.status === 'inviavel');
            const parecerRessalva = pareceres.find((p) => p.status === 'ressalva');
            const temBloqueioTecnico = !!parecerInviavel;

            const isFormOpen = activeViabilityFormProjetoId === projeto.id;

            return (
              <div
                key={projeto.id}
                className={`rounded-2xl border p-5 sm:p-6 transition-all backdrop-blur-md shadow-xl ${
                  temBloqueioTecnico
                    ? 'bg-[#120e24] border-rose-500/40 shadow-rose-950/20'
                    : isConsenso
                    ? 'bg-[#0f1130] border-amber-500/40 shadow-amber-500/5'
                    : 'bg-[#0e1026]/90 border-indigo-500/25'
                }`}
              >
                {/* Header Row: Author & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-xs">
                      {projeto.autorNome.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{projeto.autorNome}</span>
                        <span className="text-[10px] font-semibold text-indigo-300/80 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                          {projeto.autorRole}
                        </span>
                      </div>
                      <span className="text-[11px] text-indigo-400/70">{projeto.dataCriacao}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {projeto.canal}
                    </span>

                    {temBloqueioTecnico ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                        Inviabilidade Técnica Apontada
                      </span>
                    ) : isConsenso ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                        Consenso Aprovado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        <Clock className="w-3 h-3 text-amber-400" />
                        Votação em Andamento
                      </span>
                    )}
                  </div>
                </div>

                {/* Content: Title & Briefing */}
                <div className="py-3.5 space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {projeto.titulo}
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed bg-[#0a0c20]/70 p-3.5 rounded-xl border border-indigo-950">
                    {projeto.briefing}
                  </p>
                  {projeto.ctaObjetivo && (
                    <div className="text-xs text-indigo-300 flex items-center gap-1.5 pt-1">
                      <span className="font-bold text-amber-400">Objetivo / CTA:</span>
                      <span className="italic text-slate-200">"{projeto.ctaObjetivo}"</span>
                    </div>
                  )}
                </div>

                {/* =========================================================================
                    CRITICAL CONSTRAINT: ESTUDO DE VIABILIDADE TÉCNICA E OPERACIONAL
                    ========================================================================= */}
                <div className="my-3 p-4 rounded-xl bg-gradient-to-br from-[#101235] to-[#0a0c20] border border-indigo-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Estudo de Viabilidade Técnica & Operacional ({pareceres.length} pareceres)
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        setActiveViabilityFormProjetoId(isFormOpen ? null : projeto.id);
                        setViabUserRole(currentUser.cargo);
                      }}
                      className="px-2.5 py-1 text-xs font-bold bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-400/40 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isFormOpen ? 'Fechar Formulário' : '+ Dar Parecer Técnico'}</span>
                    </button>
                  </div>

                  {/* Form to add Parecer de Viabilidade */}
                  {isFormOpen && (
                    <div className="p-3.5 rounded-xl bg-[#0e102e] border border-amber-500/30 space-y-3 animate-in fade-in duration-150">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>Avaliar Viabilidade como: <strong>{currentUser.nome}</strong></span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-indigo-200 mb-1">
                            Sua Função / Especialidade Técnica *
                          </label>
                          <select
                            value={viabUserRole}
                            onChange={(e) => setViabUserRole(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#0a0c20] border border-indigo-500/30 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-400"
                          >
                            <option value="Videomaker & Social Media">Videomaker & Social Media</option>
                            <option value="Designer Gráfico & Visual">Designer Gráfico & Visual</option>
                            <option value="Gestor de Tráfego & SEO">Gestor de Tráfego & SEO</option>
                            <option value="Copywriter & Estrategista">Copywriter & Estrategista</option>
                            <option value="Corretor Líder & Consultor">Corretor Líder & Consultor</option>
                            <option value="Coordenador Geral">Coordenador Geral</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-indigo-200 mb-1">
                            Status de Viabilidade Técnica *
                          </label>
                          <div className="flex items-center gap-2">
                            <label className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${
                              viabStatus === 'viavel'
                                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400'
                                : 'bg-[#0a0c20] border-indigo-500/20 text-slate-300'
                            }`}>
                              <input
                                type="radio"
                                name={`viab-${projeto.id}`}
                                value="viavel"
                                checked={viabStatus === 'viavel'}
                                onChange={() => setViabStatus('viavel')}
                                className="sr-only"
                              />
                              ✅ Viável
                            </label>

                            <label className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${
                              viabStatus === 'ressalva'
                                ? 'bg-amber-500/30 border-amber-400 text-amber-200 ring-1 ring-amber-400'
                                : 'bg-[#0a0c20] border-indigo-500/20 text-slate-300'
                            }`}>
                              <input
                                type="radio"
                                name={`viab-${projeto.id}`}
                                value="ressalva"
                                checked={viabStatus === 'ressalva'}
                                onChange={() => setViabStatus('ressalva')}
                                className="sr-only"
                              />
                              ⚠️ Requer Ajuste
                            </label>

                            <label className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${
                              viabStatus === 'inviavel'
                                ? 'bg-rose-500/30 border-rose-400 text-rose-200 ring-1 ring-rose-400'
                                : 'bg-[#0a0c20] border-indigo-500/20 text-slate-300'
                            }`}>
                              <input
                                type="radio"
                                name={`viab-${projeto.id}`}
                                value="inviavel"
                                checked={viabStatus === 'inviavel'}
                                onChange={() => setViabStatus('inviavel')}
                                className="sr-only"
                              />
                              ⛔ Inviável
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-indigo-200 mb-1">
                          Justificativa Técnica (Explique limitações de videomaker, prazo de render, locação ou orçamento) *
                        </label>
                        <textarea
                          rows={2}
                          value={viabJustificativa}
                          onChange={(e) => setViabJustificativa(e.target.value)}
                          placeholder="Ex.: Como videomaker, nossa agenda de gravações com drone já está lotada essa semana e a câmera 4K está em manutenção..."
                          className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs text-white placeholder:text-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-indigo-200 mb-1">
                          Recursos Necessários ou Condições para Viabilizar (Opcional)
                        </label>
                        <input
                          type="text"
                          value={viabRecursos}
                          onChange={(e) => setViabRecursos(e.target.value)}
                          placeholder="Ex.: Freelancer de drone, verba de R$ 500 no Google Ads, ou adiar para a próxima semana"
                          className="w-full px-2.5 py-1.5 bg-[#0a0c20] border border-indigo-500/30 rounded-lg text-xs text-white placeholder:text-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-violet-400"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveViabilityFormProjetoId(null)}
                          className="px-3 py-1.5 text-xs text-indigo-300 hover:text-white cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveParecer(projeto.id)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-lg transition-all cursor-pointer shadow-sm"
                        >
                          Salvar Parecer Técnico
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of existing Pareceres */}
                  {pareceres.length === 0 ? (
                    <div className="p-3 rounded-lg bg-[#0a0c20]/60 border border-indigo-950 text-xs text-indigo-300/70 flex items-center justify-between">
                      <span>Nenhum parecer técnico registrado ainda. Videomaker, Designer e Tráfego podem validar a viabilidade.</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {pareceres.map((parecer) => {
                        const isInv = parecer.status === 'inviavel';
                        const isRess = parecer.status === 'ressalva';

                        return (
                          <div
                            key={parecer.id}
                            className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                              isInv
                                ? 'bg-rose-950/30 border-rose-500/40'
                                : isRess
                                ? 'bg-amber-950/20 border-amber-500/30'
                                : 'bg-[#0a0c20]/80 border-indigo-900/50'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                  <span>{parecer.userName}</span>
                                </span>
                                <span className="text-[10px] text-indigo-300 bg-[#141638] px-2 py-0.5 rounded-md border border-indigo-500/20">
                                  {parecer.userRole}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {isInv ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500 text-white flex items-center gap-1 shadow-xs">
                                    <AlertOctagon className="w-3 h-3" />
                                    INVIÁVEL (Gargalo Técnico)
                                  </span>
                                ) : isRess ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                                    <AlertTriangle className="w-3 h-3" />
                                    REQUER AJUSTE
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    VIÁVEL
                                  </span>
                                )}
                                <span className="text-[10px] text-indigo-400/60 font-mono">
                                  {parecer.timestamp}
                                </span>
                              </div>
                            </div>

                            <p className="text-indigo-100 leading-relaxed pl-2.5 border-l-2 border-violet-400/40">
                              {parecer.justificativa}
                            </p>

                            {parecer.recursosNecessarios && (
                              <div className="text-[11px] text-amber-300/90 bg-[#16122c] p-2 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                                <span className="font-bold">Recursos necessários:</span>
                                <span>{parecer.recursosNecessarios}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Warning banner if there's a technical bottleneck blocking promotion */}
                  {temBloqueioTecnico && (
                    <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 flex items-start gap-2.5 text-xs text-rose-200">
                      <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-rose-300 block font-bold text-sm">
                          ⛔ Bloqueio de Viabilidade Técnica em Vigor
                        </strong>
                        <p className="mt-0.5 leading-relaxed">
                          Mesmo com a aprovação por votos ({projeto.votosAprovar.length} votos a favor), este projeto <strong>não pode ser enviado diretamente para o calendário editorial</strong> devido à inviabilidade técnica apontada por <strong>{parecerInviavel.userName} ({parecerInviavel.userRole})</strong>.
                        </p>
                        <p className="text-[11px] text-rose-300/80 mt-1 italic">
                          "Motivo: {parecerInviavel.justificativa.slice(0, 160)}..."
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Voting Panel & Visual Distribution */}
                <div className="py-3.5 border-t border-b border-indigo-500/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>Proporção de Votos da Equipe</span>
                      <span className="text-indigo-400 font-normal">({totalProjetoVotes} votos)</span>
                    </span>

                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-emerald-400 font-bold">👍 Aprovar: {pctAprovar}%</span>
                      <span className="text-amber-300 font-bold">💬 Revisar: {pctRevisar}%</span>
                      <span className="text-rose-400 font-bold">👎 Descartar: {pctRejeitar}%</span>
                    </div>
                  </div>

                  {/* Multi-segment progress bar */}
                  <div className="h-2.5 w-full bg-[#14163c] rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${pctAprovar}%` }}
                      className="bg-emerald-500 transition-all duration-300"
                    ></div>
                    <div
                      style={{ width: `${pctRevisar}%` }}
                      className="bg-amber-400 transition-all duration-300"
                    ></div>
                    <div
                      style={{ width: `${pctRejeitar}%` }}
                      className="bg-rose-500 transition-all duration-300"
                    ></div>
                  </div>

                  {/* Interactive Voting Buttons for Current Logged User */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onVote(projeto.id, 'aprovar')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          userVotedAprovar
                            ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                            : 'bg-[#141638] text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Aprovar ({projeto.votosAprovar.length})</span>
                      </button>

                      <button
                        onClick={() => onVote(projeto.id, 'revisar')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          userVotedRevisar
                            ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-400/20'
                            : 'bg-[#141638] text-amber-300 hover:bg-amber-400/20 border border-amber-400/30'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ajustar ({projeto.votosRevisar.length})</span>
                      </button>

                      <button
                        onClick={() => onVote(projeto.id, 'rejeitar')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          userVotedRejeitar
                            ? 'bg-rose-500 text-white font-extrabold shadow-md shadow-rose-500/20'
                            : 'bg-[#141638] text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>Rejeitar ({projeto.votosRejeitar.length})</span>
                      </button>
                    </div>

                    {/* Promote to Calendar Action - Only Lucas Fontes (Coordenador Geral) + Viability Check */}
                    {isConsenso && !projeto.promovidaParaCalendario && (
                      isCoordenadorGeral ? (
                        temBloqueioTecnico ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold text-rose-300 bg-rose-950/60 border border-rose-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                              <span>Inviável p/ Videomaker/Técnico</span>
                            </span>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Atenção Lucas Fontes: Há parecer de inviabilidade técnica registrado por ${parecerInviavel?.userName}. Deseja aplicar exceção da Coordenação e agendar mesmo assim?`
                                  )
                                ) {
                                  onPromoteToCalendar(projeto, true);
                                }
                              }}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                              title="Aplicar exceção de Coordenação Geral"
                            >
                              <Crown className="w-3.5 h-3.5 fill-slate-950" />
                              <span>Liberar c/ Exceção da Coordenação</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onPromoteToCalendar(projeto)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                            title="Aprovação da Coordenação Geral (Lucas Fontes)"
                          >
                            <Crown className="w-3.5 h-3.5 fill-slate-950" />
                            <span>Promover para Calendário Editorial</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[11px] font-semibold text-amber-300/90 bg-[#16122c] border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                            title="Apenas o Coordenador Geral (Lucas Fontes) tem alçada para promover projetos discutidos para a grade oficial"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Aguardando Coordenador Geral (Lucas Fontes)</span>
                          </span>
                          <button
                            onClick={onOpenLoginModal}
                            className="text-[11px] font-bold text-indigo-300 hover:text-white bg-[#141638] hover:bg-[#1c1f4e] border border-indigo-500/30 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                            title="Alternar para Lucas Fontes para aprovar como Coordenador"
                          >
                            Entrar como Lucas →
                          </button>
                        </div>
                      )
                    )}

                    {projeto.promovidaParaCalendario && (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Agendado no Calendário
                      </span>
                    )}
                  </div>
                </div>

                {/* Real-time Brainstorm Debate Thread / Chat */}
                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-indigo-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                      <span>Debate da Equipe ({projeto.comments.length} argumentos)</span>
                    </span>
                    <span className="text-[11px] font-normal text-indigo-400/80">
                      Discuta ângulo, alternativas e alinhamentos
                    </span>
                  </div>

                  {/* Comments list */}
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {projeto.comments.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-3 rounded-xl bg-[#0a0c20]/90 border border-indigo-900/60 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <span className="text-amber-400">●</span>
                            <span>{comm.userName}</span>
                            <span className="text-[10px] text-indigo-400/80 font-normal">
                              ({comm.userRole})
                            </span>
                          </div>
                          <span className="text-indigo-400/60 font-mono text-[10px]">
                            {comm.timestamp}
                          </span>
                        </div>
                        <p className="text-indigo-100 leading-relaxed pl-3 border-l-2 border-violet-500/40">
                          {comm.content}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Add argument input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={commentInputs[projeto.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [projeto.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendComment(projeto.id);
                      }}
                      placeholder={`Comentar como ${currentUser.nome.split(' ')[0]}...`}
                      className="flex-1 px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs text-white placeholder:text-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                    <button
                      onClick={() => handleSendComment(projeto.id)}
                      className="px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== SUB-TAB 2: RANKING & INFLUÊNCIA DOS CRIADORES ==================== */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-500/25 bg-[#0e1026]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-indigo-500/20 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Dashboard de Influência dos Criadores de Projetos</span>
                </h3>
                <p className="text-xs text-indigo-300/80 mt-0.5">
                  Métricas de tração interna: quais membros da equipe têm mais votos favoráveis e projetos aprovados.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                Ranking em Tempo Real
              </span>
            </div>

            {/* Writers Ranking Table */}
            <div className="overflow-x-auto border border-indigo-500/20 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#14163c] text-indigo-200 font-bold border-b border-indigo-500/20">
                    <th className="py-3 px-4">Posição & Criador</th>
                    <th className="py-3 px-3">Cargo / Especialidade</th>
                    <th className="py-3 px-3 text-center">Projetos Submetidos</th>
                    <th className="py-3 px-3 text-center">Votos a Favor 👍</th>
                    <th className="py-3 px-3 text-center">Taxa de Aprovação</th>
                    <th className="py-3 px-3 text-center">No Calendário</th>
                    <th className="py-3 px-4 text-right">Índice de Influência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-900/30 bg-[#0a0c20]">
                  {writerRanking.map((writer, index) => {
                    const medalEmoji =
                      index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                    return (
                      <tr key={writer.email} className="hover:bg-[#14163c] transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base font-mono">{medalEmoji}</span>
                            <div>
                              <div className="text-sm">{writer.nome}</div>
                              <div className="text-[10px] text-indigo-400 font-mono font-normal">
                                {writer.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-indigo-200">{writer.role}</td>
                        <td className="py-3 px-3 text-center text-white font-mono font-bold">
                          {writer.totalProjetosSubmetidos}
                        </td>
                        <td className="py-3 px-3 text-center text-emerald-400 font-mono font-bold">
                          {writer.totalVotosAprovar}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            {writer.taxaAprovacao}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-amber-400 font-mono font-bold">
                          {writer.projetosAprovados}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-base font-extrabold text-amber-400 font-mono">
                            {writer.pontuacaoInfluencia} pts
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-violet-900/20 via-[#121438] to-transparent border border-violet-500/20 text-xs text-indigo-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Como funciona a pontuação de influência:</strong>
                <p className="text-indigo-300/80 mt-0.5">
                  Cada voto favorável recebido em projetos adiciona <strong>+10 pontos</strong>. Cada projeto que atinge consenso e é promovido ao Calendário Editorial Oficial adiciona <strong>+25 pontos</strong> de autoridade na equipe.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 3: RESUMO GERAL DO DEBATE & TENDÊNCIAS ==================== */}
      {activeSubTab === 'resumo' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-500/25 bg-[#0e1026]/90 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-indigo-500/20">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <span>Resumo Executivo da Sessão & Tendências Editoriais</span>
                </h3>
                <p className="text-xs text-indigo-300/80 mt-0.5">
                  Síntese automática do consenso alcançado para abastecer a estratégia de conteúdo da Inovatti.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#141638] border border-indigo-500/25 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-amber-400 block">Canal Mais Votado</span>
                <div className="text-lg font-bold text-white">YouTube & Instagram Reels</div>
                <p className="text-xs text-indigo-300/70">
                  Forte preferência da equipe por tours com drone e comparações de custo de vida em Maricá.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#141638] border border-indigo-500/25 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-amber-400 block">Tema com Maior Adesão</span>
                <div className="text-lg font-bold text-white">Captação Exclusiva & Financiamento</div>
                <p className="text-xs text-indigo-300/70">
                  Ganchos focados em proprietários e quebra de objeção do valor de entrada pelo FGTS.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#141638] border border-indigo-500/25 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-amber-400 block">Engajamento no Brainstorm</span>
                <div className="text-lg font-bold text-emerald-400">Quorum Ativo de 100%</div>
                <p className="text-xs text-indigo-300/70">
                  Todos os membros cadastrados participaram com votos, viabilidade e contribuições na thread.
                </p>
              </div>
            </div>

            {/* List of top approved projetos */}
            <div className="pt-2">
              <h4 className="text-sm font-bold text-white mb-3">
                🏆 Principais Projetos da Rodada (Prontos para Execução):
              </h4>
              <div className="space-y-3">
                {debateProjetos
                  .filter((p) => p.statusDebate === 'consensuado' || p.votosAprovar.length >= 3)
                  .map((p) => {
                    const hasBlock = (p.pareceresViabilidade || []).some((pv) => pv.status === 'inviavel');

                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-[#0a0c20] border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-amber-400">★ {p.canal}</span>
                            <span className="text-xs text-indigo-400">• Autor: {p.autorNome}</span>
                            {hasBlock && (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                                Bloqueio de Viabilidade
                              </span>
                            )}
                          </div>
                          <h5 className="text-sm font-bold text-white">{p.titulo}</h5>
                          <p className="text-xs text-indigo-200/80 mt-0.5">{p.briefing}</p>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                            {p.votosAprovar.length} Votos a Favor
                          </span>
                          {!p.promovidaParaCalendario && (
                            isCoordenadorGeral ? (
                              <button
                                onClick={() => onPromoteToCalendar(p, hasBlock)}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                                title="Agendar como Coordenador Geral"
                              >
                                <Crown className="w-3 h-3 fill-slate-950" />
                                <span>Agendar</span>
                              </button>
                            ) : (
                              <span
                                className="text-[11px] font-semibold text-amber-300/80 bg-[#141638] border border-amber-500/20 px-2 py-1 rounded-md flex items-center gap-1"
                                title="Apenas o Coordenador Geral (Lucas Fontes) pode agendar"
                              >
                                <Lock className="w-3 h-3 text-amber-400" />
                                <span>Requer Lucas</span>
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Debate Projeto */}
      {showNewProjetoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1026] text-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-indigo-500/30 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-1">
              Submeter Novo Projeto para Debate & Votação
            </h3>
            <p className="text-xs text-indigo-300/70 mb-4">
              Coloque seu gancho e briefing na mesa para a equipe votar e aprimorar simultaneamente.
            </p>

            <form onSubmit={handleCreateProjeto} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                  Título do Projeto / Gancho *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex.: Reels: Quanto rende uma casa de temporada no verão de Maricá?"
                  className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                  Canal Pretendido
                </label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value as Channel)}
                  className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  {CHANNELS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                  Briefing & Ângulo Proposto
                </label>
                <textarea
                  rows={3}
                  value={newBriefing}
                  onChange={(e) => setNewBriefing(e.target.value)}
                  placeholder="Explique o gancho comercial, dados que usaremos e por que esse projeto vai engajar..."
                  className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                  Chamada para Ação (CTA) / Objetivo
                </label>
                <input
                  type="text"
                  value={newCta}
                  onChange={(e) => setNewCta(e.target.value)}
                  placeholder="Ex.: Agendar visita com corretor pelo WhatsApp"
                  className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-indigo-500/20">
                <button
                  type="button"
                  onClick={() => setShowNewProjetoModal(false)}
                  className="px-3.5 py-2 text-indigo-300 hover:bg-[#141638] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs cursor-pointer shadow-md"
                >
                  Submeter à Mesa de Debate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
