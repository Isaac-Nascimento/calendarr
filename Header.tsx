import React from 'react';
import { Calendar, Lightbulb, Sparkles, Plus, RotateCcw, Vote, User, ChevronDown } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'ideias' | 'sazonal' | 'debate';
  setActiveTab: (tab: 'dashboard' | 'ideias' | 'sazonal' | 'debate') => void;
  pendingIdeasCount: number;
  riskCount: number;
  debateCount: number;
  currentUser: UserProfile;
  onOpenLoginModal: () => void;
  onOpenNewProjeto: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingIdeasCount,
  riskCount,
  debateCount,
  currentUser,
  onOpenLoginModal,
  onOpenNewProjeto,
  onResetData
}) => {
  return (
    <header className="bg-[#070814]/90 backdrop-blur-md text-white border-b border-indigo-500/30 sticky top-0 z-40 shadow-xl shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-amber-500 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-violet-600/30 border border-violet-400/40">
                CEI
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                    Calendário Editorial Inteligente
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Imobiliária Inovatti
                  </span>
                </div>
                <p className="text-xs text-indigo-300/70 flex items-center gap-1.5 mt-0.5 font-sans">
                  <span>Maricá/RJ</span>
                  <span className="text-indigo-500">•</span>
                  <span className="text-violet-400 font-medium">Previsibilidade Ativa</span>
                  <span className="text-indigo-500">•</span>
                  <span className="text-amber-400 font-medium">Debate & Viabilidade</span>
                </p>
              </div>
            </div>

            {/* Mobile quick actions */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={onOpenLoginModal}
                className="p-1.5 bg-[#141638] text-white rounded-lg border border-indigo-500/30"
                title="Perfil"
              >
                <div
                  className={`w-6 h-6 rounded-md bg-gradient-to-br ${currentUser.cor} flex items-center justify-center text-[10px] font-bold`}
                >
                  {currentUser.avatar}
                </div>
              </button>
              <button
                onClick={onOpenNewProjeto}
                className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center shadow-md shadow-amber-500/20"
                title="Novo Projeto"
              >
                <Plus className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>

          {/* Nav Tabs & User Profile Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex items-center gap-1 bg-[#0e1028] p-1 rounded-xl border border-indigo-500/25 overflow-x-auto max-w-full">
              {/* Tab 1: Calendário & Projetos */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-indigo-200/70 hover:text-white hover:bg-indigo-900/40'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                <span>Calendário & Projetos</span>
                {riskCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'dashboard' ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white animate-pulse'
                  }`}>
                    {riskCount}
                  </span>
                )}
              </button>

              {/* Tab 2: Votação & Debate */}
              <button
                onClick={() => setActiveTab('debate')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'debate'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-md shadow-amber-500/25'
                    : 'text-amber-300/80 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <Vote className="w-3.5 h-3.5" />
                <span>Votação & Debate</span>
                {debateCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'debate' ? 'bg-slate-950 text-amber-300' : 'bg-amber-400 text-slate-950'
                  }`}>
                    {debateCount}
                  </span>
                )}
              </button>

              {/* Tab 3: Janela de Sugestões */}
              <button
                onClick={() => setActiveTab('ideias')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'ideias'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-indigo-200/70 hover:text-white hover:bg-indigo-900/40'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-violet-300" />
                <span>Janela de Sugestões</span>
                {pendingIdeasCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'ideias' ? 'bg-[#0e1028] text-amber-300' : 'bg-violet-500/30 text-violet-300 border border-violet-500/40'
                  }`}>
                    {pendingIdeasCount}
                  </span>
                )}
              </button>

              {/* Tab 4: Repertório Sazonal */}
              <button
                onClick={() => setActiveTab('sazonal')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'sazonal'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-indigo-200/70 hover:text-white hover:bg-indigo-900/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                <span>Repertório Sazonal</span>
              </button>
            </nav>

            {/* User Profile Login / Fast Switch Pill */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 rounded-xl bg-[#0e1028] hover:bg-[#151740] border border-indigo-500/30 hover:border-violet-400 text-xs flex items-center gap-2 transition-all cursor-pointer group"
                title="Clique para alternar de membro ou gerenciar cadastros"
              >
                <div
                  className={`w-6 h-6 rounded-lg bg-gradient-to-br ${currentUser.cor} flex items-center justify-center text-[10px] font-extrabold text-white shadow-sm`}
                >
                  {currentUser.avatar}
                </div>
                <div className="text-left">
                  <div className="font-bold text-white group-hover:text-amber-300 transition-colors leading-tight">
                    {currentUser.nome.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-indigo-300/70 leading-tight">
                    {currentUser.cargo.split('&')[0].trim()}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
              </button>

              <button
                onClick={onOpenNewProjeto}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Novo Projeto</span>
              </button>

              <button
                onClick={onResetData}
                title="Restaurar dados de exemplo do protótipo"
                className="p-2 text-indigo-300/70 hover:text-white hover:bg-[#141638] rounded-xl transition-colors border border-transparent hover:border-indigo-500/30 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
