import { useState } from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import Panel from './components/Panel'
import Home from './components/Home'
import Login from './components/Login'
import MisReservas from './components/MisReservas';
import NuevaReserva from './components/NuevaReserva';
import Reportes from './components/Reportes';


function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,

    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/my/panel",
      element: <Panel />
    },
    {
      path: "/my/panel/mis-reservas",
      element: <MisReservas />
    },
    {
      path: "/my/panel/nueva-reserva",
      element: <NuevaReserva />
    },
    {
      path: "/my/panel/reportes",
      element: <Reportes />
    }
  ])

  return (
    <RouterProvider router={router} />
  )

}

export default App
