import { REALTIME_SUBSCRIBE_STATES, RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"

type RealtimeChannelListener = (event: { channel?: RealtimeChannel; status?: string; err?: string }) => void

// For more options & details, see https://supabase.com/docs/guides/realtime/quickstart
export default class ChatChannelManager {
    private realtimeChannel: RealtimeChannel | undefined
    private listeners: Set<RealtimeChannelListener> = new Set()
    private subscriptionError: string | undefined
    private subscriptionStatus: string | undefined

    constructor(readonly supabaseClient: SupabaseClient, readonly channelName: string) {}

    get channel(): RealtimeChannel | undefined {
        return this.realtimeChannel
    }

    get err(): string | undefined {
        return this.subscriptionError
    }

    get status(): string | undefined {
        return this.subscriptionStatus
    }

    addListener(listener: RealtimeChannelListener): RealtimeChannelListener {
        this.listeners.add(listener)
        return listener
    }

    removeListener(listener: RealtimeChannelListener): boolean {
        return this.listeners.delete(listener)
    }

    async subscribe(timeout?: number): Promise<{ err?: string; status?: string }> {
        if (this.realtimeChannel)
            throw new Error("Channel already exists; unsubscribe before re-subscribing. See also renew().")
        return new Promise<{ err?: string; status?: string }>((resolve, reject) => {
            const newChannel = this.supabaseClient.channel(this.channelName)
            try {
                newChannel.subscribe((status, err) => {
                    if (err) console.error(err)
                    this.subscriptionError = err && `${err}`
                    this.subscriptionStatus = status
                    if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) this.realtimeChannel = newChannel
                    resolve({ err: this.err, status })
                    this.sendToListeners()
                }, timeout)
            } catch (err) {
                console.error(err)
                newChannel.unsubscribe() // be thorough
                this.subscriptionStatus = undefined
                this.subscriptionError = `${err}`
                resolve({ err: this.err })
                this.sendToListeners()
            }
        })
    }

    async unsubscribe(timeout?: number): Promise<{ err?: string }> {
        if (this.channel) {
            const oldChannel = this.realtimeChannel
            this.realtimeChannel = undefined
            this.subscriptionStatus = undefined
            this.subscriptionError = undefined
            try {
                await oldChannel?.unsubscribe(timeout)
            } catch (err) {
                console.error(err)
                this.subscriptionError = `${err}`
                return { err: this.err }
            } finally {
                this.sendToListeners()
            }
        }
        return {}
    }

    private sendToListeners() {
        const event = Object.freeze({
            channel: this.realtimeChannel,
            status: this.subscriptionStatus,
            err: this.subscriptionError,
        })
        this.listeners.forEach((listener) => listener(event))
    }

    async renew(timeout?: number): Promise<{ err?: string }> {
        const unsubResult = await this.unsubscribe(timeout)
        if (unsubResult.err) return unsubResult
        return this.subscribe(timeout)
    }
}
