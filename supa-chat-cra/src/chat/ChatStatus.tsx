import React, { SyntheticEvent, useCallback, useState } from "react"
import styles from "./ChatStatus.module.scss"
import { useChat } from "./ChatProvider"

export const ChatStatus = () => {
    const { status, channel, err, manager } = useChat()
    const [loading, setLoading] = useState(false)

    const handleSubscribe = useCallback(
        async (e: SyntheticEvent) => {
            e.preventDefault()
            await manager.subscribe()
            setLoading(false)
        },
        [manager]
    )
    const handleUnsubscribe = useCallback(
        async (e: SyntheticEvent) => {
            e.preventDefault()
            await manager.unsubscribe()
        },
        [manager]
    )

    return (
        <>
            <form onSubmit={handleSubscribe}>
                Status: {status || <em>Unknown</em>}
                <button aria-live="polite" disabled={loading || !!channel}>
                    Subscribe
                </button>
                <button aria-live="polite" onClick={handleUnsubscribe} disabled={loading || !channel}>
                    Unsubscribe
                </button>
            </form>
            {err && <p className={styles.err}>Error: {err}</p>}
        </>
    )
}
