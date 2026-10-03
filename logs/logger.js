const IS_DEV =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const loggerFront = {
  debug(mensagem, contexto = {}) {
    if (IS_DEV) {
      console.log(`🔍 [DEBUG] ${mensagem}`, contexto);
    }
  },

  info(mensagem, contexto = {}) {
    if (IS_DEV) {
      console.log(`ℹ️ [INFO] ${mensagem}`, contexto);
    }
  },

  warn(mensagem, contexto = {}) {
    if (IS_DEV) {
      console.warn(`⚠️ [WARN] ${mensagem}`, contexto);
    }
  },

  error(mensagem, erro = {}, contexto = {}) {
    if (IS_DEV) {
      console.error(`❌ [ERROR] ${mensagem}`, {
        mensagemErro: erro.message,
        stack: erro.stack,
        ...contexto,
      });
    } else {
      // 🚀 NO FUTURO: enviar para /api/logs/frontend
      // fetch('/api/logs/frontend', {
      //   method: 'POST',
      //   body: JSON.stringify({ mensagem, erro: erro.message, ...contexto }),
      // }).catch(() => {});
    }
  },
};

export default loggerFront;
