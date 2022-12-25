import { Session } from '@supabase/supabase-js'

export default function Account({ session }: { session: Session }) {
    return <p>Logged in as {session.user.email}</p>
}
