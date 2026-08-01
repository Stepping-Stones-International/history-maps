import React from "react"
import { Head, Link, useForm } from "@inertiajs/react"
import Layout from "../../components/Layout"
import FormErrors from "../../components/FormErrors"

export default function New({ errors }) {
  const form = useForm({ email_address: "", password: "", password_confirmation: "" })

  const submit = (event) => {
    event.preventDefault()
    form.post("/registration")
  }

  return (
    <Layout>
      <Head title="Sign up" />

      <main className="page page--narrow">
        <header className="page__header">
          <h1 className="page__title">Sign up</h1>
        </header>

        <FormErrors errors={errors} />

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
              autoComplete="new-password"
              maxLength={72}
              className="form__input"
              value={form.data.password}
              onChange={(e) => form.setData("password", e.target.value)}
            />
          </div>

          <div className="form__field">
            <label htmlFor="password_confirmation" className="form__label">Confirm password</label>
            <input
              id="password_confirmation"
              type="password"
              required
              autoComplete="new-password"
              maxLength={72}
              className="form__input"
              value={form.data.password_confirmation}
              onChange={(e) => form.setData("password_confirmation", e.target.value)}
            />
          </div>

          <button type="submit" className="button" disabled={form.processing}>Sign up</button>
        </form>

        <p className="page__footnote">
          Already have an account? <Link href="/session/new">Log in</Link>
        </p>
      </main>
    </Layout>
  )
}
