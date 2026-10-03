export const ICONES = {
  local:
    '<path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  quarto:
    '<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 18h18"/><path d="M7 10V7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3"/>',
  banho:
    '<path d="M4 12h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M7 12V6a2 2 0 1 1 4 0"/>',
  area: '<path d="M4 4h16v16H4z"/><path d="M9 4v16M4 9h16"/>',
};

export const ico = (d, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0">${d}</svg>`;

export const SELO = `
  <span class="badge--verified">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1.6l2.5 2.1 3.2-.4 1 3.1 2.8 1.6-1.1 3 1.1 3-2.8 1.6-1 3.1-3.2-.4L12 22.4l-2.5-2.1-3.2.4-1-3.1L2.5 16l1.1-3-1.1-3 2.8-1.6 1-3.1 3.2.4z"/>
      <path d="M10.6 15.4l-2.9-2.9 1.3-1.3 1.6 1.6 4-4 1.3 1.3z" fill="#fff"/>
    </svg>
    Verificado
  </span>`;

export const iconeWA = (size = 20) => `
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.8 9.8 0 0 0 4.68 1.2h.01c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2m5.72 13.9c-.24.68-1.4 1.3-1.93 1.35-.5.05-.96.23-2.7-.56-2.1-.95-3.42-3.14-3.53-3.28-.1-.15-.85-1.16-.85-2.22 0-1.05.55-1.57.75-1.79.2-.22.43-.27.57-.27h.41c.13 0 .32-.05.49.38.17.44.6 1.5.65 1.6.05.11.08.24.01.38-.07.15-.13.24-.26.38l-.2.23c-.13.13-.27.28-.12.53.15.25.66 1.1 1.42 1.78.97.87 1.5 1.02 1.74 1.14.18.1.33.08.46-.05.15-.15.53-.62.68-.83.14-.22.29-.18.48-.11.2.07 1.24.6 1.46.71.21.11.35.16.4.25.05.1.05.56-.19 1.23"/>
  </svg>`;
