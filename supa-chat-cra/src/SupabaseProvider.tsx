import { Session } from "@supabase/gotrue-js/src/lib/types"
import { createClient, RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react"

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "missing from config"
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "missing from config"
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const chatChannel = supabase.channel("chat")

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

export default function SupabaseProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null)
    useEffect(() => {
        // store initial session
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
        // listen for changes
        return supabase.auth.onAuthStateChange((event, session) => {
            setSession(session)
        }).data.subscription.unsubscribe
    }, [])
    const contextValue: SupabaseState = useMemo(
        () =>
            Object.freeze({
                session: session || undefined,
                supabase: supabase,
                chat: chatChannel,
            }),
        [session]
    )
    return <SupabaseContext.Provider value={contextValue}>{children}</SupabaseContext.Provider>
}

export const useSupabase = () => useContext(SupabaseContext)
