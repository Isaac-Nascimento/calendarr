import React, { useState } from 'react';
import { Download, Search, Edit3, Trash2, ShieldAlert } from 'lucide-react';
import { Projeto, ProjetoStatus } from '../types';
import { formatBRDate, isProjetoInRisk } from '../utils/dateUtils';

interface TableViewProps {
  projetos: Projeto[];
  onSelectProjeto: (projeto: Projeto) => void;
  onDeleteProjeto: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: ProjetoStatus) => void;
  onExportCsv: () => void;
}

export const TableView: React.FC<TableViewProps> = ({
  projetos,
  onSelectProjeto,
  onDeleteProjeto,
  onUpdateStatus,
  onExportCsv
}) => {
  const [tableSearch, setTableSearch] = useState('');
  const [sortField, setSortField] = useState<keyof Projeto>('dataPublicacao');
  const [sortAsc, setSortAsc] = useState(true);

  const referenceDate = new Date(2026, 9, 7);

  const handleSort = (field: keyof Projeto) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredProjetos = projetos.filter((p) => {
    if (!tableSearch) return true;
    const q = tableSearch.toLowerCase();
    return (
      p.titulo.toLowerCase().includes(q) ||
      p.responsavel.toLowerCase().includes(q) ||
      p.canal.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
    );
  });

  const sortedProjetos = [...filteredProjetos].sort((a, b) => {
    const valA = (a[sortField] || '').toString();
    const valB = (b[sortField] || '').toString();
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-[#0e1026]/90 backdrop-blur-md shadow-xl p-4 sm:p-5">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-indigo-500/20 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Planilha Editorial de Projetos (Colunas A a K)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
              Estrutura Google Sheets
            </span>
          </h3>
          <p className="text-xs text-indigo-300/70 mt-0.5">
            Reflete as 11 colunas de dados de produção para exportação e integração.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-indigo-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filtrar projetos..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <button
            onClick={onExportCsv}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
            title="Exportar para arquivo CSV pronto para colar no Google Sheets"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto border border-indigo-500/25 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#14163c] text-indigo-200 font-bold border-b border-indigo-500/25">
              <th className="py-2.5 px-3 whitespace-nowrap">
                <span className="text-amber-400 font-mono mr-1">A</span> Título do Projeto
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleSort('canal')}>
                <span className="text-amber-400 font-mono mr-1">B</span> Canal
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleSort('responsavel')}>
                <span className="text-amber-400 font-mono mr-1">C</span> Responsável
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap">
                <span className="text-amber-400 font-mono mr-1">D</span> E-mail
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                <span className="text-amber-400 font-mono mr-1">E</span> Status
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleSort('dataPublicacao')}>
                <span className="text-amber-400 font-mono mr-1">F</span> Data Pub.
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap cursor-pointer hover:text-white" onClick={() => handleSort('dataLimiteProducao')}>
                <span className="text-amber-400 font-mono mr-1">G</span> Data Limite
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap">
                <span className="text-amber-400 font-mono mr-1">H</span> CTA / Objetivo
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap">
                <span className="text-amber-400 font-mono mr-1">I</span> Observações
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap text-center">
                <span className="text-amber-400 font-mono mr-1">J</span> Alerta Enviado
              </th>
              <th className="py-2.5 px-3 whitespace-nowrap">
                <span className="text-amber-400 font-mono mr-1">K</span> Data Alerta
              </th>
              <th className="py-2.5 px-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-900/30 bg-[#0a0c20]">
            {sortedProjetos.map((p, index) => {
              const inRisk = isProjetoInRisk(p, referenceDate);
              return (
                <tr
                  key={p.id}
                  className={`hover:bg-[#14163c] transition-colors ${
                    inRisk ? 'bg-amber-500/10' : index % 2 === 1 ? 'bg-[#0e1026]/40' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-semibold text-white max-w-xs">
                    <div className="line-clamp-2" title={p.titulo}>
                      {p.titulo}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {p.canal}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-indigo-200 font-medium">
                    {p.responsavel}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-indigo-400 font-mono text-[11px]">
                    {p.email}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <select
                      value={p.status}
                      onChange={(e) => onUpdateStatus(p.id, e.target.value as ProjetoStatus)}
                      className="bg-[#121435] border border-indigo-500/30 rounded-lg px-2 py-1 text-[11px] font-medium text-white focus:outline-none focus:ring-1 focus:ring-violet-400"
                    >
                      <option value="Ideia">Ideia</option>
                      <option value="Em análise">Em análise</option>
                      <option value="Aprovado">Aprovado</option>
                      <option value="Em produção">Em produção</option>
                      <option value="Revisão">Revisão</option>
                      <option value="Publicado">Publicado</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-indigo-200 font-medium">
                    {formatBRDate(p.dataPublicacao)}
                  </td>
                  <td className={`py-2.5 px-3 whitespace-nowrap font-medium ${inRisk ? 'text-amber-400 font-bold' : 'text-indigo-200'}`}>
                    {formatBRDate(p.dataLimiteProducao)}
                  </td>
                  <td className="py-2.5 px-3 text-indigo-300/80 max-w-xs truncate" title={p.ctaObjetivo}>
                    {p.ctaObjetivo || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-indigo-300/80 max-w-xs truncate" title={p.observacoes}>
                    {p.observacoes || '—'}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-center">
                    {p.alertaEnviado ? (
                      <span className="inline-flex items-center text-slate-950 font-bold bg-amber-400 px-1.5 py-0.5 rounded text-[10px]">
                        sim
                      </span>
                    ) : (
                      <span className="text-indigo-500 text-[11px]">não</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-indigo-400 text-[11px] font-mono">
                    {p.dataAlerta || '—'}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectProjeto(p)}
                        className="p-1 text-indigo-400 hover:text-white rounded hover:bg-indigo-600/20 transition-colors"
                        title="Ver / Editar Projeto"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProjeto(p.id)}
                        className="p-1 text-indigo-400 hover:text-rose-400 rounded hover:bg-rose-500/20 transition-colors"
                        title="Excluir Projeto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-indigo-300/70">
        <span>Exibindo <strong>{sortedProjetos.length}</strong> de <strong>{projetos.length}</strong> linhas da aba "Projetos".</span>
        <span>Sincronizado em tempo real com a grade editorial.</span>
      </div>
    </div>
  );
};
