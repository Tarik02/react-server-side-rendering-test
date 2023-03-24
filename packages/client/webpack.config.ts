import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import * as nodePath from 'node:path';
import { fileURLToPath } from 'node:url';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import sortKeys from 'sort-keys';
import * as webpack from 'webpack';
import WebpackAssetsManifest from 'webpack-assets-manifest';
import { Argv } from 'webpack-cli';
import { z } from 'zod';

export const buildConfig = async ({
    context,
    mode,
    hot = false,
    entryPrepend = []
}: {
    context: string,
    mode: 'development' | 'production',
    hot?: boolean,
    entryPrepend?: string[]
}): Promise<webpack.Configuration> => {
    //

    return {
        context,
        mode,
        target: 'web',

        devtool: {
            development: 'inline-source-map' as const,
            production: false as const
        }[ mode ],

        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                getCustomTransformers: () => ({
                                    before: [
                                        hot && ReactRefreshTypeScript()
                                    ].filter(Boolean)
                                })
                            }
                        }
                    ]
                }
            ]
        },

        entry: {
            app: [
                ...entryPrepend,
                '.'
            ]
        },
        output: {
            path: nodePath.join(context, './dist'),
            filename: `assets/js/[name]${ mode === 'production' ? '.[contenthash]' : '' }.js`,
            chunkFilename: `assets/js/[id]${ mode === 'production' ? '.[contenthash]' : '' }.js`
        },

        resolve: {
            extensions: [ '.tsx', '.ts', '.jsx', '.js' ]
        },

        plugins: [
            new WebpackAssetsManifest({
                output: '.manifest.json',
                transform: ({ entrypoints, ...assets }) => sortKeys({ entrypoints }, { deep: true }),
                publicPath: '',
                entrypoints: true
            }),
            hot && new ReactRefreshWebpackPlugin()
        ].filter(Boolean),

        experiments: {
            topLevelAwait: true
        }
    };
};

export default async (env: Argv['env'], rawArgv: Argv) => {
    const argv = z.object({
        mode: z.union([ z.literal('development'), z.literal('production') ]).default('development')
    }).parse(rawArgv);

    return buildConfig({
        context: nodePath.dirname(fileURLToPath(import.meta.url)),
        mode: argv.mode,
        hot: !!env?.WEBPACK_SERVE
    });
};
