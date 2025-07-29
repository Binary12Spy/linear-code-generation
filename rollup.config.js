import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';

export default {
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
            format: 'esm',
            sourcemap: true,
            plugins: [terser()]
        }
    ],
    plugins: [typescript()],
    external: []
};