import { useState } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);
    try {
      const response = await fetch("/shorten", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Unable to create a short link.");
      setResult(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">URL SHORTENER</p>
        <h1>
          Make every link
          <br />
          <em>short and shareable.</em>
        </h1>
        <p>
          Generate a compact URL backed by Cassandra and served quickly from
          Redis.
        </p>
      </section>
      <section className="card" aria-labelledby="create-link">
        <h2 id="create-link">Create a short link</h2>
        <form onSubmit={submit}>
          <label htmlFor="destination">Destination URL</label>
          <div className="inputRow">
            <input
              id="destination"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/very/long/link"
              required
            />
            <button disabled={loading}>
              {loading ? "Creating…" : "Shorten"}
            </button>
          </div>
        </form>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {result && (
          <div className="result">
            <span>Your short link</span>
            <a href={result.shortUrl} target="_blank" rel="noreferrer">
              {result.shortUrl}
            </a>
            <button type="button" onClick={copy}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
