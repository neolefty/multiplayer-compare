import React from "react"
import { createBrowserRouter } from "react-router-dom"
import ChatPage from "./ChatPage"
import { PageFrame } from "../util/PageFrame"
import ProfilePage from "./ProfilePage"

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <PageFrame>
                <h2>Welcome</h2>
            </PageFrame>
        ),
    },
    {
        path: "profile",
        element: <ProfilePage />,
    },
    {
        path: "chat",
        element: <ChatPage />,
    },
])

export default router
