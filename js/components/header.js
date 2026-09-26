import { sessao } from "../state.js";
import { iniciais, toast } from "../utils.js";

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

  // URL da área pessoal conforme o tipo
  const href =
    u.tipo === "PROPRIETARIO" || u.tipo === "ADMIN" ? "#/gestao" : "#/perfil";

  box.innerHTML = `
    <div class="header-user" id="header-user">
      <button type="button" class="header-user__btn" aria-haspopup="true" aria-expanded="false">
        <span class="avatar avatar--sm">${iniciais(u.nome)}</span>
        <span class="header-user__name">${(u.nome || "").split(" ")[0]}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      <div class="header-user__menu" hidden>
        <a href="${href}">Meu perfil</a>
        <button type="button" id="sair-conta">Terminar sessão</button>
      </div>
    </div>`;

  // Toggle do menu
  const wrap = document.getElementById("header-user");
  const btn = wrap.querySelector(".header-user__btn");
  const menu = wrap.querySelector(".header-user__menu");

  btn.onclick = (ev) => {
    ev.stopPropagation();
    const aberto = !menu.hidden;
    menu.hidden = aberto;
    btn.setAttribute("aria-expanded", String(!aberto));
  };

  // Fechar ao clicar fora
  document.addEventListener("click", function fechar(ev) {
    if (!wrap.contains(ev.target)) {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      document.removeEventListener("click", fechar);
    }
  });

  // Terminar sessão
  wrap.querySelector("#sair-conta").onclick = () => {
    sessao.sair();
    toast("Sessão terminada");
    location.hash = "#/";
    desenharHeader();
  };
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
    u.tipo === "PROPRIETARIO" || u.tipo === "ADMIN"
      ? ["#/gestao", "Gestão"]
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
