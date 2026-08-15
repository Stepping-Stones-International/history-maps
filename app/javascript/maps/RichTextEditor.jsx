import React, { useEffect, useRef, useState } from "react"
import {
  Bold, Eraser, Italic, Link, List, ListOrdered, Quote, Strikethrough, Underline
} from "lucide-react"

const COMMANDS = [
  { command: "bold", label: "Bold", icon: Bold },
  { command: "italic", label: "Italic", icon: Italic },
  { command: "underline", label: "Underline", icon: Underline },
  { command: "strikeThrough", label: "Strikethrough", icon: Strikethrough },
  { command: "insertUnorderedList", label: "Bulleted list", icon: List },
  { command: "insertOrderedList", label: "Numbered list", icon: ListOrdered },
  { command: "formatBlock", value: "blockquote", label: "Quote", icon: Quote }
]

function normalize(html) {
  return html === "<br>" ? "" : html
}

export default function RichTextEditor({ id, label, value = "", onChange }) {
  const editor = useRef(null)
  const [active, setActive] = useState({})

  useEffect(() => {
    if (!editor.current) return
    if (editor.current.innerHTML !== value) editor.current.innerHTML = value || ""
  }, [value])

  const emitChange = () => {
    if (!editor.current) return
    onChange(normalize(editor.current.innerHTML))
  }

  const refreshActive = () => {
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList")
    })
  }

  const run = (command, commandValue = null) => {
    editor.current?.focus()
    document.execCommand(command, false, commandValue)
    emitChange()
    refreshActive()
  }

  const addLink = () => {
    editor.current?.focus()
    const url = window.prompt("Link URL")
    if (!url) return

    run("createLink", url)
  }

  const clearFormatting = () => run("removeFormat")

  const handlePaste = (event) => {
    event.preventDefault()
    const text = event.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
    emitChange()
  }

  return (
    <div className="rich-editor">
      <label htmlFor={id} className="form__label">{label}</label>
      <div className="rich-editor__toolbar" aria-label={`${label} formatting`}>
        {COMMANDS.map(({ command, value: commandValue, label: commandLabel, icon: Icon }) => (
          <button
            key={`${command}-${commandValue || ""}`}
            type="button"
            className={`rich-editor__button ${active[command] ? "rich-editor__button--active" : ""}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => run(command, commandValue)}
            aria-label={commandLabel}
            title={commandLabel}
          >
            <Icon className="rich-editor__icon" aria-hidden="true" />
          </button>
        ))}

        <button
          type="button"
          className="rich-editor__button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={addLink}
          aria-label="Add link"
          title="Add link"
        >
          <Link className="rich-editor__icon" aria-hidden="true" />
        </button>

        <button
          type="button"
          className="rich-editor__button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={clearFormatting}
          aria-label="Clear formatting"
          title="Clear formatting"
        >
          <Eraser className="rich-editor__icon" aria-hidden="true" />
        </button>
      </div>

      <div
        id={id}
        ref={editor}
        className="rich-editor__surface"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        onInput={emitChange}
        onBlur={emitChange}
        onKeyUp={refreshActive}
        onMouseUp={refreshActive}
        onPaste={handlePaste}
      />
    </div>
  )
}
