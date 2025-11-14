import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext();

const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)

    // Esto es para guardar al usuario si refresca la pagina
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);


    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, login }}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthProvider, AuthContext }
