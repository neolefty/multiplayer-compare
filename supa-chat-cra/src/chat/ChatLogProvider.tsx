import { createContext, PropsWithChildren, useContext, useEffect, useReducer, useRef } from "react"
import { CHAT_EVENT } from "./ChatLog"
import { useChat } from "./ChatProvider"
import { RealtimeChannel } from "@supabase/supabase-js"

interface ChatLogState {
    chatLog: ReadonlyArray<string>
}

export const INITIAL_CHAT_LOG = Object.freeze({ chatLog: [] })
export const ChatLogContext = createContext<ChatLogState>(INITIAL_CHAT_LOG)
export const ChatLogReducer = (state: ChatLogState, action: string): ChatLogState =>
    Object.freeze({
        chatLog: [...state.chatLog, action],
    })
export const useChatLog = () => useContext(ChatLogContext)

export const ChatLogProvider = ({ children }: PropsWithChildren) => {
    const [chatLog, chatLogDispatch] = useReducer(ChatLogReducer, INITIAL_CHAT_LOG)
    const { manager } = useChat()
    const lastChannel = useRef<RealtimeChannel | undefined>()

    // Subscribe to chat, but only need to do so once per channel — even if a subscription is renewed
    useEffect(() => {
        const curChannel = manager.channel
        // return value is a removeListener() cleanup function
        return manager.addListener(({ manager, err, status }) => {
            if (curChannel !== lastChannel.current) {
                const channel = manager.channel.on("broadcast", { event: CHAT_EVENT }, (payload) => {
                    if (curChannel === lastChannel.current) {
                        chatLogDispatch(payload.payload)
                    } else {
                        // only listen to one channel at a time; and since there's no unsub function, just discard
                        console.debug(`Discarding message "${payload.payload}" from old channel.`)
                    }
                })
                lastChannel.current = channel
            }
        })
    }, [manager])

    return <ChatLogContext.Provider value={chatLog}>{children}</ChatLogContext.Provider>
}
