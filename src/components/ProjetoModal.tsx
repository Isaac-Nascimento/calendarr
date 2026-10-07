import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle, CheckCircle2, Trash2, Mail, Save, ClipboardCheck, AlertOctagon, Check } from 'lucide-react';
import { Projeto, Channel, ProjetoStatus } from '../types';
import { TEAM_MEMBERS, CHANNELS } from '../data/initialData';
import { isProjetoInRisk, formatBRDate } from '../utils/dateUtils';

interface ProjetoModalProps {
  isOpen: boolean;
  onClose: () => void;
  projeto: Projeto | null;
  onSave: (projetoData: Partial<Projeto>) => void;
  onDelete?: (id: string) => void;
  initialDate?: string;
}

export const ProjetoModal: React.FC<ProjetoModalProps> = ({
  isOpen,
  onClose,
  projeto,
  onSave,
  onDelete,
  initialDate
}) => {
  const [titulo, setTitulo] = useState('');
  const [canal, setCanal] = useState<Channel>('Instagram');
  const [responsavel, setResponsavel] = useState(TEAM_MEMBERS[0].nome);
  const [email, setEmail] = useState(TEAM_MEMBERS[0].email);
  const [status, setStatus] = useState<ProjetoStatus>('Ideia');
  const [dataPublicacao, setDataPublicacao] = useState('2026-10-15');
  const [dataLimiteProducao, setDataLimiteProducao] = useState('2026-10-13');
  const [ctaObjetivo, setCtaObjetivo] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const isEditing = !!projeto;

  useEffect(() => {
    if (projeto) {
      setTitulo(projeto.titulo);
      setCanal(projeto.canal);
      setResponsavel(projeto.responsavel);
      setEmail(projeto.email);
      setStatus(projeto.status);
      setDataPublicacao(projeto.dataPublicacao);
      setDataLimiteProducao(projeto.dataLimiteProducao);
      setCtaObjetivo(projeto.ctaObjetivo || '');
      setObservacoes(projeto.observacoes || '');
    } else {
      setTitulo('');
      setCanal('Instagram');
      setResponsavel(TEAM_MEMBERS[0].nome);
      setEmail(TEAM_MEMBERS[0].email);
      setStatus('Em produção');
      const pubDate = initialDate || '2026-10-18';
      setDataPublicacao(pubDate);
      const d = new Date(pubDate);
      d.setDate(d.getDate() - 2);
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      setDataLimiteProducao(`${d.getFullYear()}-${mStr}-${dStr}`);
      setCtaObjetivo('');
      setObservacoes('');
    }
  }, [projeto, initialDate, isOpen]);

  const handleResponsibleChange = (nome: string) => {
    setResponsavel(nome);
    const member = TEAM_MEMBERS.find((m) => m.nome === nome);
    if (member) setEmail(member.email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    onSave({
      titulo: titulo.trim(),
      canal,
      responsavel,
      email,
      status,
      dataPublicacao,
      dataLimiteProducao,
      ctaObjetivo: ctaObjetivo.trim(),
      observacoes: observacoes.trim(),
    });
    onClose();
  };

  if (!isOpen) return null;

  const currentObj: Projeto = projeto || {
    id: 'temp',
    titulo,
    canal,
    responsavel,
    email,
    status,
    dataPublicacao,
    dataLimiteProducao,
    ctaObjetivo,
    observacoes,
    alertaEnviado: false
  };

  const inRisk = isProjetoInRisk(currentObj, new Date(2026, 9, 7));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0e1026] text-white rounded-2xl max-w-xl w-full shadow-2xl border border-indigo-500/30 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#14163c] p-4 sm:p-5 flex items-center justify-between border-b border-indigo-500/20">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
              {isEditing ? 'Gestão do Projeto Editorial' : 'Novo Projeto de Conteúdo'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
              {isEditing ? projeto.titulo : 'Cadastrar Projeto Direto no Calendário'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-400 hover:text-white rounded-lg hover:bg-violet-600/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Risk Callout if in risk */}
        {inRisk && (
          <div className="p-3.5 bg-amber-500/15 border-b border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-400">⚠️ Alerta de Previsibilidade Ativo:</strong>
              <p className="mt-0.5 text-indigo-200">
                Faltam menos de 24h para a Data Limite ({formatBRDate(dataLimiteProducao)}) e o status ainda é "Ideia". O sistema já disparou notificação para <strong>{email}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-indigo-200 mb-1">
              Título do Projeto *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Tour Virtual: Mansão em Itaipuaçu..."
              className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1">
                Canal de Distribuição
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
                Status Editorial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjetoStatus)}
                className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="Ideia">Ideia (Gatilho de risco se &lt;24h)</option>
                <option value="Em análise">Em análise</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Em produção">Em produção (Seguro)</option>
                <option value="Revisão">Revisão</option>
                <option value="Publicado">Publicado (Concluído)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1">
                Responsável
              </label>
              <select
                value={responsavel}
                onChange={(e) => handleResponsibleChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.nome} value={m.nome}>{m.nome} ({m.cargo.split(' ')[0]})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1">
                E-mail do Responsável (Coluna D)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-indigo-300 font-mono focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1">
                Data de Publicação (Coluna F) *
              </label>
              <input
                type="date"
                required
                value={dataPublicacao}
                onChange={(e) => setDataPublicacao(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1">
                Data Limite de Produção (Coluna G) *
              </label>
              <input
                type="date"
                required
                value={dataLimiteProducao}
                onChange={(e) => setDataLimiteProducao(e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <span className="text-[10px] text-indigo-400 mt-0.5 block">
                O robô avisa se status ainda for "Ideia" 24h antes.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-200 mb-1">
              CTA / Objetivo do Projeto (Coluna H)
            </label>
            <input
              type="text"
              value={ctaObjetivo}
              onChange={(e) => setCtaObjetivo(e.target.value)}
              placeholder="Ex.: Agendar visita com corretor via WhatsApp"
              className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-200 mb-1">
              Observações / Briefing (Coluna I)
            </label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Anotações para o criador, referências de fotos ou formato..."
              className="w-full px-3 py-2 bg-[#0a0c20] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </div>

          {/* Feasibility Study Preview if present on project */}
          {projeto?.pareceresViabilidade && projeto.pareceresViabilidade.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#121438] border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <ClipboardCheck className="w-4 h-4" />
                <span>Estudo de Viabilidade Vinculado ({projeto.pareceresViabilidade.length})</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {projeto.pareceresViabilidade.map((pv) => (
                  <div key={pv.id} className="text-[11px] p-2 bg-[#0a0c20] rounded-lg border border-indigo-950 flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-white">{pv.userName} ({pv.userRole}):</strong>{' '}
                      <span className="text-indigo-200">{pv.justificativa}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      pv.status === 'viavel' ? 'bg-emerald-500/20 text-emerald-300' :
                      pv.status === 'inviavel' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {pv.status === 'viavel' ? 'Viável' : pv.status === 'inviavel' ? 'Inviável' : 'Ajuste'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-indigo-500/20 flex flex-wrap items-center justify-between gap-2">
            <div>
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja realmente remover este projeto do calendário?')) {
                      onDelete(projeto.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Projeto</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-indigo-300 hover:bg-[#141638] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>

              {isEditing && status !== 'Publicado' && (
                <button
                  type="button"
                  onClick={() => {
                    setStatus('Publicado');
                    onSave({ status: 'Publicado' });
                    onClose();
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Marcar Publicado</span>
                </button>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Projeto</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Backward compatibility alias
export const PautaModal = ProjetoModal;
