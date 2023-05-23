import esbuild from 'esbuild';
import fs from 'fs'

import { copy } from 'esbuild-plugin-copy';

import { typecheckPlugin } from '@jgoz/esbuild-plugin-typecheck';

(async () => {
    const res = esbuild.build({
        entryPoints: ['./src/player.ts'],
        bundle: true,
        platform: "browser",
        sourcemap: true,
        minify: false,
        format: "iife",
        tsconfig: "./tsconfig.json",
        outfile: "./dist/player.js",
        plugins: [
            typecheckPlugin(),
            copy({
                // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
                // if not specified, this plugin uses ESBuild.build outdir/outfile options as base path.
                resolveFrom: 'cwd',
                assets: {
                    from: ['./index.html'],
                    to: ['./dist/index.html'],
                },
                watch: true,
            }),
        ],
    });
})();