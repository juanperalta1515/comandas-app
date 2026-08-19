import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Usar rutas relativas para asegurar que los recursos carguen en subdirectorios de GitHub Pages
  build: {
    outDir: 'docs', // Compilar dentro de /docs para que GitHub Pages lo sirva directamente
    emptyOutDir: false, // Conservar DOCUMENTACION.md u otros archivos del usuario en la carpeta
  }
})
