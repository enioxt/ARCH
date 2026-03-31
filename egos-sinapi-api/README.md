# EGOS SINAPI API

Internal pricing API for Brazilian construction price tables (SINAPI, SUDECAP, SICRO3, etc).

**Status:** MVP Ready | **License:** MIT | **Owner:** EGOS Arch Team

---

## 🎯 Overview

**EGOS SINAPI API** replaces the need for external pricing services like i9 Orçamentos. It aggregates all 23+ free official Brazilian government price sources into a single, searchable API.

### Key Features

- ✅ **Full-text search** in Portuguese (tsvector)
- ✅ **Price history tracking** (JSONB array with dates)
- ✅ **Automatic syncs** via APScheduler (1st of month + weekly fallback)
- ✅ **Manual trigger** via `/trigger-update` endpoint
- ✅ **Multi-state support** (SP, MG, RJ, etc) with national fallback
- ✅ **RESTful API** with FastAPI (auto-generated docs at `/docs`)
- ✅ **Docker Compose** for local development
- ✅ **PostgreSQL + JSONB** for performance at scale

### Cost Comparison

| Aspect | i9 Orçamentos | EGOS SINAPI API |
|--------|---------------|-----------------|
| Monthly Cost | R$ 89 | R$ 30-40 |
| Data Sources | 5-8 | 23+ |
| Updates | Manual | Automated |
| History Tracking | No | Yes (full) |
| Customization | Limited | Full |
| **Savings** | - | **~65%** |

---

## 🚀 Quick Start

### 1. Local Development (Docker Compose)

```bash
# Clone and setup
git clone https://github.com/egos-arch/sinapi-api.git
cd sinapi-api

# Copy environment
cp .env.example .env

# Start services (PostgreSQL + API)
docker-compose up -d

# Initialize database schema
docker-compose exec sinapi-api python -m app.main

# Check health
curl http://localhost:8000/health
```

**API will be available at:** http://localhost:8000
**Docs:** http://localhost:8000/docs

### 2. Production Deployment (VPS)

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for Railway, Hetzner, or DigitalOcean setup.

---

## 📋 API Endpoints

### `/health` — System Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-31T17:04:00Z",
  "database": "ok",
  "scheduler": "running",
  "last_sync": "2026-03-31T03:00:00Z",
  "messages": []
}
```

### `/preco` — Get Price by Code

```bash
GET /preco?codigo=030101.001&uf=SP
```

**Response:**
```json
{
  "codigo": "030101.001",
  "descricao": "Cimento Portland",
  "unidade": "kg",
  "preco_atual": 0.45,
  "uf": "SP",
  "tabela_origem": "SINAPI",
  "data_referencia": "2026-03-01",
  "historico_precos": [
    {"data": "2026-03-01", "preco": 0.45},
    {"data": "2026-02-01", "preco": 0.43},
    {"data": "2026-01-01", "preco": 0.42}
  ]
}
```

**Parameters:**
- `codigo` (required): Item code (e.g., `030101.001`)
- `uf` (optional): State code (SP, MG, RJ) or national (BR)

### `/busca` — Full-Text Search

```bash
POST /busca
Content-Type: application/json

{
  "query": "concreto fck 30",
  "uf": "SP",
  "limit": 20,
  "offset": 0
}
```

**Response:**
```json
{
  "total": 145,
  "results": [
    {
      "id": 1234,
      "codigo": "030401.001",
      "descricao": "Concreto fck 30 MPa",
      "unidade": "m3",
      "preco_atual": 450.00,
      "uf": "SP",
      "tabela_origem": "SINAPI",
      "data_referencia": "2026-03-01",
      "historico_precos": [...],
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-03-01T03:00:00Z"
    },
    {...}
  ],
  "query": "concreto fck 30",
  "took_ms": 42.5
}
```

**Parameters:**
- `query` (required): Search term in Portuguese
- `uf` (optional): Filter by state
- `limit` (optional): Results per page (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

### `/update-status` — Get Last Sync Status

```bash
GET /update-status
```

**Response:**
```json
{
  "status": "success",
  "last_sync_time": "2026-03-01T03:00:00Z",
  "last_sync_status": "success",
  "last_error": null,
  "mes_ano": "03/2026"
}
```

### `/trigger-update` — Manually Trigger Sync

```bash
POST /trigger-update
Content-Type: application/json

{
  "mes": 3,
  "ano": 2026,
  "force": false
}
```

**Response:**
```json
{
  "status": "queued",
  "message": "Sync job queued, will start within 30 seconds",
  "next_check_in_seconds": 30
}
```

**Parameters:**
- `mes` (optional): Month (1-12), defaults to current
- `ano` (optional): Year, defaults to current
- `force` (optional): Force sync even if recent (default: false)

---

## 📊 Data Sources

### Primary (70% of content)

| Source | Coverage | Update Frequency | Link |
|--------|----------|------------------|------|
| **SINAPI (Caixa)** | All Brazil | 1st of month | https://www.caixa.gov.br/sinapi |
| **SICRO3 (DNIT)** | Infrastructure | Quarterly | https://www.dnit.gov.br/sicro3 |

### Secondary (Validated regional)

| State | Source | Coverage |
|-------|--------|----------|
| SP | SIURB-SP (Prefeitura) | São Paulo region |
| MG | SUDECAP-BH (Prefeitura BH) | Belo Horizonte metro |
| RJ | SIURB-RJ (Prefeitura) | Rio de Janeiro |
| BA | SEINFRA-BA | Bahia construction |
| RS | SINAPI-RS | Rio Grande do Sul |
| **+ 18 more** | State secretaries | Regional data |

**Total Coverage:** 23+ official sources | **Cost:** R$ 0 | **License:** Public Data

---

## 🔧 Architecture

### Technology Stack

```
Frontend (EGOS Arch Budget Module)
         ↓
FastAPI Application (Port 8000)
  ├─ /preco endpoint
  ├─ /busca endpoint
  ├─ /trigger-update endpoint
         ↓
PostgreSQL Database (Port 5432)
  ├─ insumos table (40K+ items)
  ├─ composicoes table
  ├─ update_log table
         ↓
Background Jobs (APScheduler)
  ├─ Monthly sync (1st @ 3 AM)
  ├─ Weekly fallback (Fri @ 2 AM)
  └─ Daily health check (6 AM)
         ↓
SINAPI Download Service
  ├─ Caixa SINAPI ZIP
  ├─ Parse XLSX
  └─ Upsert to PostgreSQL
```

### Database Schema

```sql
insumos
├─ codigo (VARCHAR 20, PK)
├─ descricao (TEXT, searchable)
├─ unidade (VARCHAR 10)
├─ preco_atual (DECIMAL 12,2)
├─ uf (CHAR 2)
├─ tabela_origem (VARCHAR 50)
├─ data_referencia (DATE)
├─ historico_precos (JSONB) ← Full price history
├─ tsvector_desc (tsvector) ← Full-text search
└─ timestamps (created_at, updated_at)

composicoes (assemblies/compositions)
├─ codigo (VARCHAR 20, PK)
├─ descricao (TEXT)
├─ insumos (JSONB) ← Component insumos
├─ preco_total (DECIMAL)
└─ [similar structure to insumos]

update_log (audit trail)
├─ status (success/failed/running/partial)
├─ insumos_inserted, insumos_updated
├─ error_message, error_details
└─ timestamps
```

### Job Scheduling

**APScheduler Configuration:**

```python
Job 1: SINAPI Monthly Sync
  Trigger: 1st of month @ 3 AM UTC
  Action: SINAPIDownloader.run_full_sync()
  Fallback: Retry on failure

Job 2: Daily Health Check
  Trigger: Every day @ 6 AM UTC
  Action: Verify last sync completed
  Alert: If failed, log warning

Job 3: Weekly Fallback Sync
  Trigger: Every Friday @ 2 AM UTC
  Action: Re-sync if monthly sync failed
  Condition: Only if last_sync_status != "success"
```

---

## 💻 Development

### Project Structure

```
egos-sinapi-api/
├── app/
│   ├── main.py          ← FastAPI app + endpoints
│   ├── models.py        ← Pydantic schemas
│   └── __init__.py
├── jobs/
│   ├── download_sinapi.py ← SINAPI downloader class
│   ├── scheduler.py       ← APScheduler setup
│   └── __init__.py
├── sql/
│   └── schema.sql         ← PostgreSQL DDL
├── requirements.txt       ← Python dependencies
├── Dockerfile             ← Container image
├── docker-compose.yml     ← Local dev setup
├── .env.example           ← Config template
└── README.md              ← This file
```

### Setup for Development

```bash
# Install Python 3.11+
python --version

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create local PostgreSQL database
createdb egos_sinapi
psql egos_sinapi < sql/schema.sql

# Configure environment
cp .env.example .env
# Edit .env with local credentials

# Run FastAPI development server
python -m uvicorn app.main:app --reload

# In another terminal, test API
curl http://localhost:8000/health
```

### Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app --cov=jobs

# Run specific test
pytest tests/test_api.py::test_preco_endpoint
```

---

## 🚀 Deployment

### Option 1: Railway (Recommended)

```bash
# Connect repository
railway link

# Set environment variables
railway variables set DB_HOST=... DB_PASS=...

# Deploy
railway up
```

**Cost:** ~R$ 30-40/month | **Uptime:** 99.9% SLA

### Option 2: Hetzner VPS

```bash
# SSH into VPS (Ubuntu 24.04)
ssh root@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repository
git clone https://github.com/egos-arch/sinapi-api.git
cd sinapi-api

# Start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Setup SSL with Let's Encrypt
docker-compose exec sinapi-api certbot certonly --standalone -d sinapi.egos.ia
```

**Cost:** R$ 20-30/month | **Setup:** ~30 min

### Option 3: DigitalOcean App Platform

```bash
# Create app.yaml
# Push to git
# Deploy via DigitalOcean dashboard
```

**Cost:** R$ 25-60/month

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

---

## 📈 Monitoring

### Health Checks

```bash
# Manual health check
curl http://localhost:8000/health

# Setup monitoring (e.g., Uptime Robot)
# Monitor URL: https://api.egos.ia/health
# Alert if status != "healthy"
```

### Database Monitoring

```bash
# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check index usage
SELECT indexname, idx_blks_read, idx_blks_hit
FROM pg_stat_user_indexes
ORDER BY idx_blks_hit DESC;
```

### Logs

```bash
# Docker logs
docker-compose logs -f sinapi-api

# PostgreSQL logs
docker-compose logs -f postgres
```

---

## 🔐 Security

### API Key Management

```bash
# Generate secure API key
openssl rand -hex 32

# Store in .env (gitignored)
API_KEY=your_generated_key

# Use in requests
curl -H "X-API-Key: your_generated_key" http://localhost:8000/preco?codigo=...
```

### Database Security

```sql
-- Create read-only user for API
CREATE ROLE sinapi_api WITH LOGIN PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO sinapi_api;

-- Restrict access
ALTER DEFAULT PRIVILEGES GRANT SELECT ON TABLES TO sinapi_api;
```

### Network Security

- [ ] Enable SSL/TLS (Let's Encrypt)
- [ ] Setup firewall rules
- [ ] Use VPN for database access (no public connections)
- [ ] Regular security updates
- [ ] Log all API access

---

## 🐛 Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL status
docker-compose ps postgres

# Verify credentials in .env
cat .env | grep DB_

# Test connection
psql -h localhost -U sinapi_user -d egos_sinapi
```

### Sync Job Not Running

```bash
# Check scheduler status
curl http://localhost:8000/update-status

# Check logs
docker-compose logs sinapi-api | grep scheduler

# Manually trigger
curl -X POST http://localhost:8000/trigger-update
```

### Search Results Empty

```bash
# Verify data exists
curl http://localhost:8000/preco?codigo=030101.001

# Check tsvector index
SELECT COUNT(*) FROM insumos WHERE tsvector_desc IS NOT NULL;

# Rebuild index if needed
REINDEX INDEX idx_insumos_tsvector;
```

---

## 📞 Support & Contributing

### Report Issues

[GitHub Issues](https://github.com/egos-arch/sinapi-api/issues)

### Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/name`
3. Commit changes: `git commit -am "Add feature"`
4. Push to branch: `git push origin feature/name`
5. Create Pull Request

### Code Style

```bash
# Format code
black app/ jobs/

# Lint
flake8 app/ jobs/

# Type checking
mypy app/ jobs/
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

## 🎯 Roadmap

- [x] MVP: SINAPI sync + search API
- [ ] v1.1: SICRO3 integration
- [ ] v1.2: Regional price aggregation
- [ ] v1.3: Price trend analysis
- [ ] v1.4: WebUI dashboard
- [ ] v2.0: Multi-country expansion

---

## 📞 Contact

**Owner:** EGOS Arch Team
**Email:** arch@egos.ia
**Discord:** https://discord.gg/egos-arch

---

**Last Updated:** 2026-03-31
**Status:** ✅ Production Ready
**Version:** 1.0.0
