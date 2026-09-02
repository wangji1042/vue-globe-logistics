import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
// import typescript from '@rollup/plugin-typescript';
// import dts from 'vite-plugin-dts';
import { peerDependencies } from './package.json';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
        includePaths: [path.resolve(__dirname, 'src/styles')]
      }
    }
  },
  plugins: [
    vue()
    // typescript({
    //   tsconfig: './tsconfig.lib.json',
    //   compilerOptions: {
    //     noEmit: false,
    //     rootDir: 'src'
    //   }
    // }),
    // dts({
    //   insertTypesEntry: true,
    //   cleanVueFileName: true,
    //   copyDtsFiles: false,
    //   outDir: 'dist/types',
    //   root: 'src',
    //   include: [
    //     'components/GlobalLogistics/**/*',
    //     'types/**/*',
    //     'hooks/**/*',
    //     'utils/**/*'
    //   ]
    // })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/components/GlobalLogistics/index.vue'),
      name: 'GlobalLogistics',
      formats: ['es', 'umd'],
      fileName: format => `global-logistics.${format}.js`
    },
    rollupOptions: {
      external: [...Object.keys(peerDependencies), 'three'],
      output: {
        globals: {
          vue: 'Vue',
          three: 'THREE'
        },
        assetFileNames: 'style/[name].[ext]'
      },
      preserveEntrySignatures: 'allow-extension'
    },
    outDir: 'dist',
    sourcemap: true,
    cssCodeSplit: false
  }
});
