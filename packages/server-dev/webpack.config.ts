import * as nodePath from 'node:path';
import { fileURLToPath } from 'node:url';
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';
import webpack from 'webpack';
import { Argv } from 'webpack-cli';
import nodeExternals from 'webpack-node-externals';
import { z } from 'zod';

export const buildConfig = async ({
    context
}: {
    context: string
}): Promise<webpack.Configuration> => {
    //

    return {
        context,
        mode: 'development',
        target: 'node',

        devtool: 'inline-source-map',

        node: {
            global: false,
            __filename: true,
            __dirname: true
        },

        externals: [
            nodeExternals({
                modulesDir: nodePath.join(nodePath.dirname(fileURLToPath(import.meta.url)), '../../node_modules'),
                allowlist: [
                    'webpack/hot/poll?100',
                    /^@app\//
                ]
                // importType: moduleName => `await import(${ JSON.stringify(moduleName) })`
            })
        ],

        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    type: 'javascript/esm'
                }
            ]
        },

        entry: {
            server: [ 'webpack/hot/poll?100', '.' ]
            // server: [ '.' ]
        },
        output: {
            clean: true,
            path: nodePath.join(context, './dist'),
            filename: '[name].cjs',
            chunkFilename: '[id].cjs',
            hotUpdateChunkFilename: '[id].[fullhash].hot-update.cjs'
        },

        resolve: {
            extensions: [ '.tsx', '.ts', '.jsx', '.js' ]
        },

        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new RunScriptWebpackPlugin({
                name: 'server.cjs',
                autoRestart: false
            })
        ],

        experiments: {
            topLevelAwait: true
        }
    };
};

export default async (env: Argv['env'], rawArgv: Argv) => {
    return buildConfig({
        context: nodePath.dirname(fileURLToPath(import.meta.url))
    });
};
