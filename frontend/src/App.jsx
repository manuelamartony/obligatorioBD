import { useState } from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import Panel from './components/Panel'
import Home from './components/Home'
import Login from './components/Login'


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
    }
  ])

  return (
    <RouterProvider router={router} />
  )

}

export default App
