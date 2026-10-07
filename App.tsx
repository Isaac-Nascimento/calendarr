import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BannerRule } from './components/BannerRule';
import { KpiCards } from './components/KpiCards';
import { CalendarView } from './components/CalendarView';
import { TableView } from './components/TableView';
import { AlertsSidebar } from './components/AlertsSidebar';
import { DebateView } from './components/DebateView';
import { SuggestionsView } from './components/SuggestionsView';
import { SazonalView } from './components/SazonalView';
import { ProjetoModal } from './components/ProjetoModal';
import { ApprovalModal } from './components/ApprovalModal';
import { LoginModal } from './components/LoginModal';
import { Toast, ToastData } from './components/Toast';
import {
  Projeto,
  SuggestionIdea,
  SazonalItem,
  Channel,
  ProjetoStatus,
  UserProfile,
  DebateProjeto,
  ParecerViabilidade
} from './types';
import {
  INITIAL_PAUTAS,
  INITIAL_IDEAS,
  SAZONAL_DATABASE,
  INITIAL_USERS,
  INITIAL_DEBATE_PAUTAS
} from './data/initialData';
import { isProjetoInRisk, formatBRDate } from './utils/dateUtils';
import { Calendar, Table, Plus } from 'lucide-react';

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'dashboard' | 'debate' | 'ideias' | 'sazonal'>('dashboard');
  const [calendarViewMode, setCalendarViewMode] = useState<'grid' | 'table'>('grid');

  // Date Navigation (Starts in October 2026)
  const [year, setYear] = useState<number>(2026);
  const [monthIndex, setMonthIndex] = useState<number>(9); // 9 = October

  // Users & Authentication State
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('cei_users_v3');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('cei_current_user_v3');
    return saved ? JSON.parse(saved) : INITIAL_USERS[4]; // Starts as Lucas Fontes (Coordenador Geral) or can switch
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Core Data with LocalStorage Persistence
  const [projetos, setProjetos] = useState<Projeto[]>(() => {
    const saved = localStorage.getItem('cei_projetos_v3');
    return saved ? JSON.parse(saved) : INITIAL_PAUTAS;
  });

  const [ideas, setIdeas] = useState<SuggestionIdea[]>(() => {
    const saved = localStorage.getItem('cei_ideas_v3');
    return saved ? JSON.parse(saved) : INITIAL_IDEAS;
  });

  const [debateProjetos, setDebateProjetos] = useState<DebateProjeto[]>(() => {
    const saved = localStorage.getItem('cei_debates_v3');
    return saved ? JSON.parse(saved) : INITIAL_DEBATE_PAUTAS;
  });

  const [sazonalList, setSazonalList] = useState<SazonalItem[]>(() => {
    const saved = localStorage.getItem('cei_sazonal_v3');
    return saved ? JSON.parse(saved) : SAZONAL_DATABASE;
  });

  // Filter States
  const [selectedChannel, setSelectedChannel] = useState<Channel | 'TODOS'>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<ProjetoStatus | 'TODOS' | 'RISCO'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Popups
  const [isProjetoModalOpen, setIsProjetoModalOpen] = useState(false);
  const [activeProjetoForModal, setActiveProjetoForModal] = useState<Projeto | null>(null);
  const [initialDateForModal, setInitialDateForModal] = useState<string | undefined>(undefined);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [ideaForApproval, setIdeaForApproval] = useState<SuggestionIdea | null>(null);

  // Feedback State
  const [toast, setToast] = useState<ToastData | null>(null);
  const [lastCheckedTime, setLastCheckedTime] = useState('07/10/2026 08:00');
  const [totalAlertsDispatched, setTotalAlertsDispatched] = useState(2);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('cei_users_v3', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('cei_current_user_v3', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cei_projetos_v3', JSON.stringify(projetos));
  }, [projetos]);

  useEffect(() => {
    localStorage.setItem('cei_ideas_v3', JSON.stringify(ideas));
  }, [ideas]);

  useEffect(() => {
    localStorage.setItem('cei_debates_v3', JSON.stringify(debateProjetos));
  }, [debateProjetos]);

  useEffect(() => {
    localStorage.setItem('cei_sazonal_v3', JSON.stringify(sazonalList));
  }, [sazonalList]);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ id: Date.now().toString(), message, type });
  };

  // Reference date for 24h risk check: October 7, 2026
  const referenceDate = new Date(2026, 9, 7);
  const riskProjetos = projetos.filter((p) => isProjetoInRisk(p, referenceDate));

  // KPIs
  const publishedCount = projetos.filter((p) => p.status === 'Publicado').length;
  const inProgressCount = projetos.filter((p) => p.status === 'Em produção' || p.status === 'Revisão').length;
  const riskCount = riskProjetos.length;
  const sazonalCount = sazonalList.length;

  /* =====================================================================
     ACTIONS: 24H PREDICTABILITY VERIFICATION
     ===================================================================== */
  const handleRunVerificarAlertas = () => {
    const nowFormatted = '07/10/2026 09:30';
    setLastCheckedTime(nowFormatted);

    const unalertedRisk = projetos.filter(
      (p) => isProjetoInRisk(p, referenceDate) && !p.alertaEnviado
    );

    if (unalertedRisk.length === 0) {
      if (riskProjetos.length > 0) {
        showToast(
          `Varredura concluída: ${riskProjetos.length} projeto(s) em risco já receberam notificações anteriores. Proteção ativa contra disparos repetidos!`,
          'info'
        );
      } else {
        showToast(
          'Varredura concluída: Todos os projetos estão em andamento ou dentro da margem de segurança!',
          'success'
        );
      }
      return;
    }

    setProjetos((prev) =>
      prev.map((p) => {
        if (unalertedRisk.some((item) => item.id === p.id)) {
          return {
            ...p,
            alertaEnviado: true,
            dataAlerta: nowFormatted,
          };
        }
        return p;
      })
    );

    setTotalAlertsDispatched((prev) => prev + unalertedRisk.length);
    showToast(
      `🚨 ${unalertedRisk.length} projeto(s) com menos de 24h notificados aos respectivos responsáveis!`,
      'warning'
    );
  };

  const handleAdvanceToProduction = (projetoId: string) => {
    setProjetos((prev) =>
      prev.map((p) => (p.id === projetoId ? { ...p, status: 'Em produção' as ProjetoStatus } : p))
    );
    showToast('Projeto movido para "Em produção" — Alerta desarmado com sucesso!', 'success');
  };

  /* =====================================================================
     ACTIONS: DEBATE, VOTING & FEASIBILITY STUDY
     ===================================================================== */
  const handleVote = (projetoId: string, voteType: 'aprovar' | 'revisar' | 'rejeitar') => {
    setDebateProjetos((prev) =>
      prev.map((p) => {
        if (p.id !== projetoId) return p;

        // Clean user's previous votes on this item
        let newAprovar = p.votosAprovar.filter((uid) => uid !== currentUser.id);
        let newRevisar = p.votosRevisar.filter((uid) => uid !== currentUser.id);
        let newRejeitar = p.votosRejeitar.filter((uid) => uid !== currentUser.id);

        // Toggle vote
        if (voteType === 'aprovar' && !p.votosAprovar.includes(currentUser.id)) {
          newAprovar.push(currentUser.id);
        } else if (voteType === 'revisar' && !p.votosRevisar.includes(currentUser.id)) {
          newRevisar.push(currentUser.id);
        } else if (voteType === 'rejeitar' && !p.votosRejeitar.includes(currentUser.id)) {
          newRejeitar.push(currentUser.id);
        }

        // Automatic consensus check (3+ approvals)
        let status = p.statusDebate;
        if (newAprovar.length >= 3) {
          status = 'consensuado';
        }

        return {
          ...p,
          votosAprovar: newAprovar,
          votosRevisar: newRevisar,
          votosRejeitar: newRejeitar,
          statusDebate: status,
        };
      })
    );

    showToast(`Voto registrado como ${currentUser.nome.split(' ')[0]}!`, 'info');
  };

  const handleAddComment = (projetoId: string, content: string) => {
    const newComment = {
      id: `comm-${Date.now()}`,
      projetoId,
      userId: currentUser.id,
      userName: currentUser.nome,
      userRole: currentUser.cargo,
      userCor: currentUser.cor,
      content,
      timestamp: 'Hoje ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setDebateProjetos((prev) =>
      prev.map((p) => (p.id === projetoId ? { ...p, comments: [...p.comments, newComment] } : p))
    );

    showToast('Contribuição adicionada ao debate da equipe!', 'success');
  };

  const handleAddParecerViabilidade = (
    projetoId: string,
    parecerData: Omit<ParecerViabilidade, 'id' | 'projetoId' | 'timestamp'>
  ) => {
    const newParecer: ParecerViabilidade = {
      ...parecerData,
      id: `viab-${Date.now()}`,
      projetoId,
      timestamp: 'Hoje ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setDebateProjetos((prev) =>
      prev.map((p) =>
        p.id === projetoId
          ? {
              ...p,
              pareceresViabilidade: [...(p.pareceresViabilidade || []), newParecer],
            }
          : p
      )
    );

    if (parecerData.status === 'inviavel') {
      showToast(
        `⛔ Parecer de INVIABILIDADE registrado por ${parecerData.userName} (${parecerData.userRole}). O projeto foi bloqueado tecnicamente!`,
        'warning'
      );
    } else if (parecerData.status === 'ressalva') {
      showToast(
        `⚠️ Parecer com RESSALVAS registrado por ${parecerData.userName}.`,
        'info'
      );
    } else {
      showToast(
        `✅ Parecer de VIABILIDADE técnica aprovado por ${parecerData.userName}!`,
        'success'
      );
    }
  };

  const handleCreateDebateProjeto = (
    newProjetoData: Omit<
      DebateProjeto,
      | 'id'
      | 'dataCriacao'
      | 'votosAprovar'
      | 'votosRevisar'
      | 'votosRejeitar'
      | 'comments'
      | 'statusDebate'
      | 'pareceresViabilidade'
    >
  ) => {
    const newDebate: DebateProjeto = {
      ...newProjetoData,
      id: `deb-${Date.now()}`,
      dataCriacao: 'Hoje às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      statusDebate: 'em_votacao',
      votosAprovar: [currentUser.id],
      votosRevisar: [],
      votosRejeitar: [],
      pareceresViabilidade: [],
      comments: [
        {
          id: `c-init-${Date.now()}`,
          projetoId: `deb-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.nome,
          userRole: currentUser.cargo,
          userCor: currentUser.cor,
          content: 'Abri este projeto para votação e estudo de viabilidade técnica da equipe!',
          timestamp: 'Agora',
        },
      ],
    };

    setDebateProjetos((prev) => [newDebate, ...prev]);
    showToast('Projeto submetido com sucesso à mesa de debate!', 'success');
  };

  const handlePromoteToCalendar = (projeto: DebateProjeto, overrideInviabilidade = false) => {
    const isCoordenador =
      currentUser.id === 'user-5' ||
      currentUser.nome.toLowerCase().includes('lucas') ||
      currentUser.email.toLowerCase().includes('lucas') ||
      currentUser.cargo.toLowerCase().includes('coordenador');

    if (!isCoordenador) {
      showToast(
        'Apenas o Coordenador Geral (Lucas Fontes) tem permissão para promover projetos discutidos para o Calendário Editorial.',
        'warning'
      );
      return;
    }

    const hasInviable = (projeto.pareceresViabilidade || []).some((pv) => pv.status === 'inviavel');
    if (hasInviable && !overrideInviabilidade) {
      showToast(
        'Projeto com restrição técnica de videomaker/produção. É necessária a aprovação com exceção da Coordenação Geral.',
        'warning'
      );
      return;
    }

    setDebateProjetos((prev) =>
      prev.map((p) => (p.id === projeto.id ? { ...p, promovidaParaCalendario: true } : p))
    );

    const pubDate = '2026-10-24';
    const deadline = '2026-10-22';
    const newProjeto: Projeto = {
      id: `p-deb-${Date.now()}`,
      titulo: projeto.titulo,
      canal: projeto.canal,
      responsavel: projeto.autorNome,
      email: projeto.autorEmail,
      status: 'Em produção',
      dataPublicacao: pubDate,
      dataLimiteProducao: deadline,
      ctaObjetivo: projeto.ctaObjetivo || 'Conversão qualificada',
      observacoes: `[CONSENSO EQUIPE]: Aprovado com ${projeto.votosAprovar.length} votos a favor.\n[COORDENADOR]: Homologado por Lucas Fontes.\n[BRIEFING]: ${projeto.briefing}`,
      alertaEnviado: false,
      pareceresViabilidade: projeto.pareceresViabilidade,
    };

    setProjetos((prev) => [newProjeto, ...prev]);
    showToast(`Projeto consensuado e agendado para ${formatBRDate(pubDate)} no Calendário Editorial!`, 'success');
    setActiveTab('dashboard');
  };

  const handleSendIdeaToDebate = (idea: SuggestionIdea) => {
    const newDebate: DebateProjeto = {
      id: `deb-from-${idea.id}`,
      titulo: idea.titulo,
      autorNome: idea.responsavel,
      autorEmail: `${idea.responsavel.toLowerCase().replace(/[^a-z]/g, '.')}@inovatti.com.br`,
      autorRole: 'Equipe Editorial',
      canal: idea.canal,
      briefing: idea.briefing,
      ctaObjetivo: idea.ctaObjetivo,
      dataCriacao: 'Enviado hoje às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      statusDebate: 'em_votacao',
      votosAprovar: [currentUser.id],
      votosRevisar: [],
      votosRejeitar: [],
      pareceresViabilidade: [],
      comments: [
        {
          id: `comm-migr-${Date.now()}`,
          projetoId: `deb-from-${idea.id}`,
          userId: currentUser.id,
          userName: currentUser.nome,
          userRole: currentUser.cargo,
          userCor: currentUser.cor,
          content: `Encaminhei esta ideia da Janela de Sugestões para debate, votos e estudo de viabilidade técnica. Videomaker e Designer, por favor avaliem!`,
          timestamp: 'Agora',
        },
      ],
    };

    setDebateProjetos((prev) => [newDebate, ...prev]);
    showToast(`"${idea.titulo.slice(0, 32)}..." enviada para a Mesa de Debate!`, 'success');
    setActiveTab('debate');
  };

  /* =====================================================================
     ACTIONS: CALENDAR & PROJETOS MANAGEMENT
     ===================================================================== */
  const handleSaveProjeto = (projetoData: Partial<Projeto>) => {
    if (activeProjetoForModal) {
      setProjetos((prev) =>
        prev.map((p) => (p.id === activeProjetoForModal.id ? ({ ...p, ...projetoData } as Projeto) : p))
      );
      showToast('Alterações salvas com sucesso no calendário editorial!');
    } else {
      const newProjeto: Projeto = {
        id: `p-${Date.now()}`,
        titulo: projetoData.titulo || 'Novo Projeto',
        canal: projetoData.canal || 'Instagram',
        responsavel: projetoData.responsavel || currentUser.nome,
        email: projetoData.email || currentUser.email,
        status: projetoData.status || 'Em produção',
        dataPublicacao: projetoData.dataPublicacao || '2026-10-18',
        dataLimiteProducao: projetoData.dataLimiteProducao || '2026-10-16',
        ctaObjetivo: projetoData.ctaObjetivo || '',
        observacoes: projetoData.observacoes || '',
        alertaEnviado: false,
      };
      setProjetos((prev) => [newProjeto, ...prev]);
      showToast('Novo projeto agendado com sucesso no calendário!');
    }
  };

  const handleDeleteProjeto = (id: string) => {
    setProjetos((prev) => prev.filter((p) => p.id !== id));
    showToast('Projeto excluído do calendário.');
  };

  const handleUpdateStatus = (id: string, newStatus: ProjetoStatus) => {
    setProjetos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    showToast(`Status atualizado para "${newStatus}".`);
  };

  const handleCreateIdea = (newIdeaData: Omit<SuggestionIdea, 'id' | 'dataCriacao'>) => {
    const newIdea: SuggestionIdea = {
      ...newIdeaData,
      id: `idea-${Date.now()}`,
      dataCriacao: '2026-10-07',
    };
    setIdeas((prev) => [newIdea, ...prev]);
    showToast('Ideia adicionada à fila de análise editorial!', 'success');
  };

  const handleArchiveIdea = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    showToast('Ideia arquivada com sucesso.', 'info');
  };

  const handleConfirmApproveIdea = (
    ideaId: string,
    details: {
      dataPublicacao: string;
      dataLimiteProducao: string;
      status: ProjetoStatus;
      canal: Channel;
      responsavel: string;
      ctaObjetivo: string;
    }
  ) => {
    const idea = ideas.find((i) => i.id === ideaId);
    if (!idea) return;

    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));

    const newProjeto: Projeto = {
      id: `p-${Date.now()}`,
      titulo: idea.titulo,
      canal: details.canal,
      responsavel: details.responsavel,
      email: `${details.responsavel.toLowerCase().replace(/[^a-z]/g, '.')}@inovatti.com.br`,
      status: details.status,
      dataPublicacao: details.dataPublicacao,
      dataLimiteProducao: details.dataLimiteProducao,
      ctaObjetivo: details.ctaObjetivo,
      observacoes: idea.briefing,
      alertaEnviado: false,
    };

    setProjetos((prev) => [newProjeto, ...prev]);
    showToast(
      `Ideia aprovada com sucesso! Agendada para ${formatBRDate(details.dataPublicacao)}.`,
      'success'
    );
    setActiveTab('dashboard');
  };

  const handleSuggestFromSazonal = (item: SazonalItem) => {
    const newIdea: SuggestionIdea = {
      id: `idea-saz-${Date.now()}`,
      titulo: item.tituloSugerido,
      canal: item.canalRecomendado,
      responsavel: currentUser.nome,
      sugeridoPor: `Repertório Sazonal (${item.nome})`,
      briefing: `Oportunidade sazonal: ${item.nome} (${item.dataStr}). Nicho: ${item.nicho}. ${item.contexto}`,
      ctaObjetivo: 'Aproveitar a sazonalidade e atrair clientes qualificados',
      dataCriacao: '2026-10-07',
    };

    setIdeas((prev) => [newIdea, ...prev]);
    showToast(
      `Projeto de "${item.nome}" enviado para a Janela de Sugestões!`,
      'success'
    );
    setActiveTab('ideias');
  };

  const handleAddCustomSazonal = (newItem: Omit<SazonalItem, 'id'>) => {
    const item: SazonalItem = {
      ...newItem,
      id: `saz-custom-${Date.now()}`,
    };
    setSazonalList((prev) => [...prev, item]);
    showToast('Nova data sazonal cadastrada com sucesso!');
  };

  const handleExportCsv = () => {
    const headers = [
      'Título do Projeto',
      'Canal',
      'Responsável',
      'E-mail do responsável',
      'Status',
      'Data de Publicação',
      'Data Limite de Produção',
      'CTA / Objetivo',
      'Observações',
      'Alerta enviado',
      'Data do alerta',
    ];

    const rows = projetos.map((p) => [
      `"${p.titulo.replace(/"/g, '""')}"`,
      `"${p.canal}"`,
      `"${p.responsavel}"`,
      `"${p.email}"`,
      `"${p.status}"`,
      `"${formatBRDate(p.dataPublicacao)}"`,
      `"${formatBRDate(p.dataLimiteProducao)}"`,
      `"${(p.ctaObjetivo || '').replace(/"/g, '""')}"`,
      `"${(p.observacoes || '').replace(/"/g, '""')}"`,
      `"${p.alertaEnviado ? 'sim' : 'não'}"`,
      `"${p.dataAlerta || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Calendario_Projetos_Inovatti_${year}_${monthIndex + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Planilha de projetos exportada em CSV compatível com Google Sheets!', 'success');
  };

  const handleRegisterUser = (newUser: Omit<UserProfile, 'id' | 'votosRealizados'>) => {
    const user: UserProfile = {
      ...newUser,
      id: `user-${Date.now()}`,
      votosRealizados: 0,
    };
    setAllUsers((prev) => [...prev, user]);
    setCurrentUser(user);
    showToast(`Bem-vindo(a), ${user.nome}! Você já está conectado.`, 'success');
  };

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    showToast(`Perfil alternado para ${user.nome}!`, 'info');
  };

  const handleResetData = () => {
    if (confirm('Deseja restaurar todos os projetos e membros para o padrão original da Inovatti?')) {
      setProjetos(INITIAL_PAUTAS);
      setIdeas(INITIAL_IDEAS);
      setDebateProjetos(INITIAL_DEBATE_PAUTAS);
      setSazonalList(SAZONAL_DATABASE);
      setAllUsers(INITIAL_USERS);
      setCurrentUser(INITIAL_USERS[4]); // Lucas Fontes
      localStorage.removeItem('cei_projetos_v3');
      localStorage.removeItem('cei_ideas_v3');
      localStorage.removeItem('cei_debates_v3');
      localStorage.removeItem('cei_sazonal_v3');
      localStorage.removeItem('cei_users_v3');
      localStorage.removeItem('cei_current_user_v3');
      showToast('Dados originais restaurados com sucesso.');
    }
  };

  return (
    <div className="min-h-screen bg-[#06070d] bg-futuristic-glow text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingIdeasCount={ideas.length}
        riskCount={riskCount}
        debateCount={debateProjetos.length}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenNewProjeto={() => {
          setActiveProjetoForModal(null);
          setInitialDateForModal(undefined);
          setIsProjetoModalOpen(true);
        }}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Banner with 24-hour Predictability Golden Rule */}
        <BannerRule
          riskCount={riskCount}
          onRunCheck={handleRunVerificarAlertas}
          onOpenDebate={() => setActiveTab('debate')}
          lastCheckedTime={lastCheckedTime}
        />

        {/* Global KPIs */}
        <KpiCards
          publishedCount={publishedCount}
          inProgressCount={inProgressCount}
          riskCount={riskCount}
          sazonalCount={sazonalCount}
          activeFilter={selectedStatus}
          onFilterStatus={(st) => {
            setSelectedStatus(st);
            setActiveTab('dashboard');
          }}
        />

        {/* TAB 1: DASHBOARD & CALENDÁRIO DE PROJETOS */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-4">
              {/* View Switcher Header */}
              <div className="flex items-center justify-between rounded-2xl p-2.5 border border-indigo-500/25 bg-[#0e1026]/90 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-1.5 bg-[#14163c] p-1 rounded-xl">
                  <button
                    onClick={() => setCalendarViewMode('grid')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      calendarViewMode === 'grid'
                        ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                        : 'text-indigo-300 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Grade Mensal</span>
                  </button>

                  <button
                    onClick={() => setCalendarViewMode('table')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      calendarViewMode === 'table'
                        ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                        : 'text-indigo-300 hover:text-white'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Planilha de Projetos (Colunas A a K)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveProjetoForModal(null);
                      setInitialDateForModal(undefined);
                      setIsProjetoModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Projeto</span>
                  </button>
                </div>
              </div>

              {calendarViewMode === 'grid' ? (
                <CalendarView
                  projetos={projetos}
                  year={year}
                  monthIndex={monthIndex}
                  onChangeMonth={(y, m) => {
                    setYear(y);
                    setMonthIndex(m);
                  }}
                  onSelectProjeto={(p) => {
                    setActiveProjetoForModal(p);
                    setIsProjetoModalOpen(true);
                  }}
                  selectedChannel={selectedChannel}
                  setSelectedChannel={setSelectedChannel}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onOpenNewProjetoWithDate={(dStr) => {
                    setActiveProjetoForModal(null);
                    setInitialDateForModal(dStr);
                    setIsProjetoModalOpen(true);
                  }}
                />
              ) : (
                <TableView
                  projetos={projetos}
                  onSelectProjeto={(p) => {
                    setActiveProjetoForModal(p);
                    setIsProjetoModalOpen(true);
                  }}
                  onDeleteProjeto={handleDeleteProjeto}
                  onUpdateStatus={handleUpdateStatus}
                  onExportCsv={handleExportCsv}
                />
              )}
            </div>

            {/* Right Sidebar: Active Predictability Alerts */}
            <div className="lg:col-span-4">
              <AlertsSidebar
                riskProjetos={riskProjetos}
                onAdvanceToProduction={handleAdvanceToProduction}
                onSelectProjeto={(p) => {
                  setActiveProjetoForModal(p);
                  setIsProjetoModalOpen(true);
                }}
                onPreviewEmailForProjeto={(p) => {
                  showToast(`Notificação registrada para ${p.email} sobre o prazo ${formatBRDate(p.dataLimiteProducao)}.`, 'warning');
                }}
                onRunCheck={handleRunVerificarAlertas}
                lastCheckedTime={lastCheckedTime}
                totalAlertsDispatched={totalAlertsDispatched}
              />
            </div>
          </div>
        )}

        {/* TAB 2: VOTAÇÃO, DEBATE & ESTUDO DE VIABILIDADE */}
        {activeTab === 'debate' && (
          <DebateView
            debateProjetos={debateProjetos}
            currentUser={currentUser}
            allUsers={allUsers}
            onVote={handleVote}
            onAddComment={handleAddComment}
            onAddParecerViabilidade={handleAddParecerViabilidade}
            onCreateDebateProjeto={handleCreateDebateProjeto}
            onPromoteToCalendar={handlePromoteToCalendar}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {/* TAB 3: JANELA DE SUGESTÕES */}
        {activeTab === 'ideias' && (
          <SuggestionsView
            ideas={ideas}
            onCreateIdea={handleCreateIdea}
            onOpenApproveModal={(idea) => {
              setIdeaForApproval(idea);
              setIsApprovalModalOpen(true);
            }}
            onArchiveIdea={handleArchiveIdea}
            onSendToDebate={handleSendIdeaToDebate}
          />
        )}

        {/* TAB 4: REPERTÓRIO SAZONAL */}
        {activeTab === 'sazonal' && (
          <SazonalView
            sazonalList={sazonalList}
            onSuggestProjeto={handleSuggestFromSazonal}
            onAddCustomSazonal={handleAddCustomSazonal}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-indigo-500/20 bg-[#070814]/90 py-6 text-xs text-indigo-300/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Calendário Editorial Inteligente</span>
            <span>—</span>
            <span>Imobiliária Inovatti • Maricá/RJ</span>
          </div>
          <div>
            <span>Conectado como <strong className="text-amber-400">{currentUser.nome}</strong> ({currentUser.cargo})</span>
          </div>
        </div>
      </footer>

      {/* Login & User Switch Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={handleSelectUser}
        onRegisterUser={handleRegisterUser}
      />

      {/* Projeto Edit/Create Modal */}
      <ProjetoModal
        isOpen={isProjetoModalOpen}
        onClose={() => setIsProjetoModalOpen(false)}
        projeto={activeProjetoForModal}
        onSave={handleSaveProjeto}
        onDelete={handleDeleteProjeto}
        initialDate={initialDateForModal}
      />

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        idea={ideaForApproval}
        onConfirmApprove={handleConfirmApproveIdea}
      />

      {/* Feedback Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
