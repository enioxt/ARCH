/**
 * Quota Monitoring Routes
 *
 * Endpoints:
 * - GET /api/quotas/status — Get all quota statuses
 * - GET /api/quotas/recommendations — Get optimization recommendations
 * - POST /api/quotas/reset/daily — Reset daily quotas (admin only)
 * - POST /api/quotas/reset/monthly — Reset monthly quotas (admin only)
 */

import { Express, Request, Response } from 'express';
import {
  getQuotaStatus,
  getQuotaRecommendations,
  resetDailyQuotas,
  resetMonthlyQuotas,
} from './quota-monitor';
import { logger } from '../telemetry/logger';

/**
 * Register quota monitoring routes
 */
export function registerQuotaRoutes(app: Express) {
  /**
   * GET /api/quotas/status
   * Returns current status of all API quotas
   */
  app.get('/api/quotas/status', (req: Request, res: Response) => {
    try {
      const status = getQuotaStatus();

      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: status,
      });

      logger.log({
        eventName: 'quota_status_requested',
        path: '/api/quotas/status',
      });
    } catch (error: any) {
      logger.log({
        eventName: 'quota_status_error',
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve quota status',
      });
    }
  });

  /**
   * GET /api/quotas/recommendations
   * Returns optimization recommendations based on current usage
   */
  app.get('/api/quotas/recommendations', (req: Request, res: Response) => {
    try {
      const recommendations = getQuotaRecommendations();

      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        recommendations,
        count: recommendations.length,
      });

      logger.log({
        eventName: 'quota_recommendations_requested',
        path: '/api/quotas/recommendations',
        recommendationCount: recommendations.length,
      });
    } catch (error: any) {
      logger.log({
        eventName: 'quota_recommendations_error',
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve recommendations',
      });
    }
  });

  /**
   * POST /api/quotas/reset/daily
   * Reset daily quotas (admin only)
   * Requires: ?adminKey=xxx (hardcoded secret)
   */
  app.post('/api/quotas/reset/daily', (req: Request, res: Response) => {
    try {
      const adminKey = req.query.adminKey as string;
      const expectedKey = process.env.ADMIN_KEY || 'admin-secret-key';

      if (!adminKey || adminKey !== expectedKey) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: invalid admin key',
        });
      }

      resetDailyQuotas();

      res.json({
        success: true,
        message: 'Daily quotas reset',
        timestamp: new Date().toISOString(),
      });

      logger.log({
        eventName: 'quota_daily_reset_triggered',
        triggeredBy: 'admin',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.log({
        eventName: 'quota_daily_reset_error',
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to reset daily quotas',
      });
    }
  });

  /**
   * POST /api/quotas/reset/monthly
   * Reset monthly quotas (admin only)
   * Requires: ?adminKey=xxx (hardcoded secret)
   */
  app.post('/api/quotas/reset/monthly', (req: Request, res: Response) => {
    try {
      const adminKey = req.query.adminKey as string;
      const expectedKey = process.env.ADMIN_KEY || 'admin-secret-key';

      if (!adminKey || adminKey !== expectedKey) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: invalid admin key',
        });
      }

      resetMonthlyQuotas();

      res.json({
        success: true,
        message: 'Monthly quotas reset',
        timestamp: new Date().toISOString(),
      });

      logger.log({
        eventName: 'quota_monthly_reset_triggered',
        triggeredBy: 'admin',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.log({
        eventName: 'quota_monthly_reset_error',
        error: error.message,
      });

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to reset monthly quotas',
      });
    }
  });

  /**
   * GET /api/quotas/summary
   * Quick summary of all quotas (human readable)
   */
  app.get('/api/quotas/summary', (req: Request, res: Response) => {
    try {
      const status = getQuotaStatus();
      const recommendations = getQuotaRecommendations();

      // Build human-readable summary
      const summary: string[] = [];
      summary.push('=== QUOTA SUMMARY ===\n');

      Object.entries(status).forEach(([apiName, data]: [string, any]) => {
        const dailyStatus = data.daily.status;
        const monthlyStatus = data.monthly.status;
        const costStatus = data.cost.status;

        summary.push(
          `${data.name.padEnd(20)} | ` +
            `Daily: ${data.daily.percentage.padStart(5)}% ${dailyStatus.padEnd(12)} | ` +
            `Monthly: ${data.monthly.percentage.padStart(5)}% ${monthlyStatus.padEnd(12)} | ` +
            `Cost: ${data.cost.percentage.padStart(5)}% ${costStatus}`
        );
      });

      summary.push('\n=== RECOMMENDATIONS ===\n');
      if (recommendations.length === 0) {
        summary.push('✅ All quotas OK, no action needed');
      } else {
        recommendations.forEach((rec) => summary.push(rec));
      }

      res.text = summary.join('\n');
      res.setHeader('Content-Type', 'text/plain');
      res.send(summary.join('\n'));

      logger.log({
        eventName: 'quota_summary_requested',
        path: '/api/quotas/summary',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve quota summary',
      });
    }
  });
}
