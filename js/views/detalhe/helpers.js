import { sessao } from "../../state.js";
import { CONFIG } from "../../config.js";

export function rotaVoltar() {
  const anterior = sessionStorage.getItem("kubiko_rota_anterior") || "";

  if (anterior.startsWith("#/gestao")) {
    return { href: "#/gestao/imoveis", texto: "Voltar ao painel" };
  }

  return { href: "#/imoveis", texto: "Voltar aos imóveis" };
}

export function ehDono(im) {
  return (
    sessao.usuario &&
    im.proprietarioId &&
    String(sessao.usuario.id) === String(im.proprietarioId)
  );
}

export function linkWhatsApp(im) {
  const municipioNome = im.municipio?.nome || im.municipio || "";

  const msg = encodeURIComponent(
    `Olá! Vi este imóvel no ${CONFIG.SITE} e quero mais informações.\n\n` +
      `📌 Ref. #${im.id} — ${im.titulo}\n` +
      `📍 ${im.zona}${municipioNome ? ", " + municipioNome : ""}\n` +
      `💰 ${CONFIG.MOEDA} ${(Number(im.preco) || 0).toLocaleString("pt-AO")}${
        im.tipoTransacao === "ARRENDAMENTO" ? "/mês" : ""
      }\n` +
      `🔗 ${location.origin}${location.pathname}#/imovel/${im.id}\n\n` +
      `Está disponível para visita?`,
  );

  return `https://wa.me/${CONFIG.WHATSAPP}?text=${msg}`;
}
