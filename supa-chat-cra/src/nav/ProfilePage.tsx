import React from "react"
import Account from "../profile/Account"
import AuthPanel from "../profile/AuthPanel"
import { PageFrame } from "../util/PageFrame"
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
