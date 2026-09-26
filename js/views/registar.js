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
          Dois minutos e ficas pronto para usar o Kubiko.
        </p>

        <form id="f-registar" class="auth-body" novalidate>

          <!-- ─── Escolha do perfil ─── -->
          <div>
            <span class="field__label">O que vens fazer?</span>
            <div class="option-grid cols-1">

              <label class="perfil-opt is-on" data-perfil="PROPRIETARIO">
                <input class="sr-only" type="radio" name="tipo" value="PROPRIETARIO" checked>
                <span class="perfil-opt__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="1.8"
                       stroke-linejoin="round" stroke-linecap="round">
                    <path d="M4 11l8-6 8 6"/><path d="M6 11v8h12v-8"/><path d="M10 19v-5h4v5"/>
                  </svg>
                </span>
                <span class="perfil-opt__text">
                  <span class="perfil-opt__title">Tenho um imóvel</span>
                  <span class="perfil-opt__desc">Quero arrendar ou vender</span>
                </span>
              </label>

              <label class="perfil-opt" data-perfil="INQUILINO_COMPRADOR">
                <input class="sr-only" type="radio" name="tipo" value="INQUILINO_COMPRADOR">
                <span class="perfil-opt__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="1.8"
                       stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
                  </svg>
                </span>
                <span class="perfil-opt__text">
                  <span class="perfil-opt__title">Procuro um imóvel</span>
                  <span class="perfil-opt__desc">Quero arrendar ou comprar</span>
                </span>
              </label>

            </div>
          </div>

          <!-- ─── Dados ─── -->
          <label class="field">
            <span class="field__label">Nome completo</span>
            <input name="nome" required autocomplete="name"
                   placeholder="Ana Pedro" class="input">
          </label>

          <label class="field">
            <span class="field__label">Email</span>
            <input name="email" type="email" required autocomplete="email"
                   placeholder="ana@exemplo.ao" class="input">
          </label>

          <label class="field">
            <span class="field__label">Telefone (WhatsApp)</span>
            <input name="telefone" type="tel" inputmode="tel" required
                   autocomplete="tel" placeholder="923000000" class="input">
            <span class="field__hint">9 dígitos, começando por 9.</span>
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

  /* ─── Alternar entre perfis ─── */
  $$(".perfil-opt", app).forEach((label) => {
    label.addEventListener("click", () => {
      const input = label.querySelector("input");
      input.checked = true;
      $$(".perfil-opt", app).forEach((l) =>
        l.classList.toggle("is-on", l === label),
      );
    });
  });

  /* ─── Força da senha ─── */
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

  /* ─── Submissão ─── */
  $("#f-registar").addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = new FormData(e.target);

    const tipo = d.get("tipo");
    const nome = String(d.get("nome") || "").trim();
    const email = String(d.get("email") || "")
      .trim()
      .toLowerCase();
    const telefone = String(d.get("telefone") || "").trim();
    const senhaValor = String(d.get("senha") || "");

    /* ─── Validações locais ─── */
    if (!nome || !email || !telefone)
      return erroCaixa("erro-registar", "Preenche o nome, email e telefone.");

    if (!email.includes("@"))
      return erroCaixa("erro-registar", "Escreve um email válido.");

    // Regex do backend: /^9\d{8}$/ → 9 dígitos, começa com 9
    if (!/^9\d{8}$/.test(telefone))
      return erroCaixa(
        "erro-registar",
        "O telefone deve ter 9 dígitos e começar por 9 (ex: 923000000).",
      );

    // Regex do backend: 8-32 chars, maiúscula + minúscula + dígito
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/.test(senhaValor))
      return erroCaixa(
        "erro-registar",
        "A senha precisa de 8-32 caracteres, com maiúsculas, minúsculas e números.",
      );

    if (!d.get("termos"))
      return erroCaixa(
        "erro-registar",
        "Aceita os termos de uso para continuar.",
      );

    const btn = e.target.querySelector(
      'button[type="submit"], button:not([type])',
    );
    const solta = ocupado(btn, "A criar conta…");

    try {
      await api.registar({
        nome,
        email,
        telefone,
        senha: senhaValor,
        tipo, // "PROPRIETARIO" ou "INQUILINO_COMPRADOR"
      });

      toast("Conta criada. Verifica o teu email para o código.");
      location.hash = `#/verificar?email=${encodeURIComponent(email)}`;
    } catch (err) {
      solta();

      if (err.status === 400 || err.status === 409) {
        const msg = err.dados?.erro || err.message;
        return erroCaixa("erro-registar", msg);
      }

      if (err.status === 403) {
        return erroCaixa(
          "erro-registar",
          "Não podes criar este tipo de conta.",
        );
      }

      erroCaixa(
        "erro-registar",
        "Não conseguimos criar a conta. Tenta outra vez.",
      );
    }
  });
}
