import React from 'react';
import { ChevronLeft, ChevronRight, Filter, Search, Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import { Projeto, Channel, ProjetoStatus } from '../types';
import { getCalendarGrid, MESES_PT, DIAS_SEMANA_CURTOS, isProjetoInRisk, formatBRDate } from '../utils/dateUtils';

interface CalendarViewProps {
  projetos: Projeto[];
  year: number;
  monthIndex: number;
  onChangeMonth: (year: number, monthIndex: number) => void;
  onSelectProjeto: (projeto: Projeto) => void;
  selectedChannel: Channel | 'TODOS';
  setSelectedChannel: (c: Channel | 'TODOS') => void;
  selectedStatus: ProjetoStatus | 'TODOS' | 'RISCO';
  setSelectedStatus: (s: ProjetoStatus | 'TODOS' | 'RISCO') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenNewProjetoWithDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  projetos,
  year,
  monthIndex,
  onChangeMonth,
  onSelectProjeto,
  selectedChannel,
  setSelectedChannel,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
  onOpenNewProjetoWithDate
}) => {
  const referenceDate = new Date(2026, 9, 7);
  const calendarCells = getCalendarGrid(year, monthIndex, referenceDate);

  const handlePrevMonth = () => {
    if (monthIndex === 0) {
      onChangeMonth(year - 1, 11);
    } else {
      onChangeMonth(year, monthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (monthIndex === 11) {
      onChangeMonth(year + 1, 0);
    } else {
      onChangeMonth(year, monthIndex + 1);
    }
  };

  const handleGoToday = () => {
    onChangeMonth(2026, 9);
  };

  const filteredProjetos = projetos.filter((p) => {
    if (selectedChannel !== 'TODOS' && p.canal !== selectedChannel) return false;
    if (selectedStatus === 'RISCO') {
      if (!isProjetoInRisk(p, referenceDate)) return false;
    } else if (selectedStatus !== 'TODOS' && p.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.titulo.toLowerCase().includes(q);
      const matchResp = p.responsavel.toLowerCase().includes(q);
      const matchObs = p.observacoes.toLowerCase().includes(q);
      if (!matchTitle && !matchResp && !matchObs) return false;
    }
    return true;
  });

  const getProjetosForDate = (dateStr: string) => {
    return filteredProjetos.filter((p) => p.dataPublicacao === dateStr);
  };

  const getSeasonalBadgeForDate = (dateStr: string) => {
    if (dateStr === '2026-10-12') return 'N. Sra. Aparecida';
    if (dateStr === '2026-10-15') return 'Dia do Professor';
    if (dateStr === '2026-10-28') return 'Dia do Servidor';
    if (dateStr === '2026-10-31') return 'Fim de Mês';
    return null;
  };

  const getChannelBadgeClass = (channel: Channel) => {
    switch (channel) {
      case 'Instagram':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'Blog':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Google':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'YouTube':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'LinkedIn':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  const getStatusBorderClass = (projeto: Projeto) => {
    const inRisk = isProjetoInRisk(projeto, referenceDate);
    if (inRisk) return 'border-l-4 border-l-amber-500 bg-amber-500/10 border-amber-500/30 shadow-xs shadow-amber-500/10';

    switch (projeto.status) {
      case 'Publicado':
        return 'border-l-4 border-l-emerald-500 bg-emerald-500/10 border-emerald-500/25';
      case 'Em produção':
        return 'border-l-4 border-l-violet-500 bg-violet-500/10 border-violet-500/25';
      case 'Revisão':
        return 'border-l-4 border-l-amber-400 bg-amber-400/10 border-amber-400/25';
      case 'Aprovado':
        return 'border-l-4 border-l-indigo-400 bg-indigo-500/10 border-indigo-500/25';
      case 'Em análise':
        return 'border-l-4 border-l-purple-400 bg-purple-500/10 border-purple-500/25';
      case 'Ideia':
      default:
        return 'border-l-4 border-l-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-[#0e1026]/90 backdrop-blur-md shadow-xl p-4 sm:p-5">
      {/* Month Navigation & Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-indigo-500/20 mb-4">
        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#131538] rounded-xl p-1 border border-indigo-500/30">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-violet-600/30 text-indigo-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-3 text-sm sm:text-base font-extrabold text-white min-w-[150px] text-center tracking-tight">
              {MESES_PT[monthIndex]} de {year}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-violet-600/30 text-indigo-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleGoToday}
            className="px-3 py-1.5 rounded-xl border border-indigo-500/30 text-xs sm:text-sm font-semibold text-indigo-200 hover:bg-[#191c48] transition-colors cursor-pointer"
          >
            Outubro/2026
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-200">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-bold text-amber-400">Risco (&lt;24h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400"></span>
            <span>Em Produção</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300"></span>
            <span>Revisão</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Publicado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span>Ideia</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5 p-3 bg-[#121438]/70 rounded-xl border border-indigo-500/20">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-indigo-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por projeto ou autor..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0a0c20] border border-indigo-500/30 rounded-lg text-xs sm:text-sm text-white placeholder:text-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        {/* Channel Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value as any)}
            className="w-full py-1.5 px-2 bg-[#0a0c20] border border-indigo-500/30 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            <option value="TODOS">Todos os Canais</option>
            <option value="Instagram">Instagram</option>
            <option value="Blog">Blog Inovatti</option>
            <option value="Google">Google Ads / GMB</option>
            <option value="YouTube">YouTube</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="TikTok">TikTok</option>
            <option value="E-mail Marketing">E-mail Marketing</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full py-1.5 px-2 bg-[#0a0c20] border border-indigo-500/30 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="RISCO">⚠️ Em Risco (&lt;24h)</option>
            <option value="Ideia">Ideia</option>
            <option value="Em análise">Em análise</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Em produção">Em produção</option>
            <option value="Revisão">Revisão</option>
            <option value="Publicado">Publicado</option>
          </select>
        </div>

        {/* Reset filters shortcut */}
        <div className="flex items-center justify-end">
          {(selectedChannel !== 'TODOS' || selectedStatus !== 'TODOS' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedChannel('TODOS');
                setSelectedStatus('TODOS');
                setSearchQuery('');
              }}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold px-2 py-1 rounded hover:bg-amber-500/10 transition-colors cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
          <span className="text-xs text-indigo-300/70 ml-auto">
            {filteredProjetos.length} {filteredProjetos.length === 1 ? 'projeto' : 'projetos'}
          </span>
        </div>
      </div>

      {/* 7-column Calendar Grid */}
      <div className="border border-indigo-500/30 rounded-xl overflow-hidden bg-indigo-950/40 shadow-inner">
        {/* Weekday Header */}
        <div className="grid grid-cols-7 bg-[#14163c] border-b border-indigo-500/25">
          {DIAS_SEMANA_CURTOS.map((dia, idx) => (
            <div
              key={dia}
              className={`py-2 text-center text-xs font-bold uppercase tracking-wider ${
                idx === 0 || idx === 6 ? 'text-indigo-400/60 bg-[#0f1130]' : 'text-indigo-200'
              }`}
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 gap-px bg-indigo-900/30">
          {calendarCells.map((cell) => {
            const dayProjetos = getProjetosForDate(cell.dateStr);
            const seasonalBadge = getSeasonalBadgeForDate(cell.dateStr);

            return (
              <div
                key={cell.dateStr}
                className={`min-h-[125px] sm:min-h-[140px] p-1.5 sm:p-2 flex flex-col transition-colors group relative ${
                  !cell.isCurrentMonth
                    ? 'bg-[#080918]/80 text-indigo-900/50'
                    : cell.isToday
                    ? 'bg-[#181a44] ring-2 ring-inset ring-amber-400'
                    : 'bg-[#0e1026] hover:bg-[#141738]'
                }`}
              >
                {/* Day Header Row */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                          : cell.isCurrentMonth
                          ? 'text-indigo-200'
                          : 'text-indigo-700'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {cell.isToday && (
                      <span className="hidden sm:inline-block text-[10px] font-bold text-amber-950 bg-amber-400 px-1 rounded">
                        Hoje
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenNewProjetoWithDate(cell.dateStr)}
                    className="opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-white p-0.5 rounded transition-opacity cursor-pointer"
                    title={`Adicionar projeto para ${formatBRDate(cell.dateStr)}`}
                  >
                    +
                  </button>
                </div>

                {/* Seasonal Tag */}
                {seasonalBadge && (
                  <div className="mb-1.5">
                    <span className="text-[10px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded-md line-clamp-1 block" title={seasonalBadge}>
                      📌 {seasonalBadge}
                    </span>
                  </div>
                )}

                {/* Content Cards */}
                <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[160px]">
                  {dayProjetos.map((projeto) => {
                    const inRisk = isProjetoInRisk(projeto, referenceDate);

                    return (
                      <div
                        key={projeto.id}
                        onClick={() => onSelectProjeto(projeto)}
                        className={`p-1.5 sm:p-2 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${getStatusBorderClass(
                          projeto
                        )}`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded border ${getChannelBadgeClass(
                              projeto.canal
                            )}`}
                          >
                            {projeto.canal}
                          </span>

                          {inRisk && (
                            <span className="inline-flex items-center text-[9px] font-extrabold text-slate-950 bg-amber-400 px-1 rounded animate-pulse" title="Risco: <24h para Data Limite com status Ideia!">
                              <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                              &lt;24h
                            </span>
                          )}
                        </div>

                        <h4 className="text-[11px] sm:text-xs font-bold text-white leading-snug line-clamp-2 mb-1">
                          {projeto.titulo}
                        </h4>

                        <div className="flex items-center justify-between text-[10px] text-indigo-300/70">
                          <span className="truncate max-w-[80px]" title={projeto.responsavel}>
                            {projeto.responsavel.split(' ')[0]}
                          </span>
                          <span className="flex items-center gap-0.5 text-indigo-400" title={`Limite: ${formatBRDate(projeto.dataLimiteProducao)}`}>
                            <Clock className="w-2.5 h-2.5 text-amber-400" />
                            {projeto.dataLimiteProducao ? formatBRDate(projeto.dataLimiteProducao).slice(0, 5) : '—'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
