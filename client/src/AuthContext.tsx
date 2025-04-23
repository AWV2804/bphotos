import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
    token: string | null;
    username: string | null;
    userid: string | null;
    login: (token: string, username: string, userid: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
    const [userid, setUserid] = useState<string | null>(localStorage.getItem('userid'));

    const login = (token: string, username: string, userid: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('userid', userid);
        setToken(token);
        setUsername(username);
        setUserid(userid);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userid');
        setToken(null);
        setUsername(null);
        setUserid(null);
    };

    return (
        <AuthContext.Provider value={{ token, username, userid, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};