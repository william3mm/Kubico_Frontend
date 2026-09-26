import { $ } from "../utils.js";
import { sessao } from "../state.js";
import {
  sidebar,
  cabecalhoGestao,
  backdropSidebar,
  ligarSidebar,
} from "../components/sidebar.js";
import { vistaGestaoImoveis } from "./gestao_imoveis.js";
import { vistaGestaoDados } from "./gestao_dados.js";
import { vistaGestaoContactos } from "./gestao_contactos.js";

/**
 * Layout principal da área de gestão.
 * Recebe a sub-aba activa (imoveis | contactos | dados).
 */
export async function vistaGestao(aba = "imoveis") {
  const app = $("#app");
  const u = sessao.user;

  // Redireccionar se não for proprietário
  if (!u || (u.tipo !== "PROPRIETARIO" && u.tipo !== "ADMIN")) {
    location.hash = "#/";
    return;
  }

  const titulos = {
    imoveis: "Todos os imóveis",
    contactos: "Contactos",
    dados: "Os meus dados",
  };

  // 1. Desenhar o shell (sidebar + topbar + área de conteúdo vazia)
  app.innerHTML = `
    <div class="gestao">
      ${backdropSidebar()}
      ${sidebar(aba)}

      <div class="gestao__content">
        ${cabecalhoGestao({ titulo: titulos[aba] || "Painel", user: u })}
        <div id="gestao-view" class="gestao__view"></div>
      </div>
    </div>`;

  ligarSidebar();

  // 2. Desenhar a sub-view conforme a aba
  const alvo = $("#gestao-view");

  if (aba === "dados") {
    return vistaGestaoDados(alvo, u);
  }
  if (aba === "contactos") {
    return vistaGestaoContactos(alvo, u);
  }

  // default: imoveis
  return vistaGestaoImoveis(alvo, u);
}
