import React, { PropsWithChildren } from "react"
import Nav from "../nav/Nav"

export const PageFrame = ({ children }: PropsWithChildren) => (
    <>
        <h1>
            <a href="https://supabase.com/docs/guides/getting-started/tutorials/with-react">Supabase Auth</a> from{" "}
            <a href="https://create-react-app.dev/">Create-React-App</a>
        </h1>
        <Nav />
        {children}
    </>
)
