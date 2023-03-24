import { MantineProvider } from '@mantine/core';
import { useEmotionCache } from '@mantine/styles';
import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';

export const App = () => {
    const cache = useEmotionCache();

    return (
        <MantineProvider
            inherit
            emotionCache={ cache }
            withGlobalStyles
            withNormalizeCSS
        >
            <Helmet>
                <link
                    rel="icon"
                    href="data:;base64,iVBORw0KGgo="
                />
            </Helmet>

            <Outlet />
        </MantineProvider>
    );
};
