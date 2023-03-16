import { PageFrame } from "../nav/PageFrame"
import React from "react"
import { usePresence } from "./PresenceProvider"

export const PresencePage = () => {
    const { value, dispatch, status } = usePresence()
    return (
        <PageFrame>
            <p>
                Count: <strong>{value.count}</strong>
                <button onClick={() => dispatch({ count: value.count + 1 })}>+</button>
                <button onClick={() => dispatch({ count: value.count - 1 })}>–</button>
            </p>
            {status && (
                <p>
                    Status: <em>{status}</em>
                </p>
            )}
        </PageFrame>
    )
}
