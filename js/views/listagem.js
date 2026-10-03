import { $, $$, esc } from "../utils.js";
import { grelhaImoveis, skeletonCards } from "../components/cards.js";
import { empty } from "../components/feedback.js";
import { listarImoveis } from "../api.js";
import loggerFront from "../../logs/logger.js";

/* ─── Layout HTML (recebe o estado actual) ─── */
function layout(f, dados) {
  const { carregado = false, imoveis = [], total = 0 } = dados;

  const activos = [
    f.q,
    f.tipoTransacao,
    f.tipo,
    f.quartos,
    f.preco_max,
    f.municipio_id,
  ].filter(Boolean).length;

  const titulo =
    f.tipoTransacao === "VENDA"
      ? "Imóveis à venda"
      : f.tipoTransacao === "ARRENDAMENTO"
        ? "Imóveis para arrendar"
        : "Todos os imóveis";

  return `
    <div class="fade-in">
      <header class="listing-head">
        <h1 class="listing-title">${titulo}</h1>
        <p class="listing-count">
          ${carregado ? `${total} ${total === 1 ? "imóvel" : "imóveis"}` : "A carregar…"}
        </p>
      </header>

      <div class="filters-bar">
        <button id="abrir-filtros" class="chip chip--tap">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.9" stroke-linecap="round" style="margin-right:.375rem">
            <path d="M4 6h16M7 12h10M10 18h4"/>
          </svg>
          Filtros
          ${activos ? `<span class="chip__count">${activos}</span>` : ""}
        </button>

        ${[
          ["", "Tudo"],
          ["ARRENDAMENTO", "Arrendar"],
          ["VENDA", "Comprar"],
        ]
          .map(
            ([v, l]) => `
            <button data-set="tipoTransacao" data-val="${v}"
                    class="chip chip--tap ${f.tipoTransacao === v ? "is-on" : ""}">${l}</button>`,
          )
          .join("")}

        ${activos ? `<a href="#/imoveis" class="chip chip--tap">Limpar</a>` : ""}
      </div>

      <div class="listing-results">
        ${
          carregado
            ? imoveis.length
              ? grelhaImoveis(imoveis)
              : empty({
                  titulo: "Nenhum imóvel com estes filtros",
                  texto:
                    "Tenta alargar a zona, o número de quartos ou o preço máximo.",
                  cta: '<a href="#/imoveis" class="btn btn-ghost">Limpar filtros</a>',
                })
            : skeletonCards(6)
        }
      </div>
    </div>

    <!-- Painel de filtros -->
    <div id="sheet" class="sheet" role="dialog" aria-modal="true" aria-label="Filtros">
      <div class="sheet__backdrop" data-fechar></div>
      <div class="sheet__panel">
        <div class="sheet__head">
          <h2 class="sheet__title">Filtros</h2>
          <button class="sheet__close" data-fechar aria-label="Fechar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        <form id="form-filtros">
          <div class="filter-field">
            <span class="field__label">Transacção</span>
            <div class="option-grid cols-3">
              ${[
                ["", "Tudo"],
                ["ARRENDAMENTO", "Arrendar"],
                ["VENDA", "Comprar"],
              ]
                .map(
                  ([v, l]) => `
                  <label class="option ${f.tipoTransacao === v ? "is-on" : ""}">
                    <input class="sr-only" type="radio" name="tipoTransacao" value="${v}"
                           ${f.tipoTransacao === v ? "checked" : ""}>${l}
                  </label>`,
                )
                .join("")}
            </div>
          </div>

          <div class="filter-field">
            <label class="field">
              <span class="field__label">Tipo de imóvel</span>
              <select name="tipo" class="select">
                <option value="">Todos os tipos</option>
                ${[
                  "APARTAMENTO",
                  "CASA",
                  "VILA",
                  "TERRENO",
                  "COMERCIAL",
                  "QUARTO",
                  "ARMAZEM",
                ]
                  .map((t) => {
                    const labels = {
                      APARTAMENTO: "Apartamento",
                      CASA: "Casa",
                      VILA: "Vila",
                      TERRENO: "Terreno",
                      COMERCIAL: "Comercial",
                      QUARTO: "Quarto",
                      ARMAZEM: "Armazém",
                    };
                    return `<option value="${t}" ${f.tipo === t ? "selected" : ""}>${labels[t]}</option>`;
                  })
                  .join("")}
              </select>
            </label>
          </div>

          <div class="filter-field">
            <span class="field__label">Quartos (mínimo)</span>
            <div class="option-grid cols-5">
              ${["", "1", "2", "3", "4"]
                .map(
                  (v) => `
                <label class="option ${f.quartos === v ? "is-on" : ""}">
                  <input class="sr-only" type="radio" name="quartos" value="${v}"
                         ${f.quartos === v ? "checked" : ""}>${v === "" ? "Qq" : v + "+"}
                </label>`,
                )
                .join("")}
            </div>
          </div>

          <div class="filter-field">
            <label class="field">
              <span class="field__label">Preço máximo (Kz)</span>
              <input name="preco_max" type="number" inputmode="numeric" min="0" step="10000"
                     value="${esc(f.preco_max)}" placeholder="ex: 500000" class="input">
            </label>
          </div>

          <div class="filter-actions">
            <a href="#/imoveis" class="btn btn-ghost">Limpar</a>
            <button class="btn btn-primary">Ver resultados</button>
          </div>
        </form>
      </div>
    </div>`;
}

/* ─── Ligar eventos ─── */
function ligarEventos(f, params) {
  const sheet = $("#sheet");
  const abrir = () => {
    sheet.classList.add("is-open");
    document.body.classList.add("scroll-lock");
  };
  const fechar = () => {
    sheet.classList.remove("is-open");
    document.body.classList.remove("scroll-lock");
  };

  $("#abrir-filtros").onclick = abrir;
  $$("[data-fechar]", sheet).forEach((b) => (b.onclick = fechar));

  // Chips de transacção
  $$("[data-set]").forEach(
    (b) =>
      (b.onclick = () => {
        const p = new URLSearchParams(params);
        b.dataset.val
          ? p.set(b.dataset.set, b.dataset.val)
          : p.delete(b.dataset.set);
        location.hash = "#/imoveis" + (p.toString() ? "?" + p : "");
      }),
  );

  // Submissão do formulário
  $("#form-filtros").addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(e.target);
    const p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    for (const [k, v] of d.entries()) if (v) p.set(k, v);
    fechar();
    location.hash = "#/imoveis" + (p.toString() ? "?" + p : "");
  });

  // Estado visual dos botões tipo rádio
  $$("#form-filtros .option input").forEach((inp) => {
    inp.addEventListener("change", () => {
      $$(`#form-filtros .option input[name="${inp.name}"]`).forEach((i) => {
        i.closest(".option").classList.toggle("is-on", i.checked);
      });
    });
  });
}

/* ─── Vista principal ─── */
export async function vistaListagem(params) {
  const app = $("#app");

  // 1. Extrair filtros do URL
  const f = {
    q: params.get("q") || "",
    tipoTransacao: params.get("tipoTransacao") || "",
    tipo: params.get("tipo") || "",
    quartos: params.get("quartos") || "",
    preco_max: params.get("preco_max") || "",
    municipio_id: params.get("municipio_id") || "",
    page: params.get("page") || "1",
    limit: params.get("limit") || "20",
  };

  // 2. Render inicial (skeleton)
  app.innerHTML = layout(f, { carregado: false });

  // 3. Ligar eventos imediatamente
  ligarEventos(f, params);

  // 4. Pedir ao backend
  try {
    loggerFront.debug("A carregar listagem de imóveis", {
      filtros: f,
    });

    const resultado = await listarImoveis(f);

    loggerFront.info("Listagem carregada", {
      total: resultado.total || 0,
      mostrados: resultado.imoveis?.length || 0,
    });

    app.innerHTML = layout(f, {
      carregado: true,
      imoveis: resultado.imoveis || [],
      total: resultado.total || 0,
    });

    ligarEventos(f, params);
  } catch (erro) {
    loggerFront.error("Falha ao carregar listagem", erro, {
      rota: "vistaListagem",
      filtros: f,
      status: erro?.status,
    });

    app.innerHTML = `
      <div class="fade-in">
        <header class="listing-head">
          <h1 class="listing-title">Todos os imóveis</h1>
          <p class="listing-count">Erro ao carregar</p>
        </header>
        ${empty({
          titulo: "Não foi possível carregar os imóveis",
          texto: "Verifica a ligação ao servidor.",
          cta: '<a href="#/imoveis" class="btn btn-primary">Tentar outra vez</a>',
        })}
      </div>`;

    ligarEventos(f, params);
  }
}
