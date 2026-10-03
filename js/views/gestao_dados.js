// import {
//   $,
//   esc,
//   toast,
//   ocupado,
//   caixaErro,
//   erroCaixa,
//   iniciais,
// } from "../utils.js";
// import { api } from "../api.js";
// import { sessao } from "../state.js";

// export function vistaGestaoDados(alvo, user) {
//   alvo.innerHTML = `
//     <form id="f-dados" class="form" novalidate>
//       <div class="gestao-perfil">
//         <span class="avatar avatar--lg">${iniciais(user.nome)}</span>
//         <div>
//           <h2 class="gestao-perfil__nome">${esc(user.nome)}</h2>
//           <p class="muted text-sm">${esc(user.email || "")}</p>
//         </div>
//       </div>

//       <fieldset class="fieldset">
//         <legend>Os teus dados</legend>

//         <label class="field">
//           <span class="field__label">Nome completo</span>
//           <input name="nome" value="${esc(user.nome || "")}" class="input">
//         </label>

//         <label class="field" style="margin-top:var(--space-4)">
//           <span class="field__label">Telefone (WhatsApp)</span>
//           <input name="telefone" type="tel" inputmode="tel"
//                  value="${esc(user.telefone || "")}" class="input">
//         </label>

//         <label class="field" style="margin-top:var(--space-4)">
//           <span class="field__label">Email</span>
//           <input name="email" type="email" value="${esc(user.email || "")}" class="input" disabled>
//           <span class="field__hint">Para alterar o email, contacta-nos.</span>
//         </label>
//       </fieldset>

//       ${caixaErro("erro-dados")}

//       <button class="btn btn-primary btn-block">Guardar alterações</button>
//       <button type="button" id="sair-conta" class="btn btn-ghost btn-block">Terminar sessão</button>
//     </form>`;

//   const f = $("#f-dados");

//   $("#sair-conta").onclick = () => {
//     sessao.sair();
//     toast("Sessão terminada");
//     location.hash = "#/";
//   };

//   f.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const d = Object.fromEntries(new FormData(f).entries());

//     if (!String(d.nome || "").trim())
//       return erroCaixa("erro-dados", "O nome não pode ficar vazio.");

//     const btn = f.querySelector('button[type="submit"], button:not([type])');
//     const solta = ocupado(btn, "A guardar…");

//     try {
//       await api.perfil(d);
//     } catch {
//       // segue mesmo se a API ainda não tiver PUT /api/perfil
//     }

//     sessao.actualizar(d);
//     solta();
//     toast("Dados guardados");
//   });
// }

import { esc, iniciais } from "../utils.js";
import { CONFIG } from "../config.js";

export function vistaGestaoDados(alvo, user) {
  const numero = "244925103300"; // formato internacional para o link
  const display = "925 103 300"; // formato visível

  const msg = encodeURIComponent(
    "Olá! Preciso de alterar os meus dados na plataforma.",
  );
  const wa = `https://wa.me/${numero}?text=${msg}`;

  alvo.innerHTML = `
    <div class="gestao-dados">
      <div class="gestao-perfil">
        <span class="avatar avatar--lg">${iniciais(user.nome)}</span>
        <div>
          <h2 class="gestao-perfil__nome">${esc(user.nome || "")}</h2>
          <p class="muted text-sm">${esc(user.email || "")}</p>
          <p class="muted text-sm">${esc(user.telefone || "Sem telefone")}</p>
        </div>
      </div>

      <div class="gestao-placeholder" style="margin-top:var(--space-6)">
        <div class="empty">
          <p class="empty__title">Edição em breve</p>
          <p class="empty__text">
            A edição do perfil (nome, telefone, verificação) será adicionada
            na próxima ronda.
          </p>
          <p class="empty__text" style="margin-top:var(--space-3)">
            Para alterar os teus dados agora, fala connosco:
          </p>
          <a href="${wa}" target="_blank" rel="noopener"
             class="btn btn-primary" style="margin-top:var(--space-4)">
            WhatsApp ${display}
          </a>
        </div>
      </div>
    </div>`;
}
