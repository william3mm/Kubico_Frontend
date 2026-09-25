import { $ } from "../utils.js";
import { grelhaImoveis, skeletonCards } from "../components/cards.js";
import { empty } from "../components/feedback.js";
import { listarImoveis } from "../api.js";

export async function vistaInicio() {
  const app = $("#app");

  // 1. Render inicial (skeleton)
  app.innerHTML = layout({ carregado: false });

  // 2. Pedir os últimos 9 imóveis ao backend
  try {
    const resultado = await listarImoveis({ limit: "9", page: "1" });

    const imoveis = resultado.imoveis || [];
    const zonas = [...new Set(imoveis.map((i) => i.zona).filter(Boolean))]
      .sort()
      .slice(0, 7);

    app.innerHTML = layout({ carregado: true, imoveis, zonas });

    ligarPesquisa();
  } catch (erro) {
    console.error("Erro ao carregar home:", erro);

    app.innerHTML = layout({ carregado: true, imoveis: [], zonas: [] });

    ligarPesquisa();
  }
}

/* ─── Layout ─── */
function layout({ carregado = false, imoveis = [], zonas = [] }) {
  return `
    <section class="home-hero fade-in">
      <h1 class="title-xl home-title">A tua próxima casa, sem intermediários.</h1>
      <p class="home-lead">
        Fala directamente com quem é dono do imóvel.
        Cada anúncio com selo foi confirmado pela nossa equipa.
      </p>

      <form id="pesquisa" class="search-bar">
        <label class="input-icon">
          <span class="sr-only">Zona ou tipo de imóvel</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"/>
            <circle cx="12" cy="10" r="2.6"/>
          </svg>
          <input name="q" type="search" autocomplete="off"
                 placeholder="Talatona, T3, vila…" class="input">
        </label>

        <label>
          <span class="sr-only">Tipo de transacção</span>
          <select name="tipoTransacao" class="select">
            <option value="">Arrendar ou comprar</option>
            <option value="ARRENDAMENTO">Arrendar</option>
            <option value="VENDA">Comprar</option>
          </select>
        </label>

        <button class="btn btn-primary">Procurar</button>
      </form>

      ${
        zonas.length
          ? `
        <div class="chip-row">
          ${zonas
            .map(
              (z) =>
                `<a href="#/imoveis?q=${encodeURIComponent(z)}" class="chip">${z}</a>`,
            )
            .join("")}
        </div>`
          : ""
      }
    </section>

    <section class="home-section">
      <div class="home-section__head">
        <h2 class="home-section__title">Publicados recentemente</h2>
        <a href="#/imoveis" class="home-section__link">Ver todos</a>
      </div>

      ${
        carregado
          ? imoveis.length
            ? grelhaImoveis(imoveis)
            : empty({
                titulo: "Ainda não há imóveis",
                texto: "Sê o primeiro a publicar.",
                cta: '<a href="#/publicar" class="btn btn-primary">Publicar imóvel</a>',
              })
          : skeletonCards(6)
      }
    </section>

    <section class="cta-panel">
      <h2>Tens uma casa para arrendar ou vender?</h2>
      <p>Publicas em poucos minutos pelo telemóvel. Os interessados falam contigo
         através do WhatsApp da plataforma.</p>
      <a href="#/publicar" class="btn btn-primary">Publicar imóvel</a>
    </section>`;
}

/* ─── Pesquisa ─── */
function ligarPesquisa() {
  const form = $("#pesquisa");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(e.target);
    const p = new URLSearchParams();
    if (d.get("q")) p.set("q", d.get("q"));
    if (d.get("tipoTransacao")) p.set("tipoTransacao", d.get("tipoTransacao"));
    location.hash = "#/imoveis" + (p.toString() ? "?" + p : "");
  });
}
