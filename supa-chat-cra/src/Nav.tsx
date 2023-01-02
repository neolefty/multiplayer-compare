import clsx from "clsx"
import { PropsWithChildren } from "react"
import { NavLink } from "react-router-dom"
import styles from "./Nav.module.css"

const StyledLink = ({ children, to }: PropsWithChildren<{ to: string }>) => (
    <NavLink to={to} className={({ isActive, isPending }) => clsx(styles.navLink, isActive && styles.active)}>
        {children}
    </NavLink>
)

export default function Nav() {
    return (
        <div className={styles.container}>
            <StyledLink to="/">Home</StyledLink>
            <StyledLink to="/profile">Profile</StyledLink>
        </div>
    )
}
