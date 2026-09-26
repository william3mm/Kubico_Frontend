import { $, $$, esc, toast } from "../utils.js";
import {
  fotos,
  precoFormatado,
  skeletonCards,
  urlFoto,
} from "../components/cards.js";
import { empty } from "../components/feedback.js";
import { CONFIG } from "../config.js";
import { api } from "../api.js";

const ICONES = {
  local:
    '<path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  quarto:
    '<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 18h18"/><path d="M7 10V7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3"/>',
  banho:
    '<path d="M4 12h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M7 12V6a2 2 0 1 1 4 0"/>',
  area: '<path d="M4 4h16v16H4z"/><path d="M9 4v16M4 9h16"/>',
};

const ico = (d, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0">${d}</svg>`;

const SELO = `
  <span class="badge--verified">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1.6l2.5 2.1 3.2-.4 1 3.1 2.8 1.6-1.1 3 1.1 3-2.8 1.6-1 3.1-3.2-.4L12 22.4l-2.5-2.1-3.2.4-1-3.1L2.5 16l1.1-3-1.1-3 2.8-1.6 1-3.1 3.2.4z"/>
      <path d="M10.6 15.4l-2.9-2.9 1.3-1.3 1.6 1.6 4-4 1.3 1.3z" fill="#fff"/>
    </svg>
    Verificado
  </span>`;

const iconeWA = (size = 20) => `
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.8 9.8 0 0 0 4.68 1.2h.01c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2m5.72 13.9c-.24.68-1.4 1.3-1.93 1.35-.5.05-.96.23-2.7-.56-2.1-.95-3.42-3.14-3.53-3.28-.1-.15-.85-1.16-.85-2.22 0-1.05.55-1.57.75-1.79.2-.22.43-.27.57-.27h.41c.13 0 .32-.05.49.38.17.44.6 1.5.65 1.6.05.11.08.24.01.38-.07.15-.13.24-.26.38l-.2.23c-.13.13-.27.28-.12.53.15.25.66 1.1 1.42 1.78.97.87 1.5 1.02 1.74 1.14.18.1.33.08.46-.05.15-.15.53-.62.68-.83.14-.22.29-.18.48-.11.2.07 1.24.6 1.46.71.21.11.35.16.4.25.05.1.05.56-.19 1.23"/>
  </svg>`;

/* Resolve a rota do botão "Voltar" conforme a origem */
function rotaVoltar() {
  const anterior = sessionStorage.getItem("kubiko_rota_anterior") || "";

  // Vem da gestão → volta à lista de imóveis do painel
  if (anterior.startsWith("#/gestao")) {
    return { href: "#/gestao/imoveis", texto: "Voltar ao painel" };
  }

  // Fallback: pública
  return { href: "#/imoveis", texto: "Voltar aos imóveis" };
}

export async function vistaDetalhe(id) {
  const app = $("#app");

  // 1. Skeleton
  app.innerHTML = `<div style="padding-top:var(--space-6)">${skeletonCards(1)}</div>`;

  // 2. Pedir o imóvel ao backend
  let im;
  try {
    im = await api.buscarImovel(id);
  } catch (erro) {
    console.error("Erro ao carregar imóvel:", erro);

    app.innerHTML = `
      <div style="padding-top:var(--space-8)">
        ${empty({
          titulo: "Imóvel não encontrado",
          texto:
            "Este anúncio pode ter sido retirado ou já não está disponível.",
          cta: '<a href="#/imoveis" class="btn btn-primary">Ver outros imóveis</a>',
        })}
      </div>`;
    return;
  }

  if (!im) {
    app.innerHTML = `
      <div style="padding-top:var(--space-8)">
        ${empty({
          titulo: "Imóvel não encontrado",
          texto: "Este anúncio pode ter sido retirado.",
          cta: '<a href="#/imoveis" class="btn btn-primary">Ver outros imóveis</a>',
        })}
      </div>`;
    return;
  }

  const f = fotos(im);
  const infra = Array.isArray(im.infraestruturas) ? im.infraestruturas : [];
  const municipioNome = im.municipio?.nome || im.municipio || "";
  const voltar = rotaVoltar();

  // 3. Mensagem WhatsApp
  const msg = encodeURIComponent(
    `Olá! Vi este imóvel no ${CONFIG.SITE} e quero mais informações.\n\n` +
      `📌 Ref. #${im.id} — ${im.titulo}\n` +
      `📍 ${im.zona}${municipioNome ? ", " + municipioNome : ""}\n` +
      `💰 ${CONFIG.MOEDA} ${(Number(im.preco) || 0).toLocaleString("pt-AO")}${
        im.tipoTransacao === "ARRENDAMENTO" ? "/mês" : ""
      }\n` +
      `🔗 ${location.origin}${location.pathname}#/imovel/${im.id}\n\n` +
      `Está disponível para visita?`,
  );
  const wa = `https://wa.me/${CONFIG.WHATSAPP}?text=${msg}`;

  app.innerHTML = `
    <article class="detail fade-in">
      <a href="${esc(voltar.href)}" class="detail-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>
        ${esc(voltar.texto)}
      </a>

      <div class="gallery">
        <div id="galeria" class="gallery__track">
          ${f
            .map(
              (src, i) => `
            <div class="gallery__slide">
              <img src="${esc(urlFoto(src))}" alt="${esc(im.titulo)} — foto ${i + 1}"
                   ${i ? 'loading="lazy"' : ""}>
            </div>`,
            )
            .join("")}
        </div>
        ${
          f.length > 1
            ? `<div class="gallery__counter"><span id="foto-actual">1</span>/${f.length}</div>`
            : ""
        }
      </div>

      ${
        f.length > 1
          ? `
      <div class="gallery-thumbs">
        ${f
          .map(
            (src, i) => `
          <button data-ir="${i}" data-on="${i === 0}">
            <img src="${esc(urlFoto(src))}" alt="Ir para a foto ${i + 1}">
          </button>`,
          )
          .join("")}
      </div>`
          : ""
      }

      <div class="detail-grid">
        <div>
          <div class="detail-badges">
            <span class="badge badge--line">${
              im.tipoTransacao === "VENDA" ? "À venda" : "Arrendar"
            }</span>
            <span class="badge badge--line">${esc(im.tipo || "Imóvel")}</span>
            ${im.verificado ? SELO : ""}
            <span class="detail-ref">Ref. #${esc(im.id)}</span>
          </div>

          <h1 class="detail-title">${esc(im.titulo)}</h1>
          <p class="detail-zone">
            ${ico(ICONES.local, 16)}
            ${esc(im.zona)}${municipioNome ? ", " + esc(municipioNome) : ""}
          </p>

          <p class="detail-price">${precoFormatado(im.preco, im.tipoTransacao)}</p>

          <div class="detail-stats">
            ${[
              [
                ICONES.quarto,
                im.quartos,
                im.quartos === 1 ? "quarto" : "quartos",
              ],
              [
                ICONES.banho,
                im.banheiros,
                im.banheiros === 1 ? "banho" : "banhos",
              ],
              [ICONES.area, im.area, "m² de área"],
            ]
              .filter(([, v]) => v)
              .map(
                ([d, v, l]) => `
                <div class="stat">
                  <span class="muted">${ico(d, 20)}</span>
                  <p class="stat__value">${esc(v)}</p>
                  <p class="stat__label">${l}</p>
                </div>`,
              )
              .join("")}
          </div>

          ${
            im.descricao
              ? `
          <section class="detail-section">
            <h2>Sobre o imóvel</h2>
            <p>${esc(im.descricao)}</p>
          </section>`
              : ""
          }

          ${
            infra.length
              ? `
          <section class="detail-section">
            <h2>O que tem</h2>
            <div class="detail-features">
              ${infra
                .map(
                  (t) => `
                <span class="detail-feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2.4"
                       stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  ${esc(t)}
                </span>`,
                )
                .join("")}
            </div>
          </section>`
              : ""
          }

          <section class="verify-box">
            <h2>${im.verificado ? "Imóvel verificado" : "Imóvel ainda não verificado"}</h2>
            <p>${
              im.verificado
                ? "A nossa equipa confirmou a existência do imóvel e os documentos do proprietário. Mesmo assim, nunca faças pagamentos antes de visitar."
                : "Ainda não confirmámos este anúncio. Visita o imóvel e confirma os documentos antes de pagar qualquer valor."
            }</p>
          </section>
        </div>

        <aside class="contact-panel">
          <p class="contact-panel__price">${precoFormatado(im.preco, im.tipoTransacao)}</p>
          <p class="contact-panel__meta">Proprietário · Ref. #${esc(im.id)}</p>

          <a href="${wa}" target="_blank" rel="noopener"
             class="btn btn-primary btn-block" style="margin-top:var(--space-4)">
            ${iconeWA()} Contactar via WhatsApp
          </a>
          <button id="partilhar" class="btn btn-ghost btn-block">Partilhar anúncio</button>

          <p class="contact-panel__note">
            A conversa passa pelo WhatsApp da plataforma, com a referência
            do imóvel já escrita.
          </p>
        </aside>
      </div>
    </article>

    <div class="detail-cta">
      <div class="detail-cta__inner">
        <div class="detail-cta__price">
          <strong>${precoFormatado(im.preco, im.tipoTransacao)}</strong>
          <span>Ref. #${esc(im.id)} · ${esc(im.zona)}</span>
        </div>
        <a href="${wa}" target="_blank" rel="noopener" class="btn btn-primary">
          ${iconeWA(18)} WhatsApp
        </a>
      </div>
    </div>`;

  /* --- Galeria: contador + miniaturas --- */
  const g = $("#galeria");
  const contador = $("#foto-actual");
  if (g && contador) {
    g.addEventListener(
      "scroll",
      () => {
        const i = Math.round(g.scrollLeft / g.clientWidth);
        contador.textContent = i + 1;
        $$("[data-ir]").forEach(
          (b) => (b.dataset.on = String(Number(b.dataset.ir) === i)),
        );
      },
      { passive: true },
    );
  }
  $$("[data-ir]").forEach(
    (b) =>
      (b.onclick = () =>
        g.scrollTo({
          left: g.clientWidth * Number(b.dataset.ir),
          behavior: "smooth",
        })),
  );

  /* --- Partilhar --- */
  const partilhar = $("#partilhar");
  if (partilhar) {
    partilhar.onclick = async () => {
      const url = location.href;
      if (navigator.share) {
        try {
          await navigator.share({ title: im.titulo, url });
        } catch {}
      } else {
        await navigator.clipboard?.writeText(url);
        toast("Link copiado");
      }
    };
  }
}
