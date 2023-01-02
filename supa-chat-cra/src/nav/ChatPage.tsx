import React from "react"
import { PageFrame } from "../util/PageFrame"
import { useSupabase } from "../SupabaseProvider"

export default function ChatPage() {
    const { session } = useSupabase()
    return <PageFrame>Chat</PageFrame>
}
