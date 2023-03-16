import {
    createContext,
    Dispatch,
    PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from "react"
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
const PresenceEventValidator = z.record(
    // How many objects are in the array?
    z.array(
        PresenceContentsValidator.merge(
            // the actual value
            z.object({ presence_ref: z.string() })
        )
    )
)
type PresenceEvent = z.infer<typeof PresenceEventValidator>

interface PresenceState<V extends {}> {
    channel?: RealtimeChannel
    value: V
    dispatch: Dispatch<Partial<V>>
    status?: string
}

const INITIAL_STATE: PresenceState<PresenceContents> = {
    value: {
        count: 0,
        description: "",
        active: false,
    },
    dispatch: () => {
        throw new Error("Not initialized")
    },
} as const

const PresenceContext = createContext<PresenceState<PresenceContents>>(INITIAL_STATE)

const PresenceReducer = (
    state: PresenceState<PresenceContents>,
    action: Partial<PresenceState<PresenceContents>>
): PresenceState<PresenceContents> => {
    return Object.freeze({ ...state, ...action })
}

export const PresenceProvider = ({
    channelName,
    children,
}: PropsWithChildren<{ channelName: string }>) => {
    const [state, dispatch] = useReducer(PresenceReducer, INITIAL_STATE)
    const { supabase, session } = useSupabase()
    const { channel, value } = state
    const stateWithDispatch: PresenceState<PresenceContents> = useMemo(
        () => ({
            ...state,
            dispatch: (action) => {
                const newValue = Object.freeze({ ...value, ...action })
                channel
                    ?.track(newValue)
                    .then((response) => console.log("track", { response }))
                console.log("dispatch", { oldValue: channel?.presenceState(), newValue })
                dispatch({ value: newValue })
            },
        }),
        [channel, state, value]
    )

    // keep a channel around
    useEffect(() => {
        if (!channel && session) dispatch({ channel: supabase.channel(channelName) })
        // TODO cleanup — may need a ref for channel
    }, [channelName, channel, supabase, session])

    // subscribe to presence
    useEffect(() => {
        if (channel) {
            const subscribedChannel = channel
                .on("presence", { event: "sync" }, () => {
                    const rawValue = channel.presenceState()
                    console.log("sync", { rawValue })
                    const value = PresenceEventValidator.parse(rawValue)
                    // TODO consider dispatching the original result of
                    //  channel.presencesState(), for stability — since the
                    //  result of Zod's parse() is a deep clone
                    // dispatch({ value })
                })
                .on(
                    "presence",
                    { event: "join" },
                    ({ key, currentPresences, newPresences }) =>
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
                subscribedChannel
                    .unsubscribe()
                    .then((response: string) => console.log("Unsubscribed", { response }))
            }
        }
    }, [channel])

    return (
        <PresenceContext.Provider value={stateWithDispatch}>
            {children}
        </PresenceContext.Provider>
    )
}

export const usePresence = (): PresenceState<PresenceContents> =>
    useContext(PresenceContext)
