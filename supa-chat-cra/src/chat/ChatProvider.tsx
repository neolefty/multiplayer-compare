import SupabaseChatManager from "./ChatChannelManager"
import { INITIAL_SUPABASE_STATE, useSupabase } from "../SupabaseProvider"
import { createContext, PropsWithChildren, useContext, useEffect, useReducer } from "react"
import { RealtimeChannel } from "@supabase/supabase-js"

interface ChatState {
    manager: SupabaseChatManager
    status: string
    channel?: RealtimeChannel
    err?: string
}

const INITIAL_STATE: ChatState = {
    manager: new SupabaseChatManager(INITIAL_SUPABASE_STATE.supabase, "uninitialized"),
    status: "uninitialized",
}

const ChatContext = createContext(INITIAL_STATE)

function MergeReducer<S extends {}>(state: S, action: Partial<S>): S {
    return Object.freeze({ ...state, ...action })
}

export const ChatProvider = ({ channelName, children }: PropsWithChildren<{ channelName: string }>) => {
    const [state, dispatch] = useReducer(MergeReducer<ChatState>, INITIAL_STATE)
    // Should we also wait for useSupabase.session? May need Auth.
    const { supabase } = useSupabase()

    useEffect(() => {
        if (state.manager.channelName !== channelName) {
            if (state.manager.channel) state.manager.unsubscribe()
            const newManager = new SupabaseChatManager(supabase, channelName)
            dispatch({
                manager: newManager,
                err: undefined,
                status: "Loading",
                channel: undefined,
            })
            // equivalent of newManager.addListener(dispatch), but that would be hard to read!
            newManager.addListener(({ err, status, channel }) => {
                dispatch({
                    err,
                    status,
                    channel,
                })
            })
        }
    }, [channelName, state.manager, supabase])

    return <ChatContext.Provider value={state}>{children}</ChatContext.Provider>
}

export const useChat = () => useContext(ChatContext)
