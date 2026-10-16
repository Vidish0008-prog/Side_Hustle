# ListingLift AI

A beginner-friendly Hacktoberfest 2026 Week 2 “Side Hustle” project: turn product notes into draft marketplace listings.

## Files
- `index.html` — page structure
- `style.css` — responsive design
- `script.js` — generation, local Ollama connection, copy buttons, and clearly labelled demo fallback

## Run it as a static demo
Open `index.html` in a browser. Fill in the form and click **Generate my listing**. If Ollama is not installed/running, the site displays a template-based demo and clearly warns that it is not AI-generated.

## Enable open-source local AI
1. Install Ollama from https://ollama.com/ .
2. In Terminal, run: `ollama pull qwen2.5:3b`
3. Start the model once with: `ollama run qwen2.5:3b`
4. Serve this folder locally (recommended; clipboard and browser security behave better on localhost). If you have Python installed, open Terminal in this folder and run: `python3 -m http.server 8000`
5. Visit `http://localhost:8000`.
6. If the browser blocks requests to Ollama due to CORS, configure Ollama's allowed origins for localhost in your environment or add a tiny local backend proxy. Do not expose Ollama's API publicly.

The model runs on your computer. The prompt is sent to `http://localhost:11434/api/generate`; it is not sent to a hosted model provider. Model downloads require internet, and local inference uses your computer's memory and CPU/GPU.

## Honest limitations
- This is a front-end prototype, not a commercial SaaS yet.
- Demo fallback uses templates, not AI.
- Always review generated claims before publishing. The prompt instructs the model not to invent product facts, but models can still make mistakes.
- For a real product, add validation, tests, a local backend/proxy, accessible error handling, and user testing with a real seller.

## Hacktoberfest angle
Open-weight AI makes it possible to prototype without a paid hosted-model API, lets a seller keep product details on their own machine, and avoids dependence on one provider's model pricing. The trade-off is that users need compatible hardware and setup, and local inference can be slower than a hosted service.
