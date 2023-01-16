import React from "react"
import { createBrowserRouter } from "react-router-dom"
import ChatPage from "../chat/ChatPage"
import { PageFrame } from "./PageFrame"
import ProfilePage from "../profile/ProfilePage"

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
