# INTEGRATION GUIDE: EGOS SINAPI API → Budget Module

Guide for integrating SINAPI API with the EGOS Arch Budget Module.

---

## 🔗 Architecture Overview

```
EGOS Arch (Frontend + Budget Module)
         ↓
         ↓ HTTP/REST calls
         ↓
SINAPI API (http://localhost:8000 or https://api.egos.ia)
         ↓
PostgreSQL (price data + history)
         ↓
Background jobs (automated syncs)
```

---

## 📝 Step 1: Configure API Connection

### In EGOS Arch `.env`

```bash
# Add to /home/enio/arch/.env

# SINAPI API Configuration
SINAPI_API_URL=http://localhost:8000
# OR for production:
# SINAPI_API_URL=https://api.egos.ia

# Cache settings
PRICE_CACHE_TTL=3600  # Cache for 1 hour
PRICE_CACHE_ENABLED=true
```

### In EGOS Arch Budget Module

**File:** `src/lib/budget-api.ts`

Update the `fetchSINAPIprices()` function to call the API:

```typescript
/**
 * Fetch SINAPI prices from internal API
 * Replaces direct SINAPI calls with our own aggregated API
 */
async function fetchSINAPIprices(
  itemName: string,
  region: string = "BR"
): Promise<PriceSource | null> {
  const apiUrl = process.env.SINAPI_API_URL || "http://localhost:8000";

  try {
    // Check quota before API call
    const { allowed, alerts } = logAPIUsage("sinapi", {
      requestCount: 0,
      status: "pending",
      itemQueried: itemName,
    });

    if (!allowed) {
      logger.warn("SINAPI quota exceeded");
      return null;
    }

    const startTime = Date.now();

    // First try: exact code lookup
    // Example: "030101.001" for cement
    const codeMatch = itemName.match(/\d{6}\.\d{3}/);
    if (codeMatch) {
      const response = await fetch(
        `${apiUrl}/preco?codigo=${codeMatch[0]}&uf=${region}`
      );

      if (response.ok) {
        const data = await response.json();

        logAPIUsage("sinapi", {
          requestCount: 1,
          costUSD: 0,
          itemQueried: itemName,
          latencyMs: Date.now() - startTime,
          status: "success",
          metadata: {
            source: "SINAPI",
            codigo: data.codigo,
            tabela_origem: data.tabela_origem,
            data_referencia: data.data_referencia,
          },
        });

        return {
          name: "SINAPI Official Price",
          type: "official",
          low: data.preco_atual * 0.95,
          mid: data.preco_atual,
          high: data.preco_atual * 1.05,
          url: `${apiUrl}/preco?codigo=${data.codigo}`,
          confidence: 0.95,
          source: "SINAPI",
          lastUpdated: new Date(data.data_referencia),
          history: data.historico_precos,
        };
      }
    }

    // Second try: full-text search in Portuguese
    const searchResponse = await fetch(`${apiUrl}/busca`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: itemName,
        uf: region !== "BR" ? region : undefined,
        limit: 5,
      }),
    });

    if (searchResponse.ok) {
      const data = await searchResponse.json();

      if (data.results.length === 0) {
        logAPIUsage("sinapi", {
          requestCount: 1,
          costUSD: 0,
          itemQueried: itemName,
          status: "no_results",
        });
        return null;
      }

      // Take first result
      const topResult = data.results[0];
      const latencyMs = Date.now() - startTime;

      logAPIUsage("sinapi", {
        requestCount: 1,
        costUSD: 0,
        itemQueried: itemName,
        latencyMs,
        status: "success",
        metadata: {
          source: "SINAPI Search",
          codigo: topResult.codigo,
          search_results: data.total,
          took_ms: data.took_ms,
        },
      });

      return {
        name: "SINAPI Search Result",
        type: "official",
        low: topResult.preco_atual * 0.95,
        mid: topResult.preco_atual,
        high: topResult.preco_atual * 1.05,
        url: `${apiUrl}/preco?codigo=${topResult.codigo}`,
        confidence: 0.92,
        source: "SINAPI",
        lastUpdated: new Date(topResult.data_referencia),
        history: topResult.historico_precos,
      };
    }

    logAPIUsage("sinapi", {
      requestCount: 1,
      costUSD: 0,
      itemQueried: itemName,
      status: "api_error",
    });

    return null;
  } catch (error: any) {
    logger.error(`SINAPI API error: ${error.message}`);

    logAPIUsage("sinapi", {
      requestCount: 1,
      costUSD: 0,
      itemQueried: itemName,
      status: "error",
      metadata: { error: error.message },
    });

    return null;
  }
}
```

---

## 🔍 Step 2: Update Research Flow

**File:** `src/lib/budget-api.ts` → `researchPrices()` function

```typescript
export async function researchPrices(
  req: Request<{}, {}, ResearchPricesRequest>,
  res: Response
) {
  try {
    const {
      projectId,
      itemIds,
      sources = ["sinapi", "retail", "cub"],
    } = req.body;

    const results: Record<string, PriceSource[]> = {};

    // Strategy: Try sources in order, stop at first success
    for (const itemId of itemIds) {
      const itemResults: PriceSource[] = [];

      // 1. Try SINAPI first (official, most reliable)
      if (sources.includes("sinapi")) {
        const sinapiPrice = await fetchSINAPIprices(itemId, "BR");
        if (sinapiPrice) {
          itemResults.push(sinapiPrice);
          results[itemId] = itemResults;
          continue;  // Found official price, skip others
        }
      }

      // 2. Try retail/market prices (Tavily, Exa)
      if (sources.includes("retail")) {
        const retailPrice = await fetchRetailPrices(itemId, "BR");
        if (retailPrice) {
          itemResults.push(retailPrice);
        }
      }

      // 3. Try CUB regional index
      if (sources.includes("cub") && itemResults.length === 0) {
        const cubPrice = await fetchCUBprices("BR");
        if (cubPrice) {
          itemResults.push(cubPrice);
        }
      }

      results[itemId] = itemResults;
    }

    res.json({
      success: true,
      projectId,
      results,
      timestamp: new Date(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
```

---

## 📊 Step 3: Add Budget Component Integration

**File:** `src/components/BudgetView.tsx`

Update to show SINAPI source information:

```typescript
// In BudgetSummary component
<div className="source-info">
  <h4>Price Sources Used</h4>
  {budget.items.map((item) => (
    <div key={item.id} className="item-sources">
      <span className="item-name">{item.name}</span>
      {item.sources.map((source, idx) => (
        <div key={idx} className="source-badge">
          <span className="source-type">{source.name}</span>
          <span className="confidence">
            Confidence: {(source.confidence * 100).toFixed(0)}%
          </span>
          {source.source === "SINAPI" && (
            <span className="official-badge">✓ Official SINAPI</span>
          )}
          <span className="date">
            {new Date(source.lastUpdated).toLocaleDateString("pt-BR")}
          </span>
        </div>
      ))}
    </div>
  ))}
</div>
```

---

## 🔄 Step 4: Setup Automated Price Updates

**File:** `src/lib/budget-api.ts` → Add scheduled job

```typescript
// On server startup, schedule price update job
import cron from "node-cron";

// Every day at 6 AM: Check for price updates from SINAPI
cron.schedule("0 6 * * *", async () => {
  logger.info("Running daily price update check...");

  try {
    const apiUrl = process.env.SINAPI_API_URL || "http://localhost:8000";

    // Check if SINAPI has new data
    const statusResponse = await fetch(`${apiUrl}/update-status`);
    const status = await statusResponse.json();

    logger.info(`SINAPI last sync: ${status.last_sync_time}`);

    if (status.status === "success") {
      // Trigger price refresh for all budgets
      // This could invalidate cache or trigger re-calculation
      logger.info("SINAPI has fresh data, budgets will use latest prices");
    }
  } catch (error: any) {
    logger.error(`Price update check failed: ${error.message}`);
  }
});
```

---

## 🚀 Step 5: Local Testing Setup

### Start SINAPI API locally:

```bash
# Terminal 1: Start SINAPI API with Docker
cd egos-sinapi-api
docker-compose up -d

# Wait for database to initialize (~30 seconds)
sleep 30

# Check health
curl http://localhost:8000/health
```

### Test integration:

```bash
# Terminal 2: Test SINAPI API endpoints

# 1. Check health
curl http://localhost:8000/health

# 2. Get specific price
curl "http://localhost:8000/preco?codigo=030101.001"

# 3. Search for materials
curl -X POST http://localhost:8000/busca \
  -H "Content-Type: application/json" \
  -d '{"query": "concreto fck 30", "limit": 5}'

# 4. Check sync status
curl http://localhost:8000/update-status
```

### Start EGOS Arch:

```bash
# Terminal 3: Start EGOS Arch budget module
cd /home/enio/arch
npm install
npm run dev
```

### Test from Budget Module:

```bash
# Terminal 4: Test budget API endpoint

# Create budget and research prices
curl -X POST http://localhost:3000/api/budget/research-prices \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-001",
    "itemIds": ["Cimento Portland", "Concreto fck 30", "Blocos cerâmicos"],
    "sources": ["sinapi", "retail"]
  }'
```

---

## 📦 Step 6: Production Deployment

### Deploy SINAPI API to VPS:

```bash
# SSH into VPS
ssh root@your-vps-ip

# Install dependencies
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone SINAPI API repo
git clone https://github.com/egos-arch/sinapi-api.git
cd sinapi-api

# Setup production environment
cp .env.example .env
# Edit .env with production credentials

# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Setup SSL
docker-compose exec sinapi-api certbot certonly --standalone -d api.egos.ia
```

### Update EGOS Arch to use production API:

**File:** `.env` (production)

```bash
SINAPI_API_URL=https://api.egos.ia
PRICE_CACHE_TTL=7200  # Longer cache in production
```

---

## 🔐 Step 7: Security Configuration

### Setup API authentication (optional):

**In SINAPI API** `app/main.py`:

```python
from fastapi import Depends, HTTPException, Header

async def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key

@app.get("/preco", dependencies=[Depends(verify_api_key)])
async def get_preco(codigo: str, uf: str = None):
    # ... endpoint implementation
```

**In EGOS Arch** `src/lib/budget-api.ts`:

```typescript
const response = await fetch(`${apiUrl}/preco?codigo=${code}`, {
  headers: {
    "X-API-Key": process.env.SINAPI_API_KEY,
  },
});
```

### Database backups:

```bash
# Daily automated backups to S3
docker-compose exec postgres pg_dump -U sinapi_user egos_sinapi | \
  aws s3 cp - s3://egos-backups/sinapi/$(date +%Y-%m-%d).sql
```

---

## 📊 Step 8: Monitoring & Alerts

### Setup monitoring:

```bash
# Monitor health endpoint
curl -s http://localhost:8000/health | jq '.status'

# Setup Uptime Robot to monitor:
# - URL: https://api.egos.ia/health
# - Check every 5 minutes
# - Alert if status != "healthy"
```

### Database monitoring:

```sql
-- Monitor table growth
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check last sync
SELECT status, MAX(completed_at) as last_sync
FROM update_log
GROUP BY status;
```

---

## 🔄 Step 9: Data Refresh Strategy

### Automatic updates:

SINAPI API automatically syncs:
- **1st of month @ 3 AM UTC**: Full SINAPI monthly release
- **Every Friday @ 2 AM UTC**: Fallback sync if monthly failed
- **Daily @ 6 AM UTC**: Health check

### Manual refresh:

```bash
# Trigger immediate sync
curl -X POST http://localhost:8000/trigger-update \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

### Budget module behavior:

```typescript
// When user clicks "Update Prices" button
async function refreshItemPrices(itemIds: string[]) {
  // 1. Fetch fresh data from SINAPI API
  // 2. Update item.lastUpdated timestamp
  // 3. Recalculate budget with new prices
  // 4. Show price change notification

  for (const itemId of itemIds) {
    const freshPrice = await fetchSINAPIprices(itemId);
    if (freshPrice) {
      // Update in budget
      updateItemPrice(itemId, freshPrice);
    }
  }

  recalculateScenarios();
  showNotification("✅ Prices updated with latest SINAPI data");
}
```

---

## 🧪 Step 10: Testing Checklist

### Unit tests:

```bash
# Test SINAPI downloader
pytest tests/test_download_sinapi.py

# Test FastAPI endpoints
pytest tests/test_api.py

# Test integration
pytest tests/test_integration.py
```

### Integration tests:

```bash
# Test Budget Module → SINAPI API flow
npm run test:integration

# Expected flow:
# 1. Create budget
# 2. Add items (ex: "Cimento")
# 3. Research prices (triggers /busca)
# 4. Verify prices populated from SINAPI
# 5. Verify confidence scores applied
# 6. Verify quota logs recorded
```

---

## 📈 Performance Optimization

### 1. Enable caching in Budget Module:

```typescript
// Cache SINAPI responses for 1 hour
const SINAPI_CACHE = new Map<string, { price: PriceSource; timestamp: number }>();

async function fetchSINAPIpricesWithCache(itemName: string) {
  const cacheKey = itemName.toLowerCase();
  const cached = SINAPI_CACHE.get(cacheKey);

  // Return cached if < 1 hour old
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.price;
  }

  // Fetch fresh and cache
  const fresh = await fetchSINAPIprices(itemName);
  if (fresh) {
    SINAPI_CACHE.set(cacheKey, { price: fresh, timestamp: Date.now() });
  }

  return fresh;
}
```

### 2. Optimize database queries:

```sql
-- Add composite index for common searches
CREATE INDEX idx_insumos_uf_tabela ON insumos(uf, tabela_origem, data_referencia DESC);

-- Analyze slow queries
EXPLAIN ANALYZE SELECT * FROM insumos WHERE tsvector_desc @@ plainto_tsquery('portuguese', 'concreto');
```

### 3. Connection pooling:

```python
# In FastAPI: Use connection pool
from psycopg2 import pool

connection_pool = pool.SimpleConnectionPool(1, 20, ...)
```

---

## 🎯 Next Steps

1. **Deploy SINAPI API** to production VPS
2. **Configure EGOS Arch** to use production API URL
3. **Run full integration test** with real budgets
4. **Setup monitoring** and alerts
5. **Document price data sources** for users
6. **Train team** on price update workflow

---

## 📞 Troubleshooting

### "SINAPI API not responding"

```bash
# Check if service is running
curl http://localhost:8000/health

# Check logs
docker-compose logs sinapi-api

# Restart service
docker-compose restart sinapi-api
```

### "Prices not updating"

```bash
# Check sync status
curl http://localhost:8000/update-status

# Trigger manual sync
curl -X POST http://localhost:8000/trigger-update

# Check database
psql -c "SELECT MAX(data_referencia) FROM insumos;"
```

### "High API latency"

```sql
-- Check database performance
ANALYZE;
VACUUM ANALYZE;

-- Monitor slow queries
SET log_min_duration_statement = 1000;
```

---

**Version:** 1.0.0
**Date:** 2026-03-31
**Status:** ✅ Ready for Integration
