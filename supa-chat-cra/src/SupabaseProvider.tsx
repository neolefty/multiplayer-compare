import { Session } from "@supabase/gotrue-js/src/lib/types"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo } from "react"
import useDeepState from "./useDeepState"
import ChatChannelManager from "./chat/ChatChannelManager"

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "missing from config"
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "missing from config"
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})

interface SupabaseState {
    supabase: SupabaseClient
    session?: Session
}

export const INITIAL_SUPABASE_STATE: SupabaseState = Object.freeze({
    supabase,
    chat: new ChatChannelManager(supabase, "chat"),
})

const SupabaseContext = createContext<SupabaseState>(INITIAL_SUPABASE_STATE)

export default function SupabaseProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useDeepState<Session | null>(null)

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

    const supabaseState: SupabaseState = useMemo(
        () =>
            Object.freeze({
                ...INITIAL_SUPABASE_STATE,
                session: session || undefined,
            }),
        [session]
    )
    return <SupabaseContext.Provider value={supabaseState}>{children}</SupabaseContext.Provider>
}

export const useSupabase = () => useContext(SupabaseContext)
