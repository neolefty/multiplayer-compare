import { RouterProvider } from "@tanstack/react-router"
import React from "react"
import "./App.css"
import router from "./router"

export default function App() {
    return <RouterProvider router={router} />
}
