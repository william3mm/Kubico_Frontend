import { sessao } from "../state.js";
import { iniciais } from "../utils.js";

export function desenharHeader() {
  const box = document.getElementById("header-conta");
  if (!box) return;

  const u = sessao.user;

  if (!u) {
    box.innerHTML = `
      <a href="#/entrar"  class="btn btn-ghost" style="min-height:40px;padding-inline:1rem">Entrar</a>
      <a href="#/registar" class="btn btn-primary" style="min-height:40px;padding-inline:1rem">Criar conta</a>`;
    return;
  }

  const href = u.perfil === "proprietario" ? "#/painel" : "#/perfil";
  box.innerHTML = `
    <a href="${href}" class="row-card" style="padding:.25rem .75rem .25rem .25rem;border-radius:var(--radius-full);align-items:center">
      <span class="avatar avatar--sm">${iniciais(u.nome)}</span>
      <span style="font-size:.875rem;font-weight:600;max-width:8rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
        ${(u.nome || "").split(" ")[0]}
      </span>
    </a>`;
}

export function desenharTabbar(rota) {
  const nav = document.getElementById("tabbar");
  if (!nav) return;

  const u = sessao.user;
  if (!u) {
    nav.hidden = true;
    nav.innerHTML = "";
    return;
  }

  nav.hidden = false;

  const conta =
    u.perfil === "proprietario"
      ? ["#/painel", "Painel"]
      : ["#/perfil", "Perfil"];

  const itens = [
    ["#/", "Início", "M4 11l8-6 8 6 M6 11v8h12v-8"],
    [
      "#/imoveis",
      "Procurar",
      "M11 11 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 M20 20l-3.5-3.5",
    ],
    [
      conta[0],
      conta[1],
      "M12 12 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M4 21c0-4 3.6-6 8-6s8 2 8 6",
    ],
  ];

  nav.innerHTML = `
    <div class="tabbar__grid">
      ${itens
        .map(([href, label, path]) => {
          const activo =
            rota === href ||
            (href !== "#/" && rota.startsWith(href.replace("#", "")));
          return `
          <a href="${href}" class="${activo ? "is-on" : ""}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="${path}"/>
            </svg>
            <span>${label}</span>
          </a>`;
        })
        .join("")}
    </div>`;
}
