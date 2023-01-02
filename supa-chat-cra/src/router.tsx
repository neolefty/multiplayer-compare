import React from "react"
import { createBrowserRouter } from "react-router-dom"
import { PageFrame } from "./PageFrame"
import ProfilePage from "./pages/ProfilePage"

const router = createBrowserRouter([
    {
        path: "/",
        element: <PageFrame>Index</PageFrame>,
    },
    {
        path: "profile",
        element: <ProfilePage />,
    },
])

export default router
