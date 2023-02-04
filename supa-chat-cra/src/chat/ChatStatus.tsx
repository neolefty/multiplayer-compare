import React, { SyntheticEvent, useCallback, useState } from "react"
import styles from "./ChatStatus.module.scss"
import { useChat } from "./ChatProvider"

export const ChatStatus = () => {
    const { status, err, manager } = useChat()
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
            console.log("handleUnsubscribe", { e })
            await manager.unsubscribe()
        },
        [manager]
    )

    return (
        <>
            <form onSubmit={handleSubscribe}>
                Status: {status || <em>Unknown</em>}
                <button aria-live="polite" disabled={loading || manager.isSubscribed}>
                    Subscribe
                </button>
                <button aria-live="polite" onClick={handleUnsubscribe} disabled={loading || !manager.isSubscribed}>
                    Unsubscribe
                </button>
            </form>
            {err && <p className={styles.err}>Error: {err}</p>}
        </>
    )
}
