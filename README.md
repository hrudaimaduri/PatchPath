# PatchPath

> **Turn a GitHub issue into an evidence-backed implementation map.**

PatchPath helps open-source contributors understand **where an issue actually needs to be changed** before they start coding.

Give PatchPath:

- a public GitHub repository
- a GitHub issue or issue description

PatchPath investigates the codebase and produces a structured implementation blueprint containing:

- 🎯 Issue understanding
- 🗺️ Change Surface
- 📁 Exact files likely to change
- 🔎 Evidence from the repository
- 🧩 Existing patterns and dependencies
- 🛠️ Implementation sequence
- 🧪 Test impact and test plan
- 📊 Evidence-based confidence

## Why PatchPath?

Finding the right files in an unfamiliar open-source repository is often harder than writing the eventual code.

A GitHub issue might say:

> "Add support for local directory paths."

But a contributor still has to answer:

- Where is the relevant behavior implemented?
- Which files actually control it?
- What existing patterns should I follow?
- Which tests already cover nearby behavior?
- What should I change first?
- What could be affected indirectly?

PatchPath answers those questions **before implementation begins**.

## How it works

```text
                 GitHub Repository
                        +
                    GitHub Issue
                        │
                        ▼
              ┌───────────────────┐
              │   GitHub Reader    │
              └─────────┬─────────┘
                        ▼
              ┌───────────────────┐
              │    Code Search     │
              └─────────┬─────────┘
                        ▼
              ┌───────────────────┐
              │  Pattern Finder    │
              └─────────┬─────────┘
                        ▼
              ┌───────────────────┐
              │  Evidence Store    │
              └─────────┬─────────┘
                        ▼
              ┌───────────────────┐
              │ Qwen 3 Open-Weight│
              └─────────┬─────────┘
                        ▼
              ┌───────────────────┐
              │ Blueprint Generator│
              └─────────┬─────────┘
                        ▼
       ┌─────────────────────────────────┐
       │          PATCHPATH              │
       │                                 │
       │ Change Surface                  │
       │ Implementation Plan             │
       │ Existing Patterns               │
       │ Evidence                        │
       │ Test Plan                       │
       └─────────────────────────────────┘
```

## The Change Surface

The core PatchPath concept is the **Change Surface**.

Each investigation separates repository impact into categories such as:

| Category | Meaning |
|---|---|
| **MUST CHANGE** | Files directly responsible for implementing the issue |
| **LIKELY CHANGE** | Files that may need modification depending on the implementation |
| **TEST** | Tests that should be added or updated |
| **DOCUMENTATION** | Docs or examples affected by the change |

Every identified file is accompanied by reasoning and repository evidence rather than being presented as an unexplained AI guess.

## Example output

For an issue involving local repository paths, PatchPath can identify a change surface such as:

```text
MUST CHANGE
└── src/server/templates/components/git_form.jinja

LIKELY CHANGE
└── src/server/form_types.py

TEST
└── tests/query_parser/test_query_parser.py
```

It then explains **why each file matters**, identifies existing repository patterns, and proposes an implementation sequence.

## Tech Stack

### Frontend

- React
- Vite
- CSS
- REST API

### Backend

- Node.js
- Express
- Git
- GitHub public repositories
- Hugging Face inference
- Qwen 3 open-weight model

### AI

PatchPath uses **Qwen 3** as the reasoning layer over repository evidence.

The model is not given only the issue description. PatchPath first gathers relevant code from the target repository and then asks the model to produce an implementation blueprint grounded in that evidence.

## Architecture

```text
React UI
   │
   │ REST
   ▼
Express API
   │
   ├── Repository cloning
   ├── File discovery
   ├── Code search
   ├── Pattern detection
   └── Evidence collection
          │
          ▼
     Qwen 3
          │
          ▼
   Blueprint Generator
          │
          ├── Change Surface
          ├── Implementation Plan
          └── Test Plan
```

## Demo Flow

1. Paste a public GitHub repository.
2. Describe a GitHub issue.
3. Click **Analyze Issue**.
4. PatchPath investigates the repository.
5. Relevant files are selected.
6. Repository evidence is passed to Qwen.
7. PatchPath generates the implementation blueprint.
8. Review the Change Surface, evidence, implementation steps, and tests.

## Running locally

### Prerequisites

- Node.js
- Git
- A Hugging Face API token with access to the configured inference route

### Backend

```bash
cd server
npm install
```

Create:

```text
server/.env
```

and add:

```env
HF_TOKEN=your_huggingface_token
```

Start the API:

```bash
node server.js
```

The backend runs on:

```text
http://localhost:3001
```

### Frontend

In another terminal:

```bash
cd client
npm install
npm run dev
```

Then open the Vite URL shown in the terminal.

## Security

Secrets are stored in environment variables and are intentionally excluded from Git.

Do **not** commit:

```text
.env
node_modules/
```

## Current Scope

PatchPath currently focuses on:

- public GitHub repositories
- issue-to-codebase investigation
- evidence-backed file discovery
- implementation planning
- test planning

It does not automatically modify repositories or create pull requests.

## Future Direction

Potential extensions include:

- GitHub issue picker
- dependency visualization
- richer repository navigation
- PR preparation
- change impact visualization
- contributor onboarding workflows
- support for additional open-weight models

## Built for React Hyderabad × MLH Hack Day 2026

PatchPath is an open-source AI project focused on making contribution to unfamiliar repositories easier.

The goal is simple:

> **Don't start coding until you know where the change belongs.**
