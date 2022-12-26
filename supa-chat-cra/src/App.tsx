import { Session } from '@supabase/gotrue-js/src/lib/types'
import React, { useEffect, useState } from 'react'
import './App.css'
import Account from './Account'
import Auth from './Auth'
import { supabase } from './supabaseClient'

export default function App() {
    const [session, setSession] = useState<Session | null>(null)
    useEffect(() => {
        // store initial session
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
        // listen for changes
        return supabase.auth.onAuthStateChange((event, session) => {
            setSession(session)
        }).data.subscription.unsubscribe
    }, [])

    return (
        <div className="App">
            <header className="App-header">
                <h1>
                    <a href="https://supabase.com/docs/guides/getting-started/tutorials/with-react">Supabase Auth</a>{' '}
                    from <a href="https://create-react-app.dev/">Create-React-App</a>
                </h1>
                <hr />
                {session && <Account key={session.user.id} session={session} />}
                {!session && <Auth />}
            </header>
        </div>
    )
}
