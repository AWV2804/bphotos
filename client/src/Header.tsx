import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Header: React.FC = () => {
    const { token, username, logout } = useAuth();

    return (
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">
                Home
            </Link>
            {token ? (
                <div>
                    Logged in: {username}
                    <button onClick={logout} className="ml-4 px-4 py-2 bg-red-600 rounded-md">
                        Logout
                    </button>
                </div>
            ) : (
                <Link to="/login" className="px-4 py-2 bg-blue-600 rounded-md">
                    Log In
                </Link>
            )}
        </header>
    );
};

export default Header;