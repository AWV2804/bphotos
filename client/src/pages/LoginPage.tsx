import { Link } from "react-router-dom";
import { constructBackendUrl } from "../utils/backendurl";
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async () => {
        try {
            const backendUrl = await constructBackendUrl('/users/login');
            const requestBody = JSON.stringify({
                email: email,
                password: password
            });
            console.log(requestBody);
            console.log(backendUrl);
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody
            });
            const data = await response.json();
            if (response.status === 200) {
                console.log(data);
                login(data.token, data.username, data.userid);
                navigate('/photos');
                console.log('Login successful');
            } else {
                alert(data.message || 'Login failed');
                console.log(data.message || 'Login failed');
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-blue-100 to-gray-100">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 text-center">
                Log In to <span className="text-blue-600">BPhotos 📸</span>
            </h1>
            <p className="text-lg text-gray-700 mb-6 text-center max-w-lg">
                Welcome back! Please log in to continue.
            </p>

            <form className="w-full max-w-sm" onSubmit={e => e.preventDefault()}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className="btn_primary cursor-pointer px-6 py-3 text-lg text-white rounded-lg shadow-md transition focus:outline-1 focus:ring-2 focus:ring-blue-700"
                        type="submit"
                        onClick={handleLogin}
                    >
                        Log In
                    </button>
                    <Link
                        to="/forgot-password"
                        className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800"
                    >
                        Forgot Password?
                    </Link>
                </div>
            </form>

            <p className="text-gray-700 mt-6">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-600 hover:text-blue-800">
                    Get Started
                </Link>
            </p>
        </div>
    );
};

export default LoginPage;