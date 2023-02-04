import { createContext, PropsWithChildren, useContext, useEffect, useReducer } from "react"
import { CHAT_EVENT } from "./ChatLog"
import { useChat } from "./ChatProvider"

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

    // Subscribe to chat, but only need to do so once per channel — even if a subscription is renewed
    useEffect(() => {
        manager.addListener(({ manager, err, status }) => {
            manager.channel.on("broadcast", { event: CHAT_EVENT }, (payload) => {
                chatLogDispatch(payload.payload)
            })
        })
    }, [manager])

    return <ChatLogContext.Provider value={chatLog}>{children}</ChatLogContext.Provider>
}
