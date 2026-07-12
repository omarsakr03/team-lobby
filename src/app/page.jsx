"use client";

import { useState } from "react";

export default function Home() {
  const [mode, setMode] = useState("player");

  return (
    <main className="page">
      <nav>
        <h2>TEAM LOBBY</h2>
        <button>Join Discord</button>
      </nav>

      <section className="hero">
        <h1>Your place to build teams and play together.</h1>
        <p>
          A modern gaming community where players find teammates,
          create squads and compete together.
        </p>
        <div className="actions">
          <button onClick={() => setMode("player")}>Find Team</button>
          <button onClick={() => setMode("leader")}>Create Team</button>
        </div>
        <div className="panel">
          {mode === "player"
            ? "Looking for a team? Browse players and join active squads."
            : "Create your own team, invite players and build your legacy."}
        </div>
      </section>

      <section className="cards">
        <article>
          <h3>Teams</h3>
          <p>Create and manage competitive squads.</p>
        </article>
        <article>
          <h3>Games</h3>
          <p>Play lobby games and community events.</p>
        </article>
        <article>
          <h3>Profiles</h3>
          <p>Show levels, ranks and achievements.</p>
        </article>
      </section>
    </main>
  );
}