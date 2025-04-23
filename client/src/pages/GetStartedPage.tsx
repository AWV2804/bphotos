import React, { useState, useEffect } from 'react';
import { constructBackendUrl } from "../utils/backendurl"
import { useNavigate } from 'react-router-dom';

const GetStartedPage: React.FC = () => {
    const [started, setStarted] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isFormValid, setIsFormValid] = useState(false);
    const navigate = useNavigate();

    const handleGetStarted = () => {
        setStarted(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isPasswordMatch = password === confirmPassword;
        if (!isPasswordMatch) {
            alert("Passwords do not match");
        }
        if (isFormValid) {
            try {
                const backendUrl = await constructBackendUrl('/users/admin');
                const requestBody = JSON.stringify({
                    name: name,
                    email: email,
                    username: username,
                    password: password
                });
                const response = await fetch(backendUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: requestBody
                });
                const data = await response.json();
                if (response.status === 200) {
                    alert(data.message);
                    console.log('User created successfully');
                } else if (response.status === 403) {
                    alert("A user has already been created. Please log in to add more users.");
                    console.log('User already exists');
                } else {
                    alert(data.error || 'User creation failed');
                    console.log(data.error || 'User creation failed');
                }
            } catch (error) {
                alert(`Something went wrong. Please try again later. Error: ${error}`);
                console.log(error);
            }
        }
    };

    useEffect(() => {
        const isFormFilled = name && email && username && password && confirmPassword;
        setIsFormValid(!!isFormFilled);
    }, [name, email, username, password, confirmPassword]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-green-100 to-gray-100">
            <h1 className={`text-5xl font-extrabold text-gray-900 mb-4 text-center transition-all duration-500 ${started ? 'mt-0' : 'mt-20'}`}>
                Get Started with <span className="text-green-600">BPhotos 📸</span>
            </h1>
            {!started && (
                <p className="text-lg text-gray-700 mb-6 text-center max-w-lg">
                    Upload your pictures into your storage system!
                </p>
            )}
            {started && (
                <div className="text-center mt-6 w-full max-w-sm">
                    <p className="text-lg text-gray-700 mb-4">
                        First, we are going to make an account.<br />
                        You can add more users this way.
                    </p>
                    <form className="w-full max-w-sm" onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="block text-gray-700 text-sm font-bold mb-2 text-left" htmlFor="name">
                                Name
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                id="name"
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-gray-700 text-sm font-bold mb-2 text-left" htmlFor="email">
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
                        <div className="mb-3">
                            <label className="block text-gray-700 text-sm font-bold mb-2 text-left" htmlFor="username">
                                Username
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                id="username"
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-gray-700 text-sm font-bold mb-2 text-left" htmlFor="password">
                                Password
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                id="password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div className='mb-8'>
                            <label className="block text-gray-700 text-sm font-bold mb-2 text-left" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn_primary cursor-pointer px-6 py-3 text-lg text-white rounded-lg shadow-md transition focus:outline-1 focus:ring-2 focus:ring-blue-700"
                            type="submit"
                            disabled={!isFormValid}
                        >
                            Create Account
                        </button>
                    </form>
                </div>
            )}
            <div className="flex space-x-4 mt-6">
                {!started && (
                    <button
                        onClick={handleGetStarted}
                        className="px-6 py-3 text-lg text-white bg-green-600 rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-green-700"
                    >
                        Let's Go
                    </button>
                )}
            </div>
        </div>
    );
};

export default GetStartedPage;