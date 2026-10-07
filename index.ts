export type ProjetoStatus = 'Ideia' | 'Em análise' | 'Aprovado' | 'Em produção' | 'Revisão' | 'Publicado' | 'Risco';
// Alias for backward compatibility
export type PautaStatus = ProjetoStatus;

export type Channel = 'Instagram' | 'Blog' | 'Google' | 'YouTube' | 'LinkedIn' | 'TikTok' | 'E-mail Marketing';

export interface ParecerViabilidade {
  id: string;
  projetoId: string;
  userId: string;
  userName: string;
  userRole: string;
  userColor: string;
  status: 'viavel' | 'ressalva' | 'inviavel';
  justificativa: string;
  recursosNecessarios?: string;
  timestamp: string;
}

export interface Projeto {
  id: string;
  titulo: string;
  canal: Channel;
  responsavel: string;
  email: string;
  status: ProjetoStatus;
  dataPublicacao: string; // YYYY-MM-DD
  dataLimiteProducao: string; // YYYY-MM-DD
  ctaObjetivo: string;
  observacoes: string;
  alertaEnviado: boolean;
  dataAlerta?: string;
  isCustom?: boolean;
  pareceresViabilidade?: ParecerViabilidade[];
}

// Alias for compatibility
export type Pauta = Projeto;

export interface SuggestionIdea {
  id: string;
  titulo: string;
  canal: Channel;
  responsavel: string;
  sugeridoPor: string;
  briefing: string;
  ctaObjetivo?: string;
  dataCriacao: string;
}

export interface SazonalItem {
  id: string;
  nome: string;
  dataStr: string;
  mes: number; // 1-12
  trimestre: 'Jan-Mar' | 'Abr-Jun' | 'Jul-Set' | 'Out-Dez';
  nicho: string;
  contexto: string;
  tituloSugerido: string;
  canalRecomendado: Channel;
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  avatar: string;
  cor: string;
  votosRealizados?: number;
}

export interface DebateComment {
  id: string;
  projetoId: string;
  userId: string;
  userName: string;
  userRole: string;
  userCor: string;
  content: string;
  timestamp: string;
}

export interface DebateProjeto {
  id: string;
  titulo: string;
  autorNome: string;
  autorEmail: string;
  autorRole: string;
  canal: Channel;
  briefing: string;
  ctaObjetivo?: string;
  dataCriacao: string;
  statusDebate: 'em_votacao' | 'consensuado' | 'arquivado';
  votosAprovar: string[]; // user IDs
  votosRevisar: string[]; // user IDs
  votosRejeitar: string[]; // user IDs
  comments: DebateComment[];
  pareceresViabilidade: ParecerViabilidade[];
  promovidaParaCalendario?: boolean;
}

// Alias for compatibility
export type DebatePauta = DebateProjeto;

export interface WriterAnalytics {
  nome: string;
  role: string;
  email: string;
  totalProjetosSubmetidos: number;
  totalVotosAprovar: number;
  taxaAprovacao: number; // percentage
  pontuacaoInfluencia: number;
  projetosAprovados: number;
  projetosComInviabilidade: number;
  // Compat aliases
  totalPautasSubmetidas?: number;
  pautasAprovadas?: number;
}
