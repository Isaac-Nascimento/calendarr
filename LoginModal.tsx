import React, { useState } from 'react';
import { User, LogIn, UserPlus, Check, X, Shield, Sparkles, Crown, Film, Palette, Target, PenTool } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onRegisterUser: (newUser: Omit<UserProfile, 'id' | 'votosRealizados'>) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSelectUser,
  onRegisterUser,
}) => {
  const [activeTab, setActiveTab] = useState<'selecionar' | 'novo'>('selecionar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('Videomaker & Social Media');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) return;

    const initials = nome
      .trim()
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const colors = [
      'from-pink-500 to-rose-600',
      'from-violet-500 to-purple-600',
      'from-blue-500 to-indigo-600',
      'from-amber-500 to-orange-600',
      'from-emerald-500 to-teal-600',
    ];
    const cor = colors[Math.floor(Math.random() * colors.length)];

    onRegisterUser({
      nome: nome.trim(),
      email: email.trim(),
      cargo: cargo.trim(),
      avatar: initials || 'U',
      cor,
    });

    setNome('');
    setEmail('');
    onClose();
  };

  const getRoleIcon = (roleName: string) => {
    const r = roleName.toLowerCase();
    if (r.includes('coordenador')) return <Crown className="w-3.5 h-3.5 text-amber-400" />;
    if (r.includes('video')) return <Film className="w-3.5 h-3.5 text-amber-400" />;
    if (r.includes('design')) return <Palette className="w-3.5 h-3.5 text-violet-400" />;
    if (r.includes('tráfego') || r.includes('seo')) return <Target className="w-3.5 h-3.5 text-blue-400" />;
    return <PenTool className="w-3.5 h-3.5 text-pink-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0b0c20] text-white rounded-3xl max-w-lg w-full shadow-2xl border border-indigo-500/30 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Futuristic 60-30-10 Glow */}
        <div className="bg-gradient-to-r from-[#14163c] via-[#1f1b4d] to-[#121438] p-5 sm:p-6 border-b border-indigo-500/20 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-indigo-400 hover:text-white rounded-xl hover:bg-violet-600/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-amber-500 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-600/30 border border-violet-400/40">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  Autenticação & Perfil de Membro
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  Inovatti
                </span>
              </div>
              <p className="text-xs text-indigo-300/80 mt-0.5">
                Alterne de perfil para votar, avaliar viabilidade técnica ou coordenar projetos.
              </p>
            </div>
          </div>

          {/* Toggle between existing and new */}
          <div className="flex items-center gap-1.5 bg-[#080918] p-1 rounded-xl mt-4 border border-indigo-500/20">
            <button
              onClick={() => setActiveTab('selecionar')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'selecionar'
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-indigo-300 hover:text-white'
              }`}
            >
              Membros da Equipe ({allUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('novo')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'novo'
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                  : 'text-indigo-300 hover:text-white'
              }`}
            >
              + Novo Cadastro
            </button>
          </div>
        </div>

        {/* Tab 1: Select Member */}
        {activeTab === 'selecionar' && (
          <div className="p-5 sm:p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            <p className="text-xs text-indigo-300/80 mb-2">
              Selecione com qual identidade você deseja interagir no brainstorm e nos estudos de viabilidade:
            </p>

            <div className="space-y-2.5">
              {allUsers.map((user) => {
                const isSelected = currentUser?.id === user.id;
                const isLucas =
                  user.id === 'user-5' ||
                  user.nome.toLowerCase().includes('lucas') ||
                  user.cargo.toLowerCase().includes('coordenador');

                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-violet-600/30 border-amber-400/80 shadow-lg ring-1 ring-amber-400/50'
                        : isLucas
                        ? 'bg-[#151336]/80 border-amber-500/30 hover:border-amber-400/70 hover:bg-[#1a1744]'
                        : 'bg-[#121438]/70 border-indigo-500/20 hover:border-violet-400/40 hover:bg-[#161844]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${user.cor} flex items-center justify-center font-extrabold text-white text-sm shadow-md shrink-0`}
                      >
                        {user.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                            {user.nome}
                          </h4>
                          {isLucas && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                              <Crown className="w-3 h-3 fill-slate-950" />
                              Coordenador Geral
                            </span>
                          )}
                          {isSelected && !isLucas && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-violet-500 text-white">
                              Conectado
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-indigo-300/80 flex items-center gap-1.5 mt-0.5">
                          {getRoleIcon(user.cargo)}
                          <span>{user.cargo}</span>
                        </div>
                        <div className="text-[10px] text-indigo-400/60 font-mono mt-0.5">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-indigo-400 group-hover:text-white px-2.5 py-1 rounded-lg bg-[#0a0c20]/60 border border-indigo-500/20">
                          Entrar →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Register New Member */}
        {activeTab === 'novo' && (
          <form onSubmit={handleRegister} className="p-5 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Gabriel Ramos"
                className="w-full px-3.5 py-2.5 bg-[#080918] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                E-mail Corporativo *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex.: gabriel.ramos@inovatti.com.br"
                className="w-full px-3.5 py-2.5 bg-[#080918] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1.5">
                Função / Especialidade Técnica na Equipe
              </label>
              <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#080918] border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="Videomaker & Social Media">Videomaker & Social Media</option>
                <option value="Designer Gráfico & Visual">Designer Gráfico & Visual</option>
                <option value="Gestor de Tráfego & SEO">Gestor de Tráfego & SEO</option>
                <option value="Copywriter & Estrategista">Copywriter & Estrategista</option>
                <option value="Corretor Líder & Consultor">Corretor Líder & Consultor</option>
                <option value="Coordenador Geral de Marketing">Coordenador Geral de Marketing</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-slate-950" />
                <span>Cadastrar Membro & Fazer Login</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
