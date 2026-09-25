import { api } from '../api.js';
import { $, toast, ocupado, caixaErro, erroCaixa, ligarOlhos, campoSenha } from '../utils.js';

const app = document.getElementById('app');
const rec = { passo: 1, email: '', codigo: '' };

export function vistaRecuperar(){
  const passos = `<div class="steps">
    ${[1,2,3].map(n => `<span class="${rec.passo >= n ? 'is-on' : ''}"></span>`).join('')}
  </div>`;

  if (rec.passo === 1) return passo1(passos);
  if (rec.passo === 2) return passo2(passos);
  return passo3(passos);
}

function passo1(passos){
  app.innerHTML = `
  <div class="auth-wrap fade-in"><div class="auth-card">
    <h1 class="auth-title">Recuperar conta</h1>
    <p class="auth-subtitle">Escreve o <strong>email</strong> com que criaste a conta. Enviamos um código de 6 dígitos.</p>
    ${passos}
    <form id="f1" class="auth-body" novalidate>
      <label class="field">
        <span class="field__label">Email</span>
        <input name="email" type="email" required autocomplete="email" placeholder="ana@exemplo.ao" class="input">
      </label>
      ${caixaErro('erro1')}
      <button class="btn btn-primary btn-block" style="margin-top:1rem">Enviar código</button>
    </form>
    <p class="auth-foot"><a href="#/entrar">Voltar a entrar</a></p>
  </div></div>`;

  $('#f1').addEventListener('submit',