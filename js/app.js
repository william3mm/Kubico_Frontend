import { $, toast } from "./utils.js";
import { sessao } from "./state.js";
import { desenharHeader, desenharTabbar } from "./components/header.js";

import { vistaInicio } from "./views/home.js";
import { vistaListagem } from "./views/listagem.js";
import { vistaDetalhe } from "./views/detalhe/index.js";
import { vistaPublicar } from "./views/publicar.js";
import { vistaEntrar } from "./views/entrar.js";
import { vistaRegistar } from "./views/registar.js";
import { vistaVerificar } from "./views/verificar.js";
import { vistaGestao } from "./views/gestao.js";
import { vistaRecuperar } from "./views/recuperar.js";
import { vistaPerfil } from "./views/perfil.js";

const areaDoUtilizador = (u) =>
  u?.tipo === "PROPRIETARIO" || u?.tipo === "ADMIN" ? "#/gestao" : "#/";

const eProprietario = (u) => u?.tipo === "PROPRIETARIO" || u?.tipo === "ADMIN";

const ano = document.getElementById("ano");
if (ano) ano.textContent = new Date().getFullYear();

function router() {
  const h = location.hash.replace(/^#/, "") || "/";
  const [rota, qs] = h.split("?");
  const params = new URLSearchParams(qs || "");
  const partes = rota.split("/").filter(Boolean);
  const u = sessao.user;

  /* ─── Modo gestão ─── */
  const rotaAnterior = sessionStorage.getItem("kubiko_rota_anterior") || "";
  const vemDaGestao = rotaAnterior.startsWith("#/gestao");

  const emGestao =
    partes[0] === "gestao" ||
    partes[0] === "publicar" ||
    (partes[0] === "imovel" && vemDaGestao);

  document.body.classList.toggle("rota-gestao", emGestao);

  if (partes[0] !== "imovel") {
    sessionStorage.setItem("kubiko_rota_anterior", "#" + (rota || "/"));
  }

  window.scrollTo({ top: 0, behavior: "auto" });

  desenharHeader();
  desenharTabbar(rota);

  /* ─── Auth ─── */
  if (partes[0] === "entrar" || partes[0] === "registar") {
    if (u) {
      location.hash = areaDoUtilizador(u);
      return;
    }
    return partes[0] === "entrar" ? vistaEntrar() : vistaRegistar();
  }

  /* ─── Públicas ─── */
  if (partes[0] === "verificar") return vistaVerificar(params);
  if (partes[0] === "imoveis") return vistaListagem(params);
  if (partes[0] === "imovel" && partes[1])
    return vistaDetalhe(decodeURIComponent(partes[1]));

  /* ─── Publicar (só proprietário) ─── */
  if (partes[0] === "publicar") {
    if (!u) {
      location.hash = "#/registar";
      return;
    }
    if (u.tipo === "INQUILINO_COMPRADOR") {
      toast("Cria uma conta como proprietário para poder publicar imóveis.");

      setTimeout(() => {
        location.hash = "#/";
      }, 1200);
      return;
    }
    return vistaPublicar(params);
  }

  /* ─── Gestão (só proprietário) ─── */
  if (partes[0] === "gestao") {
    if (!u) {
      location.hash = "#/entrar";
      return;
    }
    if (!eProprietario(u)) {
      toast("Esta área é só para proprietários.");
      location.hash = "#/";
      return;
    }
    const aba = partes[1] || "imoveis";
    return vistaGestao(aba);
  }

  /* ─── Perfil ─── */
  if (partes[0] === "perfil") {
    return vistaPerfil();
  }

  /* ─── Recuperar ─── */
  if (partes[0] === "recuperar") return vistaRecuperar();

  /* ─── Placeholder genérico ─── */
  if (partes[0] === "painel") return placeholderEmBreve("painel");

  return vistaInicio();
}

/* ═══════════════════════════════════════════════════════════
   PLACEHOLDER GENÉRICO
   ═══════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════
   ARRANQUE
   ═══════════════════════════════════════════════════════════ */
window.addEventListener("hashchange", router);
router();
