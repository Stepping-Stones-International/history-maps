import React from "react"
import { Head, Link, useForm } from "@inertiajs/react"
import Layout from "../../components/Layout"

export default function New({ emailAddress }) {
  const form = useForm({ email_address: emailAddress || "", password: "" })

  const submit = (event) => {
    event.preventDefault()
    form.post("/session")
  }

  return (
    <Layout>
      <Head title="Sign in" />

      <main className="page page--narrow">
        <header className="page__header">
          <h1 className="page__title">Sign in</h1>
        </header>

        <form onSubmit={submit} className="form">
          <div className="form__field">
            <label htmlFor="email_address" className="form__label">Email address</label>
            <input
              id="email_address"
              type="email"
              required
              autoFocus
              autoComplete="username"
              className="form__input"
              value={form.data.email_address}
              onChange={(e) => form.setData("email_address", e.target.value)}
            />
          </div>

          <div className="form__field">
            <label htmlFor="password" className="form__label">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              maxLength={72}
              className="form__input"
              value={form.data.password}
              onChange={(e) => form.setData("password", e.target.value)}
            />
          </div>

          <button type="submit" className="button" disabled={form.processing}>Sign in</button>
        </form>

        <p className="page__footnote"><Link href="/passwords/new">Forgot password?</Link></p>
      </main>
    </Layout>
  )
}
