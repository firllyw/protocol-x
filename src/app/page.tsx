"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";


export default function Home() {
  let socket: WebSocket | null = null;
  const [progress, setProgress] = useState(['Setting up..']);
  useEffect(() => {
    socket = new WebSocket("ws://localhost:3000/api/websocket");
    socket.onopen = () => {
      console.log("Connected to server");
    };
    socket.onmessage = (event) => {
      console.log("Received message: ", event.data);
      setProgress((prev) => [...prev, event.data]);
    };
    socket.onclose = () => {
      console.log("Disconnected from server");
    };
    return () => {
      socket?.close();
    };
  }, []);

  const notify = (text: string) => toast(text);
  const [githubUrl, setGithubUrl] = useState("");
  const [entry, setEntry] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    console.log('submitting...')
    e.preventDefault();
    setLoading(true);
    fetch("/api/submission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ githubUrl: githubUrl, entry: entry }),
    })
      .catch((error) => {
        notify("Error submitting form");
        console.error("Error:", error);
      })
      .then(() => {
        setLoading(false);
        notify("Form submitted successfulxly");
        setGithubUrl("");
      });

  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="github-url">
            GitHub URL
          </label>
          <input
            type="url"
            id="github-url"
            name="github-url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your GitHub URL"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="github-url">
            GitHub URL
          </label>
          <input
            type="entry"
            id="entry"
            name="entry"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="App entry point, default to app.js"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
        </div>
        <div className="flex items-center justify-between">
          <a>Status: </a>
          <ul>
            {progress.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      </form>
    </main>
  );
}
