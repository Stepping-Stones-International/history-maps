import React from "react"
import { Head, Link, useForm } from "@inertiajs/react"
import Layout from "../../components/Layout"
import FormErrors from "../../components/FormErrors"

export default function New({ errors }) {
  const form = useForm({ title: "", description: "" })

  const submit = (event) => {
    event.preventDefault()
    form.post("/topics")
  }

  return (
    <Layout>
      <Head title="New topic" />

      <main className="page page--narrow">
        <header className="page__header">
          <h1 className="page__title">New topic</h1>
        </header>

        <FormErrors errors={errors} />

        <form onSubmit={submit} className="form">
          <div className="form__field">
            <label htmlFor="title" className="form__label">Title</label>
            <input
              id="title"
              type="text"
              required
              autoFocus
              className="form__input"
              value={form.data.title}
              onChange={(e) => form.setData("title", e.target.value)}
            />
          </div>

          <div className="form__field">
            <label htmlFor="description" className="form__label">Description</label>
            <textarea
              id="description"
              rows={5}
              className="form__input"
              value={form.data.description}
              onChange={(e) => form.setData("description", e.target.value)}
            />
          </div>

          <button type="submit" className="button" disabled={form.processing}>
            Add topic
          </button>
        </form>

        <p className="page__footnote"><Link href="/topics">Back to topics</Link></p>
      </main>
    </Layout>
  )
}
