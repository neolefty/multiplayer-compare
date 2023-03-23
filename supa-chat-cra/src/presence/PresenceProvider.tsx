import { createContext, Dispatch, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from "react"
import { z } from "zod"
import { useSupabase } from "../SupabaseProvider"
import { RealtimeChannel } from "@supabase/supabase-js"

const PresenceContentsValidator = z.object({
    active: z.boolean(),
    count: z.number(),
    description: z.string(),
})
type PresenceContents = z.infer<typeof PresenceContentsValidator>

// For example
// 00a3b184-c3a0-11ed-9d63-823fcd09dc9f: [{
//     active: false,
//     count: 3,
//     description: "",
//     presence_ref: "F0zE8faUh49c51UG",
// }]
// Top level keys are UUIDs that I think identify the originator of that presence state
// TODO genericize — can we somehow define PresenceEventValidator<PresenceContents>?

// a single element in a presence update
const PresenceEventContentsValidator = PresenceContentsValidator.merge(z.object({ presence_ref: z.string() }))
export type PresenceEventContents = z.infer<typeof PresenceEventContentsValidator>

// the whole presence update
const PresenceEventValidator = z.record(
    // How many objects are in the array?
    z.array(PresenceEventContentsValidator)
)
type PresenceEvent = z.infer<typeof PresenceEventValidator>

interface PresenceState<V extends {}> {
    channel?: RealtimeChannel
    localValue: V
    remoteValues: PresenceEvent
    dispatch: Dispatch<Partial<V>>
    status?: string
    onUnsubscribe?: () => Promise<string>
}

const INITIAL_STATE: PresenceState<PresenceContents> = {
    localValue: {
        count: 0,
        description: "",
        active: false,
    },
    remoteValues: {},
    dispatch: () => {
        throw new Error("Not initialized")
    },
} as const

const PresenceContext = createContext<PresenceState<PresenceContents>>(INITIAL_STATE)

// How many messages per month needed for a game?
// See: https://supabase.com/pricing
// Free plan Postgres: 2 million per month
// Pro ($25): 5 million per month, $2.50 for incremental per million
// Games: 1000 turns x 5 players x 2 ways = 10k messages per game
// 2 million messages = 200 games
// $2.50 more per million = 100 games. Additional games 2.5 cents each
// Compare to GCP, $0.40 per million invocations.

const PresenceReducer = (
    state: PresenceState<PresenceContents>,
    action: Partial<PresenceState<PresenceContents>>
): PresenceState<PresenceContents> => {
    return Object.freeze({ ...state, ...action })
}

// Note rate limits: https://supabase.com/docs/guides/realtime/rate-limits#presence-limits
// 10 keys per object, 10% of realtime message rate limit
export const PresenceProvider = ({ channelName, children }: PropsWithChildren<{ channelName: string }>) => {
    const [state, dispatch] = useReducer(PresenceReducer, INITIAL_STATE)
    const { supabase, session } = useSupabase()
    const { channel, localValue } = state
    const stateWithDispatch: PresenceState<PresenceContents> = useMemo(
        () => ({
            ...state,
            dispatch: (action) => {
                const newValue = Object.freeze({ ...localValue, ...action })
                channel?.track(newValue).then((response) => console.log("track", { response }))
                console.log("dispatch", { oldValue: channel?.presenceState(), newValue })
                dispatch({ localValue: newValue })
            },
            onUnsubscribe:
                channel &&
                (async () => {
                    // TODO dedupe with useEffect cleanup function below
                    const response = await channel.unsubscribe()
                    console.log("Unsubscribed", { response })
                    dispatch({ channel: undefined })
                    return response
                }),
        }),
        [channel, state, localValue]
    )

    // Create a channel and keep it around
    useEffect(() => {
        if (!channel && session) dispatch({ channel: supabase.channel(channelName) })
        // TODO cleanup — may need a ref for channel
    }, [channelName, channel, supabase, session])

    // subscribe to presence
    useEffect(() => {
        if (channel) {
            const subscribedChannel = channel
                .on("presence", { event: "sync" }, () => {
                    const rawEvent = channel.presenceState()
                    console.log("sync", { rawValue: rawEvent })
                    const remoteValues: PresenceEvent = PresenceEventValidator.parse(rawEvent)
                    dispatch({ remoteValues })
                })
                .on("presence", { event: "join" }, ({ key, currentPresences, newPresences }) =>
                    console.log("join", { key, currentPresences, newPresences })
                )
                .on("presence", { event: "leave" }, () => {
                    console.log("leave", channel.presenceState())
                })
                .subscribe((status: string, err?: Error) => {
                    console.log("Subscribed", { status, err })
                    if (err) dispatch({ status: `subscription error: ${err}` })
                    else if (status) dispatch({ status: `subscription — ${status}` })
                    else dispatch({ status: undefined })
                })
            console.log("Subscribing", channel.presenceState())
            // cleanup: unsub
            return () => {
                console.log("Unsubscribing")
                subscribedChannel.unsubscribe().then((response: string) => console.log("Unsubscribed", { response }))
            }
        }
    }, [channel])

    return <PresenceContext.Provider value={stateWithDispatch}>{children}</PresenceContext.Provider>
}

export const usePresence = (): PresenceState<PresenceContents> => useContext(PresenceContext)
