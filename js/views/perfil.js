import { $ } from "../utils.js";
import { sessao } from "../state.js";
import { templatePerfil } from "./perfil/layout.js";
import { ligarAccoesPerfil } from "./perfil/accoes.js";

export function vistaPerfil() {
  const app = $("#app");
  const u = sessao.user;

  if (!u) {
    location.hash = "#/entrar";
    return;
  }

  app.innerHTML = templatePerfil(u);
  ligarAccoesPerfil(); // ← sem argumento
}
