# AGENTS.md — Listing Apartments App

This file orients any AI coding agent (Claude Code or otherwise) working in this repository. **Read it before generating any code.** [docs/requirements.md](docs/requirements.md) is the single source of truth for scope and behavior; [docs/implementation-plan.md](docs/implementation-plan.md) is the phase-by-phase build plan this project follows.

Where this file and `docs/requirements.md` disagree, **`docs/requirements.md` wins** — and the disagreement must be reported, not silently resolved.

---

## 1. Project context

Take-home assignment for a Software Engineer role at Nawy. Build a listing apartments app: a Node/TypeScript API, a responsive Next.js frontend with listing and details pages, a database, and the whole stack runnable with a single `docker compose up`.

**Grading is explicitly ordered: functionality, then code quality, then project structure and documentation.** That ordering decides every tradeoff. A working feature beats a polished feature, and a polished feature beats an extra feature. A half-finished integration reads worse to a reviewer than a clean, documented omission.

The bonus requirement — search by unit name, unit number, or project — is treated as in scope, because it is the part of the assignment that most reveals whether the data model was designed or merely typed out.

---

## 2. Tech stack

| Layer          | Choice                                                         |
| -------------- | -------------------------------------------------------------- |
| Runtime        | Node.js 24.x LTS                                               |
| Language       | TypeScript, `strict: true`                                     |
| Backend        | NestJS 10.x                                                    |
| ORM            | TypeORM, migrations only                                       |
| Database       | PostgreSQL 18 (Alpine) with the `pg_trgm` extension            |
| Frontend       | Next.js 16.x, App Router                                       |
| Styling        | Tailwind CSS 4.x + shadcn/ui                                   |
| Forms          | react-hook-form + zod                                          |
| Validation     | zod (frontend forms; also the backend's env-schema validation) |
| Repo           | npm workspaces: `apps/api`, `apps/web`, `packages/shared`      |
| Auth           | `@nestjs/jwt` + Passport JWT, `bcrypt` cost 12                 |
| API docs       | `@nestjs/swagger`                                              |
| Logging        | `nestjs-pino`                                                  |
| Rate limiting  | `@nestjs/throttler`                                            |
| Health         | `@nestjs/terminus`                                             |
| Backend tests  | Jest + Supertest against real PostgreSQL                       |
| Frontend tests | Vitest + React Testing Library                                 |
| E2E            | Playwright                                                     |
| Tooling        | ESLint 9 flat config, Prettier, Husky, lint-staged, commitlint |

Pin exact versions in each `package.json` at install time and record what npm actually resolved. Do not assert a version you have not installed. **Do not add a dependency that is not in this table without approval** — check first whether something already in the stack covers the need.

---

## 3. Build and run commands

```bash
docker compose up                       # the assignment requirement: db + api + web, migrated and seeded
docker compose -f docker-compose.yml -f docker-compose.dev.yml up   # dev mode, hot reload
docker compose down -v                  # tear down including volumes, for verifying a cold start

npm install                             # install all workspaces from the root
npm run lint                            # eslint across workspaces
npm run typecheck                       # tsc --noEmit across workspaces
npm run test                            # unit tests across workspaces

npm run -w apps/api migration:generate  # generate a migration from entity changes
npm run -w apps/api migration:run       # apply migrations
npm run -w apps/api seed                # idempotent seed
npm run -w apps/api test:integration    # supertest against real PostgreSQL
npm run -w apps/web test:e2e            # playwright
```

Ports: web `3000`, api `4000`, database `5432`. API docs at `http://localhost:4000/api/docs`.

---

## 4. Project structure

```
listing-apartments-app/
├── AGENTS.md                       this file
├── README.md
├── docker-compose.yml              production-like, Alpine, single-command startup
├── docker-compose.dev.yml          hot-reload override
├── package.json                    npm workspaces root
├── tsconfig.base.json              strict, extended by every workspace
├── .env.example
├── .github/workflows/
│   ├── ci.yml                      lint, typecheck, unit, integration
│   └── e2e.yml                     manually triggered Playwright against Compose
├── docs/
│   ├── requirements.md             SINGLE SOURCE OF TRUTH
│   └── implementation-plan.md      phased build plan
├── packages/shared/                types, enums, and zod schemas used by both apps
└── apps/
    ├── api/
    │   ├── src/
    │   │   ├── main.ts
    │   │   ├── app.module.ts
    │   │   ├── config/             env schema and validation, typed config
    │   │   ├── database/           DataSource, naming strategy, migrations/, seeds/
    │   │   ├── common/             exception filter, interceptors, pagination DTOs, decorators
    │   │   ├── health/
    │   │   ├── auth/               controller, service, strategy, guards, dto/
    │   │   └── modules/
    │   │       ├── apartments/     controller, service, repository, dto/, entities/, mappers/, *.spec.ts
    │   │       ├── projects/
    │   │       └── developers/
    │   ├── test/                   integration specs (supertest)
    │   └── Dockerfile
    └── web/
        ├── src/
        │   ├── app/                / , /apartments/[id] , /apartments/new , /login
        │   ├── components/         ui/ (shadcn), apartments/, filters/, layout/
        │   ├── lib/                api client, formatters, auth storage
        │   └── types/
        ├── e2e/                    playwright specs
        └── Dockerfile
```

Feature code lives in a feature module, not in a shared `utils` dumping ground. A file's location should make its ownership obvious.

**Note:** `apps/web/AGENTS.md` and `apps/web/CLAUDE.md` are auto-generated and regenerated by the Next.js CLI itself (`next dev` / `next build`) to flag version-specific API changes since a model's training data. They are tooling-managed, scoped to Next.js internals only, and are not edited by hand or authoritative for anything in this repository. _This_ file remains the single entry point for project rules.

---

## 5. Architecture constraints

**Backend layering is strictly one-directional:**

```
Controller  ->  Service  ->  Repository  ->  TypeORM / PostgreSQL
```

- **Controllers** do HTTP only: routing, DTO binding, status codes, Swagger decorators, guards. Zero business logic. If a controller contains an `if` about domain state, it is in the wrong layer.
- **Services** own every business rule and are the only layer permitted to call repositories.
- **Repositories** own every query. No query building in services, no `QueryBuilder` outside a repository, no raw SQL outside a migration or a repository with a comment explaining why.
- **Never skip or reverse a layer.** A controller must not touch a repository; a repository must not call a service.

**Boundary rules:**

- Entities never cross the HTTP boundary. Controllers return DTOs produced by an explicit mapper. A leaked entity is a leaked schema and a leaked `passwordHash` waiting to happen.
- All external input is validated before it reaches a service: `class-validator` DTOs with a global `ValidationPipe` using `whitelist`, `forbidNonWhitelisted`, and `transform`.
- Environment variables are validated at startup. The process must fail fast on missing configuration rather than at the first request that needs it.
- Types shared between the API and the web app live in `packages/shared` and are imported, never re-declared on the other side.

**TypeScript rules:**

- `strict: true`, and no `any`. Use `unknown` plus narrowing.
- No non-null assertion (`!`) used to silence the compiler about something that can genuinely be null.
- No `@ts-ignore` or `@ts-expect-error` without an adjacent comment naming the constraint that forces it.

---

## 6. Coding rules

### General

- Do not introduce new dependencies without approval.
- Do not change API contracts defined in [docs/requirements.md](docs/requirements.md) section 7 (exact API contracts).
- Do not invent business rules.
- If a requirement is ambiguous, stop and ask.
- Prefer existing utilities over creating duplicates.

### Testing

- Every new business rule must have tests.
- Every endpoint must have integration tests.
- Do not mark tests as skipped.

### API

- Follow REST conventions.
- Validate all external input.
- Never expose passwords or secrets.
- Use the error format defined in the API specification (`docs/requirements.md` section 7.1).

### Database

- All schema changes require migrations.
- Never modify production data directly.

### Additional

- `synchronize: true` is forbidden in every environment. Schema changes go through a generated, reviewed migration.
- Never edit a migration that has already been applied or committed — add a new one.
- Comments explain constraints and non-obvious intent. They do not narrate what the next line does.
- Use Alpine base images wherever an official Alpine variant exists.

---

## 7. Business rules

The authoritative, numbered list is [docs/requirements.md](docs/requirements.md) section 6, BR-1 through BR-23. Tests and commit messages cite BR numbers. The ones most easily got wrong:

- **BR-2** `projectId` must reference an existing, non-deleted project → **422**, not 400 and not 404.
- **BR-3** `unitNumber` is unique per project **among non-deleted rows** → **409**. The partial unique index is the authority; the service check exists only to produce a readable message.
- **BR-5** Every read excludes soft-deleted rows, at every layer, with no exception exposed through the API.
- **BR-7** A soft-deleted unit number becomes reusable within its project. This is why the index is partial rather than plain.
- **BR-8** `q` matches `unitName`, `unitNumber`, **or the parent project's name**, OR-ed together, case-insensitive and partial.
- **BR-10** A whitespace-only `q` is ignored, not treated as a match-nothing filter.
- **BR-12** A page past the end is **200** with empty `data` and accurate `meta`, never a 404.
- **BR-18** Reads are public; writes require an ADMIN token. 401 for a missing or invalid token, 403 for a valid non-ADMIN one.
- **BR-15** Money is `numeric(14,2)`, never a float, and always EGP.

---

## 8. Testing requirements

- **Every endpoint has an integration test.** Not a mocked controller test — a real HTTP request through the real application against a real PostgreSQL database.
- **Every business rule has a test that cites its BR number** in the test name, so coverage of the specification is auditable by reading test output.
- **No skipped, commented-out, or `.only` tests.** A skipped test is a lie about coverage.
- **Integration tests run against real PostgreSQL, never SQLite or an in-memory substitute.** This is not fussiness: partial unique indexes, `ILIKE`, GIN trigram search, `text[]` columns, and `numeric` semantics do not exist or do not behave the same elsewhere. A green suite on SQLite would prove nothing about the features that matter most here.
- Each test sets up and tears down its own data. Tests must pass in any order and must not depend on the seed script's contents.
- Unit tests mock the repository, not the database. If a service test needs a real database to pass, the business logic has leaked into the query layer.
- Prefer a few tests of genuinely hard behavior — combined search plus filters plus pagination, soft-delete uniqueness reuse, 401 versus 403 — over many trivial ones. Do not chase a coverage percentage.
- Frontend tests cover the behavior a user depends on: debounced search writing to the URL, empty versus error states, form validation, the 409 duplicate mapping onto its field.

---

## 9. Explicitly out of scope

Do not add these, even if one seems quick:

- Image or file upload — images are external URLs only
- Refresh tokens, token rotation, or a token blocklist
- Public registration, or any role besides ADMIN
- Internationalization, Arabic content, RTL layout
- Geospatial search, maps, PostGIS
- WebSockets or any real-time updates
- Favourites, comparisons, bookings, contact forms, outbound email
- Redis or any cache layer, message brokers, background job queues
- An admin dashboard beyond the single add-apartment form

If a task appears to call for one of these, **stop and flag it** rather than adding it. The README documents these as deliberate omissions, and that only stays true if they stay absent.

---

## 10. Git workflow and conventions

Two long-lived branches:

- **`dev`** — active development. Do not commit directly for anything non-trivial; branch off it.
- **`main`** — the submission state. What a reviewer clones to evaluate the assignment. Must always be runnable via a single `docker compose up`.

**Flow:**

1. `feature/<short-name>` (for example `feature/apartment-search`) branched off `dev` → PR into `dev`.
2. `dev` → PR into `main`, gated on CI passing **and** a clean `docker compose up` verified from a fresh clone with volumes removed.

**Conventions:**

- Conventional Commits with a scope: `feat(api): add apartment search filters`, `test(web): cover listing empty state`, `fix(api): reject whitespace-only q`, `docs: document decisions`.
- One commit per completed plan phase, with the phase's checkboxes ticked in `docs/implementation-plan.md` in that same commit.
- Each PR description names the phase it implements and the BR numbers it covers, so the history explains itself without reading the diff.
- Never push directly to `main`. Everything flows through `dev` via PR.
- Never force-push a shared branch.

---

## 11. Agent workflow rules

- **Follow the phases in [docs/implementation-plan.md](docs/implementation-plan.md) in order.** Do not start a phase until the previous phase's exit condition is genuinely met — met, not approximately met.
- **Write tests alongside the feature, in the same phase.** A phase is not done until its tests exist and pass. Never defer tests to a cleanup phase; that phase never arrives.
- **No scope creep.** Implement what `docs/requirements.md` specifies and nothing more. If something outside it seems necessary or valuable, stop and ask.
- **Do not invent business rules.** If behavior is undefined, ask. A plausible guess encoded in code is harder to find later than a question asked now.
- **Stop and ask when a requirement is ambiguous**, rather than choosing an interpretation and proceeding quietly.
- **Keep documentation in step with the code.** Ticking a checkbox, updating the README, and updating Swagger annotations happen in the same commit as the change, not afterwards.
- **Report, do not paper over.** If you find a bug, contradiction, or mistake in these documents, say so plainly instead of coding around it.
- **Verify rather than assume.** Before claiming a phase works, run it. Before claiming the stack starts, tear the volumes down and start it cold.
- Do not commit secrets. `.env.example` holds placeholders only; real values stay in an untracked `.env`.

---

## 12. Definition of done

The project is done when every one of these is true and has been verified, not assumed:

- [ ] `docker compose up` on a fresh clone with no volumes produces a populated, browsable app with **no** manual steps
- [ ] All ten endpoints in `docs/requirements.md` section 7 behave exactly as contracted, including every listed status code
- [ ] Search, all filters, sorting, and pagination work **in combination**, not just individually
- [ ] Listing and details pages are correct and usable from 320px through desktop
- [ ] Every endpoint has an integration test; every BR has a test citing its number
- [ ] No skipped, `.only`, or commented-out tests
- [ ] Swagger UI at `/api/docs` documents every endpoint, including error shapes, and can drive a real authenticated `POST`
- [ ] Lint, typecheck, unit, and integration all pass in CI; the manual E2E workflow passes against Compose
- [ ] README setup instructions were followed **literally** from a fresh clone and corrected wherever they proved ambiguous
- [ ] README documents the deliberate omissions (`requirements.md` 2.3)
- [ ] Repository access granted to `NawyDevHiring` if the repository is private
