import { iniciais } from "../utils.js";

/**
 * Sidebar do painel de gestão.
 * - Mobile: aparece em bottom sheet via botão hamburger no header da gestão
 * - Desktop: coluna fixa à esquerda
 */
export function sidebar(abaActiva = "imoveis") {
  const itens = [
    {
      chave: "imoveis",
      label: "Todos os imóveis",
      href: "#/gestao/imoveis",
      icon: '<path d="M4 11l8-6 8 6"/><path d="M6 11v8h12v-8"/><path d="M10 19v-5h4v5"/>',
    },
    {
      chave: "contactos",
      label: "Contactos",
      href: "#/gestao/contactos",
      icon: '<path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/>',
    },
    {
      chave: "dados",
      label: "Os meus dados",
      href: "#/gestao/dados",
      icon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6 19c2-3 4-4 6-4s4 1 6 4"/>',
    },
  ];

  return `
    <aside id="gestao-sidebar" class="sidebar">
      <nav class="sidebar__nav">
        ${itens
          .map((it) => {
            const on = abaActiva === it.chave;
            return `
            <a href="${it.href}" class="sidebar__link ${on ? "is-on" : ""}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1.8"
                   stroke-linecap="round" stroke-linejoin="round">
                ${it.icon}
              </svg>
              <span>${it.label}</span>
            </a>`;
          })
          .join("")}
      </nav>
    </aside>`;
}

/**
 * Cabeçalho da gestão (mobile) — hamburger + título + botão novo imóvel
 */
export function cabecalhoGestao({ titulo, user }) {
  return `
    <header class="gestao-topbar">
      <button id="abrir-sidebar" class="gestao-topbar__menu" aria-label="Abrir menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <h1 class="gestao-topbar__title">${titulo}</h1>

      <a href="#/publicar" class="gestao-topbar__novo" aria-label="Novo imóvel">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </a>
    </header>`;
}

/**
 * Backdrop para o sidebar em mobile
 */
export function backdropSidebar() {
  return `<div id="sidebar-backdrop" class="sidebar__backdrop" hidden></div>`;
}

/**
 * Liga eventos do sidebar (abrir/fechar em mobile).
 */
export function ligarSidebar() {
  const sidebar = document.getElementById("gestao-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  const btnAbrir = document.getElementById("abrir-sidebar");

  if (!sidebar || !btnAbrir) return;

  const abrir = () => {
    sidebar.classList.add("is-open");
    backdrop.hidden = false;
    document.body.classList.add("scroll-lock");
  };

  const fechar = () => {
    sidebar.classList.remove("is-open");
    backdrop.hidden = true;
    document.body.classList.remove("scroll-lock");
  };

  btnAbrir.onclick = abrir;
  backdrop?.addEventListener("click", fechar);

  // Fechar ao clicar num link (navegação)
  sidebar.querySelectorAll(".sidebar__link").forEach((a) => {
    a.addEventListener("click", fechar);
  });
}
