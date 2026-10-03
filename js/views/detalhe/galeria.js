import { $, $$, esc } from "../../utils.js";
import { urlFoto } from "../../components/cards.js";

export function templateGaleria(f, titulo) {
  if (!f.length) return "";

  return `
    <div class="gallery">
      <div id="galeria" class="gallery__track">
        ${f
          .map(
            (src, i) => `
          <div class="gallery__slide">
            <img src="${esc(urlFoto(src))}" alt="${esc(titulo)} — foto ${i + 1}"
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
    }`;
}

export function ligarGaleria() {
  const g = $("#galeria");
  const contador = $("#foto-actual");
  if (!g) return;

  if (contador) {
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
}
