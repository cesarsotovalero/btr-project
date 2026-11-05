"""BTR Worker — polls Postgres for pending agent runs and executes them.

A simple polling worker for the prototype. No Redis/Celery needed.

The worker is a SECONDARY execution path.  The primary path is the
``asyncio.create_task(run_workflow_background(...))`` fired by the API's
``trigger_analysis`` endpoint.  The worker exists so that workflows can
be retried after a cold restart (e.g. the API pod crashed while a
workflow was in-flight).

Key invariants
--------------
* Never re-invoke a workflow that is **paused at a checkpoint** — the
  checkpoint requires human approval via the API.
* Never re-invoke a workflow whose case is already ``analyzing`` — the
  API background task is already handling it.
* Only pick up cases whose status is ``analyzing`` **and** that have
  ``pending`` agent runs **and** are **not** paused at a checkpoint.
"""

from __future__ import annotations

import asyncio
import logging
import os
import sys

# Add the project-api src to path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "project-api", "src"))

from app.agents.workflow import run_workflow
from app.database import async_session

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("btr-worker")

POLL_INTERVAL = 5  # seconds


async def poll_for_work():
    """Poll for pending analysis work and execute workflows."""
    logger.info("BTR Worker started — polling for pending work...")

    while True:
        try:
            async with async_session() as session:
                from app.models.agent_run import AgentRun
                from app.models.case import Case
                from sqlalchemy import and_, distinct, select

                # Only consider cases that:
                #  1. Have at least one pending agent run
                #  2. Are in "analyzing" status (not checkpoint_pending, etc.)
                #  3. Are NOT paused at a checkpoint
                result = await session.execute(
                    select(distinct(AgentRun.case_id))
                    .join(Case, Case.id == AgentRun.case_id)
                    .where(
                        and_(
                            AgentRun.status == "pending",
                            Case.status == "analyzing",
                            Case.workflow_paused_at_checkpoint.is_(None),
                        )
                    )
                )
                pending_case_ids = [str(row[0]) for row in result.fetchall()]

            for case_id in pending_case_ids:
                logger.info(f"Processing case {case_id}...")
                try:
                    result = await run_workflow(case_id)
                    logger.info(
                        f"Case {case_id} workflow completed: {result['status']}"
                    )
                except Exception as e:
                    logger.error(f"Workflow failed for case {case_id}: {e}")

        except Exception as e:
            logger.error(f"Poll cycle error: {e}")

        await asyncio.sleep(POLL_INTERVAL)


def main():
    """Entry point for the worker process."""
    asyncio.run(poll_for_work())


if __name__ == "__main__":
    main()
