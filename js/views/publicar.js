import { $, $$, esc, ocupado, erroCaixa, caixaErro, toast } from "../utils.js";
import { api } from "../api.js";
import { CONFIG } from "../config.js";
import { TIPOS, LABELS_TIPO, INFRA_OPCOES } from "../data/imovel_opcoes.js";

export async function vistaPublicar(params = new URLSearchParams()) {
  const app = $("#app");
  const idEditar = params.get("editar");
  const modoEdicao = !!idEditar;

  /* ─── 1. Carregar o imóvel se for edição ─── */
  let im = null;

  if (modoEdicao) {
    try {
      im = await api.buscarImovel(idEditar);
    } catch (erro) {
      console.error("Erro ao carregar imóvel:", erro);
      app.innerHTML = `
        <div class="fade-in" style="padding-top:var(--space-6)">
          <div class="empty">
            <p class="empty__title">Imóvel não encontrado</p>
            <p class="empty__text">Pode ter sido apagado ou já não está disponível.</p>
            <a href="#/gestao/imoveis" class="btn btn-primary">Voltar ao painel</a>
          </div>
        </div>`;
      return;
    }
  }

  /* ─── 2. Valores iniciais ─── */
  const v = {
    titulo: im?.titulo || "",
    tipo: im?.tipo || "APARTAMENTO",
    tipoTransacao: im?.tipoTransacao || "ARRENDAMENTO",
    zona: im?.zona || "",
    municipioId: im?.municipioId || "",
    preco: im?.preco || "",
    quartos: im?.quartos ?? 2,
    banheiros: im?.banheiros ?? 1,
    area: im?.area ?? "",
    descricao: im?.descricao || "",
    infraestruturas: Array.isArray(im?.infraestruturas)
      ? im.infraestruturas
      : [],
  };

  /* ─── 3. Carregar municípios ─── */
  let municipios = [];
  try {
    const r = await api.municipios();
    municipios = r.municipios || r.data || [];
  } catch {}

  /* ─── 4. Render ─── */
  app.innerHTML = `
    <div class="form-page fade-in">

    ${`
  <a href="#/gestao/imoveis" class="detail-back">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <path d="M15 6l-6 6 6 6"/>
    </svg>
    ${modoEdicao ? "Voltar ao painel" : "Voltar ao painel"}
  </a>`}

      <h1 class="title-lg">${modoEdicao ? "Editar imóvel" : "Publicar imóvel"}</h1>
      <p class="muted text-sm" style="margin-top:.375rem;line-height:1.6">
        ${
          modoEdicao
            ? "Altera o que precisares. As fotos são geridas num próximo passo."
            : "Preenche o essencial. Depois de publicares, a equipa confirma os dados e o anúncio recebe o selo de verificado."
        }
      </p>

      <form id="f-publicar" class="form" style="margin-top:var(--space-6)" novalidate>

        <!-- ─── O IMÓVEL ─── -->
        <fieldset class="fieldset">
          <legend>O imóvel</legend>

          <label class="field">
            <span class="field__label">Título do anúncio</span>
            <input name="titulo" required value="${esc(v.titulo)}"
                   placeholder="T3 com varanda no Talatona" class="input">
          </label>

          <div class="grid-2" style="margin-top:var(--space-4)">
            <label class="field">
              <span class="field__label">Tipo</span>
              <select name="tipo" class="select">
                ${TIPOS.map(
                  (t) =>
                    `<option value="${t}" ${v.tipo === t ? "selected" : ""}>${LABELS_TIPO[t]}</option>`,
                ).join("")}
              </select>
            </label>

            <div>
              <span class="field__label">Transacção</span>
              <div class="option-grid cols-2">
                <label class="option ${v.tipoTransacao === "ARRENDAMENTO" ? "is-on" : ""}">
                  <input class="sr-only" type="radio" name="tipoTransacao"
                         value="ARRENDAMENTO" ${v.tipoTransacao === "ARRENDAMENTO" ? "checked" : ""}>
                  Arrendar
                </label>
                <label class="option ${v.tipoTransacao === "VENDA" ? "is-on" : ""}">
                  <input class="sr-only" type="radio" name="tipoTransacao"
                         value="VENDA" ${v.tipoTransacao === "VENDA" ? "checked" : ""}>
                  Vender
                </label>
              </div>
            </div>
          </div>

          <div class="grid-2" style="margin-top:var(--space-4)">
            <label class="field">
              <span class="field__label">Zona / bairro</span>
              <input name="zona" required value="${esc(v.zona)}"
                     placeholder="Talatona" class="input">
            </label>

            <label class="field">
              <span class="field__label">Município</span>
              <select name="municipioId" class="select" required>
                <option value="">Escolhe o município</option>
                ${municipios
                  .map(
                    (m) =>
                      `<option value="${m.id}" ${Number(v.municipioId) === Number(m.id) ? "selected" : ""}>${esc(m.nome)}${m.provincia?.nome ? " — " + esc(m.provincia.nome) : ""}</option>`,
                  )
                  .join("")}
              </select>
            </label>
          </div>

          <label class="field" style="margin-top:var(--space-4)">
            <span class="field__label">
              Preço em ${CONFIG.MOEDA}
              <span id="nota-preco" class="muted" style="font-weight:400">
                ${v.tipoTransacao === "ARRENDAMENTO" ? "(por mês)" : "(valor total)"}
              </span>
            </span>
            <input name="preco" type="number" inputmode="numeric" min="0" step="1000"
                   required value="${esc(v.preco)}" placeholder="450000"
                   class="input" style="font-size:1.125rem;font-weight:700">
          </label>

          <div class="grid-3" style="margin-top:var(--space-4)">
            <label class="field">
              <span class="field__label">Quartos</span>
              <input name="quartos" type="number" inputmode="numeric" min="0" max="20"
                     value="${esc(v.quartos)}" class="input" style="text-align:center;font-weight:700">
            </label>
            <label class="field">
              <span class="field__label">Banhos</span>
              <input name="banheiros" type="number" inputmode="numeric" min="0" max="20"
                     value="${esc(v.banheiros)}" class="input" style="text-align:center;font-weight:700">
            </label>
            <label class="field">
              <span class="field__label">Área m²</span>
              <input name="area" type="number" inputmode="numeric" min="0"
                     value="${esc(v.area)}" placeholder="90"
                     class="input" style="text-align:center;font-weight:700">
            </label>
          </div>

          <label class="field" style="margin-top:var(--space-4)">
            <span class="field__label">Descrição</span>
            <textarea name="descricao" rows="5" class="textarea"
              placeholder="Conta o que o imóvel tem, como é a zona e o que está incluído.">${esc(v.descricao)}</textarea>
          </label>

          <div style="margin-top:var(--space-4)">
            <span class="field__label">Infraestruturas</span>
            <div class="tags">
              ${INFRA_OPCOES.map(
                (t) => `
                <label class="tag">
                  <input type="checkbox" name="infraestruturas" value="${esc(t)}"
                         ${v.infraestruturas.includes(t) ? "checked" : ""}>
                  <span>${esc(t)}</span>
                </label>`,
              ).join("")}
            </div>
          </div>
        </fieldset>

        ${
          modoEdicao
            ? `
          <fieldset class="fieldset">
            <legend>Fotos</legend>
            <p class="muted text-sm" style="line-height:1.6">
              A gestão de fotos (adicionar, remover, reordenar) será feita na
              próxima ronda. Para já, podes alterar os dados do imóvel aqui.
            </p>
          </fieldset>`
            : `
          <fieldset class="fieldset">
            <legend>Fotos e contacto</legend>

            <label class="field">
              <span class="field__label">Fotos</span>
              <input name="ficheiros" type="file" accept="image/jpeg,image/png,image/webp" multiple class="input">
              <span class="field__hint">Três a seis fotos com boa luz chegam. A primeira é a de capa.</span>
            </label>

            <label class="field" style="margin-top:var(--space-4)">
              <span class="field__label">Teu WhatsApp</span>
              <input name="telefone" type="tel" inputmode="tel" required
                     placeholder="923000000" class="input">
              <span class="field__hint">
                Só a equipa vê este número. Os interessados falam contigo pelo
                WhatsApp da plataforma.
              </span>
            </label>
          </fieldset>`
        }

        ${caixaErro("erro-publicar")}

        <button id="btn-guardar" class="btn btn-primary btn-block">
          ${modoEdicao ? "Guardar alterações" : "Publicar imóvel"}
        </button>
        <p class="muted text-xs center" style="line-height:1.6">
          ${
            modoEdicao
              ? "As alterações ficam visíveis imediatamente."
              : "Ao publicar, confirmas que tens direito a arrendar ou vender este imóvel."
          }
        </p>

        ${
          modoEdicao
            ? `<a href="#/gestao/imoveis" class="btn btn-ghost btn-block" style="margin-top:.5rem">Cancelar</a>`
            : ""
        }
      </form>
    </div>`;

  const form = $("#f-publicar");
  const nota = $("#nota-preco");

  /* ─── Alternar visual dos radios de transacção ─── */
  $$('input[name="tipoTransacao"]', form).forEach((r) =>
    r.addEventListener("change", () => {
      $$(".option", form).forEach((o) => {
        const inp = o.querySelector("input");
        if (inp) o.classList.toggle("is-on", inp.checked);
      });
      nota.textContent =
        r.value === "ARRENDAMENTO" ? "(por mês)" : "(valor total)";
    }),
  );

  /* ─── Submissão ─── */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = new FormData(form);

    const faltam = ["titulo", "zona", "municipioId", "preco"].filter(
      (k) => !String(d.get(k) || "").trim(),
    );
    if (faltam.length) {
      erroCaixa(
        "erro-publicar",
        "Preenche o título, a zona, o município e o preço.",
      );
      form.querySelector(`[name="${faltam[0]}"]`)?.focus();
      return;
    }

    const payload = {
      titulo: d.get("titulo").trim(),
      tipo: d.get("tipo"),
      tipoTransacao: d.get("tipoTransacao"),
      zona: d.get("zona").trim(),
      municipioId: Number(d.get("municipioId")),
      preco: Number(d.get("preco")),
      quartos: Number(d.get("quartos") || 0),
      banheiros: Number(d.get("banheiros") || 0),
      area: Number(d.get("area") || 0),
      descricao: (d.get("descricao") || "").trim(),
      infraestruturas: d.getAll("infraestruturas"),
    };

    const btn = $("#btn-guardar");
    const solta = ocupado(btn, modoEdicao ? "A guardar…" : "A publicar…");

    try {
      if (modoEdicao) {
        await api.editarImovel(idEditar, payload);
        toast("Alterações guardadas");
        location.hash = "#/gestao/imoveis";
      } else {
        const fich = form.querySelector('[name="ficheiros"]')?.files || [];
        const fd = new FormData();
        Object.entries(payload).forEach(([k, val]) =>
          fd.append(k, Array.isArray(val) ? JSON.stringify(val) : val),
        );
        fd.append("telefone", d.get("telefone") || "");
        [...fich].forEach((f) => fd.append("fotos", f));

        await api.publicarConteudo(fd);
        toast("Imóvel publicado");
        location.hash = "#/gestao/imoveis";
      }
    } catch (err) {
      solta();
      const msg = err.dados?.erro || err.message || "Não foi possível guardar.";
      erroCaixa("erro-publicar", msg);
    }
  });
}
