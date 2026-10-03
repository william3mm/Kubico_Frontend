import { CONFIG } from "./config.js";

/* ═══════════════════════════════════════════════════════════
   SELECÇÃO
   ═══════════════════════════════════════════════════════════ */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ═══════════════════════════════════════════════════════════
   FORMATAÇÃO
   ═══════════════════════════════════════════════════════════ */
export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export const kz = (v) =>
  `${CONFIG.MOEDA} ${(Number(v) || 0).toLocaleString("pt-AO", {
    maximumFractionDigits: 0,
  })}`;

export const iniciais = (n) =>
  String(n || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

/* ═══════════════════════════════════════════════════════════
   TOAST (notificação temporária)
   ═══════════════════════════════════════════════════════════ */
let toastTimer;
let toastHideTimer;

export function toast(texto, duracao = 3000) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    t.setAttribute("role", "status");
    t.setAttribute("aria-live", "polite");
    document.body.appendChild(t);
  }

  // Cancela timers anteriores (evita overlap entre toasts seguidos)
  clearTimeout(toastTimer);
  clearTimeout(toastHideTimer);

  // Remove estado de saída e mostra
  t.classList.remove("toast--sai");
  t.hidden = false;
  t.textContent = texto;

  // Força reflow para reiniciar a animação de entrada
  t.style.animation = "none";
  void t.offsetWidth;
  t.style.animation = "";

  // Agenda a saída suave
  toastTimer = setTimeout(() => {
    t.classList.add("toast--sai");

    // Só esconde depois de a animação de saída terminar
    toastHideTimer = setTimeout(() => {
      t.hidden = true;
      t.classList.remove("toast--sai");
    }, 240);
  }, duracao);
}

/* ═══════════════════════════════════════════════════════════
   ESTADO DE BOTÕES
   ═══════════════════════════════════════════════════════════ */
export function ocupado(btn, texto) {
  btn.disabled = true;
  btn.dataset.antes = btn.textContent;
  btn.textContent = texto;
  return () => {
    btn.disabled = false;
    btn.textContent = btn.dataset.antes;
  };
}

/* ═══════════════════════════════════════════════════════════
   CAIXAS DE ERRO (formulários)
   ═══════════════════════════════════════════════════════════ */
export const caixaErro = (id) =>
  `<div id="${id}" class="form-error" hidden></div>`;

export function erroCaixa(id, msg) {
  const b = document.getElementById(id);
  if (!b) return;
  b.textContent = msg;
  b.hidden = false;
}

/* ═══════════════════════════════════════════════════════════
   CAMPOS DE SENHA
   ═══════════════════════════════════════════════════════════ */
export function ligarOlhos(raiz = document) {
  raiz.querySelectorAll("[data-olho]").forEach(
    (b) =>
      (b.onclick = () => {
        const inp = raiz.querySelector(`[name="${b.dataset.olho}"]`);
        if (!inp) return;
        const ver = inp.type === "password";
        inp.type = ver ? "text" : "password";
        b.setAttribute("aria-label", ver ? "Esconder senha" : "Mostrar senha");
        const svg = b.querySelector("svg");
        if (svg) svg.style.opacity = ver ? "1" : ".55";
      }),
  );
}

export const campoSenha = (name, ph, autoc) => `
  <div class="pw-wrap">
    <input name="${name}" type="password" required autocomplete="${autoc}" placeholder="${ph}" class="input">
    <button type="button" data-olho="${name}" aria-label="Mostrar senha" class="pw-toggle">
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </button>
  </div>`;

export function forcaSenha(s) {
  let p = 0;
  if (s.length >= 8) p++;
  if (/[A-Z]/.test(s) && /[a-z]/.test(s)) p++;
  if (/\d/.test(s)) p++;
  if (/[^\w\s]/.test(s)) p++;
  return Math.min(p, 4);
}
