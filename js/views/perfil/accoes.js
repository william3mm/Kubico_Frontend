import { $, toast } from "../../utils.js";
import { sessao } from "../../state.js";
import { CONFIG } from "../../config.js";

/* ─── Gera o link do WhatsApp com mensagem pré-preenchida ─── */
export function suporteWhatsApp() {
  const u = sessao.user;

  const msg = encodeURIComponent(
    `Olá! Sou ${u?.nome || "utilizador"} e preciso de ajuda com a minha conta no ${CONFIG.SITE}.`,
  );

  return `https://wa.me/${CONFIG.WHATSAPP}?text=${msg}`;
}

/* ─── Liga os botões do perfil ─── */
export function ligarAccoesPerfil() {
  const btnSair = $("#perfil-sair");
  if (btnSair) {
    btnSair.onclick = () => {
      sessao.sair();
      toast("Sessão terminada");
      location.hash = "#/";
    };
  }
}
