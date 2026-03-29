# Backend Spec Pack - Bihar Sahayata

This directory contains the separate "ingredients" needed to recreate the backend at the same magnitude and behavior. Use these docs together as the authoritative source for a full reimplementation in Node.js + Express.

**Primary Documents**
- `docs/backend-api-documentation.md`
- `docs/backend-spec-db-schema.md`
- `docs/backend-spec-auth-schema.md`
- `docs/backend-spec-auth.md`
- `docs/backend-spec-env.md`
- `docs/backend-spec-enums.md`
- `docs/backend-spec-workflows.md`
- `docs/backend-spec-error-contract.md`

**Recommended Build Order**
1. Implement database schema and migrations using `docs/backend-spec-db-schema.md` and `docs/backend-spec-auth-schema.md`.
2. Implement auth using `docs/backend-spec-auth.md` and `docs/backend-spec-env.md`.
3. Implement API routes using `docs/backend-api-documentation.md`.
4. Validate behaviors using `docs/backend-spec-enums.md`, `docs/backend-spec-workflows.md`, and `docs/backend-spec-error-contract.md`.

**Notes**
- This pack is designed to remove ambiguity. It includes exact schema definitions, explicit enums, workflows, and error shapes.
- If you need a strict contract, I can also generate a full OpenAPI spec and SQL DDL from this pack.
