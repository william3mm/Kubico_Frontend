import { $, $$, esc, kz, toast, ocupado } from "../utils.js";
import { api } from "../api.js";
import { empty } from "../components/feedback.js";
import { capaMini, urlFoto } from "../components/cards.js";

const ESTADOS = {
  publicado: { txt: "Publicado", cls: "badge--verified" },
  "em-verificacao": { txt: "Em verificação", cls: "badge--warn" },
  pausado: { txt: "Pausado", cls: "badge--line" },
  arrendado: { txt: "Arrendado", cls: "badge--line" },
  vendido: { txt: "Vendido", cls: "badge--line" },
};

export async function vistaGestaoImoveis(alvo, user) {
  alvo.innerHTML = `<p class="muted">A carregar imóveis…</p>`;

  let imoveis = [];

  try {
    const r = await api.meusImoveis();
    imoveis = r.imoveis || r.data || [];
  } catch (erro) {
    console.error("Erro ao carregar imóveis:", erro);
    alvo.innerHTML = empty({
      titulo: "Não foi possível carregar os teus imóveis",
      texto: "Verifica a ligação ao servidor.",
      cta: '<a href="#/gestao/imoveis" class="btn btn-primary">Tentar outra vez</a>',
    });
    return;
  }

  if (!imoveis.length) {
    alvo.innerHTML = empty({
      titulo: "Ainda não tens anúncios",
      texto: "Publica o primeiro imóvel e começa a receber contactos.",
      cta: '<a href="#/publicar" class="btn btn-primary">Publicar imóvel</a>',
    });
    return;
  }

  alvo.innerHTML = `
    <div class="gestao-imoveis">
      ${imoveis.map(cardGestao).join("")}
    </div>`;

  ligarAccoes(imoveis);
}

/* ─── Card de imóvel (gestão) ─── */
function cardGestao(im) {
  const e = ESTADOS[im.estado] || ESTADOS["publicado"];
  const capa = im.fotos?.[0];

  return `
    <div class="gestao-imovel" data-id="${esc(im.id)}">
      <div class="gestao-imovel__media">
        ${
          capa
            ? `<img src="${esc(urlFoto(capa))}" alt="${esc(im.titulo)}" loading="lazy">`
            : capaMini(im.id, "w-full h-full")
        }
      </div>

      <div class="gestao-imovel__body">
        <div class="gestao-imovel__top">
          <span class="badge ${e.cls}">${e.txt}</span>
          <span class="gestao-imovel__preco">${kz(im.preco)}${
            im.tipoTransacao === "ARRENDAMENTO"
              ? '<span class="muted" style="font-weight:500;font-size:.75rem">/mês</span>'
              : ""
          }</span>
        </div>

        <h3 class="gestao-imovel__titulo">${esc(im.titulo)}</h3>
        <p class="gestao-imovel__zona">${esc(im.zona)}${
          im.municipio?.nome ? ", " + esc(im.municipio.nome) : ""
        }</p>

        <div class="gestao-imovel__meta">
          <span>${im.vistas || 0} vistas</span>
          <span>${im.contactos || 0} contactos</span>
        </div>

        <div class="gestao-imovel__accoes">
          <a href="#/imovel/${esc(im.id)}" class="btn btn-ghost">Ver</a>
          <button data-editar="${esc(im.id)}" class="btn btn-ghost">Editar</button>
          <button data-apagar="${esc(im.id)}" class="btn btn-ghost btn--danger">Apagar</button>
        </div>
      </div>
    </div>`;
}

/* ─── Acções (editar, apagar) ─── */
function ligarAccoes(imoveis) {
  // Editar → redirecciona para #/publicar?editar=:id
  $$("[data-editar]").forEach((b) => {
    b.onclick = () => {
      location.hash = `#/publicar?editar=${encodeURIComponent(b.dataset.editar)}`;
    };
  });

  // Apagar
  $$("[data-apagar]").forEach((b) => {
    b.onclick = async () => {
      const id = b.dataset.apagar;
      const im = imoveis.find((x) => String(x.id) === String(id));
      if (!im) return;

      const ok = confirm(
        `Apagar "${im.titulo}"?\n\nEsta acção não pode ser desfeita. As fotos também serão removidas.`,
      );
      if (!ok) return;

      const solta = ocupado(b, "A apagar…");

      try {
        await api.apagarImovel(id);
        toast("Imóvel apagado");

        // Remover do DOM sem recarregar
        const card = b.closest(".gestao-imovel");
        card?.remove();

        // Se ficou vazio, mostra o empty state
        if (!document.querySelector(".gestao-imovel")) {
          const alvo = document.getElementById("gestao-view");
          alvo.innerHTML = empty({
            titulo: "Ainda não tens anúncios",
            texto: "Publica o primeiro imóvel e começa a receber contactos.",
            cta: '<a href="#/publicar" class="btn btn-primary">Publicar imóvel</a>',
          });
        }
      } catch (err) {
        solta();
        const msg = err.dados?.erro || "Não foi possível apagar o imóvel.";
        toast(msg);
      }
    };
  });
}
