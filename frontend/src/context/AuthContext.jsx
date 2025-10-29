import { createContext, useContext, useState } from "react"

const AuthContext = createContext();

const AuthProvider = ({ children }) => {

    const [user, setUser] = useState({
        name: "Franco",
        email: "franco@ucu.com",
        password: "123",
        role: "student"
    })

    return (
        <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
    )
}

export { AuthProvider, AuthContext }