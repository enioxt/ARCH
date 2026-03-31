# SINAPI API - Deployment Checklist

Complete pre-deployment verification for production readiness.

---

## ✅ Pre-Deployment Checklist

### Code Quality

- [ ] All Python files follow PEP 8 style guide
- [ ] Type hints added to all functions
- [ ] No hardcoded secrets in code
- [ ] API keys only in .env (gitignored)
- [ ] Error handling for all edge cases
- [ ] Logging configured correctly

```bash
# Verify code quality
black --check app/ jobs/
flake8 app/ jobs/
mypy app/ jobs/
```

### Security

- [ ] No secrets in .env.example
- [ ] Database credentials not in code
- [ ] API key verification implemented
- [ ] CORS properly configured
- [ ] Rate limiting in place
- [ ] SQL injection prevention (parameterized queries)

```bash
# Check for secrets
gitleaks detect --verbose

# Verify .env is gitignored
git check-ignore .env
```

### Database

- [ ] PostgreSQL schema created (run schema.sql)
- [ ] All indices created
- [ ] Full-text search tsvector working
- [ ] Triggers for timestamp updates working
- [ ] Database user permissions set correctly

```bash
# Verify schema
psql -d egos_sinapi -f sql/schema.sql

# Test full-text search
psql -d egos_sinapi -c "SELECT COUNT(*) FROM insumos WHERE tsvector_desc @@ plainto_tsquery('portuguese', 'concreto');"
```

### Dependencies

- [ ] requirements.txt contains all needed packages
- [ ] No version conflicts
- [ ] Python 3.11+ available
- [ ] PostgreSQL 13+ available
- [ ] Docker (if using Docker) available

```bash
# Verify dependencies
pip install -r requirements.txt
pip freeze > installed.txt
```

### Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] API endpoints respond correctly
- [ ] Database operations work
- [ ] Error handling tested

```bash
# Run tests
pytest tests/ -v --cov=app --cov=jobs

# Test API locally
curl http://localhost:8000/health
curl -X POST http://localhost:8000/busca -d '{"query": "concreto"}'
```

### Docker

- [ ] Dockerfile builds successfully
- [ ] docker-compose.yml validates
- [ ] All services start correctly
- [ ] Health checks pass
- [ ] Volume mounts work correctly

```bash
# Build and test Docker
docker-compose build
docker-compose up -d
sleep 10
curl http://localhost:8000/health
docker-compose down
```

### Documentation

- [ ] README.md complete and accurate
- [ ] INTEGRATION_GUIDE.md covers all steps
- [ ] API endpoints documented in /docs
- [ ] Environment variables documented
- [ ] Troubleshooting guide included

---

## 🚀 Deployment Steps

### Step 1: Prepare VPS (Ubuntu 24.04)

```bash
# [ ] SSH into VPS
ssh root@your-vps-ip

# [ ] Update system
apt-get update && apt-get upgrade -y

# [ ] Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# [ ] Install Docker Compose
apt-get install -y docker-compose

# [ ] Create app directory
mkdir -p /app/sinapi-api
cd /app/sinapi-api
```

### Step 2: Clone Repository

```bash
# [ ] Clone from GitHub
git clone https://github.com/egos-arch/sinapi-api.git .

# [ ] Verify files present
ls -la app/ jobs/ sql/
```

### Step 3: Configure Environment

```bash
# [ ] Copy env template
cp .env.example .env

# [ ] Edit production values
nano .env

# Required values:
# - DB_HOST=localhost
# - DB_NAME=egos_sinapi
# - DB_USER=sinapi_user
# - DB_PASS=<strong-password>
# - ENVIRONMENT=production
# - ADMIN_SECRET_KEY=<random-key>
```

### Step 4: Setup Database

```bash
# [ ] Create database
createdb egos_sinapi

# [ ] Create user with privileges
psql -c "CREATE ROLE sinapi_user WITH LOGIN PASSWORD 'your_password';"
psql -c "GRANT CONNECT ON DATABASE egos_sinapi TO sinapi_user;"
psql -c "GRANT USAGE ON SCHEMA public TO egos_sinapi;"

# [ ] Load schema
psql -d egos_sinapi -f sql/schema.sql

# [ ] Verify tables
psql -d egos_sinapi -c "\dt"
```

### Step 5: Build and Deploy

```bash
# [ ] Build Docker image
docker-compose build

# [ ] Start services
docker-compose up -d

# [ ] Check status
docker-compose ps
docker-compose logs -f sinapi-api
```

### Step 6: Verify Deployment

```bash
# [ ] Check API health
curl http://localhost:8000/health

# [ ] Check database connection
curl http://localhost:8000/api/status

# [ ] Test endpoints
curl -X POST http://localhost:8000/busca \
  -H "Content-Type: application/json" \
  -d '{"query": "cimento", "limit": 1}'
```

### Step 7: Setup SSL/HTTPS

```bash
# [ ] Install Let's Encrypt certbot
apt-get install -y certbot python3-certbot-nginx

# [ ] Generate certificate
certbot certonly --standalone -d api.egos.ia

# [ ] Update docker-compose to mount SSL
# - Mount: /etc/letsencrypt:/etc/letsencrypt:ro
# - Update: HTTPS_ENABLED=true

# [ ] Restart services
docker-compose restart sinapi-api
```

### Step 8: Setup Reverse Proxy (Nginx)

```bash
# [ ] Install Nginx
apt-get install -y nginx

# [ ] Create config
cat > /etc/nginx/sites-available/sinapi-api <<'EOF'
server {
    listen 443 ssl http2;
    server_name api.egos.ia;

    ssl_certificate /etc/letsencrypt/live/api.egos.ia/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.egos.ia/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.egos.ia;
    return 301 https://$server_name$request_uri;
}
EOF

# [ ] Enable site
ln -s /etc/nginx/sites-available/sinapi-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 9: Setup Monitoring

```bash
# [ ] Install monitoring agent
# Option 1: Datadog
DD_AGENT_MAJOR_VERSION=7 bash -c "$(curl -L https://s3.amazonaws.com/datadog-agent/scripts/install_agent.sh)"

# Option 2: New Relic
curl -Ls https://download.newrelic.com/install/newrelic-cli/scripts/install.sh | bash

# [ ] Configure uptime monitoring
# - Service: Uptime Robot
# - URL: https://api.egos.ia/health
# - Frequency: Every 5 minutes
# - Alert on failure
```

### Step 10: Backup Strategy

```bash
# [ ] Setup daily backups to S3
cat > /app/sinapi-api/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DATE=$(date +%Y-%m-%d)
pg_dump -U sinapi_user egos_sinapi | gzip > /tmp/sinapi-$BACKUP_DATE.sql.gz
aws s3 cp /tmp/sinapi-$BACKUP_DATE.sql.gz s3://egos-backups/sinapi/
rm /tmp/sinapi-$BACKUP_DATE.sql.gz
EOF

chmod +x /app/sinapi-api/backup.sh

# [ ] Add to crontab (2 AM daily)
crontab -e
# Add: 0 2 * * * /app/sinapi-api/backup.sh
```

---

## 🔍 Post-Deployment Verification

### Health Checks

```bash
# [ ] API responds on public URL
curl https://api.egos.ia/health

# [ ] Database is accessible
psql -h localhost -U sinapi_user -d egos_sinapi -c "SELECT COUNT(*) FROM insumos;"

# [ ] Scheduler is running
curl https://api.egos.ia/update-status

# [ ] Full-text search works
curl -X POST https://api.egos.ia/busca \
  -d '{"query":"concreto fck 30"}'
```

### Performance Testing

```bash
# [ ] API response time < 500ms
time curl https://api.egos.ia/preco?codigo=030101.001

# [ ] Database query time < 100ms
EXPLAIN ANALYZE SELECT * FROM insumos WHERE codigo = '030101.001';

# [ ] Full-text search < 500ms
EXPLAIN ANALYZE SELECT * FROM insumos WHERE tsvector_desc @@ plainto_tsquery('portuguese', 'concreto') LIMIT 20;
```

### Load Testing

```bash
# [ ] Can handle 100 requests/second
ab -n 1000 -c 100 https://api.egos.ia/health

# [ ] No connection pool exhaustion
# Monitor: docker-compose logs sinapi-api | grep "pool"
```

### Security Audit

```bash
# [ ] SSL/TLS certificate valid
curl -I https://api.egos.ia/ | grep SSL

# [ ] No sensitive data in logs
docker-compose logs | grep -i password
# Should return: (empty)

# [ ] API key required for admin endpoints
curl -X POST https://api.egos.ia/trigger-update
# Should return: 401 Unauthorized

# [ ] SQL injection protection
curl 'https://api.egos.ia/busca' \
  -d '{"query":"1\"; DROP TABLE insumos; --"}'
# Should return: Safe error (query executed safely)
```

---

## 📊 Monitoring Dashboard Setup

### Grafana Dashboards

```bash
# [ ] Import dashboard JSON
# - CPU usage
# - Memory usage
# - Database connections
# - API response times
# - Request rates by endpoint
```

### Alert Rules

```bash
# [ ] CPU > 80% → Alert
# [ ] Memory > 85% → Alert
# [ ] API response time > 1s → Alert
# [ ] Database connections > 80 → Alert
# [ ] Sync job failed → Critical alert
# [ ] 5xx errors > 1% → Alert
```

### Log Aggregation

```bash
# [ ] Setup ELK Stack or equivalent
# - Elasticsearch for log storage
# - Kibana for visualization
# - Logstash for pipeline

# [ ] Monitor for patterns:
# - sync failures
# - database errors
# - API timeouts
# - security issues
```

---

## 🔄 Maintenance Schedule

### Daily (Automated)

- [ ] Health check @ 6 AM UTC
- [ ] Log rotation
- [ ] Backup cleanup (keep last 30 days)

### Weekly

- [ ] Fallback sync (Friday @ 2 AM UTC)
- [ ] Review error logs
- [ ] Check disk usage
- [ ] Verify backup integrity

### Monthly

- [ ] Update dependencies
- [ ] Security patches
- [ ] Performance review
- [ ] Capacity planning

### Quarterly

- [ ] Full security audit
- [ ] Load testing
- [ ] Disaster recovery test
- [ ] Documentation review

---

## 🚨 Incident Response

### If API is down:

```bash
# 1. Check service status
docker-compose ps

# 2. Check logs
docker-compose logs sinapi-api -f

# 3. Restart service
docker-compose restart sinapi-api

# 4. Check database
psql -d egos_sinapi -c "SELECT 1"

# 5. Test endpoints
curl http://localhost:8000/health

# 6. Notify stakeholders
# Send to #incidents channel in Slack
```

### If database is corrupted:

```bash
# 1. Stop API
docker-compose stop sinapi-api

# 2. Restore from backup
aws s3 cp s3://egos-backups/sinapi/latest.sql.gz /tmp/
gunzip /tmp/latest.sql.gz
psql -d egos_sinapi -f /tmp/latest.sql

# 3. Verify data
SELECT COUNT(*) FROM insumos;

# 4. Restart API
docker-compose start sinapi-api
```

### If sync job fails:

```bash
# 1. Check update status
curl http://localhost:8000/update-status

# 2. Manually trigger
curl -X POST http://localhost:8000/trigger-update -d '{"force": true}'

# 3. Monitor progress
watch -n 5 'curl http://localhost:8000/update-status'

# 4. Check logs
docker-compose logs sinapi-api | grep download

# 5. If still failing, check SINAPI availability
curl -I https://www.caixa.gov.br/Downloads/sinapi/
```

---

## ✅ Sign-Off Checklist

**Before marking "Ready for Production":**

- [ ] All deployment steps completed
- [ ] All verification tests passed
- [ ] Monitoring and alerts configured
- [ ] Backup strategy implemented
- [ ] SSL certificate valid
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Team trained
- [ ] Incident response plan ready

---

**Date Prepared:** 2026-03-31
**Status:** ✅ Ready for Deployment
**Owner:** EGOS Arch Team
