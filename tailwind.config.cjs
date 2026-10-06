/** Tailwind — build statique (remplace le CDN runtime).
 *  Rebuild : npx tailwindcss@3.4.17 -c tailwind.config.cjs -o assets/vendor/tailwind.css --minify
 *  Le scanner lit les classes dans index.html et admin.html (y compris celles
 *  présentes dans les template literals JS). La safelist couvre les classes
 *  construites dynamiquement (couleurs des chiffres clés, modifiables via l'admin).
 *  NB : palette volontairement sobre (style minimaliste) — un seul accent
 *  terracotta, tons sable/pierre, ombres discrètes.
 */
module.exports = {
  content: ['./index.html', './admin.html'],
  safelist: [
    'text-brandRed', 'text-brandOrange', 'text-brandGreen',
    'text-brandYellow', 'text-brandPink', 'text-brandPurple',
  ],
  theme: {
    extend: {
      fontFamily: {
        fredoka: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        nunito: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        caveat: ['"Iowan Old Style"', 'Palatino', 'Georgia', 'serif'],
      },
      colors: {
        brandRed: '#A6522F', brandOrange: '#B08A3E', brandYellow: '#B08A3E',
        brandGreen: '#55664F', brandPink: '#9C948A', brandPurple: '#4A443C',
        cream: '#FAF9F6', ink: '#17140F',
      },
      boxShadow: {
        pop: '0 1px 2px rgba(23,20,15,.07)',
        pops: '0 6px 18px rgba(23,20,15,.09)',
        popsm: '0 1px 1px rgba(23,20,15,.05)',
      },
    },
  },
  plugins: [],
};
