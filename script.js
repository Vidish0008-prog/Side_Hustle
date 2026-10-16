/*
  ListingLift AI
  Local AI mode: uses Ollama's local HTTP API (default: http://localhost:11434).
  Example model: qwen2.5:3b
  If Ollama is not running, the app offers a clearly labelled demo preview.
*/
const form = document.querySelector("#listing-form");
const detailsInput = document.querySelector("#details");
const charCount = document.querySelector("#char-count");
const generateButton = document.querySelector("#generate-btn");
const buttonLabel = document.querySelector("#button-label");
const emptyState = document.querySelector("#empty-state");
const results = document.querySelector("#results");
const errorMessage = document.querySelector("#error-message");
const modeBadge = document.querySelector("#mode-badge");

detailsInput.addEventListener("input", () => {
  charCount.textContent = `${detailsInput.value.length} / 1800`;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.classList.add("hidden");

  const data = {
    productName: document.querySelector("#product-name").value.trim(),
    marketplace: document.querySelector("#marketplace").value,
    tone: document.querySelector("#tone").value,
    details: detailsInput.value.trim(),
    audience: document.querySelector("#audience").value.trim(),
    keywords: document.querySelector("#keywords").value.trim()
  };

  if (!data.productName || !data.details) return;
  setLoading(true);

  try {
    const generated = await generateWithOllama(data);
    renderResults(generated);
    modeBadge.textContent = "LOCAL AI";
    modeBadge.classList.add("local");
  } catch (error) {
    // Demo output lets visitors explore the interface without installing a model.
    // It is not represented as AI-generated output.
    renderResults(makeDemoListing(data));
    modeBadge.textContent = "DEMO PREVIEW";
    modeBadge.classList.remove("local");
    errorMessage.textContent = "Ollama was not reachable, so this is a template-based demo preview—not AI-generated content. To use open-source AI locally, install Ollama, download a model such as qwen2.5:3b, and enable the local API. Details: " + error.message;
    errorMessage.classList.remove("hidden");
  } finally {
    setLoading(false);
  }
});

async function generateWithOllama(data) {
  const prompt = `You are a careful ecommerce copywriter helping a small seller. Create a marketplace listing using only the facts provided. Never invent materials, dimensions, certifications, shipping promises, or product features. If a detail is missing, leave it out. Be ${data.tone.toLowerCase()}. Marketplace: ${data.marketplace}. Product: ${data.productName}. Ideal customer: ${data.audience || "general shoppers"}. Keywords to consider naturally: ${data.keywords || "none provided"}. Product facts: ${data.details}

Return ONLY valid JSON with exactly these keys:
{"title":"A clear, searchable title under 140 characters","description":"A helpful, persuasive description in 2-3 short paragraphs. Include only supplied facts.","tags":["10 short search tags, each under 25 characters"]}
No markdown fences.`;
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "qwen2.5:3b", prompt, stream: false, format: "json" })
  });
  if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}.`);
  const payload = await response.json();
  const parsed = JSON.parse(payload.response);
  if (!parsed.title || !parsed.description || !Array.isArray(parsed.tags)) {
    throw new Error("The model response was missing a title, description, or tag list.");
  }
  return {
    title: String(parsed.title),
    description: String(parsed.description),
    tags: parsed.tags.slice(0, 10).map(tag => String(tag).replace(/^#/, "").trim()).filter(Boolean)
  };
}

function makeDemoListing(data) {
  const keywords = data.keywords.split(",").map(s => s.trim()).filter(Boolean);
  const details = data.details.replace(/\s+/g, " ").trim();
  const tags = [...new Set([
    ...keywords,
    data.productName.toLowerCase(),
    ...data.productName.toLowerCase().split(/\s+/),
    data.marketplace.toLowerCase() === "general" ? "gift idea" : data.marketplace.toLowerCase(),
    "small business",
    "product gift",
    "everyday use"
  ])].filter(tag => tag.length > 1).slice(0, 10);

  const title = `${data.productName} | Thoughtful ${data.audience ? data.audience + " " : ""}Find`;
  const description = `${data.productName}\n\n${details}\n\nA considered option for ${data.audience || "anyone looking for something useful and well-chosen"}. Please review the product details and add any important information before publishing.`;
  return { title: title.slice(0, 140), description, tags };
}

function renderResults(listing) {
  emptyState.classList.add("hidden");
  results.classList.remove("hidden");
  document.querySelector("#result-title").textContent = listing.title;
  document.querySelector("#result-description").textContent = listing.description;
  const tagContainer = document.querySelector("#result-tags");
  tagContainer.replaceChildren();
  listing.tags.forEach(tag => {
    const chip = document.createElement("span");
    chip.className = "tag";
    chip.textContent = "#" + tag.replace(/^#/, "");
    tagContainer.appendChild(chip);
  });
}

function setLoading(loading) {
  generateButton.disabled = loading;
  buttonLabel.textContent = loading ? "Writing your listing…" : "Generate my listing";
}

document.querySelectorAll("[data-copy]").forEach(button => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copy);
    const text = target.id === "result-tags"
      ? [...target.querySelectorAll(".tag")].map(tag => tag.textContent).join(" ")
      : target.textContent;
    try {
      await navigator.clipboard.writeText(text);
      const original = button.textContent;
      button.textContent = "Copied ✓";
      setTimeout(() => { button.textContent = original; }, 1400);
    } catch {
      errorMessage.textContent = "Clipboard access was blocked by your browser. Select the text and copy it manually.";
      errorMessage.classList.remove("hidden");
    }
  });
});
