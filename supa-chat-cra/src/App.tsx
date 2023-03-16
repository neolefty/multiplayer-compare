import React from "react"
import "./App.scss"
import { RouterProvider } from "react-router-dom"
import { router } from "./nav/router"
import { SupabaseProvider } from "./SupabaseProvider"
import { ChatProvider } from "./chat/ChatProvider"
import { ChatLogProvider } from "./chat/ChatLogProvider"
import { PresenceProvider } from "./presence/PresenceProvider"

export const App = () => {
    return (
        <SupabaseProvider>
            <ChatProvider channelName="chat">
                <PresenceProvider channelName="presence-page">
                    <ChatLogProvider>
                        <RouterProvider router={router} />
                    </ChatLogProvider>
                </PresenceProvider>
            </ChatProvider>
        </SupabaseProvider>
    )
}
