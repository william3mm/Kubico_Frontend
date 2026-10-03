import { $ } from "../../utils.js";
import { empty } from "../../components/feedback.js";
import { skeletonCards } from "../../components/cards.js";
import { carregarImovel } from "./carregar.js";
import { ehDono, linkWhatsApp } from "./helpers.js";
import { templateDetalhe } from "./layout.js";
import { ligarGaleria } from "./galeria.js";
import { ligarPartilhar } from "./contacto.js";

export async function vistaDetalhe(id) {
  const app = $("#app");

  // 1. Skeleton
  app.innerHTML = `<div style="padding-top:var(--space-6)">${skeletonCards(1)}</div>`;

  // 2. Carregar (público → privado)
  const im = await carregarImovel(id);

  if (!im) {
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

  // 3. Derivados
  const dono = ehDono(im);
  const wa = linkWhatsApp(im);

  // 4. Render
  app.innerHTML = templateDetalhe(im, { ehDono: dono, wa });

  // 5. Interacções
  ligarGaleria();
  if (!dono) ligarPartilhar(im);
}
