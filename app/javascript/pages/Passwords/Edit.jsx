import React from "react"
import { Head, useForm } from "@inertiajs/react"
import Layout from "../../components/Layout"

export default function Edit({ token }) {
  const form = useForm({ password: "", password_confirmation: "" })

  const submit = (event) => {
    event.preventDefault()
    form.put(`/passwords/${token}`)
  }

  return (
    <Layout>
      <Head title="Update your password" />

      <main className="page page--narrow">
        <header className="page__header">
          <h1 className="page__title">Update your password</h1>
        </header>

        <form onSubmit={submit} className="form">
          <div className="form__field">
            <label htmlFor="password" className="form__label">New password</label>
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
            <label htmlFor="password_confirmation" className="form__label">Repeat new password</label>
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

          <button type="submit" className="button" disabled={form.processing}>Save</button>
        </form>
      </main>
    </Layout>
  )
}
