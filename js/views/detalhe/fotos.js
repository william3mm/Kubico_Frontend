import { $, $$, esc, toast, ocupado } from "../../utils.js";
import { urlFoto, placeholder } from "../../components/cards.js";
import { api } from "../../api.js";
import loggerFront from "../../../logs/logger.js";
import { abrirModal } from "../../components/modal.js";

const MAX_FOTOS = 10;

/* ═══════════════════════════════════════════════════════════
   TEMPLATE
   ═══════════════════════════════════════════════════════════ */
export function templateFotos(im, { ehDono }) {
  if (!ehDono) return "";

  const fotos = Array.isArray(im.fotos) ? im.fotos : [];

  return `
    <section class="fotos-gestao" id="fotos-gestao">
      <header class="fotos-gestao__header">
        <h2 class="fotos-gestao__titulo">
          Fotos
          <span class="muted text-sm" style="font-weight:500">
            (${fotos.length}/${MAX_FOTOS})
          </span>
        </h2>
        <p class="muted text-sm" style="line-height:1.6">
          A primeira foto é a capa. Arrasta para reordenar.
        </p>
      </header>

      <div class="fotos-grid" id="fotos-grid">
        ${fotos.map((f, i) => cardFoto(f, i, fotos.length)).join("")}

        ${
          fotos.length < MAX_FOTOS
            ? `<label class="foto-add" id="foto-add">
                 <input type="file" accept="image/jpeg,image/png,image/webp"
                        multiple hidden id="foto-input">
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="1.6"
                      stroke-linecap="round" stroke-linejoin="round">
                   <path d="M12 5v14M5 12h14"/>
                 </svg>
                 <span>Adicionar</span>
               </label>`
            : ""
        }
      </div>

      <div class="fotos-gestao__progresso" id="fotos-progresso" hidden></div>
    </section>`;
}

function cardFoto(url, i, total) {
  const nome = nomeFoto(url);

  return `
    <div class="foto-card ${i === 0 ? "foto-card--capa" : ""}"
         data-foto="${esc(url)}"
         draggable="true">
      <img src="${esc(urlFoto(url))}" alt="Foto ${i + 1}" loading="lazy">

      ${i === 0 ? `<span class="foto-card__badge">Capa</span>` : ""}

      <button type="button" class="foto-card__remover"
              data-remover="${esc(nome)}"
              aria-label="Remover foto ${i + 1}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.4"
             stroke-linecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>`;
}

function nomeFoto(url) {
  // "/uploads/imoveis/abc.webp" → "abc.webp"
  return String(url).split("/").pop();
}

/* ═══════════════════════════════════════════════════════════
   LIGAÇÕES
   ═══════════════════════════════════════════════════════════ */
export function ligarFotos(im, { onMudar }) {
  const grid = $("#fotos-grid");
  if (!grid) return;

  const input = $("#foto-input");
  if (input) {
    input.addEventListener("change", (e) => {
      const ficheiros = [...e.target.files];
      if (ficheiros.length) {
        adicionar(im, ficheiros, onMudar);
        input.value = "";
      }
    });
  }

  // Remover
  $$("[data-remover]", grid).forEach((b) => {
    b.onclick = async (e) => {
      e.stopPropagation();
      const nome = b.dataset.remover;

      const ok = await abrirModal({
        titulo: "Remover esta foto?",
        descricao: "A foto é apagada permanentemente do servidor.",
        confirmar: "Remover",
        cancelar: "Cancelar",
        perigoso: true,
      });

      if (!ok) return;

      b.disabled = true;

      try {
        await api.apagarFoto(im.id, nome);
        toast("Foto removida");
        loggerFront.info("Foto removida", { id: im.id, nome });
        onMudar?.();
      } catch (err) {
        b.disabled = false;
        toast(err.dados?.erro || "Não foi possível remover.");
        loggerFront.error("Falha ao remover foto", err, { id: im.id, nome });
      }
    };
  });

  // Drag & drop reordenação
  ligarDragDrop(grid, im, onMudar);
}

/* ═══════════════════════════════════════════════════════════
   ADICIONAR
   ═══════════════════════════════════════════════════════════ */
async function adicionar(im, ficheiros, onMudar) {
  const progresso = $("#fotos-progresso");
  progresso.hidden = false;
  progresso.innerHTML = `<p class="muted text-sm">A enviar ${ficheiros.length} foto(s)…</p>`;

  const fd = new FormData();
  ficheiros.forEach((f) => fd.append("fotos", f));

  try {
    await api.adicionarFotos(im.id, fd);
    toast(`${ficheiros.length} foto(s) adicionada(s)`);
    loggerFront.info("Fotos adicionadas", {
      id: im.id,
      quantidade: ficheiros.length,
    });
    progresso.hidden = true;
    onMudar?.();
  } catch (err) {
    progresso.hidden = true;
    toast(err.dados?.erro || "Não foi possível adicionar as fotos.");
    loggerFront.error("Falha ao adicionar fotos", err, {
      id: im.id,
      quantidade: ficheiros.length,
    });
  }
}

/* ═══════════════════════════════════════════════════════════
   DRAG & DROP (reordenar)
   ═══════════════════════════════════════════════════════════ */
function ligarDragDrop(grid, im, onMudar) {
  let origem = null;

  $$(".foto-card", grid).forEach((card) => {
    card.addEventListener("dragstart", (e) => {
      origem = card;
      card.classList.add("foto-card--a-arrastar");
      e.dataTransfer.effectAllowed = "move";
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("foto-card--a-arrastar");
      origem = null;
      $$(".foto-card", grid).forEach((c) =>
        c.classList.remove("foto-card--alvo"),
      );
    });

    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (card === origem) return;
      card.classList.add("foto-card--alvo");
    });

    card.addEventListener("dragleave", () => {
      card.classList.remove("foto-card--alvo");
    });

    card.addEventListener("drop", async (e) => {
      e.preventDefault();
      card.classList.remove("foto-card--alvo");
      if (!origem || origem === card) return;

      // Reorganiza no DOM
      const pai = card.parentNode;
      const posOrigem = [...pai.children].indexOf(origem);
      const posAlvo = [...pai.children].indexOf(card);

      if (posOrigem < posAlvo) {
        card.after(origem);
      } else {
        card.before(origem);
      }

      // Lê a nova ordem a partir do DOM (só fotos, ignora o botão "adicionar")
      const novaOrdem = $$(".foto-card", pai).map((c) => c.dataset.foto);

      // Actualiza UI (capa passa a ser o primeiro)
      $$(".foto-card", pai).forEach((c, i) => {
        c.classList.toggle("foto-card--capa", i === 0);
        const badge = c.querySelector(".foto-card__badge");
        if (i === 0 && !badge) {
          c.insertAdjacentHTML(
            "beforeend",
            `<span class="foto-card__badge">Capa</span>`,
          );
        } else if (i > 0 && badge) {
          badge.remove();
        }
      });

      // Persiste no backend
      try {
        await api.reordenarFotos(im.id, novaOrdem);
        toast("Ordem guardada");
        loggerFront.info("Fotos reordenadas", { id: im.id });
        onMudar?.();
      } catch (err) {
        toast(err.dados?.erro || "Não foi possível guardar a ordem.");
        loggerFront.error("Falha ao reordenar", err, { id: im.id });
        onMudar?.(); // recarrega para voltar ao estado real
      }
    });
  });
}
