import React from "react"
import { Link, usePage, router } from "@inertiajs/react"

export default function SiteHeader() {
  const { currentUser } = usePage().props

  const logOut = (event) => {
    event.preventDefault()
    router.delete("/session")
  }

  return (
    <header className="site-header">
      <Link href="/" className="site-header__brand">Knowledge</Link>

      <nav className="site-header__nav">
        {currentUser ? (
          <>
            <span className="site-header__user">{currentUser.email_address}</span>
            <form onSubmit={logOut}>
              <button type="submit" className="button button--quiet">Log out</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/session/new" className="site-header__link">Log in</Link>
            <Link href="/registration/new" className="button">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  )
}
