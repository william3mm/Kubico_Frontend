import { api } from "../api.js";
import { sessao } from "../state.js";
import {
  $,
  toast,
  ocupado,
  caixaErro,
  erroCaixa,
  ligarOlhos,
  campoSenha,
} from "../utils.js";

function encaminharPorTipo(u) {
  if (u?.tipo === "PROPRIETARIO" || u?.tipo === "ADMIN") {
    location.hash = "#/gestao";
  } else {
    location.hash = "#/";
  }
}

export function vistaEntrar() {
  const app = $("#app");

  app.innerHTML = `
    <div class="auth-wrap fade-in">
      <div class="auth-card">
        <h1 class="auth-title">Entrar na conta</h1>
        <p class="auth-subtitle">
          Usa o email com que criaste a conta.
        </p>

        <form id="f-entrar" class="auth-body" novalidate>
          <label class="field">
            <span class="field__label">Email</span>
            <input name="email" type="email" required autocomplete="email"
                   placeholder="ana@exemplo.ao" class="input">
          </label>

          <div>
            <div class="auth-label-row">
              <span class="field__label">Senha</span>
              <a href="#/recuperar">Esqueci-me</a>
            </div>
            ${campoSenha("senha", "A tua senha", "current-password")}
          </div>

          <label class="check-row">
            <input type="checkbox" name="manter" checked>
            <span>Manter a sessão aberta neste telemóvel</span>
          </label>

          ${caixaErro("erro-entrar")}

          <button class="btn btn-primary btn-block">Entrar</button>
        </form>
      </div>

      <p class="auth-foot">
        Ainda não tens conta?
        <a href="#/registar">Criar conta</a>
      </p>
    </div>`;

  ligarOlhos(app);

  $("#f-entrar").addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = new FormData(e.target);
    const email = String(d.get("email") || "")
      .trim()
      .toLowerCase();
    const senha = String(d.get("senha") || "");

    if (!email || !senha)
      return erroCaixa("erro-entrar", "Escreve o email e a senha.");

    const btn = e.target.querySelector("button");
    const solta = ocupado(btn, "A entrar…");

    try {
      const r = await api.entrar({ email, senha });

      // O backend devolve { usuario }, o token vem no cookie HttpOnly
      const u = r?.usuario || r?.utilizador || r?.user;

      if (u) {
        sessao.guardar("cookie-auth", u);
      }

      toast("Bem-vindo");
      encaminharPorTipo(u);
    } catch (err) {
      solta();

      if (err.status === 401) {
        return erroCaixa(
          "erro-entrar",
          "Email ou senha errados. Tenta outra vez.",
        );
      }

      if (err.status === 403) {
        return erroCaixa(
          "erro-entrar",
          "A tua conta ainda não está confirmada. Verifica o teu email.",
        );
      }

      erroCaixa(
        "erro-entrar",
        err.dados?.erro || "Não conseguimos entrar. Tenta outra vez.",
      );
    }
  });
}
