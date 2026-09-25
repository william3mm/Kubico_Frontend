const CHAVE_TOKEN = "kubiko_token";
const CHAVE_USER = "kubiko_user";

export const sessao = {
  get token() {
    try {
      return sessionStorage.getItem(CHAVE_TOKEN);
    } catch {
      return null;
    }
  },
  get user() {
    try {
      return JSON.parse(sessionStorage.getItem(CHAVE_USER) || "null");
    } catch {
      return null;
    }
  },
  guardar(token, user) {
    try {
      sessionStorage.setItem(CHAVE_TOKEN, token || "");
      sessionStorage.setItem(CHAVE_USER, JSON.stringify(user || {}));
    } catch {}
  },
  actualizar(patch) {
    const u = { ...(this.user || {}), ...patch };
    this.guardar(this.token, u);
    return u;
  },
  sair() {
    try {
      sessionStorage.removeItem(CHAVE_TOKEN);
      sessionStorage.removeItem(CHAVE_USER);
    } catch {}
  },
};

export const state = {
  imoveis: [],
  carregado: false,
  erro: null,
};
