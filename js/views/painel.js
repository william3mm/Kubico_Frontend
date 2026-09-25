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
const DEMO_MEUS = [
  {
    id: 1,
    titulo: "T3 novo com varanda ampla",
    zona: "Talatona",
    preco: 450000,
    transacao: "arrendar",
    estado: "publicado",
    verificado: true,
    vistas: 842,
    contactos: 23,
  },
  {
    id: 2,
    titulo: "Casa térrea com quintal murado",
    zona: "Benfica",
    preco: 38000000,
    transacao: "comprar",
    estado: "em-verificacao",
    verificado: false,
    vistas: 196,
    contactos: 4,
  },
  {
    id: 8,
    titulo: "Loja com armazém nas traseiras",
    zona: "Cacuaco",
    preco: 600000,
    transacao: "arrendar",
    estado: "arrendado",
    verificado: true,
    vistas: 1310,
    contactos: 41,
  },
];

const ESTADOS = {
  publicado: { txt: "Publicado", cls: "badge--verified" },
  "em-verificacao": { txt: "Em verificação", cls: "badge--warn" },
  pausado: { txt: "Pausado", cls: "badge--line" },
  arrendado: { txt: "Arrendado", cls: "badge--line" },
  vendido: { txt: "Vendido", cls: "badge--line" },
};

const CONTACTOS_DEMO = [
  {
    nome: "Ana Pedro",
    imovel: "T3 novo com varanda ampla",
    quando: "Há 2 horas",
    tel: "923111222",
    nova: true,
  },
  {
    nome: "Carlos Neto",
    imovel: "Casa térrea com quintal murado",
    quando: "Ontem",
    tel: "923777888",
    nova: false,
  },
  {
    nome: "Sónia Dias",
    imovel: "T3 novo com varanda ampla",
    quando: "15 Set",
    tel: "924333111",
    nova: false,
  },
];

export async function vistaPainel(aba = "imoveis") {
  const app = $("#app");
  const u = sessao.user || { nome: "Proprietário" };

  let meus = DEMO_MEUS;
  try {
    const r = await api.meusImoveis();
    meus = r.imoveis || r.data || meus;
  } catch {}

  const activos = meus.filter((i) => i.estado === "publicado").length;
  const vistas = meus.reduce((s, i) => s + (Number(i.vistas) || 0), 0);
  const contactos = meus.reduce((s, i) => s + (Number(i.contactos) || 0), 0);

  const abas = [
    ["imoveis", "Meus imóveis"],
    ["contactos", "Contactos"],
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
            Proprietário · ${meus.length} ${meus.length === 1 ? "anúncio" : "anúncios"}
          </p>
        </div>
        <a href="#/publicar" class="btn btn-primary perfil-hero__cta hide-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Publicar
        </a>
      </div>

      ${
        !u.documentosOk
          ? `
        <div class="callout callout--warn">
          <p class="callout__title">Falta enviar os documentos</p>
          <p class="callout__text">
            Envia o documento de identidade e a prova de propriedade para
            os anúncios receberem o selo de verificado.
          </p>
          <button class="callout__cta">Enviar documentos</button>
        </div>`
          : ""
      }

      <div class="stats-grid">
        ${[
          [activos, "anúncios activos"],
          [vistas.toLocaleString("pt-AO"), "visualizações"],
          [contactos, "contactos"],
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
            <a href="#/painel?aba=${k}" class="${aba === k ? "is-on" : ""}">${l}</a>`,
          )
          .join("")}
      </div>

      <div class="list-rows">
        ${
          aba === "contactos"
            ? blocoContactos()
            : aba === "dados"
              ? blocoDados(u)
              : blocoMeusImoveis(meus)
        }
      </div>

      <a href="#/publicar" class="fab" aria-label="Publicar imóvel">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </a>
    </div>`;

  if (aba === "dados") ligarFormDados();
  ligarAccoes();
}

/* ---------- Blocos ---------- */

const blocoMeusImoveis = (lista) =>
  lista.length
    ? lista
        .map((im) => {
          const e = ESTADOS[im.estado] || ESTADOS["publicado"];
          const fechado = im.estado === "arrendado" || im.estado === "vendido";

          return `
      <div class="row-card" style="flex-direction:column;padding:var(--space-3)">
        <div style="display:flex;gap:var(--space-3)">
          ${capaMini(im.id)}
          <div class="row-card__body">
            <span class="badge ${e.cls}">${e.txt}</span>
            <p class="row-card__title" style="margin-top:.375rem">${esc(im.titulo)}</p>
            <p style="font-weight:800;line-height:1.2">
              ${kz(im.preco)}${
                im.transacao === "arrendar"
                  ? '<span class="muted" style="font-weight:500;font-size:.75rem">/mês</span>'
                  : ""
              }
            </p>
            <p class="row-card__meta">
              ${im.vistas || 0} vistas · ${im.contactos || 0} contactos
            </p>
          </div>
        </div>
        <div class="row-card__actions">
          <a href="#/imovel/${esc(im.id)}" class="btn btn-ghost">Ver</a>
          <button data-editar="${esc(im.id)}" class="btn btn-ghost">Editar</button>
          ${
            fechado
              ? `<button data-reactivar="${esc(im.id)}" class="btn btn-ghost">Reactivar</button>`
              : `<button data-pausar="${esc(im.id)}" class="btn btn-ghost">${
                  im.estado === "pausado" ? "Retomar" : "Pausar"
                }</button>`
          }
        </div>
      </div>`;
        })
        .join("")
    : empty({
        titulo: "Ainda não tens anúncios",
        texto: "Publica o primeiro imóvel e começa a receber contactos.",
        cta: '<a href="#/publicar" class="btn btn-primary">Publicar imóvel</a>',
      });

const blocoContactos = () => `
  <div class="list-rows">
    ${CONTACTOS_DEMO.map(
      (c) => `
      <div class="contact-row">
        <span class="avatar avatar--md">${esc(iniciais(c.nome))}</span>
        <div class="contact-row__body">
          <p class="contact-row__name">
            ${esc(c.nome)}
            ${c.nova ? '<span class="contact-row__dot"></span>' : ""}
          </p>
          <p class="contact-row__sub">${esc(c.imovel)}</p>
          <p class="contact-row__sub">${esc(c.quando)}</p>
        </div>
        <a href="https://wa.me/244${esc(c.tel)}" target="_blank" rel="noopener"
           class="btn btn-primary" style="border-radius:var(--radius-md);min-height:44px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.8 9.8 0 0 0 4.68 1.2c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2m5.72 13.9c-.24.68-1.4 1.3-1.93 1.35-.5.05-.96.23-2.7-.56-2.1-.95-3.42-3.14-3.53-3.28-.1-.15-.85-1.16-.85-2.22 0-1.05.55-1.57.75-1.79.2-.22.43-.27.57-.27h.41c.13 0 .32-.05.49.38.17.44.6 1.5.65 1.6.05.11.08.24.01.38-.07.15-.13.24-.26.38l-.2.23c-.13.13-.27.28-.12.53.15.25.66 1.1 1.42 1.78.97.87 1.5 1.02 1.74 1.14.18.1.33.08.46-.05.15-.15.53-.62.68-.83.14-.22.29-.18.48-.11.2.07 1.24.6 1.46.71.21.11.35.16.4.25.05.1.05.56-.19 1.23"/>
          </svg>
          Responder
        </a>
      </div>`,
    ).join("")}

    <p class="muted text-xs center" style="line-height:1.6;padding-inline:var(--space-6)">
      Os contactos ficam aqui durante 90 dias. Liga o endpoint de contactos
      para ver os teus dados reais.
    </p>
  </div>`;

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
      <legend>Verificação</legend>

      <div style="display:flex;justify-content:space-between;align-items:center;gap:var(--space-3)">
        <div>
          <p style="font-weight:600;font-size:.875rem">Documento de identidade</p>
          <p class="muted text-xs">Bilhete de identidade ou passaporte</p>
        </div>
        <span class="badge ${u.documentosOk ? "badge--verified" : "badge--warn"}">
          ${u.documentosOk ? "Entregue" : "Em falta"}
        </span>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;gap:var(--space-3);margin-top:var(--space-3)">
        <div>
          <p style="font-weight:600;font-size:.875rem">Prova de propriedade</p>
          <p class="muted text-xs">Escritura, contrato ou declaração</p>
        </div>
        <span class="badge ${u.documentosOk ? "badge--verified" : "badge--warn"}">
          ${u.documentosOk ? "Entregue" : "Em falta"}
        </span>
      </div>

      <label class="field" style="margin-top:var(--space-4)">
        <span class="field__label">Enviar ou substituir documentos</span>
        <input type="file" accept="image/*,application/pdf" multiple class="input">
      </label>
    </fieldset>

    <fieldset class="fieldset">
      <legend>Avisos</legend>

      ${[
        ["Novo contacto num anúncio meu", true],
        ["Anúncio aprovado ou recusado", true],
        ["Resumo semanal de visualizações", false],
      ]
        .map(
          ([l, on], i) => `
          <label class="check-row" style="justify-content:space-between">
            <span>${l}</span>
            <input type="checkbox" name="aviso${i}" ${on ? "checked" : ""}>
          </label>`,
        )
        .join("")}
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
  $$("[data-pausar]").forEach(
    (b) => (b.onclick = () => toast("Anúncio pausado")),
  );
  $$("[data-reactivar]").forEach(
    (b) => (b.onclick = () => toast("Anúncio reactivado")),
  );
  $$("[data-editar]").forEach(
    (b) =>
      (b.onclick = () =>
        (location.hash = "#/publicar?editar=" + b.dataset.editar)),
  );
}
