import { api, fetchApi } from "../api.js";
import { ROTAS_API } from "../config.js";
import { sessao } from "../state.js";
import {
  $,
  toast,
  ocupado,
  caixaErro,
  erroCaixa,
  ligarOlhos,
  campoSenha,
  forcaSenha,
} from "../utils.js";

const TEMPO_RESEND = 30;

const rec = {
  passo: 1,
  email: "",
  codigo: "",
  sucesso: false,
  destino: "#/", // ← novo
};

export function vistaRecuperar() {
  if (rec.passo === 1) return passo1();
  if (rec.passo === 2) return passo2();
  return passo3();
}

/* ═══════════════════════════════════════════════════════════
   PASSO 1 — Email
   ═══════════════════════════════════════════════════════════ */
function passo1() {
  $("#app").innerHTML = `
    <div class="auth-wrap fade-in">
      <div class="auth-card">
        <h1 class="auth-title">Recuperar conta</h1>
        <p class="auth-subtitle">
          Escreve o <strong>email</strong> com que criaste a conta.
          Enviamos um código de 6 dígitos.
        </p>

        ${templateSteps(1)}

        <form id="f1" class="auth-body" novalidate>
          <label class="field">
            <span class="field__label">Email</span>
            <input name="email" type="email" required autocomplete="email"
                   placeholder="ana@exemplo.ao" class="input">
          </label>

          ${caixaErro("erro1")}

          <button id="btn1" class="btn btn-primary btn-block" disabled
                  style="margin-top:1rem">
            Enviar código
          </button>
        </form>

        <p class="auth-foot"><a href="#/entrar">Voltar a entrar</a></p>
      </div>
    </div>`;

  const form = $("#f1");
  const btn = $("#btn1");
  const inputEmail = form.querySelector('[name="email"]');

  inputEmail.focus();
  inputEmail.addEventListener("input", () => {
    btn.disabled = !inputEmail.value.includes("@");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = inputEmail.value.trim();
    if (!email) return;

    const solta = ocupado(btn, "A enviar…");

    try {
      await fetchApi(ROTAS_API.enviarOtp, {
        metodo: "POST",
        corpo: { email, tipoAcao: "RECUPERACAO" },
      });

      rec.email = email;
      rec.passo = 2;
      toast("Código enviado. Vê o teu email.");
      vistaRecuperar();
    } catch (err) {
      solta();
      erroCaixa("erro1", err.dados?.erro || "Não foi possível enviar agora.");
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   PASSO 2 — Código OTP
   ═══════════════════════════════════════════════════════════ */
function passo2() {
  $("#app").innerHTML = `
    <div class="auth-wrap fade-in">
      <div class="auth-card">
        <h1 class="auth-title">Confirmar código</h1>
        <p class="auth-subtitle">
          Enviámos um código para <strong>${rec.email}</strong>.
        </p>

        ${templateSteps(2)}

        <form id="f2" class="auth-body" novalidate>
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

          ${caixaErro("erro2")}

          <button id="btn2" class="btn btn-primary btn-block" disabled
                  style="margin-top:1rem">
            Verificar
          </button>

          <div class="auth-foot" style="margin-top:var(--space-3)">
            <span id="resend-info" class="muted"></span>
            <button type="button" id="reenviar"
                    style="font-weight:600;color:var(--brand)" disabled>
              Enviar outra vez
            </button>
          </div>
        </form>

        <p class="auth-foot">
          <a href="#" id="voltar">Voltar ao email</a>
        </p>
      </div>
    </div>`;

  const caixas = [...document.querySelectorAll("[data-otp]")];
  const btn = $("#btn2");

  caixas[0].focus();

  const actualizarBtn = () => {
    const codigo = caixas.map((c) => c.value).join("");
    btn.disabled = codigo.length < 6;
  };

  caixas.forEach((c, i) => {
    c.addEventListener("input", () => {
      c.value = c.value.replace(/\D/g, "").slice(0, 1);
      if (c.value && i < 5) caixas[i + 1].focus();
      actualizarBtn();
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
      actualizarBtn();
    });
  });

  const btnResend = $("#reenviar");
  const resendInfo = $("#resend-info");
  let tempoRestante = 0;
  let intervalId = null;

  const actualizarUI = () => {
    if (tempoRestante > 0) {
      resendInfo.textContent = `Podes reenviar em ${tempoRestante}s. `;
    } else {
      resendInfo.textContent = "Não recebeste? ";
    }
  };

  const pararTimer = () => {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    tempoRestante = 0;
    btnResend.disabled = false;
    btnResend.style.opacity = "1";
    btnResend.style.cursor = "pointer";
    actualizarUI();
  };

  const iniciarTimer = () => {
    tempoRestante = TEMPO_RESEND;
    btnResend.disabled = true;
    btnResend.style.opacity = ".5";
    btnResend.style.cursor = "not-allowed";
    actualizarUI();
    intervalId = setInterval(() => {
      tempoRestante--;
      actualizarUI();
      if (tempoRestante <= 0) pararTimer();
    }, 1000);
  };

  iniciarTimer();

  btnResend.onclick = async () => {
    if (tempoRestante > 0) return;

    const textoOriginal = btnResend.textContent;
    btnResend.disabled = true;
    btnResend.textContent = "A enviar…";

    try {
      await fetchApi(ROTAS_API.enviarOtp, {
        metodo: "POST",
        corpo: { email: rec.email, tipoAcao: "RECUPERACAO" },
      });
      toast("Código reenviado. Vê o teu email.");
      iniciarTimer();
    } catch (err) {
      iniciarTimer();
      erroCaixa("erro2", err.dados?.erro || "Não foi possível reenviar agora.");
    } finally {
      btnResend.textContent = textoOriginal;
    }
  };

  $("#voltar").onclick = (e) => {
    e.preventDefault();
    rec.passo = 1;
    rec.email = "";
    rec.codigo = "";
    vistaRecuperar();
  };

  $("#f2").addEventListener("submit", async (e) => {
    e.preventDefault();

    const codigo = caixas.map((c) => c.value).join("");
    if (codigo.length < 6)
      return erroCaixa("erro2", "Faltam dígitos no código.");

    const solta = ocupado(btn, "A verificar…");

    try {
      await fetchApi(ROTAS_API.verificar, {
        metodo: "POST",
        corpo: {
          email: rec.email,
          codigoInput: codigo,
          tipoAcao: "RECUPERACAO",
        },
      });

      rec.codigo = codigo;
      rec.passo = 3;
      toast("Código confirmado. Define a nova senha.");
      vistaRecuperar();
    } catch (err) {
      solta();
      erroCaixa("erro2", err.dados?.erro || "Código inválido ou expirado.");
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   PASSO 3 — Nova senha (ou sucesso)
   ═══════════════════════════════════════════════════════════ */
function passo3() {
  if (rec.sucesso) return passo3Sucesso();

  $("#app").innerHTML = `
    <div class="auth-wrap fade-in">
      <div class="auth-card">
        <h1 class="auth-title">Nova senha</h1>
        <p class="auth-subtitle">
          Define uma nova senha para <strong>${rec.email}</strong>.
        </p>

        ${templateSteps(3)}

        <form id="f3" class="auth-body" novalidate>
          <label class="field">
            <span class="field__label">Nova senha</span>
            ${campoSenha("senha", "Mínimo 8 caracteres", "new-password")}
          </label>

          <div style="margin-top:var(--space-3)">
            <div class="pw-forca" id="forca"></div>
          </div>

          <label class="field" style="margin-top:var(--space-4)">
            <span class="field__label">Confirmar senha</span>
            ${campoSenha("senha2", "Repete a senha", "new-password")}
          </label>

          ${caixaErro("erro3")}

          <button id="btn3" class="btn btn-primary btn-block" disabled
                  style="margin-top:1rem">
            Trocar senha
          </button>
        </form>
      </div>
    </div>`;

  const form = $("#f3");
  const btn = $("#btn3");
  const inputSenha = form.querySelector('[name="senha"]');
  const inputSenha2 = form.querySelector('[name="senha2"]');
  const forca = $("#forca");

  ligarOlhos(form);

  const senhaValida = (s) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/.test(s);

  const actualizarBtn = () => {
    const ok =
      senhaValida(inputSenha.value) && inputSenha.value === inputSenha2.value;
    btn.disabled = !ok;
  };

  inputSenha.addEventListener("input", () => {
    const n = forcaSenha(inputSenha.value);
    forca.className = "pw-forca pw-forca--" + n;
    forca.dataset.n = n;
    actualizarBtn();
  });

  inputSenha2.addEventListener("input", actualizarBtn);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!senhaValida(inputSenha.value))
      return erroCaixa(
        "erro3",
        "A senha deve ter 8-32 caracteres, com maiúscula, minúscula e número.",
      );

    if (inputSenha.value !== inputSenha2.value)
      return erroCaixa("erro3", "As senhas não coincidem.");

    const solta = ocupado(btn, "A trocar…");

    try {
      const r = await fetchApi(ROTAS_API.novaSenha, {
        metodo: "POST",
        corpo: {
          email: rec.email,
          codigoOtp: rec.codigo,
          senha: inputSenha.value,
        },
      });

      // Auto-login: guarda o user (o cookie httpOnly já veio no header)
      if (r.usuario) {
        sessao.guardar(r.usuario);

        // Decide o destino conforme o tipo
        const tipo = r.usuario.tipo;
        rec.destino =
          tipo === "PROPRIETARIO" || tipo === "ADMIN" ? "#/gestao" : "#/";
      } else {
        rec.destino = "#/";
      }

      rec.sucesso = true;
      vistaRecuperar();
      toast(r?.mensagem || "Palavra-passe alterada com sucesso!");
    } catch (err) {
      solta();
      erroCaixa(
        "erro3",
        err.dados?.erro || "Não foi possível alterar a senha.",
      );
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   PASSO 3 (SUCESSO) — mesmo cartão, conteúdo diferente
   ═══════════════════════════════════════════════════════════ */
function passo3Sucesso() {
  const destino = rec.destino || "#/";

  $("#app").innerHTML = `
    <div class="auth-wrap fade-in">
      <div class="auth-card">
        <div class="auth-sucesso">
          <div class="auth-sucesso__icone">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>

          <h1 class="auth-title">Palavra-passe actualizada</h1>
          <p class="auth-subtitle">
            A tua senha foi alterada e a sessão iniciada.
            A entrar…
          </p>
        </div>

        <a href="${destino}" class="btn btn-primary btn-block"
           style="margin-top:var(--space-5)">
          Continuar agora
        </a>
      </div>
    </div>`;

  // Reset do estado — próxima vez começa do zero
  const _destino = destino;
  rec.passo = 1;
  rec.email = "";
  rec.codigo = "";
  rec.sucesso = false;

  // Auto-redirect após 1.8s
  setTimeout(() => {
    location.hash = _destino;
  }, 1800);
}

/* ═══════════════════════════════════════════════════════════
   STEPS (indicador de progresso)
   ═══════════════════════════════════════════════════════════ */
function templateSteps(activo) {
  return `
    <div class="steps">
      ${[1, 2, 3]
        .map((n) => `<span class="${activo >= n ? "is-on" : ""}"></span>`)
        .join("")}
    </div>`;
}
