"""
Job Scheduler - APScheduler setup for automated SINAPI syncs
Runs background tasks for downloading and updating price tables
"""

import logging
import os
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from .download_sinapi import SINAPIDownloader

logger = logging.getLogger(__name__)


class SINAPIScheduler:
    """Manages scheduled jobs for SINAPI data ingestion"""

    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.downloader = SINAPIDownloader(
            db_host=os.getenv("DB_HOST", "localhost"),
            db_name=os.getenv("DB_NAME", "egos_sinapi"),
            db_user=os.getenv("DB_USER", "sinapi_user"),
            db_pass=os.getenv("DB_PASS", "sinapi_pass"),
        )

        # Track last sync status
        self.last_sync_status = None
        self.last_sync_time = None

    def sync_sinapi_job(self):
        """Background job to sync SINAPI data"""
        logger.info("Starting SINAPI sync job...")

        try:
            success = self.downloader.run_full_sync()

            if success:
                self.last_sync_status = "success"
                self.last_sync_time = datetime.now()
                logger.info("SINAPI sync completed successfully")
            else:
                self.last_sync_status = "failed"
                self.last_sync_time = datetime.now()
                logger.error("SINAPI sync failed")

        except Exception as e:
            self.last_sync_status = "error"
            self.last_sync_time = datetime.now()
            logger.error(f"SINAPI sync error: {e}")

    def start(self):
        """Start the scheduler with all configured jobs"""

        # Job 1: SINAPI sync on 1st of month at 3 AM UTC
        # (SINAPI updates on 1st of each month)
        self.scheduler.add_job(
            self.sync_sinapi_job,
            CronTrigger(day=1, hour=3, minute=0, timezone="UTC"),
            id="sinapi_monthly_sync",
            name="SINAPI Monthly Sync",
            replace_existing=True,
        )

        logger.info("Scheduled: SINAPI monthly sync at 1st of month, 3 AM UTC")

        # Job 2: Daily health check at 6 AM UTC
        # (Verify previous day's sync completed)
        self.scheduler.add_job(
            self._daily_health_check,
            CronTrigger(hour=6, minute=0, timezone="UTC"),
            id="daily_health_check",
            name="Daily Health Check",
            replace_existing=True,
        )

        logger.info("Scheduled: Daily health check at 6 AM UTC")

        # Job 3: Optional: Additional sync every 7 days (for redundancy)
        # Falls back to Fri @ 2 AM if monthly sync fails
        self.scheduler.add_job(
            self._weekly_fallback_sync,
            CronTrigger(day_of_week=4, hour=2, minute=0, timezone="UTC"),
            id="weekly_fallback_sync",
            name="Weekly Fallback Sync",
            replace_existing=True,
        )

        logger.info("Scheduled: Weekly fallback sync every Friday at 2 AM UTC")

        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("Scheduler started")

    def stop(self):
        """Stop the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Scheduler stopped")

    def _daily_health_check(self):
        """Verify system health and log status"""
        logger.info(f"Health check: Last sync was {self.last_sync_status} at {self.last_sync_time}")

        if self.last_sync_status == "failed":
            logger.warning("Last sync failed, triggering retry...")
            # Could trigger manual sync here if needed

    def _weekly_fallback_sync(self):
        """Fallback sync if monthly sync failed"""
        if self.last_sync_status != "success":
            logger.warning("Monthly sync appears to have failed, running fallback...")
            self.sync_sinapi_job()
        else:
            logger.info("Last sync was successful, skipping fallback")

    def get_job_status(self) -> dict:
        """Get current scheduler status"""
        return {
            "scheduler_running": self.scheduler.running,
            "jobs_scheduled": len(self.scheduler.get_jobs()),
            "last_sync_status": self.last_sync_status,
            "last_sync_time": self.last_sync_time.isoformat() if self.last_sync_time else None,
            "next_jobs": [
                {
                    "id": job.id,
                    "name": job.name,
                    "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                }
                for job in self.scheduler.get_jobs()
            ],
        }


# Global scheduler instance
_scheduler_instance = None


def get_scheduler() -> SINAPIScheduler:
    """Get or create global scheduler instance"""
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = SINAPIScheduler()
    return _scheduler_instance


def start_scheduler():
    """Start the global scheduler"""
    scheduler = get_scheduler()
    scheduler.start()


def stop_scheduler():
    """Stop the global scheduler"""
    scheduler = get_scheduler()
    scheduler.stop()
