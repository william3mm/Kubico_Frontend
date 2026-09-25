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

export function vistaEntrar(onSucesso) {
  const app = $("#app");

  app.innerHTML = `
    <div class="auth-wrap fade-in">
      <div class="auth-card">
        <h1 class="auth-title">Entrar na conta</h1>
        <p class="auth-subtitle">
          Usa o número de telefone ou o email com que criaste a conta.
        </p>

        <form id="f-entrar" class="auth-body" novalidate>
          <label class="field">
            <span class="field__label">Telefone ou email</span>
            <input name="identificador" required autocomplete="username"
                   placeholder="923 000 000" class="input">
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
    const identificador = String(d.get("identificador") || "").trim();
    const senha = String(d.get("senha") || "");

    if (!identificador || !senha)
      return erroCaixa("erro-entrar", "Escreve o telefone ou email e a senha.");

    const btn = e.target.querySelector("button");
    const solta = ocupado(btn, "A entrar…");

    try {
      const r = await api.entrar({ identificador, senha });
      sessao.guardar(r.token, r.utilizador || r.user);
      toast("Bem-vindo");
      onSucesso?.();
    } catch (err) {
      solta();
      if (err.status === 401)
        return erroCaixa(
          "erro-entrar",
          "Telefone ou senha errados. Tenta outra vez.",
        );
      erroCaixa(
        "erro-entrar",
        "Não conseguimos ligar ao servidor. Tenta outra vez.",
      );
    }
  });
}
