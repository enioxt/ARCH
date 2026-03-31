# API Keys & Security Guide

> **IMPORTANT:** Never commit `.env` to git. It's already in `.gitignore`.

## 🔐 Stored API Keys

### Local (.env file — NOT committed)

**Currently stored:**
```
BRAVE_API_KEY=BSAzJ4rPne1JDWZxGZT-yXoSWvVErzm ✅
FIRECRAWL_API_KEY=fc-7574224eba4a416eafbfcc0150b185f4 ✅
EXA_API_KEY=*** (placeholder)
PERPLEXITY_API_KEY=*** (placeholder)
GEMINI_API_KEY=*** (placeholder)
OPENAI_API_KEY=*** (placeholder)
ANTHROPIC_API_KEY=*** (placeholder)
OPENROUTER_API_KEY=*** (placeholder)
```

All keys are stored in `.env` file which is:
- ✅ In `.gitignore` (not committed)
- ✅ Loaded by `dotenv` at runtime
- ✅ Accessible via `process.env.KEY_NAME`

### Production (Environment Variables)

For production deployment, set these as environment variables in your hosting:
- Vercel: Settings → Environment Variables
- Railway: Settings → Variables
- Heroku: Config Vars
- Docker: `--env-file` or docker-compose secrets

## 🚀 Using API Keys in Code

### Brave Search API

**Location:** `src/lib/budget-api.ts:fetchRetailPrices()`

```typescript
// ✅ CORRECT: Load from process.env
const braveKey = process.env.BRAVE_API_KEY;

if (!braveKey) {
  throw new Error('BRAVE_API_KEY not set in environment');
}

const response = await fetch('https://api.search.brave.com/res/v1/web/search', {
  headers: {
    'Accept': 'application/json',
    'X-Subscription-Token': braveKey,
  },
});

// ❌ WRONG: Never hardcode keys
const braveKey = 'BSAzJ4rPne1JDWZxGZT-yXoSWvVErzm';
```

### Exa API

**Location:** `src/lib/budget-api.ts:researchPrices()`

```typescript
// ✅ CORRECT
const exaKey = process.env.EXA_API_KEY;
const exa = new Exa(exaKey);

const results = await exa.search(itemName, { numResults: 5 });
```

### Firecrawl API

**Location:** `src/lib/budget-api.ts:fetchRetailPrices()`

**Key Format:** `fc-` followed by alphanumeric string

```typescript
// ✅ CORRECT: Load from process.env
const firecrawlKey = process.env.FIRECRAWL_API_KEY;

if (!firecrawlKey) {
  throw new Error('FIRECRAWL_API_KEY not set in environment');
}

// POST request to https://api.firecrawl.dev/v0/scrape
const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${firecrawlKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: targetUrl,
    formats: ['markdown', 'html'],
    onlyMainContent: true,
  }),
});

const data = await response.json();
const markdown = data.markdown; // Contains scraped content

// ❌ WRONG: Never hardcode keys
const firecrawlKey = 'fc-7574224eba4a416eafbfcc0150b185f4';
```

**Important:** Firecrawl uses `Bearer` token authentication (not API key header), unlike Brave which uses `X-Subscription-Token`.

### Perplexity API

**Location:** `src/lib/budget-api.ts:deepResearchPrices()` (planned)

```typescript
// ✅ CORRECT
const perpKey = process.env.PERPLEXITY_API_KEY;
const perp = new Perplexity(perpKey);

const response = await perp.chat.completions.create({
  model: 'sonar-pro',
  messages: [...],
});
```

## 🛡️ Security Best Practices

### ✅ DO

1. **Store keys in `.env`** (not in code)
2. **Load via `process.env`** at runtime
3. **Check key existence** before using
4. **Rotate keys quarterly** (security best practice)
5. **Use separate keys per environment** (dev, staging, prod)
6. **Log API usage** for audit trails
7. **Set rate limits** on API keys

### ❌ DON'T

1. **Never hardcode keys** in source code
2. **Never commit `.env`** to git
3. **Never log API keys** or responses
4. **Never share keys** in Slack, email, etc
5. **Never use production keys in development**
6. **Never expose keys in error messages**
7. **Never publish keys in documentation**

## 📝 Setup Instructions

### For Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your API keys:
   ```bash
   nano .env
   # or: vim .env
   # or: code .env
   ```

3. Verify `.env` is in `.gitignore`:
   ```bash
   cat .gitignore | grep -i env
   # Should output: .env*
   ```

4. Test that keys are loaded:
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.BRAVE_API_KEY)"
   # Should output: BSAzJ4rPne1JDWZxGZT-yXoSWvVErzm
   ```

### For Production

1. Set environment variables in your hosting platform
2. Never commit `.env` — always use platform's secret manager
3. Rotate keys every 90 days
4. Monitor API usage for unusual patterns

## 📊 API Cost Tracking

Each API call should log:
- API name (Brave, Exa, Firecrawl, etc)
- Request timestamp
- Item queried
- Cost in USD
- Response time
- Success/failure

```typescript
// ✅ EXAMPLE: Log API usage
logger.log({
  eventName: 'budget_source_fetched',
  provider: 'brave',
  itemName: 'Concreto fck 30 MPa',
  costUsd: 0.005, // Brave charges ~$5/1000 requests
  latencyMs: 234,
  status: 'success',
});
```

## 🔄 Key Rotation Schedule

| API | Frequency | Added | Last Rotated | Next Due |
|-----|-----------|-------|--------------|----------|
| Brave | Quarterly | 2026-03-31 | 2026-03-31 | 2026-06-30 |
| Firecrawl | Quarterly | 2026-03-31 | 2026-03-31 | 2026-06-30 |
| Exa | Quarterly | - | - | - |
| Perplexity | Quarterly | - | - | - |
| Gemini | Quarterly | - | - | - |
| OpenAI | Quarterly | - | - | - |

## 🚨 Emergency Response

If a key is accidentally committed:

1. **Immediately rotate the key** (disable old one)
2. Run the following commands:
   ```bash
   # Remove from git history
   git filter-branch --tree-filter 'rm -f .env' HEAD

   # Force push (dangerous, coordinate with team)
   git push origin --force-with-lease
   ```
3. Add the key to `.gitignore` if not already there
4. Log the incident in security records

## 📚 References

- **Budget Module:** `src/lib/budget-api.ts`
- **Environment Setup:** `.env.example`
- **API Endpoints:** `docs/SYSTEM_MAP.md` → Flow 4
- **Implementation Guide:** `BUDGET_IMPLEMENTATION_GUIDE.md`

## 🤝 Questions?

If you need to add a new API key:
1. Add to `.env.example` with placeholder
2. Add to `.env` with actual value
3. Load via `process.env.KEY_NAME` in code
4. Document usage in this file
5. Update API_COST_TRACKING.md

---

**Last Updated:** 2026-03-31
**Reviewed By:** Enio Rocha
**Status:** ✅ Complete
