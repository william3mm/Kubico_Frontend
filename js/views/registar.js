import { api } from "../api.js";
import { sessao } from "../state.js";
import {
  $,
  $$,
  toast,
  ocupado,
  caixaErro,
  erroCaixa,
  ligarOlhos,
  campoSenha,
  forcaSenha,
} from "../utils.js";

export function vistaRegistar() {
  const app = $("#app");

  app.innerHTML = `
    <div class="auth-wrap fade-in">
      <div class="auth-card">
        <h1 class="auth-title">Criar conta</h1>
        <p class="auth-subtitle">
          Registe-se para publicar e gerir os seus imóveis no Kubiko.
        </p>

        <form id="f-registar" class="auth-body" novalidate>
          <label class="field">
            <span class="field__label">Nome completo</span>
            <input name="nome" required autocomplete="name"
                   placeholder="Ana Pedro" class="input">
          </label>

          <label class="field">
            <span class="field__label">Telefone (WhatsApp)</span>
            <input name="telefone" type="tel" inputmode="tel" required
                   autocomplete="tel" placeholder="923 000 000" class="input">
          </label>

          <label class="field">
            <span class="field__label">
              Email 
            </span>
            <input name="email" type="email" autocomplete="email"
                   placeholder="ana@exemplo.ao" class="input">
          </label>

          <div>
            <span class="field__label">Senha</span>
            ${campoSenha("senha", "Mínimo 8 caracteres", "new-password")}
            <div class="pw-strength" id="barras">
              <span></span><span></span><span></span><span></span>
            </div>
            <p id="dica-senha" class="field__hint">
              Junta letras, números e um símbolo.
            </p>
          </div>

          <label class="check-row">
            <input type="checkbox" name="termos">
            <span class="muted">
              Aceito os termos de uso e a política de privacidade do Kubiko.
            </span>
          </label>

          ${caixaErro("erro-registar")}

          <button class="btn btn-primary btn-block">Criar conta</button>
        </form>
      </div>

      <p class="auth-foot">
        Já tens conta? <a href="#/entrar">Entrar</a>
      </p>
    </div>`;

  ligarOlhos(app);

  const senha = app.querySelector('[name="senha"]');
  const barras = $$("#barras span", app);
  const dica = $("#dica-senha");

  senha.addEventListener("input", () => {
    const f = forcaSenha(senha.value);
    barras.forEach((b, i) => b.classList.toggle("is-on", i < f));
    dica.textContent = [
      "Junta letras, números e um símbolo.",
      "Senha fraca.",
      "Senha razoável.",
      "Senha boa.",
      "Senha forte.",
    ][f];
  });

  $("#f-registar").addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = new FormData(e.target);

    const dados = {
      nome: String(d.get("nome") || "").trim(),
      telefone: String(d.get("telefone") || "").trim(),
      email: String(d.get("email") || "").trim(),
      senha: String(d.get("senha") || ""),
    };

    if (!dados.nome || !dados.telefone)
      return erroCaixa("erro-registar", "Preenche o nome e o telefone.");
    if (dados.senha.length < 8)
      return erroCaixa(
        "erro-registar",
        "A senha precisa de pelo menos 8 caracteres.",
      );
    if (!d.get("termos"))
      return erroCaixa(
        "erro-registar",
        "Aceita os termos de uso para continuar.",
      );

    const btn = e.target.querySelector("button");
    const solta = ocupado(btn, "A criar conta…");

    try {
      const r = await api.registar(dados);
      sessao.guardar(r.token, r.utilizador || r.user || dados);
      toast("Conta criada");
      location.hash = "#/painel";
    } catch (err) {
      solta();
      if (err.status === 409)
        return erroCaixa(
          "erro-registar",
          "Já existe uma conta com este telefone. Entra ou recupera a senha.",
        );
      erroCaixa(
        "erro-registar",
        "Não conseguimos criar a conta. Tenta outra vez.",
      );
    }
  });
}
