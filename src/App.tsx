import React, { useEffect, useMemo, useState } from "react";

// Protótipo DEMO – "Nevar" (Vite + React + TS + Tailwind)
// Multiplataforma: PWA no navegador e base para Android/iOS/Windows/Mac.
// ⚠️ Demo-only: sem backend (usa localStorage).

const LS_KEYS = {
  USERS: "nevar_demo_users",
  OSS: "nevar_demo_os",
  SESSION: "nevar_demo_session",
  BRAND: "nevar_demo_brand",
};

type Role = "ADMIN" | "GESTOR" | "RECEPCAO" | "FINANCEIRO" | "TECNICO";

interface User {
  id: string;
  name: string;
  email: string;
  pass: string; // hash fake (apenas demo)
  role: Role;
  active: boolean;
}

interface OSItem {
  id: string;
  cliente: string;
  endereco: string;
  equipamento: string;
  prioridade: "Baixa" | "Média" | "Alta";
  status: "Aberta" | "Agendada" | "Em Execução" | "Concluída" | "Faturada";
  tecnicoId?: string;
  data?: string; // agendamento
}

function hashFake(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return String(h >>> 0);
}

function seedOSIfEmpty() {
  const raw = localStorage.getItem(LS_KEYS.OSS);
  if (raw) return;
  const sample: OSItem[] = [
    { id: "OS-1001", cliente: "Condomínio Jardim Azul", endereco: "Rua das Flores, 123 - Centro", equipamento: "Split 18.000 BTU - LG", prioridade: "Média", status: "Agendada", data: new Date().toISOString() },
    { id: "OS-1002", cliente: "Padaria Pão Quente", endereco: "Av. Brasil, 450", equipamento: "Câmara Fria - Embraco", prioridade: "Alta", status: "Aberta" },
    { id: "OS-1003", cliente: "Residencial Sol Nascente", endereco: "Rua A, 55", equipamento: "Split 9.000 BTU - Samsung", prioridade: "Baixa", status: "Em Execução" }
  ];
  localStorage.setItem(LS_KEYS.OSS, JSON.stringify(sample));
}

function fetchUsers(): User[] {
  const raw = localStorage.getItem(LS_KEYS.USERS);
  return raw ? (JSON.parse(raw) as User[]) : [];
}
function saveUsers(users: User[]) {
  localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
}

function useSession() {
  const [session, setSession] = useState<User | null>(() => {
    const raw = localStorage.getItem(LS_KEYS.SESSION);
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const login = (user: User) => {
    localStorage.setItem(LS_KEYS.SESSION, JSON.stringify(user));
    setSession(user);
  };
  const logout = () => {
    localStorage.removeItem(LS_KEYS.SESSION);
    setSession(null);
  };
  return { session, login, logout };
}

function Shell({ children, onLogout, user, view, setView }: { children: React.ReactNode; onLogout: () => void; user: User; view: string; setView: (v: string)=>void }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white grid place-items-center font-bold">NV</div>
            <div>
              <div className="text-xs text-slate-500 leading-none">Nevar – Sistema de Refrigeração</div>
              <div className="font-semibold leading-none">{view === "admin" ? `Painel (${user.role})` : "Site – Preview"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setView(view === "admin" ? "site" : "admin")} className="px-3 py-1.5 rounded-xl border">
              {view === "admin" ? "Ver Site" : "Voltar ao Painel"}
            </button>
            <span className="text-sm">{user.name}</span>
            <button className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:opacity-90" onClick={onLogout}>Sair</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
      <footer className="py-8 text-center text-xs text-slate-400">Protótipo demonstrativo – PWA / base para Android · iOS · Windows · Mac</footer>
    </div>
  );
}

function Card({ title, children, actions }: { title: string; children?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        {actions}
      </div>
      <div>{children}</div>
    </div>
  );
}

function AdminBootstrap({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const can = name && email && pass;
  const handle = () => {
    const users = fetchUsers();
    if (users.length > 0) return onCreated();
    const user: User = { id: crypto.randomUUID(), name, email, pass: hashFake(pass), role: "ADMIN", active: true };
    users.push(user);
    saveUsers(users);
    onCreated();
  };
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center mb-4">
          <div className="text-2xl font-bold">Primeiro Acesso – Nevar</div>
          <div className="text-sm text-slate-500">Crie o usuário Administrador para começar</div>
        </div>
        <div className="space-y-3">
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Nome" value={name} onChange={e=>setName(e.target.value)} />
          <input className="w-full border rounded-xl px-3 py-2" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Senha" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          <button disabled={!can} onClick={handle} className="w-full py-2 rounded-xl bg-slate-900 text-white disabled:opacity-40">Criar Administrador</button>
        </div>
      </div>
    </div>
  );
}

function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const handle = () => {
    const users = fetchUsers();
    const u = users.find((x) => x.email.trim().toLowerCase() === email.trim().toLowerCase() && x.active);
    if (!u || u.pass !== hashFake(pass)) {
      setError("Credenciais inválidas ou usuário inativo.");
      return;
    }
    onLogin(u);
  };
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center mb-4">
          <div className="text-2xl font-bold">Entrar – Nevar</div>
          <div className="text-sm text-slate-500">Acesse com seu e-mail e senha</div>
        </div>
        <div className="space-y-3">
          <input className="w-full border rounded-xl px-3 py-2" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Senha" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button onClick={handle} className="w-full py-2 rounded-xl bg-slate-900 text-white">Entrar</button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user }: { user: User }) {
  const oss = useMemo(() => {
    const raw = localStorage.getItem(LS_KEYS.OSS);
    return raw ? (JSON.parse(raw) as OSItem[]) : [];
  }, [user.id]);

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card title="Resumo Rápido">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border"><div className="text-2xl font-bold">{oss.length}</div><div className="text-xs text-slate-500">O.S. Totais</div></div>
          <div className="p-3 rounded-xl bg-slate-50 border"><div className="text-2xl font-bold">{oss.filter(o=>o.status!=="Concluída" && o.status!=="Faturada").length}</div><div className="text-xs text-slate-500">Pendentes</div></div>
          <div className="p-3 rounded-xl bg-slate-50 border"><div className="text-2xl font-bold">{oss.filter(o=>o.status==="Agendada").length}</div><div className="text-xs text-slate-500">Agendadas</div></div>
        </div>
      </Card>
      <Card title="Atalhos">
        <div className="flex flex-wrap gap-2">
          {["Nova O.S.", "Novo Orçamento", "Estoque", "Financeiro", "Relatórios", "CMS do Site"].map((t) => (
            <button key={t} className="px-3 py-2 rounded-xl border hover:bg-slate-50">{t}</button>
          ))}
        </div>
      </Card>
      <Card title="O.S. Recentes">
        <div className="space-y-2 max-h-56 overflow-auto pr-2">
          {oss.slice(0, 6).map((o) => (
            <div key={o.id} className="p-2 rounded-xl border flex items-center justify-between">
              <div>
                <div className="font-medium">{o.id} · {o.cliente}</div>
                <div className="text-xs text-slate-500">{o.equipamento} · {o.prioridade}</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 border">{o.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Subnav({ items, current, setCurrent }:{ items: string[]; current: string; setCurrent: (s:string)=>void }){
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {items.map(i=> (
        <button key={i} onClick={()=>setCurrent(i)} className={`px-3 py-1.5 rounded-xl border ${current===i?"bg-slate-900 text-white":"bg-white"}`}>{i}</button>
      ))}
    </div>
  );
}

function Placeholder({ title, desc, cta }: { title: string; desc: string; cta?: string }) {
  return (
    <div className="bg-white rounded-2xl border p-6 text-center">
      <div className="text-xl font-semibold mb-2">{title}</div>
      <div className="text-sm text-slate-500 mb-4">{desc}</div>
      {cta && <div className="text-xs text-slate-400">{cta}</div>}
    </div>
  );
}

// O.S.
function OSBoard() {
  const [tab, setTab] = useState("Kanban");
  const [items, setItems] = useState<OSItem[]>(() => {
    const raw = localStorage.getItem(LS_KEYS.OSS);
    return raw ? (JSON.parse(raw) as OSItem[]) : [];
  });
  const statuses: OSItem["status"][] = ["Aberta","Agendada","Em Execução","Concluída","Faturada"];
  const advance = (id: string) => {
    const order = statuses;
    const next = items.map(i=>{
      if (i.id!==id) return i;
      const idx = order.indexOf(i.status);
      return { ...i, status: order[Math.min(idx+1, order.length-1)] };
    });
    setItems(next); localStorage.setItem(LS_KEYS.OSS, JSON.stringify(next));
  };
  return (
    <div>
      <Subnav items={["Kanban","Nova O.S.","Detalhe/Encerrar"]} current={tab} setCurrent={setTab} />
      {tab==="Kanban" && (
        <div className="grid md:grid-cols-5 gap-3">
          {statuses.map(st=> (
            <div key={st} className="bg-white rounded-2xl border p-3">
              <div className="font-semibold mb-2">{st}</div>
              <div className="space-y-2 min-h-24">
                {items.filter(i=>i.status===st).map(i=> (
                  <div key={i.id} className="p-2 border rounded-xl bg-slate-50">
                    <div className="text-sm font-medium">{i.id} · {i.cliente}</div>
                    <div className="text-xs text-slate-500">{i.equipamento}</div>
                    <button onClick={()=>advance(i.id)} className="mt-2 text-xs px-2 py-1 rounded-lg border">Avançar</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="Nova O.S." && (
        <Placeholder title="Nova O.S." desc="Formulário com cliente, local, equipamento, SLA, checklist e peças previstas." cta="(Demo visual)" />
      )}
      {tab==="Detalhe/Encerrar" && (
        <Placeholder title="Detalhe da O.S." desc="Timeline, fotos antes/depois, consumo de peças, laudo e assinatura do cliente. Botão 'Encerrar O.S.'" cta="(Demo visual)" />
      )}
    </div>
  );
}

// Orçamentos
function Orcamentos() {
  const [tab, setTab] = useState("Lista");
  return (
    <div>
      <Subnav items={["Lista","Novo","Itens & Cálculo"]} current={tab} setCurrent={setTab} />
      {tab==="Lista" && <Placeholder title="Orçamentos – Lista" desc="Tabela com status (Em avaliação, Aprovado, Perdido), valor, validade e link de aprovação." />}
      {tab==="Novo" && <Placeholder title="Novo Orçamento" desc="Selecionar serviços, peças, deslocamento, impostos e margens. Gerar PDF/link para cliente." />}
      {tab==="Itens & Cálculo" && <Placeholder title="Configuração de Itens" desc="Regras de preço, tabelas por cliente, desconto máximo por perfil." />}
    </div>
  );
}

// Estoque
function Estoque() {
  const [tab, setTab] = useState("Itens");
  return (
    <div>
      <Subnav items={["Itens","Depósitos","Movimentações"]} current={tab} setCurrent={setTab} />
      {tab==="Itens" && <Placeholder title="Itens de Estoque" desc="Lista com SKU, NCM, custo, preço, saldo, mínimos e curva ABC." />}
      {tab==="Depósitos" && <Placeholder title="Depósitos / Vans" desc="Controle por local: Matriz, vans de técnicos, filiais. Transferências e reservas por O.S." />}
      {tab==="Movimentações" && <Placeholder title="Movimentações" desc="Entradas (compras/devoluções) e saídas (O.S./perdas) com anexos e auditoria." />}
    </div>
  );
}

// Financeiro
function Financeiro() {
  const [tab, setTab] = useState("Receber");
  return (
    <div>
      <Subnav items={["Receber","Pagar","Emissão Fiscal","Fluxo de Caixa"]} current={tab} setCurrent={setTab} />
      {tab==="Receber" && <Placeholder title="Contas a Receber" desc="Cobranças via PIX/boleto/cartão; baixa automática; inadimplência." />}
      {tab==="Pagar" && <Placeholder title="Contas a Pagar" desc="Fornecedores, despesas recorrentes, centros de custo e anexos." />}
      {tab==="Emissão Fiscal" && <Placeholder title="Emissão de NFS-e / NF-e / NFC-e" desc="Integração SEFAZ/Prefeitura, certificado A1, séries, CFOP/NCM/CSOSN." />}
      {tab==="Fluxo de Caixa" && <Placeholder title="Fluxo de Caixa" desc="Previsto x realizado, DRE gerencial simples, filtros por unidade/equipe." />}
    </div>
  );
}

// Relatórios
function Relatorios() {
  const [tab, setTab] = useState("Operação");
  return (
    <div>
      <Subnav items={["Operação","Comercial","Financeiro","Estoque"]} current={tab} setCurrent={setTab} />
      {tab==="Operação" && <Placeholder title="KPIs de Operação" desc="SLA, 1ª visita resolvida, retrabalho, produtividade por técnico." />}
      {tab==="Comercial" && <Placeholder title="KPIs Comerciais" desc="Taxa de conversão, tempo de ciclo, ticket médio, motivos de perda." />}
      {tab==="Financeiro" && <Placeholder title="KPIs Financeiros" desc="Margem por serviço/cliente, receitas por período, inadimplência." />}
      {tab==="Estoque" && <Placeholder title="KPIs de Estoque" desc="Giro, ruptura, valorização, perdas." />}
    </div>
  );
}

// CMS
function CMS() {
  const [tab, setTab] = useState("Páginas");
  return (
    <div>
      <Subnav items={["Páginas","Serviços","Depoimentos","Leads"]} current={tab} setCurrent={setTab} />
      {tab==="Páginas" && <Placeholder title="Gerenciar Páginas" desc="Home, Sobre, Áreas atendidas, Contato. Editor simples e SEO." />}
      {tab==="Serviços" && <Placeholder title="Catálogo de Serviços" desc="Ar-condicionado Split, Chiller, Câmara fria, Preventiva; preços públicos opcionais." />}
      {tab==="Depoimentos" && <Placeholder title="Depoimentos" desc="Provas sociais com nome/empresa e nota." />}
      {tab==="Leads" && <Placeholder title="Leads" desc="Formulários integrados ao CRM/Orçamentos, status e retorno." />}
    </div>
  );
}

// Usuários
function UsersAdmin() {
  const [users, setUsers] = useState<User[]>(() => fetchUsers());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState<Role>("RECEPCAO");

  const add = () => {
    if (!name || !email || !pass) return;
    const u: User = { id: crypto.randomUUID(), name, email, pass: hashFake(pass), role, active: true };
    const next = [...users, u];
    setUsers(next);
    saveUsers(next);
    setName(""); setEmail(""); setPass(""); setRole("RECEPCAO");
  };
  const toggle = (id: string) => {
    const next = users.map(u => u.id === id ? { ...u, active: !u.active } : u);
    setUsers(next); saveUsers(next);
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card title="Criar Usuário">
        <div className="space-y-3">
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Nome" value={name} onChange={e=>setName(e.target.value)} />
          <input className="w-full border rounded-xl px-3 py-2" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Senha" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
          <select className="w-full border rounded-xl px-3 py-2" value={role} onChange={e=>setRole(e.target.value as Role)}>
            {(["ADMIN","GESTOR","RECEPCAO","FINANCEIRO","TECNICO"] as Role[]).map(r=> <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={add} className="w-full py-2 rounded-xl bg-slate-900 text-white">Adicionar</button>
        </div>
      </Card>
      <Card title="Usuários">
        <div className="space-y-2">
          {users.map(u=> (
            <div key={u.id} className="p-2 rounded-xl border flex items-center justify-between">
              <div>
                <div className="font-medium">{u.name} <span className="text-xs text-slate-400">({u.role})</span></div>
                <div className="text-xs text-slate-500">{u.email}</div>
              </div>
              <button onClick={()=>toggle(u.id)} className={`px-3 py-1.5 rounded-xl border ${u.active?"bg-green-50":"bg-rose-50"}`}>{u.active?"Ativo":"Inativo"}</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Técnico
function TecnicoView({ user }: { user: User }) {
  const [oss, setOss] = useState<OSItem[]>(() => {
    const raw = localStorage.getItem(LS_KEYS.OSS);
    const all: OSItem[] = raw ? JSON.parse(raw) : [];
    return all.filter(o => !o.tecnicoId || o.tecnicoId === user.id);
  });
  const concluir = (id: string) => {
    const next = oss.map(o => o.id === id ? { ...o, status: "Concluída" } : o);
    setOss(next);
    const raw = localStorage.getItem(LS_KEYS.OSS);
    const all: OSItem[] = raw ? JSON.parse(raw) : [];
    const merged = all.map(o => o.id === id ? { ...o, status: "Concluída" } : o);
    localStorage.setItem(LS_KEYS.OSS, JSON.stringify(merged));
  };
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {oss.map(o => (
        <div key={o.id} className="bg-white rounded-2xl border p-4">
          <div className="font-semibold">{o.id} – {o.cliente}</div>
          <div className="text-sm text-slate-500">{o.endereco}</div>
          <div className="text-sm mt-2">Equip.: {o.equipamento}</div>
          <div className="text-xs mt-1">Prioridade: {o.prioridade}</div>
          <div className="text-xs mb-2">Status: {o.status}</div>
          <button onClick={()=>concluir(o.id)} className="px-3 py-1.5 rounded-xl border">Encerrar O.S.</button>
        </div>
      ))}
      {oss.length===0 && <div className="text-sm text-slate-500">Sem O.S. atribuídas.</div>}
    </div>
  );
}

// Site Preview
function SitePreview() {
  return (
    <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl border overflow-hidden">
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs">NEVAR</div>
        <h1 className="text-3xl font-bold mt-2">Clima perfeito para o seu negócio</h1>
        <p className="text-slate-500 mt-1">Instalação, manutenção e refrigeração comercial com atendimento rápido.</p>
        <div className="mt-4 flex justify-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-slate-900 text-white">Solicitar Orçamento</button>
          <button className="px-4 py-2 rounded-xl border">Ver Serviços</button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-3 p-6">
        {[
          {t:"Instalação de Split", d:"Projetos residenciais e comerciais."},
          {t:"Câmaras Frias", d:"Montagem e manutenção completa."},
          {t:"Contratos Preventivos", d:"Planos para reduzir paradas e custos."}
        ].map((c)=> (
          <div key={c.t} className="bg-white rounded-2xl p-5 border">
            <div className="font-semibold">{c.t}</div>
            <div className="text-sm text-slate-500">{c.d}</div>
          </div>
        ))}
      </div>
      <div className="p-6 border-t text-center text-sm text-slate-500">Atendemos região metropolitana · WhatsApp (11) 99999-9999</div>
    </div>
  );
}

function Nav({ role, current, setCurrent }: { role: Role; current: string; setCurrent: (s: string)=>void }) {
  const base = ["Dashboard","O.S.","Orçamentos","Estoque","Financeiro","Relatórios","CMS do Site"];
  const tech = ["Minhas O.S."];
  const items = role === "TECNICO" ? tech : base;
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {items.map(item=> (
        <button key={item} onClick={()=>setCurrent(item)} className={`px-3 py-1.5 rounded-xl border ${current===item?"bg-slate-900 text-white":"bg-white"}`}>{item}</button>
      ))}
      {role === "ADMIN" && (
        <button onClick={()=>setCurrent("Usuários")} className={`px-3 py-1.5 rounded-xl border ${current==="Usuários"?"bg-slate-900 text-white":"bg-white"}`}>Usuários</button>
      )}
    </div>
  );
}

export default function App() {
  const { session, login, logout } = useSession();
  const [bootChecked, setBootChecked] = useState(false);

  useEffect(() => {
    seedOSIfEmpty();
    fetchUsers();
    setBootChecked(true);
    if (!localStorage.getItem(LS_KEYS.BRAND)) localStorage.setItem(LS_KEYS.BRAND, "Nevar");
  }, []);

  if (!bootChecked) return null;

  const users = fetchUsers();
  if (users.length === 0) {
    return <AdminBootstrap onCreated={() => {}} />;
  }
  if (!session) {
    return <Login onLogin={login} />;
  }

  return <AppAuthed user={session} onLogout={logout} />;
}

function AppAuthed({ user, onLogout }: { user: User; onLogout: () => void }) {
  // Default view comes from env or query (?site=1)
  const q = new URLSearchParams(location.search);
  const siteFlag = q.get("site");
  const defaultView = siteFlag ? "site" : (import.meta.env.VITE_DEFAULT_VIEW === "site" ? "site" : "admin");

  const [current, setCurrent] = useState("Dashboard");
  const [view, setView] = useState<"admin"|"site">(defaultView as "admin"|"site");

  if (view === "site") {
    return (
      <Shell onLogout={onLogout} user={user} view={view} setView={setView}>
        <SitePreview />
      </Shell>
    );
  }

  return (
    <Shell onLogout={onLogout} user={user} view={view} setView={setView}>
      <Nav role={user.role} current={current} setCurrent={setCurrent} />
      {user.role === "TECNICO" ? (
        current === "Minhas O.S." ? <TecnicoView user={user} /> : <TecnicoView user={user} />
      ) : (
        <>
          {current === "Dashboard" && <Dashboard user={user} />}
          {current === "O.S." && <OSBoard />}
          {current === "Orçamentos" && <Orcamentos />}
          {current === "Estoque" && <Estoque />}
          {current === "Financeiro" && <Financeiro />}
          {current === "Relatórios" && <Relatorios />}
          {current === "CMS do Site" && <CMS />}
          {current === "Usuários" && user.role === "ADMIN" && <UsersAdmin />}
        </>
      )}
    </Shell>
  );
}
