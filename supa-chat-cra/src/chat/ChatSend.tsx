import { useCallback, useState } from "react"
import { useSupabase } from "../SupabaseProvider"
import { CHAT_EVENT } from "./ChatLog"

export default function ChatSend() {
    const { chat } = useSupabase()
    const [sending, setSending] = useState(false)
    const [text, setText] = useState("")
    const handleSend = useCallback(async () => {
        if (text) {
            setSending(true)
            try {
                await chat.send({
                    type: "broadcast",
                    event: CHAT_EVENT,
                    payload: text,
                })
            } finally {
                setSending(false)
                setText("")
            }
        }
    }, [chat, text])
    return (
        <form onSubmit={handleSend}>
            <label htmlFor="chat">Send a message</label>
            <input id="chat" disabled={sending} value={text} onChange={(e) => setText(e.target.value)} />
            <button aria-live="polite">Chat</button>
        </form>
    )
}
