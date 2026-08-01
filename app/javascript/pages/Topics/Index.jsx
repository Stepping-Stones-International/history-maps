import React, { useState } from "react"
import { Head, Link } from "@inertiajs/react"
import { Plus } from "lucide-react"
import Layout from "../../components/Layout"
import Modal from "../../components/Modal"
import NewTopicForm from "../../components/NewTopicForm"

export default function Index({ topics }) {
  const [creating, setCreating] = useState(false)

  return (
    <Layout>
      <Head title="Topics" />

      <main className="page">
        <header className="page__header">
          <h1 className="page__title">Topics</h1>

          <button
            type="button"
            className="icon-button icon-button--large"
            onClick={() => setCreating(true)}
            title="Add new topic"
            aria-label="Add new topic"
          >
            <Plus className="icon-button__glyph" strokeWidth={2} />
          </button>
        </header>

        {topics.length > 0 ? (
          <ul className="topic-list">
            {topics.map((topic) => (
              <li key={topic.id} className="topic">
                <h2 className="topic__title">
                  <Link href={`/topics/${topic.id}/edit`} className="topic__link">
                    {topic.title}
                  </Link>
                </h2>
                <p className="topic__description">{topic.description}</p>
                <p className="topic__author">by {topic.author_email}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="page__empty">No topics yet.</p>
        )}
      </main>

      {creating && (
        <Modal title="New topic" onClose={() => setCreating(false)}>
          <NewTopicForm onCancel={() => setCreating(false)} />
        </Modal>
      )}
    </Layout>
  )
}
