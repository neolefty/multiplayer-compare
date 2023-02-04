import { ChatChannelManager } from "./ChatChannelManager"
import { INITIAL_SUPABASE_STATE, useSupabase } from "../SupabaseProvider"
import { createContext, PropsWithChildren, Reducer, useContext, useEffect, useReducer } from "react"

interface ChatState {
    manager: ChatChannelManager
    status: string
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

    useEffect(() => {
        if (state.manager.channelName !== channelName) {
            if (!state.manager.isClosed) state.manager.unsubscribe()
            const newManager = new ChatChannelManager(supabase, channelName)
            dispatch({
                manager: newManager,
                err: undefined,
                status: "Loading",
            })
            // equivalent of newManager.addListener(dispatch), but that would be hard to read!
            newManager.addListener((update) => {
                console.warn({ channelName }, update)
                dispatch(update)
            })
        }
    }, [channelName, state.manager, supabase])

    return <ChatContext.Provider value={state}>{children}</ChatContext.Provider>
}

export const useChat = () => useContext(ChatContext)
