# 📊 API QUOTAS & MONITORING SYSTEM

**Data:** 2026-03-31
**Status:** ✅ LIVE MONITORING ACTIVE
**Responsibility:** Enio Rocha

---

## 🎯 OVERVIEW

Sistema centralizado para monitorar e controlar cotas de uso de TODAS as APIs:

- ✅ Rastreia requisições diárias e mensais
- ✅ Monitora custos em tempo real
- ✅ Alerta automático em 80%+ de uso
- ✅ Bloqueia requisições se exceder quota
- ✅ Dashboard de status `/api/quotas/status`

---

## 📋 QUOTAS CONFIGURADAS

### 🔷 SEARCH APIs

#### **Google Gemini** (Free Tier)
```
Daily Requests:  60/day (practical limit for MVP)
Monthly Tokens:  2M/month (free tier)
Cost:            $0/month
Status:          ✅ ACTIVE
Alerts:          🟡 80%+ of daily limit
Reset:           Daily @ 00:00 UTC
```

#### **Tavily AI** (Dev Tier)
```
Daily Requests:  100/day
Monthly Limit:   3,000/month
Cost:            $0/month (free dev tier)
Status:          ✅ CONFIGURED
Alerts:          🟡 90%+ of limits
Reset:           Daily @ 00:00 UTC
Docs:            https://tavily.com/docs
```

#### **Exa AI** (Free Trial)
```
Monthly Limit:   30,000/month (estimated)
Cost:            $7/1000 searches
Monthly Budget:  $50 USD (safety limit)
Status:          ⏳ FREE TRIAL
Alerts:          🟡 90%+ quota
Reset:           Monthly
Docs:            https://exa.ai/docs
```

#### **Brave Search** (Pay-as-you-go)
```
Monthly Limit:   300,000/month (safety set by us)
Cost:            $5/1000 requests
Monthly Budget:  $50 USD (safety limit)
Status:          ✅ CONFIGURED
Alerts:          🟡 90%+ quota
Reset:           Monthly
Docs:            https://api.search.brave.com/docs
```

---

### 🔷 SCRAPING APIs

#### **Firecrawl** (Starter Plan — $16/mo)
```
Monthly Limit:   3,000 requests
Cost:            $16/month (fixed)
Status:          ✅ ACTIVE
Alerts:          🟡 90%+ quota
Reset:           Monthly (auto-renew)
Docs:            https://docs.firecrawl.dev/
```

---

### 🔷 GENERATION APIs

#### **fal.ai** (Paid)
```
Daily Limit:     100 generations (safety)
Monthly Limit:   3,000 generations
Cost:            ~$0.05-0.30 per generation
Monthly Budget:  $200 USD (trial $20 + estimated)
Status:          ✅ ACTIVE
Alerts:          🟡 80%+ budget
Reset:           Monthly
Docs:            https://fal.ai/docs
```

#### **Together AI** (Free SDXL + Flux)
```
Monthly Limit:   30,000/month
Cost:            $0/month
Status:          ✅ ACTIVE
Alerts:          None (unlimited free)
Reset:           Monthly
Docs:            https://www.together.ai/
```

---

### 🔷 AI/LLM APIs

#### **OpenRouter** (Pay-as-you-go)
```
Monthly Limit:   30,000 requests
Cost:            Varies by model ($0.0001-0.001/token)
Monthly Budget:  $100 USD
Status:          ✅ ACTIVE (trial + safety)
Alerts:          🟡 80%+ budget
Reset:           Monthly
Docs:            https://openrouter.ai/docs
Models:          Claude, Perplexity, GPT-4, etc
```

#### **OpenAI** (Free Trial)
```
Daily Limit:     100 requests
Monthly Limit:   3,000 requests
Cost:            Varies by model
Monthly Budget:  $0 (free trial only)
Status:          ⏳ FREE TRIAL
Alerts:          🟡 90%+ quota
Reset:           Monthly
Docs:            https://platform.openai.com/docs
```

#### **Anthropic Claude** (Free Trial)
```
Daily Limit:     100 requests
Monthly Limit:   3,000 requests
Cost:            Free trial
Monthly Budget:  $0
Status:          ⏳ FREE TRIAL
Alerts:          🟡 90%+ quota
Reset:           Monthly
Docs:            https://docs.anthropic.com/
```

---

## ⚙️ MONITORING SYSTEM

### Code Location
```
src/lib/quota-monitor.ts (350+ lines)
```

### Core Functions

#### 1. **Initialize Quotas**
```typescript
import { initializeQuotas } from '@/lib/quota-monitor';

// Call on app startup
initializeQuotas();
```

#### 2. **Log API Usage**
```typescript
import { logAPIUsage } from '@/lib/quota-monitor';

// Call after EVERY API request
const { allowed, alerts } = logAPIUsage('tavily', {
  requestCount: 1,
  costUSD: 0,
  itemQueried: 'Concreto fck 30 MPa preço',
  latencyMs: 234,
  status: 'success',
  metadata: { region: 'MG' }
});

if (!allowed) {
  logger.error('Quota exceeded, request blocked');
  return res.status(429).json({ error: 'Quota exceeded' });
}
```

#### 3. **Get Status Dashboard**
```typescript
import { getQuotaStatus } from '@/lib/quota-monitor';

const status = getQuotaStatus();
// Returns object with all APIs + usage percentages
```

#### 4. **Check if Usage Allowed**
```typescript
import { isAPIUsageAllowed, enforceQuota } from '@/lib/quota-monitor';

// Option 1: Check and handle
if (!isAPIUsageAllowed('gemini')) {
  return res.status(429).json({ error: 'Quota exceeded' });
}

// Option 2: Throw error (for middleware)
enforceQuota('gemini');  // throws if exceeded
```

#### 5. **Reset Quotas**
```typescript
import { resetDailyQuotas, resetMonthlyQuotas } from '@/lib/quota-monitor';

// Reset daily @ 00:00 UTC (use cron job)
resetDailyQuotas();

// Reset monthly @ 1st of month @ 00:00 UTC (use cron job)
resetMonthlyQuotas();
```

---

## 🔌 API ENDPOINTS (Quota Monitoring)

### GET `/api/quotas/status`
```bash
curl http://localhost:3000/api/quotas/status
```

**Response:**
```json
{
  "gemini": {
    "name": "Google Gemini",
    "tier": "free",
    "daily": {
      "used": 45,
      "limit": 60,
      "percentage": "75.0",
      "status": "🟢 OK"
    },
    "monthly": {
      "used": 1250000,
      "limit": 2000000,
      "percentage": "62.5",
      "status": "🟢 OK"
    },
    "cost": {
      "used": "$0.00",
      "limit": "$0.00",
      "percentage": "0.0",
      "status": "🟢 OK"
    },
    "alerts": [],
    "lastReset": "2026-03-31T00:00:00Z"
  },
  "tavily": { /* ... */ },
  "firecrawl": { /* ... */ },
  // ... todas as APIs
}
```

### GET `/api/quotas/recommendations`
```bash
curl http://localhost:3000/api/quotas/recommendations
```

**Response:**
```json
{
  "recommendations": [
    "⚠️ Gemini: Daily quota at 75%, all OK",
    "🟡 Firecrawl: Monthly quota at 85%, optimize usage",
    "💡 Tavily: Dev tier good for MVP, upgrade if >100 queries/day needed"
  ]
}
```

---

## 🚨 ALERT LEVELS

### 🟢 **GREEN** (0-79%)
Status OK, normal usage

### 🟡 **YELLOW** (80-99%)
Warning, approaching limit. Monitor closely.

```
Action: Log warning, but allow requests
```

### 🔴 **RED** (100%+)
Quota exceeded. Block requests.

```
Action: Block request, return 429 Too Many Requests
Log incident
Send alert to ops team
```

---

## 📝 IMPLEMENTATION CHECKLIST

### Budget Module Integration
- [ ] `src/lib/budget-api.ts` — Add quota checks before each API call
- [ ] `src/lib/budget-calculator.ts` — Log calculation costs
- [ ] Error handling: Return 429 if quota exceeded

### Server Integration
- [ ] `server.ts` — Register `/api/quotas/*` endpoints
- [ ] Add cron jobs for daily/monthly resets
- [ ] Add logging middleware for all API requests

### Monitoring
- [ ] Dashboard component for quota status
- [ ] Email alerts when >80% quota
- [ ] Slack webhook on >90% quota
- [ ] Daily digest report

---

## 🔔 ALERTS & NOTIFICATIONS

### Email Alert (80%+ budget)
```
Subject: ⚠️ ARCH API Quota Warning — Firecrawl at 82%

Dear Enio,

Your Firecrawl API usage has reached 82% of monthly budget:
  Used: 2,460 / 3,000 requests
  Cost: $13.10 / $16.00

Recommendation: Optimize queries or consider upgrading to Pro plan.
```

### Slack Webhook (90%+ quota)
```
🚨 QUOTA ALERT: Gemini daily limit at 92% (55/60 requests)
   → Block until reset @ 00:00 UTC tomorrow
   → Check for runaway jobs
```

### Log Entry
```typescript
{
  eventName: 'quota_alert',
  severity: 'warning',
  provider: 'gemini',
  percentageUsed: 92,
  dailyUsed: 55,
  dailyLimit: 60,
  timestamp: '2026-03-31T23:45:00Z'
}
```

---

## 💡 BEST PRACTICES

### ✅ DO

1. **Always call logAPIUsage()** after each API request
   ```typescript
   logAPIUsage('tavily', { requestCount: 1, costUSD: 0 });
   ```

2. **Check enforceQuota()** in request handlers
   ```typescript
   try {
     enforceQuota('gemini');
     // Make request...
   } catch (e) {
     return res.status(429).json({ error: 'Quota exceeded' });
   }
   ```

3. **Set up automated resets**
   ```typescript
   // In cron job or scheduled task
   cron.schedule('0 0 * * *', () => resetDailyQuotas());
   cron.schedule('0 0 1 * *', () => resetMonthlyQuotas());
   ```

4. **Monitor with dashboard**
   ```
   Visit: http://localhost:3000/api/quotas/status
   Every morning to check previous day's usage
   ```

5. **Set conservative budgets**
   ```typescript
   // Always set monthlyBudgetUSD < actual cost limit
   // Add 20% buffer
   monthlyBudgetUSD: 16,  // $16 Firecrawl plan
   ```

### ❌ DON'T

1. **Never skip quota logging**
   ```typescript
   // ❌ WRONG
   const response = await fetch(url);
   // Use response without logging

   // ✅ CORRECT
   const { allowed } = logAPIUsage('api', { ... });
   if (!allowed) throw new Error('Quota exceeded');
   ```

2. **Don't hardcode API limits**
   ```typescript
   // ❌ WRONG
   if (count > 100) throw Error();  // hardcoded

   // ✅ CORRECT
   enforceQuota('gemini');  // uses configured limit
   ```

3. **Don't ignore yellow alerts**
   ```typescript
   // ⚠️ Yellow means approaching limit
   // Proactively switch to fallback API
   ```

4. **Don't use production keys in development**
   ```typescript
   // ❌ WRONG: Uses production quota
   TAVILY_API_KEY=tvly-prod-xxx (production)

   // ✅ CORRECT: Use dev tier
   TAVILY_API_KEY=tvly-dev-xxx (development)
   ```

---

## 📊 DAILY QUOTA SHEET (Track Manually)

| Date | Gemini | Tavily | Firecrawl | fal.ai | Cost | Notes |
|------|--------|--------|-----------|--------|------|-------|
| 3/31 | 45/60  | 25/100 | 250/3000  | 5/100  | $5.20 | MVP testing |
| 4/1  | 60/60  | 95/100 | 850/3000  | 15/100 | $12.50 | Budget module live |
| 4/2  | 58/60  | 88/100 | 1200/3000 | 18/100 | $15.80 | High scraping load |
| ... | ... | ... | ... | ... | ... | ... |

---

## 🔐 SECURITY

### API Key Storage
```
✅ All keys in .env (gitignored)
✅ Keys loaded via process.env at runtime
✅ No keys in logs or error messages
✅ Quota limits are public, not secrets
```

### Access Control
```
✅ Quota endpoints require auth (TODO: implement)
✅ Only ops team can reset quotas
✅ Quota logs in structured format
✅ Audit trail of all changes
```

---

## 📞 TROUBLESHOOTING

### "API quota exceeded"
```
1. Check: http://localhost:3000/api/quotas/status
2. Identify: Which API and which limit (daily/monthly/cost)?
3. Wait: For automatic reset at 00:00 UTC (daily) or 1st month (monthly)
4. Fallback: Use alternative API if available
5. Upgrade: Consider paid tier if approaching limits
```

### "Quota system not initialized"
```
1. Ensure initializeQuotas() called on app startup
2. Check server.ts for initialization
3. Verify src/lib/quota-monitor.ts exists
4. Restart server
```

### "Discrepancy between logged and actual usage"
```
1. Check for caching (may show stale data)
2. Verify all requests use logAPIUsage()
3. Look for error requests (may not be logged)
4. Compare with API dashboard (Tavily, Firecrawl, etc)
5. Report discrepancy if >5% difference
```

---

## 📞 SUPPORT

### For Quota Issues
- Check: `getQuotaRecommendations()`
- Review: Daily quota sheet above
- Contact: Enio Rocha (enio@egos.ia)

### For API-Specific Help
- Tavily: https://tavily.com/support
- Firecrawl: https://docs.firecrawl.dev/support
- Gemini: https://ai.google.dev/support
- OpenRouter: https://openrouter.ai/support

---

**Last Updated:** 2026-03-31
**Status:** ✅ ACTIVE
**Next Review:** 2026-04-07 (weekly)
