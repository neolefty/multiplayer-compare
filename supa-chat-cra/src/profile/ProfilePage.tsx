import React from "react"
import Account from "./Account"
import AuthPanel from "./AuthPanel"
import { PageFrame } from "../nav/PageFrame"
import { useSupabase } from "../SupabaseProvider"

export default function ProfilePage() {
    const { session } = useSupabase()
    return (
        <PageFrame>
            {session && <Account key={session.user.id} session={session} />}
            {!session && <AuthPanel />}
        </PageFrame>
    )
}
