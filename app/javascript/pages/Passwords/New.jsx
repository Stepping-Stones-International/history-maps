import React from "react"
import { Head, Link, useForm } from "@inertiajs/react"
import Layout from "../../components/Layout"

export default function New({ emailAddress }) {
  const form = useForm({ email_address: emailAddress || "" })

  const submit = (event) => {
    event.preventDefault()
    form.post("/passwords")
  }

  return (
    <Layout>
      <Head title="Forgot your password?" />

      <main className="page page--narrow">
        <header className="page__header">
          <h1 className="page__title">Forgot your password?</h1>
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

          <button type="submit" className="button" disabled={form.processing}>
            Email reset instructions
          </button>
        </form>

        <p className="page__footnote"><Link href="/session/new">Back to sign in</Link></p>
      </main>
    </Layout>
  )
}
