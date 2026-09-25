import { esc } from "../utils.js";
import { CONFIG } from "../config.js";

const ICONES = {
  local:
    '<path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  quarto:
    '<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 18h18"/><path d="M7 10V7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3"/>',
  banho:
    '<path d="M4 12h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M7 12V6a2 2 0 1 1 4 0"/>',
  area: '<path d="M4 4h16v16H4z"/><path d="M9 4v16M4 9h16"/>',
};

/* Ícone SVG — tamanho em pixels, sem classes Tailwind */
const ico = (d, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true"
        style="flex-shrink:0">${d}</svg>`;

const SELO = `
  <span class="badge--verified">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1.6l2.5 2.1 3.2-.4 1 3.1 2.8 1.6-1.1 3 1.1 3-2.8 1.6-1 3.1-3.2-.4L12 22.4l-2.5-2.1-3.2.4-1-3.1L2.5 16l1.1-3-1.1-3 2.8-1.6 1-3.1 3.2.4z"/>
      <path d="M10.6 15.4l-2.9-2.9 1.3-1.3 1.6 1.6 4-4 1.3 1.3z" fill="#fff"/>
    </svg>
    Verificado
  </span>`;

/* Converte qualquer valor (número, string, UUID) num inteiro estável */
function hashCode(str) {
  let hash = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function placeholder(seed = 1, texto = "Sem foto") {
  const n = typeof seed === "number" ? seed : hashCode(seed);
  const tons = [
    ["#DDE7E1", "#C3D6CB"],
    ["#E2E6EA", "#CBD4DB"],
    ["#E7E4DD", "#D3CEC2"],
    ["#DEE4EC", "#C6D0DD"],
  ];
  const [a, b] = tons[Math.abs(n) % tons.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="800" height="600" fill="url(#g)"/>
    <g fill="none" stroke="#8A9A90" stroke-width="14" stroke-linejoin="round" stroke-linecap="round">
      <path d="M250 300 L400 190 L550 300"/><path d="M290 300 v130 h220 v-130"/><path d="M370 430 v-80 h60 v80"/>
    </g>
    <text x="400" y="510" text-anchor="middle" font-family="sans-serif"
          font-size="30" fill="#6E7E74">${texto}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/* Resolve a URL completa de uma foto */
export function urlFoto(src) {
  if (!src) return src;
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  return `${CONFIG.API_BASE}${src}`;
}

export const fotos = (im) =>
  Array.isArray(im.fotos) && im.fotos.length
    ? im.fotos
    : [placeholder(im.id || 1, im.zona || "Sem foto")];

export function precoFormatado(v, transacao) {
  const base = `${CONFIG.MOEDA} ${(Number(v) || 0).toLocaleString("pt-AO", { maximumFractionDigits: 0 })}`;
  return transacao === "ARRENDAMENTO"
    ? `${base}<span class="preco-mes">/mês</span>`
    : base;
}

/** CARD PRINCIPAL */
export function cardImovel(im) {
  const f = fotos(im);
  const municipioNome = im.municipio?.nome || im.municipio || "";

  return `
  <a href="#/imovel/${encodeURIComponent(im.id)}" class="property-card">
    <div class="property-card__media">
      <img src="${esc(urlFoto(f[0]))}" alt="${esc(im.titulo)}" loading="lazy">
      <div class="property-card__badges">
        <span class="badge">${im.tipoTransacao === "VENDA" ? "À venda" : "Arrendar"}</span>
        ${im.verificado ? SELO : ""}
      </div>
    </div>
    <div class="property-card__body">
      <p class="property-card__price">${precoFormatado(im.preco, im.tipoTransacao)}</p>
      <h3 class="property-card__title">${esc(im.titulo)}</h3>
      <p class="property-card__zone">
        ${ico(ICONES.local, 14)}
        ${esc(im.zona)}${municipioNome ? ", " + esc(municipioNome) : ""}
      </p>
      <div class="property-card__meta">
        ${im.quartos ? `<span>${ico(ICONES.quarto, 14)} ${im.quartos}</span>` : ""}
        ${im.banheiros ? `<span>${ico(ICONES.banho, 14)} ${im.banheiros}</span>` : ""}
        ${im.area ? `<span>${ico(ICONES.area, 14)} ${im.area} m²</span>` : ""}
      </div>
    </div>
  </a>`;
}

export function grelhaImoveis(lista) {
  return `<div class="property-grid">${lista.map(cardImovel).join("")}</div>`;
}

export function skeletonCards(n = 6) {
  return `<div class="property-grid">
    ${Array.from({ length: n })
      .map(
        () => `
      <div class="skeleton-card">
        <div class="skeleton-card__media skel"></div>
        <div class="skeleton-card__body">
          <div class="skeleton-line sm skel"></div>
          <div class="skeleton-line lg skel"></div>
          <div class="skeleton-line sm skel"></div>
        </div>
      </div>`,
      )
      .join("")}
  </div>`;
}

export function capaMini(seed, size = 80) {
  const n = typeof seed === "number" ? seed : Math.abs(hashCode(seed));
  const tons = [
    ["#DDE7E1", "#C3D6CB"],
    ["#E2E6EA", "#CBD4DB"],
    ["#E7E4DD", "#D3CEC2"],
    ["#DEE4EC", "#C6D0DD"],
  ];
  const [a, b] = tons[n % tons.length];
  return `<div style="width:${size}px;height:${size}px;border-radius:var(--radius-md);overflow:hidden;flex-shrink:0;background:linear-gradient(135deg,${a},${b})">
    <svg viewBox="0 0 24 24" style="width:100%;height:100%;padding:1.25rem" fill="none"
         stroke="#8A9A90" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">
      <path d="M4 11l8-6 8 6"/><path d="M6 11v8h12v-8"/><path d="M10 19v-5h4v5"/>
    </svg>
  </div>`;
}
