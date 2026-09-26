import { empty } from "../components/feedback.js";

export function vistaGestaoContactos(alvo) {
  alvo.innerHTML = empty({
    titulo: "Ainda sem contactos",
    texto:
      "Quando alguém contactar um dos teus imóveis pelo WhatsApp, aparece aqui.",
    cta: '<a href="#/gestao/imoveis" class="btn btn-primary">Ver imóveis</a>',
  });
}
