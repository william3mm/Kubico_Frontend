import { $, $$, ocupado, erroCaixa, caixaErro, toast, esc } from "../utils.js";
import { api } from "../api.js";
import { state } from "../state.js";
import { CONFIG } from "../config.js";

const INFRA_OPCOES = [
  "Gerador",
  "Água de furo",
  "Estacionamento",
  "Segurança 24h",
  "Elevador",
  "Piscina",
  "Quintal",
  "Mobilado",
  "Ar condicionado",
  "Depósito de água",
];

export function vistaPublicar() {
  const app = $("#app");
  app.innerHTML = `
    <div class="fade-in" style="padding-top:var(--space-5)">
      <h1 class="title-lg" style="max-width:36rem;margin-inline:auto">Publicar imóvel</h1>
      <p class="muted text-sm" style="max-width:36rem;margin:.375rem auto 0;line-height:1.6">
        Preenche o essencial. Depois de publicares, a equipa confirma os
        dados e o anúncio recebe o selo de verificado.
      </p>

      <form id="f-publicar" class="form form--narrow" style="margin-top:var(--space-6)" novalidate>
        <fieldset class="fieldset">
          <legend>O imóvel</legend>

          <label class="field">
            <span class="field__label">Título do anúncio</span>
            <input name="titulo" required placeholder="T3 com varanda no Talatona" class="input">
          </label>

          <div class="grid-2" style="margin-top:var(--space-4)">
            <label class="field">
              <span class="field__label">Tipo</span>
              <select name="tipo" class="select">
                <option>Apartamento</option><option>Casa</option><option>Vila</option>
                <option>Terreno</option><option>Comercial</option><option>Quarto</option>
              </select>
            </label>

            <div>
              <span class="field__label">Transacção</span>
              <div class="option-grid cols-2">
                <label class="option is-on">
                  <input class="sr-only" type="radio" name="transacao" value="arrendar" checked>Arrendar
                </label>
                <label class="option">
                  <input class="sr-only" type="radio" name="transacao" value="comprar">Vender
                </label>
              </div>
            </div>
          </div>

          <div class="grid-2" style="margin-top:var(--space-4)">
            <label class="field">
              <span class="field__label">Zona / bairro</span>
              <input name="zona" required placeholder="Talatona" class="input">
            </label>
            <label class="field">
              <span class="field__label">Município</span>
              <input name="municipio" placeholder="Belas" class="input">
            </label>
          </div>

          <label class="field" style="margin-top:var(--space-4)">
            <span class="field__label">
              Preço em ${CONFIG.MOEDA}
              <span id="nota-preco" class="muted" style="font-weight:400">(por mês)</span>
            </span>
            <input name="preco" type="number" inputmode="numeric" min="0" step="1000"
                   required placeholder="450000" class="input" style="font-size:1.125rem;font-weight:700">
          </label>

          <div class="grid-3" style="margin-top:var(--space-4)">
            <label class="field">
              <span class="field__label">Quartos</span>
              <input name="quartos" type="number" inputmode="numeric" min="0" max="20" value="2"
                     class="input" style="text-align:center;font-weight:700">
            </label>
            <label class="field">
              <span class="field__label">Banhos</span>
              <input name="banheiros" type="number" inputmode="numeric" min="0" max="20" value="1"
                     class="input" style="text-align:center;font-weight:700">
            </label>
            <label class="field">
              <span class="field__label">Área m²</span>
              <input name="area" type="number" inputmode="numeric" min="0" placeholder="90"
                     class="input" style="text-align:center;font-weight:700">
            </label>
          </div>

          <label class="field" style="margin-top:var(--space-4)">
            <span class="field__label">Descrição</span>
            <textarea name="descricao" rows="5" class="textarea"
              placeholder="Conta o que o imóvel tem, como é a zona e o que está incluído."></textarea>
          </label>

          <div style="margin-top:var(--space-4)">
            <span class="field__label">Infraestruturas</span>
            <div class="tags">
              ${INFRA_OPCOES.map(
                (t) => `
                <label class="tag">
                  <input type="checkbox" name="infraestruturas" value="${t}">
                  <span>${t}</span>
                </label>`,
              ).join("")}
            </div>
          </div>
        </fieldset>

        <fieldset class="fieldset">
          <legend>Fotos e contacto</legend>

          <label class="field">
            <span class="field__label">Fotos</span>
            <input name="ficheiros" type="file" accept="image/*" multiple class="input">
            <span class="field__hint">Três a seis fotos com boa luz chegam. A primeira é a de capa.</span>
          </label>

          <label class="field" style="margin-top:var(--space-4)">
            <span class="field__label">Teu WhatsApp</span>
            <input name="telefone" type="tel" inputmode="tel" required placeholder="923 000 000" class="input">
            <span class="field__hint">
              Só a equipa vê este número. Os interessados falam contigo pelo
              WhatsApp da plataforma.
            </span>
          </label>
        </fieldset>

        ${caixaErro("erro-publicar")}

        <button id="btn-publicar" class="btn btn-primary btn-block">Publicar imóvel</button>
        <p class="muted text-xs center" style="line-height:1.6">
          Ao publicar, confirmas que tens direito a arrendar ou vender este imóvel.
        </p>
      </form>
    </div>`;

  const form = $("#f-publicar");
  const nota = $("#nota-preco");

  /* Alternar nota do preço */
  $$('input[name="transacao"]', form).forEach((r) =>
    r.addEventListener("change", () => {
      $$(".option", form).forEach((o) => {
        const inp = o.querySelector("input");
        if (inp) o.classList.toggle("is-on", inp.checked);
      });
      nota.textContent = r.value === "arrendar" ? "(por mês)" : "(valor total)";
    }),
  );

  /* Submissão */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = new FormData(form);

    const faltam = ["titulo", "zona", "preco", "telefone"].filter(
      (k) => !String(d.get(k) || "").trim(),
    );
    if (faltam.length) {
      erroCaixa(
        "erro-publicar",
        "Preenche o título, a zona, o preço e o teu WhatsApp para publicar.",
      );
      form.querySelector(`[name="${faltam[0]}"]`)?.focus();
      return;
    }

    const payload = {
      titulo: d.get("titulo").trim(),
      tipo: d.get("tipo"),
      transacao: d.get("transacao"),
      zona: d.get("zona").trim(),
      municipio: (d.get("municipio") || "").trim(),
      preco: Number(d.get("preco")),
      quartos: Number(d.get("quartos") || 0),
      banheiros: Number(d.get("banheiros") || 0),
      area: Number(d.get("area") || 0),
      descricao: (d.get("descricao") || "").trim(),
      infraestruturas: d.getAll("infraestruturas"),
      telefone: d.get("telefone").trim(),
      verificado: false,
    };

    const btn = $("#btn-publicar");
    const solta = ocupado(btn, "A publicar…");

    try {
      const fich = form.querySelector('[name="ficheiros"]').files;
      let r;
      if (fich.length) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) =>
          fd.append(k, Array.isArray(v) ? JSON.stringify(v) : v),
        );
        [...fich].forEach((f) => fd.append("fotos", f));
        r = (await api.publicarConteudo?.(fd)) ?? { ok: true };
      } else {
        r = (await api.publicar?.(payload)) ?? { ok: true };
      }
      state.imoveis.unshift({ id: r.id || Date.now(), ...payload });
      toast("Imóvel publicado");
      location.hash = "#/imoveis";
    } catch {
      solta();
      erroCaixa(
        "erro-publicar",
        "O anúncio não foi publicado — a API não respondeu. Verifica a ligação e tenta outra vez.",
      );
    }
  });
}
