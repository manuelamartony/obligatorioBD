"use client";

import './styles/App.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Panel from './pages/Panel'
import Home from './pages/Home'
import Login, { loginAction } from './pages/Login'
import MisReservas from './pages/MisReservas';
import NuevaReserva from './pages/NuevaReserva';
import Reportes from './pages/Reportes';
import Salas from './pages/Salas';
import Participantes from './pages/Participantes';

import ProtectedRoutes from './components/ProtectedRoutes';
import Sanciones from './pages/Sanciones';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
    action: loginAction,
  },

  {
    element: <ProtectedRoutes roles={["alumno", "admin", "docente"]} />,
    children: [
      { path: "/my/panel", element: <Panel /> },
      { path: "/my/panel/mis-reservas", element: <MisReservas /> },
      { path: "/my/panel/nueva-reserva", element: <NuevaReserva /> },
    ],
  },

  {
    element: <ProtectedRoutes roles={["admin"]} />,
    children: [
      { path: "/my/panel/reportes", element: <Reportes /> },
      { path: "/my/panel/salas", element: <Salas /> },
      { path: "/my/panel/participantes", element: <Participantes /> },
      { path: "/my/panel/sanciones", element: <Sanciones /> }
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
