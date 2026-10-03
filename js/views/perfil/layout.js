import { esc, iniciais } from "../../utils.js";
import { suporteWhatsApp } from "./accoes.js";

const LABEL_TIPO = {
  PROPRIETARIO: "Proprietário",
  ADMIN: "Administrador",
  INQUILINO_COMPRADOR: "Inquilino / Comprador",
};

export function templatePerfil(u) {
  const tipoLabel = LABEL_TIPO[u.tipo] || "Utilizador";

  return `
    <div class="perfil-page fade-in">
      <a href="#/" class="detail-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M15 6l-6 6 6 6"/>
        </svg>
        Voltar ao início
      </a>

      ${cartaoPerfil(u, tipoLabel)}
      ${blocoInfo(u)}
      ${blocoSuporte()}

      <button id="perfil-sair" class="btn btn-ghost btn-block"
              style="margin-top:var(--space-3)">
        Terminar sessão
      </button>
    </div>`;
}

/* ─── Cartão com avatar ─── */
function cartaoPerfil(u, tipoLabel) {
  return `
    <div class="perfil-card">
      <div class="perfil-card__avatar">
        <span class="avatar avatar--xl">${iniciais(u.nome)}</span>
      </div>

      <h1 class="perfil-card__nome">${esc(u.nome || "Utilizador")}</h1>
      <p class="perfil-card__email">${esc(u.email || "")}</p>
      <span class="badge badge--line">${tipoLabel}</span>
    </div>`;
}

/* ─── Bloco de informação ─── */
function blocoInfo(u) {
  return `
    <div class="perfil-info">
      <div class="perfil-info__row">
        <span class="perfil-info__label">Telefone</span>
        <span class="perfil-info__valor">${esc(u.telefone || "Não definido")}</span>
      </div>
    </div>`;
}

/* ─── Bloco de suporte ─── */
function blocoSuporte() {
  const display = "925 103 300";

  return `
    <section class="perfil-suporte">
      <h2 class="perfil-suporte__titulo">Precisas de ajuda?</h2>
      <p class="perfil-suporte__texto">
        A edição do perfil (nome, telefone, etc.) será adicionada em breve.
        Para alterar os teus dados agora, fala connosco pelo WhatsApp.
      </p>

      <a href="${suporteWhatsApp()}" target="_blank" rel="noopener"
         class="btn btn-primary btn-block perfil-suporte__btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"
             aria-hidden="true" style="flex-shrink:0">
          <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.8 9.8 0 0 0 4.68 1.2h.01c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2m5.72 13.9c-.24.68-1.4 1.3-1.93 1.35-.5.05-.96.23-2.7-.56-2.1-.95-3.42-3.14-3.53-3.28-.1-.15-.85-1.16-.85-2.22 0-1.05.55-1.57.75-1.79.2-.22.43-.27.57-.27h.41c.13 0 .32-.05.49.38.17.44.6 1.5.65 1.6.05.11.08.24.01.38-.07.15-.13.24-.26.38l-.2.23c-.13.13-.27.28-.12.53.15.25.66 1.1 1.42 1.78.97.87 1.5 1.02 1.74 1.14.18.1.33.08.46-.05.15-.15.53-.62.68-.83.14-.22.29-.18.48-.11.2.07 1.24.6 1.46.71.21.11.35.16.4.25.05.1.05.56-.19 1.23"/>
        </svg>
        Contactar suporte (${display})
      </a>
    </section>`;
}
