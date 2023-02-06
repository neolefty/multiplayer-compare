import { ChatChannelManager, ChatChannelState } from "./ChatChannelManager"
import { INITIAL_SUPABASE_STATE, useSupabase } from "../SupabaseProvider"
import { createContext, PropsWithChildren, Reducer, useContext, useEffect, useReducer, useRef } from "react"

interface ChatState {
    manager: ChatChannelManager
    status: ChatChannelState
    err?: string
}

const INITIAL_STATE: ChatState = {
    manager: new ChatChannelManager(INITIAL_SUPABASE_STATE.supabase, "uninitialized"),
    status: "uninitialized",
}

const ChatContext = createContext(INITIAL_STATE)

// function ChatReducer(state: ChatState, action: Partial<ChatState>): ChatState {
//     return Object.freeze({ ...state, ...action })
// }
function MergeReducer<S extends {}>(state: S, action: Partial<S>): S {
    return Object.freeze({ ...state, ...action })
}

export const ChatProvider = ({ channelName, children }: PropsWithChildren<{ channelName: string }>) => {
    // This would eliminate the false error in WebStorm on the next line, "Expression expected."
    // const [state, dispatch] = useReducer(ChatReducer, INITIAL_STATE)
    // This is a simpler declaration, but WebStorm doesn't particularly like it
    // const [state, dispatch] = useReducer(MergeReducer<ChatState>, INITIAL_STATE)
    const [state, dispatch] = useReducer<Reducer<ChatState, Partial<ChatState>>>(MergeReducer, INITIAL_STATE)
    // Should we also wait for useSupabase.session? May need Auth.
    const { supabase } = useSupabase()

    const cleanupRef = useRef<() => void | undefined>()

    useEffect(() => {
        // renew channelManager when:
        //  – channelName changes — also unsubscribe from old channel & manager
        //  – channel is closed — need to make a new channel object to re-subscribe
        if (state.manager.channelName !== channelName || state.status === "CLOSED") {
            if (!state.manager.isClosed) state.manager.unsubscribe()
            const newManager = new ChatChannelManager(supabase, channelName)
            cleanupRef.current?.()
            cleanupRef.current = undefined
            dispatch({
                // further updates will come from listener below
                manager: newManager,
                err: undefined,
                status: "uninitialized",
            })
            cleanupRef.current = newManager.addListener((update) => {
                console.debug({ channelName }, update)
                dispatch(update)
            })
        }
    }, [channelName, state.manager, state.status, supabase])

    return <ChatContext.Provider value={state}>{children}</ChatContext.Provider>
}

export const useChat = () => useContext(ChatContext)
