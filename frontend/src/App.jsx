import './styles/App.css'
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import Panel from './pages/Panel'
import Home from './pages/Home'
import Login, { loginAction } from './pages/Login'
import MisReservas from './pages/MisReservas';
import NuevaReserva from './pages/NuevaReserva';
import Reportes from './pages/Reportes';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoutes from './components/ProtectedRoutes';
import { useEffect, useState } from 'react';

function App() {


  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
      action: loginAction, // <-- action del login
    },
    {
      element: <ProtectedRoutes />,
      children: [
        { path: "/my/panel", element: <Panel /> },
        { path: "/my/panel/mis-reservas", element: <MisReservas /> },
        { path: "/my/panel/nueva-reserva", element: <NuevaReserva /> },
        { path: "/my/panel/reportes", element: <Reportes /> },
      ],
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
