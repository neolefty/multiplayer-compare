import { SyntheticEvent, useCallback, useRef, useState } from "react"
import { CHAT_EVENT } from "./ChatLog"
import { RealtimeChannel } from "@supabase/supabase-js"

export default function ChatSend({ chat }: { chat: RealtimeChannel }) {
    const [sending, setSending] = useState(false)
    const [text, setText] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    const handleSend = useCallback(
        async (e: SyntheticEvent) => {
            e.preventDefault()
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
                    setTimeout(() => {
                        if (inputRef.current) inputRef.current.focus()
                    }, 0)
                }
            }
        },
        [chat, text]
    )

    return (
        <form onSubmit={handleSend}>
            <label htmlFor="chat">Send a message</label>
            <input ref={inputRef} id="chat" disabled={sending} value={text} onChange={(e) => setText(e.target.value)} />
            <button aria-live="polite">Chat</button>
        </form>
    )
}
