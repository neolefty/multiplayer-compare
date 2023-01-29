import { REALTIME_SUBSCRIBE_STATES, RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"

interface ChatChannelEvent {
    manager: ChatChannelManager
    status?: string
    err?: string
}
/** Listen for changes to a channel subscription. */
type ChatChannelManagerListener = (event: ChatChannelEvent) => void

// For more options & details, see https://supabase.com/docs/guides/realtime/quickstart
export default class ChatChannelManager {
    readonly channel: RealtimeChannel
    private listeners: Set<ChatChannelManagerListener> = new Set()
    private subscriptionError: string | undefined
    private subscriptionStatus: REALTIME_SUBSCRIBE_STATES | undefined

    constructor(readonly supabaseClient: SupabaseClient, readonly channelName: string) {
        this.channel = this.supabaseClient.channel(this.channelName)
    }

    get err(): string | undefined {
        return this.subscriptionError
    }

    get status(): string | undefined {
        return this.subscriptionStatus
    }

    addListener(listener: ChatChannelManagerListener): ChatChannelManagerListener {
        this.listeners.add(listener)
        return listener
    }

    removeListener(listener: ChatChannelManagerListener): boolean {
        return this.listeners.delete(listener)
    }

    /** Turn on listening to this Supabase realtime channel. */
    async subscribe(timeout?: number): Promise<{ err?: string; status?: string }> {
        if (this.isSubscribed)
            throw new Error("Already subscribed; unsubscribe before re-subscribing. See also renew().")
        return new Promise<ChatChannelEvent>((resolve) => {
            try {
                this.channel.subscribe((status, err) => {
                    if (err) console.error(err)
                    console.log("Subscription callback", { status, err })
                    this.subscriptionError = err && `${err}`
                    this.subscriptionStatus = status as REALTIME_SUBSCRIBE_STATES
                    const event = this.sendToListeners()
                    resolve(event)
                }, timeout)
            } catch (err) {
                console.error(err)
                this.channel.unsubscribe() // be thorough
                this.subscriptionStatus = REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR
                this.subscriptionError = `${err}`
                const event = this.sendToListeners()
                resolve(event)
            }
        })
    }

    /**
     * Turn off listening to this realtime Supabase channel.
     * No effect if already unsubscribed.
     */
    async unsubscribe(timeout?: number): Promise<{ err?: string }> {
        if (!this.isClosed) {
            try {
                const result = await this.channel.unsubscribe(timeout)
                if (result === "error") {
                    this.subscriptionStatus = REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR
                    this.subscriptionError = result
                    console.error(result)
                    return { err: result }
                } else {
                    this.subscriptionStatus = REALTIME_SUBSCRIBE_STATES.SUBSCRIBED
                    this.subscriptionError = undefined
                    return {}
                }
            } catch (err) {
                console.error(err)
                this.subscriptionStatus = REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR
                this.subscriptionError = `${err}`
                return { err: this.err }
            } finally {
                this.sendToListeners()
            }
        }
        return {}
    }

    get isTimedOut() {
        return this.status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT
    }
    get isSubscribed() {
        return this.status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED
    }
    get isChannelError() {
        return this.status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR
    }
    get isClosed() {
        return this.status === REALTIME_SUBSCRIBE_STATES.CLOSED
    }

    private sendToListeners(): ChatChannelEvent {
        const event = Object.freeze({
            manager: this,
            status: this.subscriptionStatus,
            err: this.subscriptionError,
        })
        this.listeners.forEach((listener) => listener(event))
        return event
    }

    async renew(timeout?: number): Promise<{ err?: string }> {
        const unsubResult = await this.unsubscribe(timeout)
        if (unsubResult.err) return unsubResult
        return this.subscribe(timeout)
    }
}
