import { $, esc, toast } from "../../utils.js";
import { precoFormatado } from "../../components/cards.js";
import { iconeWA } from "./icones.js";

export function templateContacto(im, { ehDono, wa }) {
  if (ehDono) {
    return `
      <aside class="contact-panel">
        <p class="contact-panel__price">${precoFormatado(im.preco, im.tipoTransacao)}</p>
        <p class="contact-panel__meta">Proprietário · Ref. #${esc(im.id)}</p>

        <a href="#/publicar?editar=${esc(im.id)}"
           class="btn btn-primary btn-block" style="margin-top:var(--space-4)">
          Editar imóvel
        </a>
        <a href="#/gestao/imoveis"
           class="btn btn-ghost btn-block" style="margin-top:.5rem">
          Voltar ao painel
        </a>
      </aside>`;
  }

  return `
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
    </aside>`;
}

export function templateCtaFixo(im, wa) {
  return `
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
}

export function ligarPartilhar(im) {
  const partilhar = $("#partilhar");
  if (!partilhar) return;

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
