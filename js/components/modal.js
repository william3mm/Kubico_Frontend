import { esc } from "../utils.js";

export function abrirModal({
  titulo,
  descricao = "",
  confirmar = "Confirmar",
  cancelar = "Cancelar",
  perigoso = false,
}) {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true">
        <h2 class="modal-titulo">${esc(titulo)}</h2>
        ${descricao ? `<p class="modal-descricao">${esc(descricao)}</p>` : ""}
        <div class="modal-accoes">
          <button type="button" class="btn btn-ghost" data-cancelar>
            ${esc(cancelar)}
          </button>
          <button type="button" class="btn ${perigoso ? "btn--danger" : "btn-primary"}"
                  data-confirmar>
            ${esc(confirmar)}
          </button>
        </div>
      </div>`;

    document.body.appendChild(backdrop);
    document.body.style.overflow = "hidden";

    const fechar = (valor) => {
      backdrop.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      resolve(valor);
    };

    const onKey = (e) => {
      if (e.key === "Escape") fechar(false);
      if (e.key === "Enter") fechar(true);
    };

    backdrop.querySelector("[data-confirmar]").onclick = () => fechar(true);
    backdrop.querySelector("[data-cancelar]").onclick = () => fechar(false);
    backdrop.onclick = (e) => {
      if (e.target === backdrop) fechar(false);
    };
    document.addEventListener("keydown", onKey);

    // Foco no botão confirmar
    requestAnimationFrame(() => {
      backdrop.querySelector("[data-confirmar]").focus();
    });
  });
}
