import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Outlet } from "react-router-dom"


const ProtectedRoutes = ({ children }) => {
    const { user } = useContext(AuthContext) //Desestructuracion de un objeto. En la llave voy a recibir la informacion que pase en context {value}


    return (
        <>
            {user.role === "student" ? <Outlet /> : <div>Error, no sos estudiante</div>}
        </>

    )
}

export default ProtectedRoutes