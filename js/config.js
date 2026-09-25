export const CONFIG = {
  API_BASE: "http://localhost:3002",
  SITE: "Kubiko",
  MOEDA: "Kz",
  WHATSAPP: "244923000000",
};

export const ROTAS_API = {
  // ─── Auth ───
  registar: "/api/auth/registar",
  entrar: "/api/auth/login",
  recuperar: "/api/auth/recuperar",
  verificar: "/api/auth/verificar-codigo",
  novaSenha: "/api/auth/nova-senha",

  // ─── Imóveis (tudo neste prefixo) ───
  imoveis: "/api/imoveis", // GET lista, GET :id, POST, PUT :id, DELETE :id

  // ─── Localização ───
  municipios: "/api/municipios",
};
