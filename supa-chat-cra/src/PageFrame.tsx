import { Outlet } from "@tanstack/react-router"
import React from "react"
import SupabaseProvider from "./SupabaseProvider"

export const PageFrame = () => (
    <SupabaseProvider>
        <h1>
            <a href="https://supabase.com/docs/guides/getting-started/tutorials/with-react">Supabase Auth</a> from{" "}
            <a href="https://create-react-app.dev/">Create-React-App</a>
        </h1>
        <Outlet />
    </SupabaseProvider>
)
