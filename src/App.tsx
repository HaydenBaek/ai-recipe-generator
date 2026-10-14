import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

export default function App() {
  const { signOut } = useAuthenticator();
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateRecipe() {
    const items = ingredients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (items.length === 0) {
      setError("Please enter some ingredients.");
      return;
    }

    setLoading(true);
    setError("");
    setRecipe("");

    try {
      const { data, errors } = await client.queries.askBedrock({
        ingredients: items,
      });

      if (errors?.length) {
        throw new Error(errors.map((item) => item.message).join(", "));
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setRecipe(data?.body ?? "No recipe was returned. Try again.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: 24 }}>
      <h1>AI Recipe Generator</h1>
      <p>Enter ingredients separated by commas.</p>

      <textarea
        aria-label="Ingredients"
        placeholder="eggs, rice, onions"
        value={ingredients}
        onChange={(event) => setIngredients(event.target.value)}
        rows={4}
        style={{ width: "100%", padding: 12, boxSizing: "border-box" }}
      />

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={generateRecipe} disabled={loading}>
          {loading ? "Generating..." : "Generate recipe"}
        </button>

        <button onClick={signOut}>Sign out</button>
      </div>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      {recipe && (
        <section style={{ marginTop: 24, whiteSpace: "pre-wrap" }}>
          <h2>Your recipe</h2>
          {recipe}
        </section>
      )}
    </main>
  );
}