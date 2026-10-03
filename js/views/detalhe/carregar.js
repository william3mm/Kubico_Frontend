import { api } from "../../api.js";
import loggerFront from "../../../logs/logger.js";

/**
 * Tenta o endpoint público (verificados).
 * Se falhar, tenta o privado (só devolve se for do utilizador).
 */
export async function carregarImovel(id) {
  loggerFront.info("Tentar endpoint público", { id });

  try {
    const im = await api.buscarImovel(id);
    return im;
  } catch (err) {
    loggerFront.info("Público falhou", {
      id,
      status: err?.status,
      erro: err?.dados?.erro,
    });
  }

  loggerFront.info("Tentar endpoint privado", { id });

  try {
    const r = await api.meuImovel(id);
    return r.imovel || r;
  } catch (err) {
    loggerFront.error("Privado falhou", err, {
      id,
      status: err?.status,
      rota: "carregarImovel",
    });
    return null;
  }
}
