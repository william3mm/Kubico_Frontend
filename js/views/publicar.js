import { $, $$, esc, ocupado, erroCaixa, caixaErro, toast } from "../utils.js";
import { api } from "../api.js";
import { CONFIG } from "../config.js";
import { TIPOS, LABELS_TIPO, INFRA_OPCOES } from "../data/imovel_opcoes.js";

/* Províncias onde aceitamos publicações (por NOME — robusto a siglas diferentes) */
const PROVINCIAS_ACTIVAS = ["Luanda", "Bengo"];

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

  /* ─── 2. Carregar municípios ─── */
  let todosMunicipios = [];
  try {
    const r = await api.municipios();
    todosMunicipios = r.municipios || r.data || [];
  } catch (err) {
    console.error("Erro ao carregar municípios:", err);
  }

  /* ─── 3. Agrupar municípios por NOME de província ─── */
  const provincias = new Map(); // nome → { id, nome, sigla, municipios[] }

  for (const m of todosMunicipios) {
    const p = m.provincia;
    if (!p || !p.nome) continue;

    if (!provincias.has(p.nome)) {
      provincias.set(p.nome, {
        id: p.id,
        nome: p.nome,
        sigla: p.sigla || "",
        municipios: [],
      });
    }
    provincias.get(p.nome).municipios.push(m);
  }

  /* ─── 4. Filtrar só as províncias activas (por nome) ─── */
  const listaProvincias = [...provincias.values()]
    .filter((p) => PROVINCIAS_ACTIVAS.includes(p.nome))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt"));

  /* ─── 5. Descobrir província do imóvel (se edição) ─── */
  let provinciaInicial = "";

  if (modoEdicao && im?.municipioId) {
    for (const p of listaProvincias) {
      if (p.municipios.some((m) => Number(m.id) === Number(im.municipioId))) {
        provinciaInicial = p.nome;
        break;
      }
    }
  }

  if (!provinciaInicial && listaProvincias.length) {
    provinciaInicial = listaProvincias[0].nome;
  }

  /* ─── 6. Valores iniciais ─── */
  const v = {
    titulo: im?.titulo || "",
    tipo: im?.tipo || "APARTAMENTO",
    tipoTransacao: im?.tipoTransacao || "ARRENDAMENTO",
    zona: im?.zona || "",
    municipioId: im?.municipioId || "",
    preco: im?.preco ?? "",
    quartos: im?.quartos ?? "",
    banheiros: im?.banheiros ?? "",
    area: im?.area ?? "",
    descricao: im?.descricao || "",
    infraestruturas: Array.isArray(im?.infraestruturas)
      ? im.infraestruturas
      : [],
  };

  /* ─── 7. Render ─── */
  app.innerHTML = `
    <div class="form-page fade-in">

      <a href="#/gestao/imoveis" class="detail-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M15 6l-6 6 6 6"/>
        </svg>
        Voltar ao painel
      </a>

      <h1 class="title-lg">${modoEdicao ? "Editar imóvel" : "Publicar imóvel"}</h1>
      <p class="muted text-sm" style="margin-top:.375rem;line-height:1.6">
        ${
          modoEdicao
            ? "Altera o que precisares. As fotos são geridas num próximo passo."
            : "Preenche o essencial. Depois de publicares, a equipa confirma os dados e o anúncio recebe o selo de verificado."
        }
      </p>

      <form id="f-publicar" class="form" style="margin-top:var(--space-6)" novalidate>

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

          <label class="field" style="margin-top:var(--space-4)">
            <span class="field__label">Zona / bairro</span>
            <input name="zona" required value="${esc(v.zona)}"
                   placeholder="Talatona" class="input">
          </label>

          <div class="grid-2" style="margin-top:var(--space-4)">
            <label class="field">
              <span class="field__label">Província</span>
              <select name="provinciaNome" class="select" required id="select-provincia">
                ${listaProvincias
                  .map(
                    (p) =>
                      `<option value="${esc(p.nome)}" ${p.nome === provinciaInicial ? "selected" : ""}>${esc(p.nome)}</option>`,
                  )
                  .join("")}
              </select>
            </label>

            <label class="field">
              <span class="field__label">Município</span>
              <select name="municipio_id" class="select" required id="select-municipio">
                <option value="">Escolhe o município</option>
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
                     value="${esc(v.quartos)}" placeholder="2"
                     class="input" style="text-align:center;font-weight:700">
            </label>
            <label class="field">
              <span class="field__label">Banhos</span>
              <input name="banheiros" type="number" inputmode="numeric" min="0" max="20"
                     value="${esc(v.banheiros)}" placeholder="1"
                     class="input" style="text-align:center;font-weight:700">
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
  const selectProvincia = $("#select-provincia");
  const selectMunicipio = $("#select-municipio");

  /* ─── Preencher municípios conforme a província escolhida ─── */
  function preencherMunicipios(nomeProvincia, valorSelecionado = "") {
    const p = provincias.get(nomeProvincia);
    const lista = p?.municipios || [];

    selectMunicipio.innerHTML = `
      <option value="">Escolhe o município</option>
      ${lista
        .map(
          (m) =>
            `<option value="${m.id}" ${Number(valorSelecionado) === Number(m.id) ? "selected" : ""}>${esc(m.nome)}</option>`,
        )
        .join("")}`;
  }

  /* ─── Preencher logo no arranque ─── */
  preencherMunicipios(provinciaInicial, v.municipioId);

  /* ─── Ao mudar de província, recarregar municípios ─── */
  selectProvincia.addEventListener("change", () => {
    preencherMunicipios(selectProvincia.value);
  });

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

    const faltam = ["titulo", "zona", "municipio_id", "preco"].filter(
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

    /* Campos opcionais: "" se vazio, número se preenchido */
    const numOuVazio = (k) => {
      const raw = String(d.get(k) ?? "").trim();
      return raw === "" ? "" : Number(raw);
    };

    const payload = {
      titulo: d.get("titulo").trim(),
      tipo: d.get("tipo"),
      tipoTransacao: d.get("tipoTransacao"),
      zona: d.get("zona").trim(),
      municipioId: Number(d.get("municipio_id")),
      preco: Number(d.get("preco")),
      quartos: numOuVazio("quartos"),
      banheiros: numOuVazio("banheiros"),
      area: numOuVazio("area"),
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

        const campos = {
          titulo: payload.titulo,
          tipo: payload.tipo,
          tipoTransacao: payload.tipoTransacao,
          zona: payload.zona,
          municipio_id: payload.municipioId,
          preco: payload.preco,
          quartos: payload.quartos,
          banheiros: payload.banheiros,
          area: payload.area,
          descricao: payload.descricao,
          telefone: d.get("telefone") || "",
        };

        for (const [k, val] of Object.entries(campos)) {
          if (val !== null && val !== undefined) {
            fd.append(k, String(val));
          }
        }

        payload.infraestruturas.forEach((item) =>
          fd.append("infraestruturas", item),
        );

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
