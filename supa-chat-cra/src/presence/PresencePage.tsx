import { PageFrame } from "../nav/PageFrame"
import React from "react"
import { usePresence } from "./PresenceProvider"
import "./PresencePage.scss"

const LocalPresenceControl = () => {
    const { localValue, dispatch } = usePresence()
    return (
        <>
            <label htmlFor="count">
                Count: <strong>{localValue.count}</strong>
            </label>
            <button id="count" onClick={() => dispatch({ count: localValue.count + 1 })}>
                +
            </button>
            <button id="count" onClick={() => dispatch({ count: localValue.count - 1 })}>
                –
            </button>
            <br />
            <label htmlFor="description">Description</label>:
            <input
                id="description"
                value={localValue.description}
                onChange={(e) => dispatch({ description: e.target.value })}
            />
            <br />
            <label htmlFor="active">{localValue.active ? "Active" : "Inactive"}</label>
            <input
                type="checkbox"
                checked={localValue.active}
                onChange={() => dispatch({ active: !localValue.active })}
            />
        </>
    )
}

// TODO show remote values — maybe labelled by their UUIDs
// TODO look up users by UUID and improve the labels

export const PresencePage = () => {
    const { status } = usePresence()
    return (
        <PageFrame>
            <p>
                Status: <em>{status || "Unknown"}</em>
            </p>
            <h3>Local State</h3>
            <LocalPresenceControl />
        </PageFrame>
    )
}
