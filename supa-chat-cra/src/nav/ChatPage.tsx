import React from "react"
import ChatLog from "../chat/ChatLog"
import ChatSend from "../chat/ChatSend"
import { PageFrame } from "../util/PageFrame"

export default function ChatPage() {
    return (
        <PageFrame>
            <ChatLog />
            <ChatSend />
        </PageFrame>
    )
}
