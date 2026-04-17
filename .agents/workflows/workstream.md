---
description: # Agent Team Workstream: Code Quality & Reliability
---

## 1. Roles & Objectives
- **Lead Orchestrator**: Coordinates tasks and assigns sub-agents.
- **Testing Agent**: Executes existing tests, generates new ones, and ensures 100% pass rate.
- **Refactoring Agent**: Identifies bad smells/DRY violations and improves code structure.

## 2. Parallel Workflow
1. **Phase 1: Baseline**
   - [Testing Agent] Runs `npm test` or equivalent to establish a green baseline.
2. **Phase 2: Execution**
   - [Refactoring Agent] Analyzes code in `/src` for "bad practices."
   - [Refactoring Agent] Proposes and implements changes.
3. **Phase 3: Verification**
   - [Testing Agent] Re-runs all tests. 
   - *Conflict Check*: If tests fail, the Refactoring Agent must revert or fix based on test output.

## 3. Communication Channel
Agents must log status in `artifacts/status.log` after every run.
