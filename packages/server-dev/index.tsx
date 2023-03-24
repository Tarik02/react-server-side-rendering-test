import createFastify from 'fastify';
import { fastifyWebpackHot } from 'fastify-webpack-hot';
import * as nodePath from 'node:path';
import pino from 'pino';
import webpack from 'webpack';
import { z } from 'zod';

import { buildConfig } from '../client/webpack.config';

const logger = pino({
    level: 'debug'
});

const env = z.object({
    PORT: z.coerce.number().default(3000)
}).parse(
    process.env
);

const abortController = new AbortController();

import.meta.webpackHot?.accept();
import.meta.webpackHot?.accept('../server/renderApplication');
import.meta.webpackHot?.dispose(() => {
    abortController.abort();
});

const fastify = createFastify({
    logger,
    disableRequestLogging: true
});

const config = await buildConfig({
    context: nodePath.join(__dirname, '../../client'),
    mode: 'development',
    hot: true,
    entryPrepend: [
        'fastify-webpack-hot/client'
    ]
});

config.plugins = config.plugins ?? [];
config.plugins.push(
    new webpack.HotModuleReplacementPlugin()
);

const compiler = webpack(
    config
);

fastify.register(fastifyWebpackHot, {
    prefix: '/dev-server',
    compiler
});

fastify.get('*', async (request, reply) => {
    const stats = request.webpack.stats?.toJson({
        all: false,
        entrypoints: true
    });

    const scripts = (
        <>
            { (stats?.entrypoints?.app.assets ?? []).slice(0, 1)
                .filter(
                    asset => asset.name.match(/\.[cm]?js$/) && !asset.name.match(/\.hot-update\.[cm]?js$/)
                )
                .map(asset => (
                    <script
                        key={ asset.name }
                        defer
                        type="module"
                        src={ `/${ asset.name }` }
                    />
                ))
            }
        </>
    );

    const {
        renderApplication,
        renderApplicationWithSsr
    } = await import('../server/renderApplication');

    let stream;
    try {
        stream = await renderApplicationWithSsr({
            url: `${ request.protocol }://${ request.hostname }${ request.url }`,
            scripts
        });
    } catch (error) {
        fastify.log.error(error);

        stream = await renderApplication({
            scripts
        });
    }

    reply.hijack();
    reply.raw.write('<!doctype html>');
    stream.pipe(reply.raw);
});

try {
    await fastify.listen({
        host: '0.0.0.0',
        port: env.PORT,
        signal: abortController.signal
    });
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
