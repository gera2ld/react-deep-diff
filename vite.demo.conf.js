import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  base: '',
  build: {
    outDir: 'dist/demo',
  },
});
