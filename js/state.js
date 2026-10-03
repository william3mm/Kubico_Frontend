const CHAVE_USER = "kubiko_user";

export const sessao = {
  get user() {
    try {
      return JSON.parse(sessionStorage.getItem(CHAVE_USER) || "null");
    } catch {
      return null;
    }
  },

  get autenticado() {
    return !!this.user;
  },

  guardar(user) {
    try {
      sessionStorage.setItem(CHAVE_USER, JSON.stringify(user || {}));
    } catch {}
  },

  actualizar(patch) {
    const u = { ...(this.user || {}), ...patch };
    this.guardar(u);
    return u;
  },

  sair() {
    try {
      sessionStorage.removeItem(CHAVE_USER);
      sessionStorage.removeItem("kubiko_token");
    } catch {}
  },
};

export const state = {
  imoveis: [],
  carregado: false,
  erro: null,
};
