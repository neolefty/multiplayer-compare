import { Session } from "@supabase/gotrue-js/src/lib/types"
import { createClient, RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer, useRef } from "react"
import { CHAT_EVENT } from "./chat/ChatLog"
import useDeepState from "./useDeepState"

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "missing from config"
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "missing from config"
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})

const chatChannel = supabase.channel("chat")

// For more options & details, see https://supabase.com/docs/guides/realtime/quickstart
chatChannel.subscribe((status, err) => {
    console.log({ status, err })
})

interface SupabaseState {
    supabase: SupabaseClient
    session?: Session
    chat: RealtimeChannel
}

const INITIAL_STATE: SupabaseState = Object.freeze({
    supabase: supabase,
    chat: chatChannel,
})

const SupabaseContext = createContext<SupabaseState>(INITIAL_STATE)

interface ChatLogState {
    chatLog: ReadonlyArray<string>
}

const INITIAL_CHAT_LOG = Object.freeze({ chatLog: [] })

const ChatLogContext = createContext<ChatLogState>(INITIAL_CHAT_LOG)

const ChatLogReducer = (state: ChatLogState, action: string): ChatLogState =>
    Object.freeze({
        chatLog: [...state.chatLog, action],
    })

export default function SupabaseProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useDeepState<Session | null>(null)
    const [chatLog, chatLogDispatch] = useReducer(ChatLogReducer, INITIAL_CHAT_LOG)

    const channelRef = useRef<RealtimeChannel>()

    // subscribe to auth
    useEffect(() => {
        // store initial session
        supabase.auth.getSession().then(({ data: { session: newSession } }) => setSession(newSession))
        // listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("AuthStateChange", { event, session })
            setSession(session)
        })
        return subscription.unsubscribe
    }, [setSession])

    // subscribe to chat
    // TODO make this only happen once — maybe a global?
    useEffect(() => {
        if (!channelRef.current) {
            // noinspection UnnecessaryLocalVariableJS
            const channel = chatChannel.on("broadcast", { event: CHAT_EVENT }, (payload) => {
                console.log("incoming", { payload })
                chatLogDispatch(payload.payload)
            })
            channelRef.current = channel
            // Cleanup is being triggered by second render of React Dev Mode, when subscription
            // hasn't finished initializing, and then re-subscription is not succeeding.
            // Maybe wait until subscription is active — that is, (status: "SUBSCRIBED") is received.
            // return () => {
            //     if (channelRef.current === channel) channelRef.current = undefined
            //     channel.unsubscribe().then((value) => console.log("Unsubscribed", { value }))
            // }
        }
    }, [session])

    const supabaseState: SupabaseState = useMemo(
        () =>
            Object.freeze({
                session: session || undefined,
                supabase: supabase,
                chat: chatChannel,
            }),
        [session]
    )
    return (
        <SupabaseContext.Provider value={supabaseState}>
            <ChatLogContext.Provider value={chatLog}>{children}</ChatLogContext.Provider>
        </SupabaseContext.Provider>
    )
}

export const useSupabase = () => useContext(SupabaseContext)
export const useChatLog = () => useContext(ChatLogContext)
