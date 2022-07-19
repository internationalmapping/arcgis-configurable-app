import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import eslint from '@rollup/plugin-eslint';
import livereload from 'rollup-plugin-livereload';
import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';
import { join } from 'path';
import autoprefixer from 'autoprefixer';
import nested from 'postcss-nested';
import variables from 'postcss-css-variables';

// Builds based on environment
const dev = process.env.BUILD === 'development';
const OUTPUT = dev ? 'output/dev' : 'output/dist';
const SOURCEMAP = dev ? 'inline' : false;
const MINIFY = dev
    ? null
    : terser({
          output: {
              comments: false,
          },
          compress: true,
      });
const SERVER = dev
    ? [
          serve({
              port: 10001,
              contentBase: ['.', OUTPUT], // serve root so sourcemaps work
          }),
          livereload({
              verbose: true,
          }),
      ]
    : [];

export default {
    input: './src/main.tsx',
    output: {
        dir: OUTPUT,
        format: 'amd',
        sourcemap: SOURCEMAP,
    },
    external: [/^Components\/.*/, /^esri\/.*/, /^dojo\/.*/, /^dijit\/.*/, /^dojox?\/.*/, /^moment\/.*/, /^async\/.*/, /.*html$/],
    plugins: [
        replace({
            exclude: './src/config.ts',
            preventAssignment: true,
            'process.env.PRODUCTION': JSON.stringify(!dev),
            __buildDate__: () => JSON.stringify(new Date()),
            __buildVersion: 15,
        }),
        resolve(),
        del({ targets: OUTPUT }),
        eslint({
            exclude: ['node_modules/**', 'src/**/*.css'],
        }),
        json(),
        typescript(),
        MINIFY,
        postcss({
            extensions: ['.css'],
            sourceMap: SOURCEMAP,
            plugins: [autoprefixer, nested, variables],
            extract: true,
        }),
        copy({
            targets: [
                { src: 'src/*.html', dest: OUTPUT },
                { src: 'src/favicon.ico', dest: OUTPUT },
                {
                    src: './node_modules/@esri/configurable-app-components',
                    dest: join(OUTPUT),
                },
                {
                    src: './node_modules/templates-common-library',
                    dest: join(OUTPUT),
                },
                /* CDN hosted assets via setAssetPath in ./src/main.tsx
                {
                    src: './node_modules/@esri/calcite-components/dist/calcite/assets/',
                    dest: join(OUTPUT),
                },*/
            ],
        }),
        ...SERVER,
    ],
};
