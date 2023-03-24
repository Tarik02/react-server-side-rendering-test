import { routes } from '@app/ui/routes';
import { CacheProvider } from '@emotion/react';
import { MantineProvider } from '@mantine/core';
import { ServerStyles, createStylesServer } from '@mantine/ssr';
import { ReactNode } from 'react';
import { renderToStaticNodeStream, renderToString } from 'react-dom/server';
import { HelmetData, HelmetProvider } from 'react-helmet-async';
import { StaticRouterProvider, createStaticHandler, createStaticRouter } from 'react-router-dom/server';

const {
    default: createEmotionCache
} = (await import('@emotion/cache')).default as unknown as typeof import('@emotion/cache');

export const renderApplication = async ({
    scripts
}: {
    scripts?: ReactNode
}) => {
    return renderToStaticNodeStream(
        <html>
            <body>
                <div id="root" />

                { scripts }
            </body>
        </html>
    );
};

export const renderApplicationWithSsr = async ({
    url,
    scripts
}: {
    url: string,
    scripts?: ReactNode
}) => {
    const cache = createEmotionCache({ key: 'mantine' });
    const stylesServer = createStylesServer(cache);

    const { query, dataRoutes } = createStaticHandler(routes);

    const context = await query(
        new Request(
            new URL(url).href,
            {
                //
            }
        )
    );

    if (context instanceof Response) {
        throw context;
    }

    const router = createStaticRouter(dataRoutes, context);

    const helmetData = new HelmetData({});

    const appRoot = (
        <HelmetProvider context={ helmetData.context }>
            <CacheProvider value={ cache }>
                <MantineProvider emotionCache={ cache }>
                    <StaticRouterProvider
                        router={ router }
                        context={ context }
                    />
                </MantineProvider>
            </CacheProvider>
        </HelmetProvider>
    );

    const html = renderToString(appRoot);
    const { helmet } = helmetData.context;

    return renderToStaticNodeStream(
        <html>
            <head>
                <>
                    { helmet.title.toComponent() }
                    { helmet.priority.toComponent() }
                    { helmet.meta.toComponent() }
                    { helmet.link.toComponent() }
                    { helmet.script.toComponent() }
                    <ServerStyles
                        html={ html }
                        server={ stylesServer }
                    />
                </>
            </head>
            <body>
                <div
                    data-ssr
                    id="root"
                    dangerouslySetInnerHTML={ { __html: html } }
                />

                { scripts }
            </body>
        </html>
    );
};
