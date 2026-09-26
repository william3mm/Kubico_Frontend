import { $ } from "./utils.js";
import { desenharHeader, desenharTabbar } from "./components/header.js";
import { vistaInicio } from "./views/home.js";
import { vistaListagem } from "./views/listagem.js";
import { vistaDetalhe } from "./views/detalhe.js";
import { vistaPublicar } from "./views/publicar.js";
import { vistaEntrar } from "./views/entrar.js";
import { vistaRegistar } from "./views/registar.js";

const ano = document.getElementById("ano");
if (ano) ano.textContent = new Date().getFullYear();

function router() {
  const h = location.hash.replace(/^#/, "") || "/";
  const [rota, qs] = h.split("?");
  const params = new URLSearchParams(qs || "");
  const partes = rota.split("/").filter(Boolean);

  window.scrollTo({ top: 0, behavior: "auto" });

  desenharHeader();
  desenharTabbar(rota);

  if (partes[0] === "entrar") return vistaEntrar();
  if (partes[0] === "registar") return vistaRegistar();
  if (partes[0] === "imoveis") return vistaListagem(params);
  if (partes[0] === "imovel" && partes[1])
    return vistaDetalhe(decodeURIComponent(partes[1]));
  if (partes[0] === "publicar") return vistaPublicar();

  if (
    partes[0] === "recuperar" ||
    partes[0] === "perfil" ||
    partes[0] === "painel"
  ) {
    return placeholderEmBreve(partes[0]);
  }

  return vistaInicio();
}

function placeholderEmBreve(nome) {
  $("#app").innerHTML = `
    <div class="auth-wrap">
      <div class="auth-card">
        <h1 class="auth-title">Em breve: ${nome}</h1>
        <p class="auth-subtitle">
          Este ecrã faz parte da próxima ronda.
        </p>
        <div class="auth-body">
          <a href="#/" class="btn btn-primary btn-block">Voltar ao início</a>
        </div>
      </div>
    </div>`;
}

window.addEventListener("hashchange", router);
router();
