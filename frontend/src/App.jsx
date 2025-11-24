"use client";


import './styles/App.css'
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import Panel from './pages/Panel'
import Home from './pages/Home'
import Login, { loginAction } from './pages/Login'
import MisReservas from './pages/MisReservas';
import NuevaReserva from './pages/NuevaReserva';
import Reportes from './pages/Reportes';
import Salas from './pages/Salas';

import ProtectedRoutes from './components/ProtectedRoutes';
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
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
