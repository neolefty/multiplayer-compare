import { Session } from "@supabase/supabase-js"
import { SyntheticEvent, useCallback, useEffect, useReducer } from "react"
import { JsonValue } from "type-fest"
import Avatar from "./Avatar"
import { useSupabase } from "../SupabaseProvider"
import Tree from "../util/Tree"

interface AccountState {
    loading: boolean
    username?: string
    editUsername?: string
    website?: string
    editWebsite?: string
    avatarUrl?: string
    editAvatarUrl?: string
    error?: string
    success?: string
}

const DEFAULT_ACCOUNT_STATE: AccountState = {
    loading: false,
}

const reducer = (state: AccountState, action: "clear" | Partial<AccountState>) =>
    action === "clear" ? DEFAULT_ACCOUNT_STATE : { ...state, ...action }

export default function Account({ session }: { session: Session }) {
    const [state, dispatch] = useReducer(reducer, DEFAULT_ACCOUNT_STATE)
    const { supabase } = useSupabase()

    const dirty =
        state.editAvatarUrl !== state.avatarUrl ||
        state.editUsername !== state.username ||
        state.website !== state.editWebsite

    const getProfile = useCallback(async () => {
        let cancel = false
        try {
            dispatch("clear")
            dispatch({ loading: true })
            const { user } = session

            let { data, error, status } = await supabase
                .from("profiles")
                .select("username, website, avatar_url")
                .eq("id", user.id)
                .single()

            if (error && status !== 406) dispatch({ error: `${error}` })

            if (data)
                dispatch({
                    username: data.username,
                    editUsername: data.username,
                    website: data.website,
                    editWebsite: data.website,
                    avatarUrl: data.avatar_url,
                    editAvatarUrl: data.avatar_url,
                })
        } catch (error) {
            if (!cancel) {
                console.error(error)
                dispatch({ error: `${error}` })
            }
        } finally {
            if (!cancel) dispatch({ loading: false })
        }
        return () => (cancel = true)
    }, [session, supabase])

    useEffect(() => {
        getProfile()
        return undefined
    }, [getProfile])

    const isEmpty = !state.error && !state.loading && !state.avatarUrl && !state.username && !state.website

    const updateProfile = useCallback(
        async (e?: SyntheticEvent) => {
            e?.preventDefault()
            dispatch({ loading: true, error: undefined })
            try {
                const updates = {
                    id: session.user.id,
                    username: state.editUsername,
                    website: state.editWebsite,
                    avatar_url: state.editAvatarUrl,
                    updated_at: new Date(),
                }
                let { error } = await supabase.from("profiles").upsert(updates)
                if (error) dispatch({ error: `${error}` })
                else
                    dispatch({
                        username: state.editUsername,
                        website: state.editWebsite,
                        avatarUrl: state.editAvatarUrl,
                    })
            } catch (error) {
                dispatch({ error: `${error}` })
            } finally {
                dispatch({ loading: false })
            }
        },
        [session, state, supabase]
    )

    const handleUpload = useCallback(
        async (url: string) => {
            dispatch({
                avatarUrl: url,
                editAvatarUrl: url,
                loading: true,
            })
            try {
                let { error } = await supabase.from("profiles").upsert({
                    id: session.user.id,
                    avatar_url: url,
                    updated_at: new Date(),
                })
                if (error) dispatch({ error: `${error}` })
            } catch (error) {
                dispatch({ error: `${error}` })
            } finally {
                dispatch({ loading: false })
            }
        },
        [session, supabase]
    )

    return (
        <>
            <ul>
                <li>
                    email: {session.user.email} — for {session.expires_in} seconds.
                    <button onClick={() => supabase.auth.signOut()}>Log out</button>
                </li>
                {state.loading && (
                    <li>
                        <em>Loading ...</em>
                    </li>
                )}
                {state.username && <li>username: {state.username}</li>}
                {state.website && (
                    <li>
                        <a href={state.website}>{state.website}</a>
                    </li>
                )}
                {state.avatarUrl && (
                    <li>
                        <Avatar url={state.avatarUrl} size={200} onUpload={handleUpload} />
                    </li>
                )}
                {state.error && (
                    <li>
                        <strong>Error: {state.error}</strong>
                    </li>
                )}
                {isEmpty && (
                    <li>
                        <em>Empty</em>
                    </li>
                )}
            </ul>
            <hr />
            <form className="profile" onSubmit={updateProfile}>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    value={state.editUsername || ""}
                    onChange={(e) => dispatch({ editUsername: e.target.value })}
                />
                <label htmlFor="website">Website</label>
                <input
                    id="website"
                    value={state.editWebsite || ""}
                    onChange={(e) => dispatch({ editWebsite: e.target.value })}
                />
                <label htmlFor="avatarUrl">Avatar URL</label>
                <input
                    id="avatarUrl"
                    value={state.editAvatarUrl || ""}
                    onChange={(e) => dispatch({ editAvatarUrl: e.target.value })}
                />
                <button disabled={!dirty}>Update</button>
            </form>
            <hr />
            <details>
                <summary>Session Details</summary>
                <Tree json={session.user as unknown as JsonValue} />
            </details>
        </>
    )
}
