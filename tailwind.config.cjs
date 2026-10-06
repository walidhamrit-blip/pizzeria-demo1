/** Tailwind — build statique (remplace le CDN runtime).
 *  Rebuild : npx tailwindcss@3.4.17 -c tailwind.config.cjs -o assets/vendor/tailwind.css --minify
 *  Le scanner lit les classes dans index.html et admin.html (y compris celles
 *  présentes dans les template literals JS). La safelist couvre les classes
 *  construites dynamiquement (couleurs des chiffres clés, modifiables via l'admin).
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
        fredoka: ['Fredoka', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        caveat: ['Caveat', 'cursive'],
      },
      colors: {
        brandRed: '#FF2E4C', brandOrange: '#FF7A00', brandYellow: '#FFC700',
        brandGreen: '#00B25C', brandPink: '#FF4D8D', brandPurple: '#7C3AED',
        cream: '#FFF7E9', ink: '#1E0E0A',
      },
      boxShadow: {
        pop: '6px 6px 0 #1E0E0A', pops: '8px 8px 0 #1E0E0A', popsm: '4px 4px 0 #1E0E0A',
      },
    },
  },
  plugins: [],
};
