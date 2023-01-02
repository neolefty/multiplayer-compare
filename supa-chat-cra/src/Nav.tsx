import { LinkOptions } from "@tanstack/react-router"
import styles from "./Nav.module.css"

export default function Nav() {
    return (
        <div className={styles.container}>
            <Link to="/">Index</Link>
            <Link to="/profile">Profile</Link>
        </div>
    )
}
