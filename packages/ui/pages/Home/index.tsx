import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export const Home = () => {
    return (
        <div>
            <Helmet>
                <title>Home</title>
            </Helmet>

            Home

            <Link to="/test">Test</Link>
        </div>
    );
};
