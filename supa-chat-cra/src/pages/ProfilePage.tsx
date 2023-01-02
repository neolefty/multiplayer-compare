import React from "react"
import Account from "../Account"
import Auth from "../Auth"
import { useSupabase } from "../SupabaseProvider"

export default function ProfilePage() {
    const { session } = useSupabase()
    return (
        <>
            {session && <Account key={session.user.id} session={session} />}
            {!session && <Auth />}
        </>
    )
}
