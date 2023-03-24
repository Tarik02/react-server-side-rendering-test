import { RouteObject } from 'react-router-dom';

import { App } from '../components/App';
import { Home } from '../pages/Home';
import { Test } from '../pages/Test';

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/',
                element: <Home />
            },
            {
                path: '/test',
                element: <Test />
            }
        ]
    }
];
