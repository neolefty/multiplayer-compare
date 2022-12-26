import { SyntheticEvent, useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    // lol
    const isValidEmail = email.indexOf('@') > 0 && email.trim().indexOf('@') < email.trim().length - 1

    const handleLogin = async (e: SyntheticEvent) => {
        e.preventDefault()
        try {
            setLoading(true)
            const { error, data } = await supabase.auth.signInWithOtp({ email })
            console.log({ data })
            if (error) throw error
            setSent(true)
        } catch (error: any) {
            alert(error.error_description || error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setSent(false)
        setEmail('')
        setError('')
    }

    return (
        <div aria-live="polite">
            <p>Sign in via link with your email below</p>
            {loading && <p>Check Login Link ...</p>}
            {!loading && !sent && !error && (
                <div>
                    <form onSubmit={handleLogin}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button aria-live="polite" disabled={!isValidEmail}>
                            Send Login Link
                        </button>
                    </form>
                </div>
            )}
            {sent && !error && (
                <div>
                    <form onSubmit={handleReset}>
                        <p>
                            Success! Email sent to <strong>{email}</strong>.
                        </p>
                        <button aria-live="polite">Reset</button>
                    </form>
                </div>
            )}
            {error && (
                <form onSubmit={handleReset}>
                    <p>Dang, something went wrong.</p>
                    <p>{error}</p>
                    <button aria-live="polite">Try again</button>
                </form>
            )}
        </div>
    )
}
