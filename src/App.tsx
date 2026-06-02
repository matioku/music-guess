import "./App.css";
import { useGameState } from "./hooks/useGameState";
import { useSearch } from "./hooks/useSearch";

function App() {
  const { state, submitGuess, takeHint, skipHint, reset } = useGameState(
    "release",
    "hard",
    true
  );
  const { inputValue, setInput, suggestions, clearSuggestions } =
    useSearch("release");

  if (state.isLoadingTarget) return <p>Chargement...</p>;

  if (state.status === "error") {
    return (
      <p>
        Erreur de chargement.{" "}
        <button onClick={reset}>Réessayer</button>
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
          <button onClick={reset}>Rejouer</button>
        </div>
      )}
    </div>
  );
}

export default App;
