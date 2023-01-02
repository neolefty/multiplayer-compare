import { PropsWithChildren } from "react"
import { NavLink } from "react-router-dom"
import styles from "./Nav.module.css"

const StyledLink = ({ children, to }: PropsWithChildren<{ to: string }>) => (
    <NavLink to={to} className={({ isActive, isPending }) => (isActive ? "active" : undefined)}>
        {children}
    </NavLink>
)

export default function Nav() {
    return (
        <div className={styles.container}>
            <StyledLink to="/">Index</StyledLink>
            <StyledLink to="/profile">Profile</StyledLink>
        </div>
    )
}
