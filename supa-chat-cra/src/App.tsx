import React from "react"
import "./App.css"
import { RouterProvider } from "react-router-dom"
import router from "./router"
import SupabaseProvider from "./SupabaseProvider"

export default function App() {
    return (
        <SupabaseProvider>
            <RouterProvider router={router} />
        </SupabaseProvider>
    )
}
