import fastifyStatic from '@fastify/static';
import createFastify from 'fastify';
import * as nodeFs from 'node:fs/promises';
import * as nodePath from 'node:path';
import { fileURLToPath } from 'node:url';
import pino from 'pino';
import { z } from 'zod';

import { renderApplication, renderApplicationWithSsr } from '../server/renderApplication';

const staticRoot = nodePath.join(
    nodePath.dirname(fileURLToPath(import.meta.url)),
    '../client/dist'
);

const logger = pino({
    level: 'debug'
});

const env = z.object({
    PORT: z.coerce.number().default(3000)
}).parse(
    process.env
);

const abortController = new AbortController();

const fastify = createFastify({
    logger
});

fastify.register(fastifyStatic, {
    root: nodePath.join(staticRoot, 'assets'),
    prefix: '/assets'
});

const manifest = z.object({
    entrypoints: z.object({
        app: z.object({
            assets: z.object({
                js: z.array(z.string())
            })
        })
    })
}).parse(
    JSON.parse(
        await nodeFs.readFile(
            nodePath.join(staticRoot, './.manifest.json'),
            'utf-8'
        )
    )
);

fastify.get('*', async (request, reply) => {
    const scripts = (
        <>
            { manifest.entrypoints.app.assets.js
                .map(asset => (
                    <script
                        key={ asset }
                        defer
                        type="module"
                        src={ `/${ asset }` }
                    />
                ))
            }
        </>
    );

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
