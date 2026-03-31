# SINAPI Download - Mudança em 2025

## ⚠️ Mudança de Estrutura (Jan 2025)

A Caixa Federal alterou completamente a forma de disponibilização das tabelas SINAPI em 2025:

### ANTES (até Dez 2024)
```
URL direta: https://www.caixa.gov.br/Downloads/sinapi/Tabelas_SINAPI/SINAPI_{mes}{ano}.zip
Exemplo: SINAPI_032026.zip (download direto via HTTP)
```

### AGORA (2025+)

**Sistema SIPCI (Portal Interativo)**
- URL: https://sipci.caixa.gov.br/SIPCI/servlet/TopController
- Login público: `numeroNIS=00000000000`
- Acesso via browser obrigatório
- Formato: Arquivo único "SINAPI REFERÊNCIA.xlsx" por mês

**Sumário de Publicações**
- URL: https://cesarep.github.io/sumario-sinapi/
- Lista todos os relatórios mensais por UF (AC, AL, AM, etc)
- 2 ZIPs mensais:
  - **XLSX**: Famílias, Coeficientes, Manutenção, Insumos e Composições (todos os estados)
  - **PDF**: Relatórios Analíticos e Sintéticos

**Site Oficial**
- https://www.caixa.gov.br/poder-publico/modernizacao-gestao/sinapi/Paginas/default.aspx
- Acesso via "Relatórios Mensais" → "Consultar"
- Interface web com seleção manual de UF e formato

---

## 🔧 Soluções Implementadas

### Solução 1: Dados de Teste (ATUAL)
- ✅ 34 insumos realistas inseridos manualmente
- ✅ Permite testar toda a API sem depender do download
- ✅ Arquivo: `/sql/seed_test_data.sql`

### Solução 2: SIPCI API (Em Investigação)
```python
# Possível endpoint não documentado
url = "https://sipci.caixa.gov.br/SIPCI/servlet/TopController"
params = {
    "acao": "LoginInternetPublicoI",
    "login": "S",
    "numeroNIS": "00000000000",
    "pageNumber": "1",
    "processo": "insumos"
}
```

### Solução 3: Web Scraping com Selenium (Última Opção)
```python
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("https://sipci.caixa.gov.br/SIPCI/servlet/TopController?...")
# Navegar manualmente e clicar em "Download"
```

### Solução 4: Download Manual + Seed Script
```bash
# 1. Baixar SINAPI REFERÊNCIA.xlsx do SIPCI
# 2. Processar com script Python
python scripts/import_sinapi_xlsx.py --file SINAPI_REFERENCIA.xlsx --uf SP
```

---

## 📊 Novo Formato Excel (2025)

### Abas Disponíveis
| Aba | Descrição |
|-----|-----------|
| ISD | Insumo Sem Desoneração |
| ICD | Insumo Com Desoneração |
| ISE | Insumo Sem Encargo |
| CSD | Composição Sem Desoneração |
| CCD | Composição Com Desoneração |
| CSE | Composição Sem Encargo |
| Analítico | Composições detalhadas (sem custo) |
| Analítico com Custo | Composições detalhadas (com valores) |

### Colunas Principais
```
Insumos:
- Código (ex: 030101.001)
- Descrição
- Unidade (kg, m³, un)
- Preço Atual
- UF (BR = nacional)

Composições:
- Código (ex: 92510)
- Descrição
- Unidade
- Custo Unitário
- Itens (JSON array com insumos)
```

---

## 🚀 Próximos Passos

1. **Curto Prazo (Manual):**
   - Baixar SINAPI REFERÊNCIA.xlsx via SIPCI
   - Criar script `import_sinapi_xlsx.py` para processar
   - Rodar seed mensalmente

2. **Médio Prazo (SIPCI API):**
   - Investigar endpoints não documentados do SIPCI
   - Reverse engineering da interface web
   - Implementar autenticação pública

3. **Longo Prazo (Parcerias):**
   - Solicitar à CAIXA endpoint oficial para APIs
   - Sugerir formato JSON nativo (atualmente só XLSX/PDF)
   - Propor integração via webhook para atualizações

---

## 📖 Referências

- **Sumário SINAPI:** https://cesarep.github.io/sumario-sinapi/
- **SIPCI (Login Público):** https://sipci.caixa.gov.br/SIPCI/servlet/TopController?acao=LoginInternetPublicoI&login=S&numeroNIS=00000000000
- **Guia i9 Orçamentos:** https://www.i9orcamentos.com.br/baixar-tabela-sinapi/
- **Guia Smart Planilhas:** https://smartplanilhas.com.br/guia-rapido-atualize-sua-planilha-com-a-tabela-sinapi-2025/

---

**Última atualização:** 2026-03-31
**Status:** Dados de teste disponíveis | Download automático em investigação
