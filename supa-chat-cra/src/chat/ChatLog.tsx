import { useChatLog } from "../SupabaseProvider"

export const CHAT_EVENT = "chat"

export default function ChatLog({ n = 10 }: { n?: number }) {
    const { chatLog: chat } = useChatLog()
    const start = Math.max(0, chat.length - n)
    return (
        <ul>
            {chat.slice(start).map((message, i) => (
                <li key={i + start}>{message}</li>
            ))}
        </ul>
    )
}
