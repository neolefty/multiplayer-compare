import { PageFrame } from "../nav/PageFrame"
import React from "react"
import { PresenceEventContents, usePresence } from "./PresenceProvider"
import "./PresencePage.scss"

const LocalPresenceInputs = () => {
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

const PresenceStateDisplay = ({ uuid, value }: { uuid: string; value: ReadonlyArray<PresenceEventContents> }) => (
    <>
        <dt>{uuid}</dt>
        <dd>
            {value.map((contents, i) => (
                <div key={contents.presence_ref}>
                    {contents.count} x {contents.description || <em>unknown</em>} —{" "}
                    <em>{contents.active ? "active" : "inactive"}</em>
                </div>
            ))}
        </dd>
    </>
)

// TODO show remote values — maybe labelled by their UUIDs
// TODO look up users by UUID and improve the labels

export const PresencePage = () => {
    const { status, remoteValues } = usePresence()
    const remoteEntries = Object.entries(remoteValues)
    return (
        <PageFrame>
            <p>
                Status: <em>{status || "Unknown"}</em>
            </p>
            <hr />
            <h3>Local State</h3>
            <LocalPresenceInputs />
            {remoteEntries.length && (
                <>
                    <hr />
                    <h3>Remote State</h3>
                    <dl>
                        {remoteEntries.map(([uuid, value]) => (
                            <PresenceStateDisplay uuid={uuid} value={value} key={uuid} />
                        ))}
                    </dl>
                </>
            )}
        </PageFrame>
    )
}
