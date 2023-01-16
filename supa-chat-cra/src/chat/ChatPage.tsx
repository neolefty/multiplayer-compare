import React from "react"
import ChatLog from "./ChatLog"
import ChatSend from "./ChatSend"
import { PageFrame } from "../nav/PageFrame"
import { ChatStatus } from "./ChatStatus"
import { useChat } from "./ChatProvider"

export default function ChatPage() {
    const { channel } = useChat()
    // TODO reconnect chat log on channel renew
    // TODO maybe move chat log to SupabaseChatChannel!
    return (
        <PageFrame>
            {channel && <ChatSend chat={channel} />}
            <ChatLog />
            <ChatStatus />
        </PageFrame>
    )
}
