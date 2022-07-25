import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import eslint from '@rollup/plugin-eslint';
import builtins from 'builtin-modules';
import livereload from 'rollup-plugin-livereload';
import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';
import { join } from 'path';
import autoprefixer from 'autoprefixer';
import nested from 'postcss-nested';
import variables from 'postcss-css-variables';
import { generateSW } from 'rollup-plugin-workbox';

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
    external: [builtins, /^Components\/.*/, /^TemplatesCommonLib\/.*/, /^esri\/.*/, /^dojo\/.*/, /^dijit\/.*/, /^dojox?\/.*/, /^moment\/.*/, /^async\/.*/, /.*html$/],
    plugins: [
        replace({
            exclude: './src/config.ts',
            preventAssignment: true,
            'process.env.PRODUCTION': JSON.stringify(!dev),
            __buildDate__: () => JSON.stringify(new Date()),
            __buildVersion: 15,
        }),
        generateSW({
            swDest: join(OUTPUT, 'sw.js'),
            globDirectory: OUTPUT,
            mode: dev ? 'development' : 'production',
            cacheId: 'im-app',
            runtimeCaching: [
                {
                    // Match any request ends with .png, .jpg, .jpeg or .svg.
                    urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
                    // Apply a cache-first strategy.
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'im-app-images',
                        expiration: {
                            maxEntries: 2000,
                            maxAgeSeconds: 604800,
                        },
                    },
                },
                {
                    // Match any fonts
                    urlPattern: /\.(?:eot|ttf|jpeg|woff|woff2)$/,
                    // Apply a cache-first strategy.
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'im-app-fonts',
                        expiration: {
                            maxEntries: 2000,
                            maxAgeSeconds: 604800,
                        },
                    },
                },
                {
                    urlPattern: new RegExp('https://api.airtable.com'),
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'im-app-airtable',
                        expiration: {
                            maxEntries: 2000,
                            maxAgeSeconds: 21600,
                        },
                    },
                },
                {
                    urlPattern: new RegExp('https://js.arcgis.com'),
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'im-app-arcgis-js',
                        expiration: {
                            maxEntries: 2000,
                            maxAgeSeconds: 604800,
                        },
                    },
                },
                {
                    urlPattern: new RegExp('https://basemaps.arcgis.com'),
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'im-app-arcgis-basemaps',
                        expiration: {
                            maxEntries: 2000,
                            maxAgeSeconds: 604800,
                        },
                    },
                },
                {
                    urlPattern: 'https://services\\d?\\.arcgis\\.com/.*',
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'im-app-arcgis-services',
                        expiration: {
                            maxEntries: 2000,
                            maxAgeSeconds: 86400,
                        },
                    },
                },
                {
                    urlPattern: new RegExp('https://www\\.arcgis\\.com/.*'),
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'im-app-arcgis-portal',
                        expiration: {
                            maxEntries: 2000,
                            maxAgeSeconds: 86400,
                        },
                    },
                },
            ],
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
                { src: 'src/config.json', dest: OUTPUT },
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
