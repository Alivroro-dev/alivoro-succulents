# Succulent Success – Free Beginner Course + AI Assistant

A gentle, self-paced course for growing succulents, now with a free AI chat assistant powered by Cloudflare Workers AI.

## Features
- 8 clear step-by-step modules
- Progress tracking (saved in the browser)
- UK seasonal advice
- Propagation guides
- Free AI chat that answers succulent questions accurately
- Zero ongoing cost (uses Cloudflare free tiers)

---

## 1. Deploy the Course (Cloudflare Pages)

1. Create a new **Public** GitHub repository.
2. Upload all the files and folders from this project.
3. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
4. Select your repository.
5. Leave Build command and Output directory empty.
6. Deploy. You will get a URL like `https://your-project.pages.dev`.

---

## 2. Deploy the AI Worker (Cloudflare Workers AI)

This is what powers the chat.

### Create the Worker

1. In the Cloudflare dashboard go to **Workers & Pages** → **Create** → **Create Worker**.
2. Name it something like `succulent-ai`.
3. Click **Deploy**.
4. Click **Edit code**.
5. **Delete** the default code and paste the entire contents of the file:
   `ai/worker.js`
6. Click **Save and Deploy**.

### Enable Workers AI binding

1. In the Worker settings, go to **Settings** → **Bindings**.
2. Click **Add binding**.
3. Choose **Workers AI**.
4. Variable name: `AI` (exactly this).
5. Save.

### Get the Worker URL

After deploying you will see a URL like:
`https://succulent-ai.your-subdomain.workers.dev`

Copy that URL.

---

## 3. Connect the Course to the AI Worker

1. Open the file `js/chat.js` in your GitHub repository (or locally).
2. Find this line near the top:

```js
const WORKER_URL = "PASTE_YOUR_WORKER_URL_HERE";
```

3. Replace it with your real Worker URL, for example:

```js
const WORKER_URL = "https://succulent-ai.your-subdomain.workers.dev";
```

4. Commit the change. Cloudflare Pages will automatically update the live course within a minute or two.

---

## 4. Test it

1. Open your Pages URL.
2. Click **Open AI Assistant**.
3. Ask a question such as:
   - “How often should I water succulents in winter in the UK?”
   - “My echeveria leaves are soft and mushy – what should I do?”
   - “How do I propagate from a leaf?”

---

## Notes

- The AI uses Cloudflare’s free Workers AI tier (Llama 3.1 8B). Daily limits are generous for personal use.
- The system prompt is written to prioritise accurate, safe, beginner-friendly succulent advice and to be honest when unsure.
- Chat history is kept short to stay within free limits.
- The course modules still work completely offline. Only the AI chat needs the Worker.

---

Enjoy your course + AI helper!
