import { readFile } from 'fs/promises';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(async () => {
  const pkgJson = JSON.parse(await readFile('package.json', 'utf8'));
  const externals = Object.keys({
    ...pkgJson.dependencies,
    ...pkgJson.peerDependencies,
  });
  return {
    plugins: [react()],
    build: {
      lib: {
        entry: 'src/index.ts',
        formats: ['es'],
      },
      rollupOptions: {
        external: (id) => {
          const pkgName = id
            .split('/')
            .slice(0, id.startsWith('@') ? 2 : 1)
            .join('/');
          return externals.includes(pkgName);
        },
      },
    },
  };
});
