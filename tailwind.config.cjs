module.exports = {
  mode: 'jit',
  purge: [
    './src/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    extend: {
      colors: {
        'njam-green': '#bace33'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}
