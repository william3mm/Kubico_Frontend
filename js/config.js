export const CONFIG = {
  API_BASE: "",
  SITE: "Kubiko",
  MOEDA: "Kz",
  WHATSAPP: "244923000000",
};

export const ROTAS_API = {
  // ─── Auth ───
  registar: "/api/auth/register",
  entrar: "/api/auth/login",
  recuperar: "/api/auth/password-recovery",
  verificar: "/api/auth/otp/verify",
  novaSenha: "/api/auth/password-recovery",
  enviarOtp: "/api/auth/otp/send",
  gestaoImoveis: "/api/gestao/imoveis",

  imoveis: "/api/imoveis",

  // ─── Localização ───
  municipios: "/api/municipios",
};
