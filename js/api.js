import { CONFIG, ROTAS_API } from "./config.js";
import { sessao } from "./state.js";

export async function fetchApi(
  rota,
  { metodo = "GET", corpo = null, formData = null } = {},
) {
  const headers = { Accept: "application/json" };
  if (corpo && !formData) headers["Content-Type"] = "application/json";
  if (sessao.token) headers["Authorization"] = "Bearer " + sessao.token;

  const r = await fetch(CONFIG.API_BASE + rota, {
    method: metodo,
    headers,
    credentials: "include",
    body: formData ? formData : corpo ? JSON.stringify(corpo) : null,
  });

  const dados = await r.json().catch(() => ({}));
  if (!r.ok) {
    const erro = new Error(
      dados.mensagem || dados.message || `HTTP ${r.status}`,
    );
    erro.status = r.status;
    erro.dados = dados;
    throw erro;
  }
  return dados;
}

export async function listarImoveis(filtros = {}) {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor !== "" && valor != null) params.set(chave, valor);
  }
  const query = params.toString();
  return fetchApi(ROTAS_API.imoveis + (query ? "?" + query : ""));
}

export const api = {
  entrar: (corpo) => fetchApi(ROTAS_API.entrar, { metodo: "POST", corpo }),
  registar: (corpo) => fetchApi(ROTAS_API.registar, { metodo: "POST", corpo }),
  recuperar: (destino) =>
    fetchApi(ROTAS_API.recuperar, { metodo: "POST", corpo: { destino } }),
  verificar: (destino, codigo) =>
    fetchApi(ROTAS_API.verificar, {
      metodo: "POST",
      corpo: { destino, codigo },
    }),
  novaSenha: (destino, codigo, senha) =>
    fetchApi(ROTAS_API.novaSenha, {
      metodo: "POST",
      corpo: { destino, codigo, senha },
    }),

  // Imóveis
  publicar: (corpo) => fetchApi(ROTAS_API.imoveis, { metodo: "POST", corpo }),
  publicarConteudo: (formData) =>
    fetchApi(ROTAS_API.imoveis, { metodo: "POST", formData }),

  // Municipios
  municipios: () => fetchApi(ROTAS_API.municipios),
};
