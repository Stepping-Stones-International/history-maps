import React from "react"
import { Head, Link } from "@inertiajs/react"
import { Plus } from "lucide-react"
import Layout from "../../components/Layout"

export default function Index({ topics }) {
  return (
    <Layout>
      <Head title="Topics" />

      <main className="page">
        <header className="page__header">
          <h1 className="page__title">Topics</h1>

          <Link
            href="/topics/new"
            className="icon-button icon-button--large"
            title="Add new topic"
            aria-label="Add new topic"
          >
            <Plus className="icon-button__glyph" strokeWidth={2} />
          </Link>
        </header>

        {topics.length > 0 ? (
          <ul className="topic-list">
            {topics.map((topic) => (
              <li key={topic.id} className="topic">
                <h2 className="topic__title">{topic.title}</h2>
                <p className="topic__description">{topic.description}</p>
                <p className="topic__author">by {topic.author_email}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="page__empty">No topics yet.</p>
        )}
      </main>
    </Layout>
  )
}
