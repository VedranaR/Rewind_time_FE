import { useState } from "react";
import classes from "./SearchForm.module.css";

export default function SearchForm({ onSearch }) {
  const [q, setQ] = useState("");

  function submit(e) {
    e.preventDefault();
    onSearch(q.trim());
  }
  function cancel() {
    setQ("");
    onSearch("");
  }

  return (
    <form onSubmit={submit} className={classes.form}>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="search for…"
      />

      <button type="submit">🔍</button>
      <button type="button" onClick={cancel}>
        ✖
      </button>
    </form>
  );
}
