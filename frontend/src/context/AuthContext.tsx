
import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

import {
    loginUser,
    registerUser,
    type LoginRequest,
    type RegisterRequest,
    type AuthResponse,
} from "../services/authService";

interface AuthContextType {
    user: AuthResponse | null;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthResponse | null>(() => {
        const savedUser = localStorage.getItem("taskflow_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (data: LoginRequest) => {
        const response = await loginUser(data);
        localStorage.setItem("taskflow_user", JSON.stringify(response));
        localStorage.setItem("taskflow_token", response.token);
        setUser(response);
    };

    const register = async (data: RegisterRequest) => {
        const response = await registerUser(data);
        localStorage.setItem("taskflow_user", JSON.stringify(response));
        localStorage.setItem("taskflow_token", response.token);
        setUser(response);
    };

    const logout = () => {
        localStorage.removeItem("taskflow_user");
        localStorage.removeItem("taskflow_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};
