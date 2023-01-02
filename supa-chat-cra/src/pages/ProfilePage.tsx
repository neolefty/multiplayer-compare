import React from "react"
import Account from "../Account"
import Auth from "../Auth"
import { PageFrame } from "../PageFrame"
import { useSupabase } from "../SupabaseProvider"

export default function ProfilePage() {
    const { session } = useSupabase()
    return (
        <PageFrame>
            {session && <Account key={session.user.id} session={session} />}
            {!session && <Auth />}
        </PageFrame>
    )
}
