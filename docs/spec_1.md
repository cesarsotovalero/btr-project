Below is a prototype specification you can implement immediately. It is intentionally biased toward “demo in a hackathon, survive in production later”.

The counter-intuitive part is this: for a risk tool, the real prototype is not the model. It is the workflow. If analysts do not trust the evidence trail, even the smartest agent becomes an expensive hallucination machine.

## 1) Prototype goal

Build a **risk assessment web app for SEB analysts** that:

1. ingests company case documents,
2. extracts structured evidence from PDFs, spreadsheets, and slides,
3. runs a multi-agent compliance and risk review,
4. produces a **draft risk assessment** with explanations, missing items, and recommended next actions,
5. presents everything in a **visual analyst workspace** so humans can decide fast.

This design uses:

- **FastAPI** for backend APIs
- **PostgreSQL** for transactional data
- **Vanilla JavaScript** frontend
- **Express** as the web server for the frontend
- **Docker Compose** for local spin-up
- **Google Gemini on Vertex AI** for multimodal LLM calls
- **LangGraph** for agent orchestration
- **Deep Agents / research-style agent pattern** for document analysis and regulation grounding
- **OCR/document parsing pipeline** for heterogeneous inputs
- **SEB Green design system** inspired UI styling, using official visual guidance and color palette references ([designlibrary.sebgroup.com][1])

## 2) What the prototype should do

### Core user story

An analyst receives a new company case.

The system should allow the analyst to:

- create a case
- upload documents
- trigger AI analysis
- inspect extracted data in a normalized view
- see compliance checks against regulations and internal policies
- review a proposed risk class and rationale
- approve, reject, or request more information

### Prototype output

For each case, the app should generate:

- **Case summary**
- **Extracted company profile**
- **Financial overview**
- **Document inventory**
- **Compliance status**
- **Missing information / red flags**
- **Historical similar cases**
- **Suggested risk class**
- **Suggested credit policy notes**
- **Analyst-facing explanation trail**
- **Audit log of AI steps**

## 3) Prototype scope (MVP)

Keep the MVP narrow. Otherwise the prototype will collapse under its own ambition.

### In scope

- Upload case files
- Parse 3 main input families:
  - PDF
  - Excel
  - PowerPoint

- OCR support for scanned PDFs/images
- Normalize extracted content into:
  - tables
  - document summaries
  - key-value fields

- Multi-agent analysis
- Regulation-aware reasoning
- Historical-case retrieval
- Visual analyst dashboard
- Human review and feedback capture
- Dockerized local environment

### Out of scope for the first prototype

- Full production-grade identity and access management
- Real-time integration with all internal SEB systems
- Full workflow automation of decisioning
- Perfect document parsing accuracy
- Fully autonomous compliance decisions

That last point matters. The prototype should produce a **recommendation**, not a final decision.

## 4) High-level architecture

## Frontend

**Stack**

- Express server
- Vanilla JS
- HTML/CSS
- SEB-style visual language

**Responsibility**

- case management UI
- file upload UI
- dashboard UI
- analyst review UI
- explanations, tables, charts, timelines

## Backend

**Stack**

- FastAPI
- Python services
- LangGraph orchestration
- Vertex AI Gemini integration

**Responsibility**

- case APIs
- document ingestion
- parsing/OCR
- agent workflow execution
- retrieval and grounding
- persistence
- audit trail

## Data layer

**Stack**

- PostgreSQL

**Responsibility**

- cases
- companies
- uploaded documents
- extracted entities
- agent outputs
- analyst decisions
- historical outcomes
- audit logs

## AI/Agent layer

**Stack**

- LangGraph for orchestrating multi-step agent workflows
- Gemini on Vertex AI for multimodal reasoning and extraction
- retrieval layer for regulations, internal rules, and historical cases

Vertex AI supports Gemini models and multimodal workflows, while LangGraph is designed for durable orchestration, human-in-the-loop patterns, and agent graphs, which fits this problem unusually well. ([Google Cloud Documentation][2])

## 5) Recommended prototype workflow

### Step 1. Create case

Analyst creates:

- company name
- case ID
- sector
- country
- optional applicant metadata

### Step 2. Upload documents

Accepted files:

- PDF
- XLSX / XLS
- PPTX / PPT
- optional images or text files

### Step 3. Ingestion and parsing

Pipeline:

1. Store raw document metadata in Postgres
2. Detect document type
3. Route to parser
4. OCR if needed
5. Extract text, tables, sections, headings, pages, slide notes, spreadsheet sheets
6. Save structured extraction artifacts
7. Build a case-wide normalized representation

### Step 4. AI multi-agent review

Agents analyze:

- company information
- financial statements
- internal compliance requirements
- European regulations
- internal risk process documentation
- historical similar cases

### Step 5. Synthesis

System produces:

- compliance verdict by category
- risk factors
- missing evidence
- confidence indicators
- proposed risk class
- recommended next action

### Step 6. Analyst review

Analyst sees:

- summary cards
- extracted evidence tables
- highlighted source snippets
- risk rationale
- similar cases
- approve/reject/request-info actions

## 6) Multi-agent design (prototype)

Do not start with 15 agents. That is how hackathons become funerals.

Use **6 focused agents**.

### 1. Intake Agent

Purpose:

- validate upload set
- classify document types
- create the working case bundle

Input:

- raw uploaded files

Output:

- document inventory
- ingestion status
- parsing plan

### 2. Extraction Agent

Purpose:

- extract structured information from files
- handle OCR fallback
- convert heterogeneous inputs into common JSON objects

Input:

- case files

Output:

- extracted text
- extracted tables
- key entities
- metadata
- confidence flags

### 3. Regulation Context Agent

Purpose:

- retrieve relevant regulations and policy snippets
- build grounded context for reasoning

Input:

- case profile
- extracted content
- internal regulation corpus
- EIF/EIP/internal risk docs

Output:

- relevant rule set for this case
- cited passages
- policy checklist

### 4. Risk Process Agent

Purpose:

- enforce the SEB risk assessment process document you mentioned
- ensure the analysis follows SEB's process steps

Input:

- extracted case data
- risk process documentation

Output:

- process compliance checklist
- missing procedural steps
- gating decisions

### 5. Historical Similarity Agent

Purpose:

- retrieve similar past cases and outcomes
- support explanation with precedent

Input:

- current case features
- historical case store

Output:

- similar cases
- similarity rationale
- outcome patterns

### 6. Decision Support Agent

Purpose:

- synthesize all prior outputs into analyst-friendly recommendations

Input:

- all previous agent outputs

Output:

- draft risk class
- compliance status
- reasons
- recommendations
- open questions

## 7) LangGraph orchestration

A simple graph is enough.

```text
START
  -> Intake Agent
  -> Extraction Agent
  -> Regulation Context Agent
  -> Risk Process Agent
  -> Historical Similarity Agent
  -> Decision Support Agent
  -> Human Review
END
```

### Human-in-the-loop checkpoints

Insert pauses after:

- extraction
- regulation matching
- final recommendation

This is one of those boring choices that saves the demo. LangGraph is explicitly strong at human-in-the-loop and durable orchestration, so this is a good architectural fit. ([LangChain Docs][3])

## 8) Document handling strategy

You said documents can be PDF, Excel, PowerPoint, and mixed formats. The prototype should transform them into a **common analyst representation**.

### Unified internal representation

For every uploaded file, produce:

```json
{
  "document_id": "doc_123",
  "document_type": "pdf|excel|pptx",
  "title": "Annual Report 2025",
  "sections": [],
  "tables": [],
  "entities": [],
  "key_metrics": [],
  "source_references": [],
  "ocr_used": true,
  "confidence": 0.84
}
```

### UI transformation targets

Instead of forcing analysts to read everything, show:

- **Document summary card**
- **Extracted key metrics table**
- **Compliance checklist**
- **Red-flag timeline**
- **Source evidence viewer**
- **Cross-document consistency view**

### Examples

From PDF:

- company description
- auditor notes
- liabilities
- revenue figures

From Excel:

- balance sheet rows
- debt ratios
- cash flow anomalies

From PowerPoint:

- management claims
- growth projections
- business model statements

## 9) Data model (prototype level)

These are the main tables you need in Postgres.

### `cases`

- id
- case_number
- company_name
- sector
- country
- status
- created_at
- updated_at

### `documents`

- id
- case_id
- filename
- file_type
- storage_path
- upload_status
- parsed_status
- ocr_used
- created_at

### `document_extractions`

- id
- document_id
- extracted_text
- extracted_json
- confidence
- created_at

### `regulation_sources`

- id
- source_name
- source_type
- version
- content_reference
- active

### `case_findings`

- id
- case_id
- finding_type
- severity
- title
- description
- source_refs
- created_by_agent
- created_at

### `risk_assessments`

- id
- case_id
- proposed_risk_class
- compliance_status
- recommendation
- reasoning
- confidence
- created_at

### `historical_cases`

- id
- case_id
- outcome
- final_risk_class
- decision_notes
- closed_at

### `agent_runs`

- id
- case_id
- agent_name
- input_snapshot
- output_snapshot
- status
- started_at
- ended_at

### `analyst_reviews`

- id
- case_id
- reviewer_name
- action
- comment
- reviewed_at

### `audit_logs`

- id
- case_id
- event_type
- actor
- payload
- timestamp

## 10) API design (FastAPI)

Keep it boring. Boring APIs survive demos.

### Case endpoints

- `POST /api/cases`
- `GET /api/cases`
- `GET /api/cases/{id}`
- `PATCH /api/cases/{id}`

### Document endpoints

- `POST /api/cases/{id}/documents`
- `GET /api/cases/{id}/documents`
- `POST /api/documents/{id}/parse`
- `GET /api/documents/{id}/extraction`

### Analysis endpoints

- `POST /api/cases/{id}/analyze`
- `GET /api/cases/{id}/findings`
- `GET /api/cases/{id}/risk-assessment`
- `GET /api/cases/{id}/agent-runs`

### Review endpoints

- `POST /api/cases/{id}/review`
- `GET /api/cases/{id}/audit-log`

### Reference data endpoints

- `GET /api/regulations`
- `POST /api/regulations/reindex`
- `GET /api/historical-cases/search`

## 11) Frontend screens

### 1. Case list page

Shows:

- all cases
- status
- company
- last updated
- quick action buttons

### 2. Case detail page

Shows:

- case metadata
- uploaded documents
- analysis status
- timeline of actions

### 3. Document intelligence page

Shows:

- document cards
- extracted tables
- OCR text preview
- source page/slide references
- confidence indicators

### 4. Compliance dashboard

Shows:

- checklist by regulation/policy
- compliant / non-compliant / unknown
- reasons
- evidence links

### 5. Risk decision workspace

Shows:

- suggested risk class
- rationale
- similar historical cases
- analyst comment box
- decision buttons

### 6. Audit and trace page

Shows:

- which agent did what
- what evidence was used
- when a human intervened

## 12) UX style guidance

Use the official SEB Green design language as inspiration and keep the prototype visually minimal. SEB’s design system explicitly defines Green as its product design system, and official color guidance includes green tones such as `#60cd18`, `#45b400`, and `#308800`. Also, SEB states that the logo must not be recolored or altered. ([designlibrary.sebgroup.com][1])

### UI principles

- white or light background
- green for primary actions and positive statuses
- dark green for headers and navigation
- yellow for caution
- red for severe issues
- strong contrast
- card-based layout
- evidence first, not prose first

### Visual components

- status chips
- collapsible evidence panels
- sortable tables
- confidence bars
- timeline of case progress
- side-by-side comparison of extracted values vs source snippet

## 13) Recommendation engine logic (prototype level)

Do not implement deep business logic on day one. Use a **rules + LLM synthesis** pattern.

### Layer A. Deterministic checks

Examples:

- mandatory documents missing
- financial fields absent
- inconsistent totals
- expired statements
- unsupported format

### Layer B. Retrieval-grounded reasoning

LLM reviews:

- internal regulations
- European regulations
- risk process steps
- historical analogs

### Layer C. Decision synthesis

Final agent produces:

- compliant / partially compliant / non-compliant
- proposed risk class
- top 5 reasons
- additional info needed

This hybrid pattern is the right compromise for a prototype. Pure LLM reasoning looks magical in demos and suspicious on Monday morning.

## 14) Historical cases component

For the prototype, keep similarity simple.

### Similarity dimensions

- sector
- geography
- company size
- revenue band
- debt profile
- document patterns
- final outcome

### Output

Show:

- 3 to 5 similar cases
- why they were considered similar
- how they were decided
- caution if precedent is weak

## 15) Security and governance assumptions

Even for a prototype, you should model safe boundaries.

### Minimum controls

- all AI outputs marked as recommendations
- audit every agent run
- store source references
- allow manual override
- mask sensitive PII in logs
- separate raw files from extracted summaries
- keep regulations versioned

### Prototype disclaimer

- not for automatic credit decisioning
- not a legally binding compliance engine
- analyst remains accountable

## 16) Docker Compose setup

You asked for easy spin-up. Use 4 services.

### Services

- `frontend`
  - Express
  - serves HTML/CSS/JS

- `backend`
  - FastAPI
  - REST APIs
  - orchestration trigger

- `db`
  - PostgreSQL

- `worker`
  - Python worker
  - parsing, OCR, agent execution

Optional later:

- `redis`
- `vector-store`
- `minio` or object storage

### Example structure

```text
root/
  backend/
    app/
    agents/
    services/
    models/
    api/
    requirements.txt
    Dockerfile
  frontend/
    public/
    src/
    server.js
    package.json
    Dockerfile
  worker/
    app/
    parsers/
    ocr/
    agents/
    Dockerfile
  infra/
    docker-compose.yml
  docs/
    prototype-spec.md
```

### Compose behavior

`docker compose up --build` should:

- start Postgres
- start FastAPI
- start frontend server
- start worker

That is enough for a local demo.

## 17) Suggested implementation order (hackathon-friendly)

### Phase 1

Get visible value fast.

Build:

- case creation
- document upload
- basic parsing
- dashboard with extracted tables
- mock risk summary

### Phase 2

Add AI workflow.

Build:

- LangGraph orchestration
- Gemini integration on Vertex AI
- regulation retrieval
- risk process agent

Gemini on Vertex AI supports multimodal model access and agentic workflows, which aligns well with document-heavy case analysis. ([Google Cloud Documentation][4])

### Phase 3

Make it analyst-credible.

Build:

- historical case retrieval
- evidence links
- audit trail
- human review actions

### Phase 4

Polish the demo.

Build:

- SEB-style UI
- confidence badges
- charts
- latency and error handling
- seed dataset

## 18) What a strong prototype demo should show

A good demo scenario:

1. Analyst opens a new company case
2. Uploads PDF annual report, Excel financials, and PowerPoint investor deck
3. System parses files and extracts a unified financial summary
4. Agents review rules and policies
5. Dashboard highlights:
   - 2 missing compliance items
   - 1 financial inconsistency
   - 3 similar historical cases

6. System proposes:
   - risk class
   - rationale
   - additional documents needed

7. Analyst reviews source evidence and records final decision

That demo tells a story. Stories get prototypes funded.

## 19) Crisp technical recommendation

If you want this running fast, build the prototype around this backbone:

- **FastAPI** for all APIs and orchestration entrypoints
- **Postgres** as the single source of truth
- **Express + Vanilla JS** for simple, fast UI delivery
- **LangGraph** as the workflow brain
- **Gemini on Vertex AI** as the multimodal reasoning layer
- **worker service** for OCR, parsing, and analysis
- **Docker Compose** for one-command local startup

## 20) Final prototype definition

This prototype is:

- a **human-in-the-loop credit/risk review assistant**
- not a fully autonomous underwriting platform
- optimized for **document understanding, grounded compliance checking, and explainable recommendations**
- intentionally visual, simple, and demoable

That is the right level of ambition. In banking, “prototype” should mean “useful and inspectable”, not “AI guessed confidently in a dark room”.

If you want, I can turn this next into a **one-page product requirements document (PRD)** or a **folder-by-folder technical blueprint** aligned with your existing scaffold.

[1]: https://designlibrary.sebgroup.com/foundation/green-design-system/?utm_source=chatgpt.com "DesignLibrary - Green design system - SEB"
[2]: https://docs.cloud.google.com/vertex-ai/docs?utm_source=chatgpt.com "Vertex AI Documentation"
[3]: https://docs.langchain.com/oss/python/langgraph/overview?utm_source=chatgpt.com "LangGraph overview - Docs by LangChain"
[4]: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models?utm_source=chatgpt.com "Google models | Generative AI on Vertex AI"
