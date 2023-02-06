import React from "react"
import "./App.scss"
import { RouterProvider } from "react-router-dom"
import { router } from "./nav/router"
import { SupabaseProvider } from "./SupabaseProvider"
import { ChatProvider } from "./chat/ChatProvider"
import { ChatLogProvider } from "./chat/ChatLogProvider"

export const App = () => {
    return (
        <SupabaseProvider>
            <ChatProvider channelName="chat">
                <ChatLogProvider>
                    <RouterProvider router={router} />
                </ChatLogProvider>
            </ChatProvider>
        </SupabaseProvider>
    )
}
