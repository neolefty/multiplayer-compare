import clsx from "clsx"
import { PropsWithChildren } from "react"
import { NavLink } from "react-router-dom"
import { useSupabase } from "../SupabaseProvider"
import styles from "./Nav.module.scss"

const StyledLink = ({ children, to }: PropsWithChildren<{ to: string }>) => (
    <NavLink to={to} className={({ isActive, isPending }) => clsx(styles.navItem, isActive && styles.active)}>
        {children}
    </NavLink>
)

export const Nav = () => {
    const { session } = useSupabase()
    return (
        <div className={styles.container}>
            <span className={styles.navItem}>Hello {session?.user.email}</span>
            <StyledLink to="/">Home</StyledLink>
            <StyledLink to="/profile">Profile</StyledLink>
            <StyledLink to="/chat">Chat</StyledLink>
            <StyledLink to="/sync">Sync</StyledLink>
        </div>
    )
}
