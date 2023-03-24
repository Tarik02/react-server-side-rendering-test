import { routes } from '@app/ui/routes';
import createEmotionCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { MantineProvider } from '@mantine/core';
import { } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

const rootElement = document.getElementById('root')! as HTMLDivElement;

const cache = createEmotionCache({ key: 'mantine' });

const router = createBrowserRouter(routes);

const rootApp = (
    <HelmetProvider>
        <CacheProvider value={ cache }>
            <MantineProvider emotionCache={ cache }>
                <RouterProvider router={ router } />
            </MantineProvider>
        </CacheProvider>
    </HelmetProvider>
);

const root = rootElement.dataset.ssr ?
    hydrateRoot(rootElement, rootApp) :
    createRoot(rootElement).render(rootApp);
