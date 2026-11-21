import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  CarFront,
  ClipboardList,
  FolderTree,
  KeyRound,
  LayoutDashboard,
  Menu,
  Tag,
  Users,
  Wrench,
  Layers,
  X,
  type LucideIcon,
} from "lucide-react";

export interface NavbarProps {
  brandName?: string;
}

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

// Lista centralizada dos links; ao adicionar uma rota, basta incluí-la aqui.
const secoes: { titulo: string; itens: NavItem[] }[] = [
  {
    titulo: "Visão geral",
    itens: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    titulo: "Operação",
    itens: [
      { to: "/locacoes", label: "Locações", icon: KeyRound },
      { to: "/clientes", label: "Clientes", icon: Users },
      { to: "/veiculos", label: "Veículos", icon: CarFront },
      { to: "/manutencoes", label: "Manutenções", icon: Wrench },
    ],
  },
  {
    titulo: "Cadastros",
    itens: [
      { to: "/modelos", label: "Modelos", icon: Layers },
      { to: "/categorias", label: "Categorias", icon: FolderTree },
      { to: "/marcas", label: "Marcas", icon: Tag },
    ],
  },
];

const todosItens = secoes.flatMap((s) => s.itens);

function paginaAtual(pathname: string): string {
  const item = [...todosItens]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) => (i.to === "/" ? pathname === "/" : pathname.startsWith(i.to)));
  return item?.label ?? "Dashboard";
}

// Layout principal: sidebar fixa no desktop e gaveta deslizante no celular/tablet.
export function AppLayout({ children, brandName = "Locadora de Veículos" }: NavbarProps & { children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aberto]);

  return (
    <div className="app-shell">
      <aside id="app-sidebar" className={`app-sidebar ${aberto ? "is-open" : ""}`} aria-label="Navegação principal">
        <div className="d-flex align-items-center justify-content-between">
          <NavLink className="app-brand" to="/" onClick={() => setAberto(false)}>
            <span className="app-brand-mark" aria-hidden="true">
              <CarFront size={20} />
            </span>
            <span>
              <span className="app-brand-name d-block">{brandName}</span>
              <span className="app-brand-sub">Gestão de frota e locações</span>
            </span>
          </NavLink>
          <button
            type="button"
            className="btn btn-icon text-white d-lg-none me-2"
            aria-label="Fechar menu"
            onClick={() => setAberto(false)}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="app-nav">
          {secoes.map((secao) => (
            <div key={secao.titulo}>
              <p className="app-nav-section">{secao.titulo}</p>
              <ul className="list-unstyled d-flex flex-column gap-1 mb-0">
                {secao.itens.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === "/"}
                      onClick={() => setAberto(false)}
                      className={({ isActive }) => `app-nav-link ${isActive ? "active" : ""}`}
                    >
                      <item.icon size={18} aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="app-sidebar-footer d-flex align-items-center gap-2">
          <ClipboardList size={14} aria-hidden="true" />
          Sistema de Locação de Veículos
        </div>
      </aside>

      {aberto && (
        <button
          type="button"
          className="app-sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setAberto(false)}
        />
      )}

      <div className="app-main">
        <div className="app-topbar">
          <button
            type="button"
            className="app-topbar-toggle"
            aria-label="Abrir menu"
            aria-controls="app-sidebar"
            aria-expanded={aberto}
            onClick={() => setAberto(true)}
          >
            <Menu size={18} aria-hidden="true" />
          </button>
          <p className="app-breadcrumb">
            {brandName} <span aria-hidden="true">/</span> <strong>{paginaAtual(pathname)}</strong>
          </p>
        </div>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
