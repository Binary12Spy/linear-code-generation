import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';

// Main bundle configuration
const mainConfig = {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/index.cjs.js',
            format: 'cjs'
        },
        {
            file: 'dist/index.esm.js',
            format: 'es'
        },
        {
            file: 'dist/index.min.js',
            format: 'es',
            sourcemap: true,
            plugins: [terser()]
        }
    ],
    plugins: [typescript()],
    external: []
};

// Individual format configurations for tree-shaking
const code39Config = {
    input: 'src/Code_39/index.ts',
    output: [
        {
            file: 'dist/Code_39/index.cjs.js',
            format: 'cjs'
        },
        {
            file: 'dist/Code_39/index.esm.js',
            format: 'es'
        }
    ],
    plugins: [typescript()],
    external: []
};

export default [mainConfig, code39Config];