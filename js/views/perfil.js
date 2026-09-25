import { api } from "../api.js";
import { sessao, sairSessao } from "../state.js";
import {
  $,
  $$,
  esc,
  kz,
  iniciais,
  toast,
  ocupado,
  caixaErro,
  erroCaixa,
} from "../utils.js";
import { capaMini } from "../components/cards.js";
import { empty } from "../components/feedback.js";

/* Dados de exemplo — usados quando a API ainda não responde */
const DEMO = {
  favoritos: [
    {
      id: 1,
      titulo: "T3 novo com varanda ampla",
      zona: "Talatona",
      preco: 450000,
      transacao: "arrendar",
      verificado: true,
    },
    {
      id: 5,
      titulo: "Vila com piscina no Miramar",
      zona: "Miramar",
      preco: 1800000,
      transacao: "arrendar",
      verificado: true,
    },
    {
      id: 3,
      titulo: "T2 mobilado perto do centro",
      zona: "Alvalade",
      preco: 280000,
      transacao: "arrendar",
      verificado: false,
    },
  ],
  visitas: [
    {
      id: "v1",
      imovel: "T3 novo com varanda ampla",
      zona: "Talatona",
      data: "Sábado, 19 Set · 10:00",
      estado: "confirmada",
    },
    {
      id: "v2",
      imovel: "T2 mobilado perto do centro",
      zona: "Alvalade",
      data: "Segunda, 21 Set · 16:30",
      estado: "pendente",
    },
  ],
};

export async function vistaPerfil(aba = "guardados") {
  const app = $("#app");
  const u = sessao.user || { nome: "Visitante" };

  let favoritos = DEMO.favoritos;
  let visitas = DEMO.visitas;

  try {
    const [f, v] = await Promise.all([api.favoritos(), api.visitas()]);
    favoritos = f.imoveis || f.favoritos || f.data || favoritos;
    visitas = v.visitas || v.data || visitas;
  } catch {}

  const abas = [
    ["guardados", "Guardados"],
    ["visitas", "Visitas"],
    ["dados", "Dados"],
  ];

  app.innerHTML = `
    <div class="fade-in">
      <div class="perfil-hero">
        <span class="avatar avatar--lg">${esc(iniciais(u.nome))}</span>
        <div class="perfil-hero__info">
          <div class="detail-badges" style="margin-bottom:.25rem">
            <h1 class="perfil-hero__name">${esc(u.nome)}</h1>
            ${u.verificado ? '<span class="badge--verified">Verificado</span>' : ""}
          </div>
          <p class="perfil-hero__sub">
            Procura casa · no Kubiko desde ${esc(u.desde || "2026")}
          </p>
        </div>
      </div>

      <div class="stats-grid">
        ${[
          [favoritos.length, "guardados"],
          [visitas.length, "visitas"],
          [
            u.orcamento ? kz(u.orcamento).replace("Kz ", "") : "—",
            "orçamento (Kz)",
          ],
        ]
          .map(
            ([v, l]) => `
            <div class="stat-card">
              <p class="stat-card__value">${esc(v)}</p>
              <p class="stat-card__label">${l}</p>
            </div>`,
          )
          .join("")}
      </div>

      <div class="tabs">
        ${abas
          .map(
            ([k, l]) => `
            <a href="#/perfil?aba=${k}" class="${aba === k ? "is-on" : ""}">${l}</a>`,
          )
          .join("")}
      </div>

      <div class="list-rows">
        ${
          aba === "visitas"
            ? blocoVisitas(visitas)
            : aba === "dados"
              ? blocoDados(u)
              : blocoGuardados(favoritos)
        }
      </div>
    </div>`;

  if (aba === "dados") ligarFormDados();
  ligarAccoes();
}

/* ---------- Blocos ---------- */

const blocoGuardados = (lista) =>
  lista.length
    ? lista
        .map(
          (im) => `
      <div class="row-card">
        ${capaMini(im.id)}
        <div class="row-card__body">
          <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap">
            <p style="font-weight:800;line-height:1.2">
              ${kz(im.preco)}${
                im.transacao === "arrendar"
                  ? '<span class="muted" style="font-weight:500;font-size:.75rem">/mês</span>'
                  : ""
              }
            </p>
            ${im.verificado ? '<span class="badge--verified">Verificado</span>' : ""}
          </div>
          <p class="row-card__title">${esc(im.titulo)}</p>
          <p class="row-card__meta">${esc(im.zona)}</p>
        </div>
        <button data-remover="${esc(im.id)}" class="btn-icon" aria-label="Remover dos guardados">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 20s-7-4.5-7-9.4A4.1 4.1 0 0 1 12 7a4.1 4.1 0 0 1 7 3.6C19 15.5 12 20 12 20z"/>
          </svg>
        </button>
      </div>`,
        )
        .join("")
    : empty({
        titulo: "Ainda não guardaste nenhum imóvel",
        texto: "Toca no coração de um anúncio para o ter aqui à mão.",
        cta: '<a href="#/imoveis" class="btn btn-primary">Ver imóveis</a>',
      });

const blocoVisitas = (lista) =>
  lista.length
    ? lista
        .map(
          (v) => `
      <div class="visit-card">
        <div class="visit-card__top">
          <div style="min-width:0">
            <p class="visit-card__title">${esc(v.imovel)}</p>
            <p class="visit-card__zone">${esc(v.zona)}</p>
            <p class="visit-card__when">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <rect x="3" y="5" width="18" height="16" rx="2"/>
                <path d="M8 3v4M16 3v4M3 11h18"/>
              </svg>
              ${esc(v.data)}
            </p>
          </div>
          <span class="badge ${v.estado === "confirmada" ? "badge--verified" : "badge--warn"}">
            ${v.estado === "confirmada" ? "Confirmada" : "À espera"}
          </span>
        </div>
        <div class="visit-card__actions">
          <button data-remarcar="${esc(v.id)}" class="btn">Remarcar</button>
          <button data-cancelar="${esc(v.id)}" class="btn">Cancelar</button>
        </div>
      </div>`,
        )
        .join("")
    : empty({
        titulo: "Sem visitas marcadas",
        texto: "Quando combinares uma visita pelo WhatsApp, ela aparece aqui.",
        cta: '<a href="#/imoveis" class="btn btn-primary">Procurar casa</a>',
      });

const blocoDados = (u) => `
  <form id="f-dados" class="form" novalidate>
    <fieldset class="fieldset">
      <legend>Os teus dados</legend>

      <label class="field">
        <span class="field__label">Nome</span>
        <input name="nome" value="${esc(u.nome || "")}" class="input">
      </label>

      <label class="field">
        <span class="field__label">Telefone (WhatsApp)</span>
        <input name="telefone" type="tel" inputmode="tel"
               value="${esc(u.telefone || "")}" class="input">
      </label>

      <label class="field">
        <span class="field__label">Email</span>
        <input name="email" type="email" value="${esc(u.email || "")}" class="input">
      </label>
    </fieldset>

    <fieldset class="fieldset">
      <legend>O que procuras</legend>

      <label class="field">
        <span class="field__label">Zonas de interesse</span>
        <input name="zonaProcura" value="${esc(u.zonaProcura || "")}"
               placeholder="Talatona, Benfica" class="input">
      </label>

      <label class="field">
        <span class="field__label">Orçamento por mês (Kz)</span>
        <input name="orcamento" type="number" inputmode="numeric"
               value="${esc(u.orcamento || "")}" placeholder="450000" class="input">
      </label>

      <p class="field__hint">
        Usamos isto para te avisar quando entrar um imóvel com o teu perfil.
      </p>
    </fieldset>

    ${caixaErro("erro-dados")}

    <button class="btn btn-primary btn-block">Guardar alterações</button>
    <button type="button" id="sair" class="btn btn-ghost btn-block">Terminar sessão</button>
  </form>`;

/* ---------- Acções ---------- */

function ligarFormDados() {
  const f = $("#f-dados");
  if (!f) return;

  $("#sair").onclick = () => {
    sairSessao();
    toast("Sessão terminada");
    location.hash = "#/entrar";
  };

  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries());

    if (!String(d.nome || "").trim() || !String(d.telefone || "").trim())
      return erroCaixa(
        "erro-dados",
        "O nome e o telefone não podem ficar vazios.",
      );

    const btn = f.querySelector('button[type="submit"], button:not([type])');
    const solta = ocupado(btn, "A guardar…");

    try {
      await api.perfil(d);
    } catch {}

    sessao.actualizar(d);
    solta();
    toast("Dados guardados");
  });
}

function ligarAccoes() {
  $$("[data-remover]").forEach(
    (b) =>
      (b.onclick = () => {
        b.closest(".row-card").remove();
        toast("Removido dos guardados");
      }),
  );
  $$("[data-cancelar]").forEach(
    (b) =>
      (b.onclick = () => {
        b.closest(".visit-card").remove();
        toast("Visita cancelada");
      }),
  );
  $$("[data-remarcar]").forEach(
    (b) => (b.onclick = () => toast("Combina a nova data pelo WhatsApp")),
  );
}
