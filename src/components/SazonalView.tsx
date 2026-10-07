import React, { useState } from 'react';
import { Sparkles, Calendar, Plus, Search, ArrowRight } from 'lucide-react';
import { SazonalItem, Channel } from '../types';

interface SazonalViewProps {
  sazonalList: SazonalItem[];
  onSuggestProjeto: (item: SazonalItem) => void;
  onAddCustomSazonal: (newItem: Omit<SazonalItem, 'id'>) => void;
}

export const SazonalView: React.FC<SazonalViewProps> = ({
  sazonalList,
  onSuggestProjeto,
  onAddCustomSazonal
}) => {
  const [selectedQuarter, setSelectedQuarter] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [nome, setNome] = useState('');
  const [dataStr, setDataStr] = useState('');
  const [trimestre, setTrimestre] = useState<'Jan-Mar' | 'Abr-Jun' | 'Jul-Set' | 'Out-Dez'>('Out-Dez');
  const [nicho, setNicho] = useState('');
  const [contexto, setContexto] = useState('');
  const [tituloSugerido, setTituloSugerido] = useState('');
  const [canalRecomendado, setCanalRecomendado] = useState<Channel>('Instagram');

  const filteredItems = sazonalList.filter((item) => {
    if (selectedQuarter !== 'todos' && item.trimestre !== selectedQuarter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.nome.toLowerCase().includes(q) ||
        item.contexto.toLowerCase().includes(q) ||
        item.nicho.toLowerCase().includes(q) ||
        item.tituloSugerido.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !dataStr.trim()) return;

    onAddCustomSazonal({
      nome: nome.trim(),
      dataStr: dataStr.trim(),
      mes: 10,
      trimestre,
      nicho: nicho.trim() || 'Oportunidade Comercial',
      contexto: contexto.trim() || 'Data estratégica adicionada pela equipe.',
      tituloSugerido: tituloSugerido.trim() || nome.trim(),
      canalRecomendado
    });

    setShowAddModal(false);
    setNome('');
    setDataStr('');
    setNicho('');
    setContexto('');
    setTituloSugerido('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="rounded-2xl border border-indigo-500/25 bg-[#0e1026]/90 backdrop-blur-md shadow-xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-indigo-500/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-300 flex items-center justify-center border border-violet-500/30">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Repertório de Oportunidades Sazonais & Mercado Imobiliário
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-indigo-300/80 max-w-3xl leading-relaxed">
              Mapeamento de datas comemorativas e picos sazonais estratégicos (temporada de verão, feirões de crédito, datas civis e comerciais). Clique em <strong>"Sugerir projeto"</strong> para enviar um briefing pronto direto para a Janela de Sugestões.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-violet-600/30 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Adicionar Data Sazonal</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'todos', label: 'Todos os Meses' },
              { id: 'Jan-Mar', label: '1º Tri (Jan-Mar)' },
              { id: 'Abr-Jun', label: '2º Tri (Abr-Jun)' },
              { id: 'Jul-Set', label: '3º Tri (Jul-Set)' },
              { id: 'Out-Dez', label: '4º Tri (Out-Dez)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedQuarter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedQuarter === tab.id
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-[#141638] text-indigo-300 hover:bg-[#1a1d48] border border-indigo-500/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-indigo-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar oportunidade..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs text-white placeholder:text-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
        </div>
      </div>

      {/* Grid of Seasonal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-indigo-500/25 bg-[#0e1026]/90 backdrop-blur-md hover:border-violet-400/60 hover:shadow-xl transition-all p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  {item.dataStr}
                </span>
                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                  {item.trimestre}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-1.5 leading-snug">
                {item.nome}
              </h3>

              <div className="text-[11px] font-semibold text-indigo-300 mb-2 flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">Nicho:</span>
                <span className="truncate">{item.nicho}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0a0c20]/80 border border-indigo-950 text-xs text-indigo-200/90 leading-relaxed mb-4">
                {item.contexto}
              </div>

              <div className="mb-4 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                  Gancho Sugerido:
                </span>
                <p className="text-white font-medium italic border-l-2 border-amber-400 pl-2 leading-relaxed">
                  "{item.tituloSugerido}"
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-indigo-500/20 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Canal: {item.canalRecomendado}
              </span>

              <button
                onClick={() => onSuggestProjeto(item)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
              >
                <span>⚡ Sugerir projeto</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Custom Seasonal Date */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1026] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-indigo-500/30 text-white animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white mb-1">
              Adicionar Nova Data ao Repertório Sazonal
            </h3>
            <p className="text-xs text-indigo-300/70 mb-4">
              Cadastre marcos comerciais locais de Maricá ou campanhas do seu nicho imobiliário.
            </p>

            <form onSubmit={handleCreateCustom} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1">Nome da Data / Campanha *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Semana do Imóvel de Veraneio"
                  className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1">Data / Período *</label>
                  <input
                    type="text"
                    required
                    value={dataStr}
                    onChange={(e) => setDataStr(e.target.value)}
                    placeholder="Ex.: 10 a 15 de Novembro"
                    className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1">Trimestre</label>
                  <select
                    value={trimestre}
                    onChange={(e) => setTrimestre(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                  >
                    <option value="Jan-Mar">1º Tri (Jan-Mar)</option>
                    <option value="Abr-Jun">2º Tri (Abr-Jun)</option>
                    <option value="Jul-Set">3º Tri (Jul-Set)</option>
                    <option value="Out-Dez">4º Tri (Out-Dez)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1">Nicho / Ângulo Estratégico</label>
                <input
                  type="text"
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  placeholder="Ex.: Imóveis de Alto Padrão em Ponta Negra"
                  className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1">Contexto & Justificativa</label>
                <textarea
                  rows={2}
                  value={contexto}
                  onChange={(e) => setContexto(e.target.value)}
                  placeholder="Por que esta data gera tração no mercado local de Maricá?"
                  className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1">Título de Projeto Sugerido</label>
                <input
                  type="text"
                  value={tituloSugerido}
                  onChange={(e) => setTituloSugerido(e.target.value)}
                  placeholder="Ex.: 3 motivos para garantir sua casa de veraneio antes de Dezembro"
                  className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-indigo-500/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-indigo-300 hover:bg-[#141638] rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  Salvar Oportunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
