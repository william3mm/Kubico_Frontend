import { api, fetchApi } from "../api.js";
import { ROTAS_API } from "../config.js";
import { sessao } from "../state.js";
import { $, toast, ocupado, caixaErro, erroCaixa } from "../utils.js";

const TEMPO_RESEND = 30; // segundos

/* Ecrã de verificação OTP após registo */
export function vistaVerificar(params) {
  const app = $("#app");
  const email = params.get("email") || "";

  if (!email) {
    location.hash = "#/registar";
    return;
  }

  let tempoRestante = 0;
  let intervalId = null;

  app.innerHTML = `
    <div class="auth-wrap fade-in">
      <div class="auth-card">
        <h1 class="auth-title">Confirmar email</h1>
        <p class="auth-subtitle">
          Enviámos um código de 6 dígitos para
          <strong>${email}</strong>. Escreve-o abaixo.
        </p>

        <form id="f-verificar" class="auth-body" novalidate>
          <div>
            <span class="field__label">Código de verificação</span>
            <div class="otp-row" id="otp">
              ${[0, 1, 2, 3, 4, 5]
                .map(
                  (i) => `<input data-otp="${i}" inputmode="numeric"
                                 maxlength="1" aria-label="Dígito ${i + 1}"
                                 autocomplete="one-time-code">`,
                )
                .join("")}
            </div>
          </div>

          ${caixaErro("erro-verificar")}

          <button class="btn btn-primary btn-block">Confirmar</button>

          <div class="auth-foot" style="margin-top:var(--space-3)">
            <span id="resend-info" class="muted"></span>
            <button type="button" id="reenviar"
                    style="font-weight:600;color:var(--brand)"
                    disabled>Enviar outra vez</button>
          </div>
        </form>
      </div>

      <p class="auth-foot">
        <a href="#/entrar">Voltar a entrar</a>
      </p>
    </div>`;

  /* ─── Caixas OTP ─── */
  const caixas = [...app.querySelectorAll("[data-otp]")];
  caixas[0].focus();

  caixas.forEach((c, i) => {
    c.addEventListener("input", () => {
      c.value = c.value.replace(/\D/g, "").slice(0, 1);
      if (c.value && i < 5) caixas[i + 1].focus();
    });

    c.addEventListener("keydown", (ev) => {
      if (ev.key === "Backspace" && !c.value && i > 0) caixas[i - 1].focus();
      if (ev.key === "ArrowLeft" && i > 0) caixas[i - 1].focus();
      if (ev.key === "ArrowRight" && i < 5) caixas[i + 1].focus();
    });

    c.addEventListener("paste", (ev) => {
      const t = (ev.clipboardData.getData("text") || "")
        .replace(/\D/g, "")
        .slice(0, 6);
      if (!t) return;
      ev.preventDefault();
      t.split("").forEach((d, j) => {
        if (caixas[j]) caixas[j].value = d;
      });
      caixas[Math.min(t.length, 5)].focus();
    });
  });

  /* ─── Timer de reenvio ─── */
  const btnResend = $("#reenviar");
  const resendInfo = $("#resend-info");

  function iniciarTimer() {
    tempoRestante = TEMPO_RESEND;
    btnResend.disabled = true;
    btnResend.style.opacity = "0.5";
    btnResend.style.cursor = "not-allowed";
    actualizarUI();

    intervalId = setInterval(() => {
      tempoRestante--;
      actualizarUI();
      if (tempoRestante <= 0) pararTimer();
    }, 1000);
  }

  function actualizarUI() {
    if (tempoRestante > 0) {
      resendInfo.textContent = `Podes reenviar em ${tempoRestante}s. `;
    } else {
      resendInfo.textContent = "Não recebeste? ";
    }
  }

  function pararTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    tempoRestante = 0;
    btnResend.disabled = false;
    btnResend.style.opacity = "1";
    btnResend.style.cursor = "pointer";
    actualizarUI();
  }

  iniciarTimer();

  window.addEventListener("hashchange", function limpar() {
    if (!document.getElementById("f-verificar")) {
      clearInterval(intervalId);
      window.removeEventListener("hashchange", limpar);
    }
  });

  /* ─── Reenviar código ─── */
  btnResend.onclick = async () => {
    if (tempoRestante > 0) return;

    const textoOriginal = btnResend.textContent;
    btnResend.disabled = true;
    btnResend.textContent = "A enviar…";

    try {
      await fetchApi(ROTAS_API.enviarOtp, {
        metodo: "POST",
        corpo: { email, tipoAcao: "CONFIRMACAO" },
      });
      toast("Código reenviado. Vê o teu email.");
      iniciarTimer();
    } catch (err) {
      iniciarTimer();
      const msg = err.dados?.erro || "Não foi possível reenviar agora.";
      erroCaixa("erro-verificar", msg);
    } finally {
      btnResend.textContent = textoOriginal;
    }
  };

  /* ─── Submissão do código ─── */
  $("#f-verificar").addEventListener("submit", async (e) => {
    e.preventDefault();

    const codigo = caixas.map((c) => c.value).join("");
    if (codigo.length < 6)
      return erroCaixa("erro-verificar", "Faltam dígitos no código.");

    const btn = e.target.querySelector(
      'button[type="submit"], button:not([type])',
    );
    const solta = ocupado(btn, "A confirmar…");

    try {
      const r = await fetchApi(ROTAS_API.verificar, {
        metodo: "POST",
        corpo: { email, codigoInput: codigo, tipoAcao: "CONFIRMACAO" },
      });

      const u = r?.usuario;

      // O token já vem no cookie HttpOnly — só guardamos o utilizador
      if (u) {
        sessao.guardar("cookie-auth", u);
      }

      toast("Conta confirmada com sucesso");

      // ─── Encaminhar conforme o tipo ───
      if (u?.tipo === "PROPRIETARIO" || u?.tipo === "ADMIN") {
        location.hash = "#/gestao";
      } else if (u?.tipo === "INQUILINO_COMPRADOR") {
        location.hash = "#/";
      } else {
        location.hash = "#/";
      }
    } catch (err) {
      solta();
      const msg = err.dados?.erro || "Código inválido ou expirado.";
      erroCaixa("erro-verificar", msg);
    }
  });
}
