import { useGameState } from "./hooks/useGameState";
import { useSearch } from "./hooks/useSearch";

function App() {
  const { state, submitGuess, takeHint, skipHint, reset, retryLoadTarget } =
    useGameState("release", "hard", true);
  const { inputValue, setInput, suggestions, error, clearSuggestions } =
    useSearch("release");

  if (state.isLoadingTarget) return <p>Chargement...</p>;

  if (state.targetLoadError) {
    return (
      <p>
        Erreur de chargement.{" "}
        <button onClick={retryLoadTarget}>Réessayer</button>
      </p>
    );
  }

  return (
    <div style={{ padding: "1rem", fontFamily: "monospace" }}>
      <p>
        Mode: {state.mode} | Difficulty: {state.difficulty} | Status:{" "}
        {state.status}
      </p>
      <p>
        Guesses: {state.guesses.length} | BlurLevel: {state.blurLevel} |
        HintsUsed: {state.hintsUsed}
      </p>
      <p>RevealedFields: [{state.revealedFields.join(", ")}]</p>

      {/* ⚠️ SMOKE-TEST DEBUG ONLY — reveals the answer to test the win condition.
          Violates the "target never in DOM before win" rule; REMOVE before the
          real UI. Search this title below and submit it to trigger a win. */}
      {state.target && (
        <div
          style={{
            border: "2px dashed crimson",
            padding: "0.5rem",
            margin: "0.5rem 0",
          }}
        >
          <strong>🐞 DEBUG — réponse :</strong>{" "}
          {state.target.kind === "release"
            ? `${state.target.title} — ${state.target.artist}${
                state.target.year ? ` (${state.target.year})` : ""
              }`
            : state.target.name}{" "}
          <code>[{state.target.mbid}]</code>
          {state.target.kind === "release" &&
            (state.target.coverArtUrl ? (
              <div>
                <img
                  src={state.target.coverArtUrl}
                  alt={`Pochette de ${state.target.title}`}
                  width={120}
                  height={120}
                  style={{ marginTop: "0.5rem", objectFit: "cover" }}
                />
              </div>
            ) : (
              <p>(aucune pochette trouvée — CAA 404 + Discogs sans résultat)</p>
            ))}
        </div>
      )}

      {state.availableHint && (
        <div>
          <strong>
            Indice :{" "}
            {state.availableHint.kind === "blur"
              ? "réduction du flou"
              : `champ "${state.availableHint.field}"`}
          </strong>{" "}
          <button onClick={takeHint}>Prendre</button>{" "}
          <button onClick={skipHint}>Ignorer</button>
        </div>
      )}

      {state.status === "playing" && (
        <>
          <input
            value={inputValue}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Chercher…"
          />
          {error && <p style={{ color: "crimson" }}>{error}</p>}
          <ul>
            {suggestions.map((s) => (
              <li
                key={s.mbid}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  submitGuess(s.mbid);
                  clearSuggestions();
                }}
              >
                {s.title} — {s.subtitle}
              </li>
            ))}
          </ul>
        </>
      )}

      <hr />
      {state.guesses.map((g, i) => (
        <div key={i} style={{ marginBottom: "0.5rem" }}>
          <strong>
            {g.resource.kind === "release" ? g.resource.title : g.resource.name}
          </strong>{" "}
          {Object.entries(g.comparison).map(([field, fc]) => (
            <span key={field} style={{ marginRight: "0.5rem" }}>
              {field}:{(fc as { feedback: string }).feedback}
            </span>
          ))}
        </div>
      ))}

      {(state.status === "won" || state.status === "lost") && (
        <div>
          <p>{state.status === "won" ? "Gagné !" : "Perdu"}</p>
          {state.target && (
            <p>
              Réponse :{" "}
              {state.target.kind === "release"
                ? state.target.title
                : state.target.name}
            </p>
          )}
          {state.target?.kind === "release" && state.target.coverArtUrl && (
            <img
              src={state.target.coverArtUrl}
              alt={`Pochette de ${state.target.title}`}
              width={160}
              height={160}
              style={{ objectFit: "cover" }}
            />
          )}
          <div>
            <button onClick={reset}>Rejouer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
