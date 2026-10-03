import { esc } from "../../utils.js";
import { fotos, precoFormatado } from "../../components/cards.js";
import { ICONES, ico, SELO } from "./icones.js";
import { templateGaleria } from "./galeria.js";
import { templateContacto, templateCtaFixo } from "./contacto.js";
import { rotaVoltar } from "./helpers.js";

export function templateDetalhe(im, { ehDono, wa }) {
  const f = fotos(im);
  const infra = Array.isArray(im.infraestruturas) ? im.infraestruturas : [];
  const municipioNome = im.municipio?.nome || im.municipio || "";
  const voltar = rotaVoltar();
  const soVisivelParaMim = ehDono && !im.verificado;

  return `
    <article class="detail fade-in">
      <a href="${esc(voltar.href)}" class="detail-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>
        ${esc(voltar.texto)}
      </a>

      ${
        soVisivelParaMim
          ? `<div class="alert alert--warn" style="margin-bottom:var(--space-4)">
               Este imóvel ainda está em verificação. Só tu o vês nesta página.
             </div>`
          : ""
      }

      ${templateGaleria(f, im.titulo)}

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

          ${templateStats(im)}
          ${templateDescricao(im)}
          ${templateInfra(infra)}
          ${templateVerifyBox(im)}
        </div>

        ${templateContacto(im, { ehDono, wa })}
      </div>
    </article>

    ${ehDono ? "" : templateCtaFixo(im, wa)}`;
}

function templateStats(im) {
  const stats = [
    [ICONES.quarto, im.quartos, im.quartos === 1 ? "quarto" : "quartos"],
    [ICONES.banho, im.banheiros, im.banheiros === 1 ? "banho" : "banhos"],
    [ICONES.area, im.area, "m² de área"],
  ].filter(([, v]) => v);

  if (!stats.length) return "";

  return `
    <div class="detail-stats">
      ${stats
        .map(
          ([d, v, l]) => `
        <div class="stat">
          <span class="muted">${ico(d, 20)}</span>
          <p class="stat__value">${esc(v)}</p>
          <p class="stat__label">${l}</p>
        </div>`,
        )
        .join("")}
    </div>`;
}

function templateDescricao(im) {
  if (!im.descricao) return "";
  return `
    <section class="detail-section">
      <h2>Sobre o imóvel</h2>
      <p>${esc(im.descricao)}</p>
    </section>`;
}

function templateInfra(infra) {
  if (!infra.length) return "";
  return `
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
    </section>`;
}

function templateVerifyBox(im) {
  return `
    <section class="verify-box">
      <h2>${im.verificado ? "Imóvel verificado" : "Imóvel ainda não verificado"}</h2>
      <p>${
        im.verificado
          ? "A nossa equipa confirmou a existência do imóvel e os documentos do proprietário. Mesmo assim, nunca faças pagamentos antes de visitar."
          : "Ainda não confirmámos este anúncio. Visita o imóvel e confirma os documentos antes de pagar qualquer valor."
      }</p>
    </section>`;
}
