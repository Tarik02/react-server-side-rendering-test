import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export const Test = () => {
    return (
        <div>
            <Helmet>
                <title>Test</title>
            </Helmet>

            Test

            <Link to="/">Home</Link>
        </div>
    );
};
