import nodemailer from "nodemailer"

interface EmailConfig {
    host: string
    port: number
    secure: boolean
    auth: {
        user: string
        pass: string
    }
}

interface WeeklyReportData {
    period: string
    stats: {
        newAnalyses: number
        newClusters: number
        newKeywords: number
        newSerpResults: number
    }
}

/**
 * Email Service
 * Handles sending email notifications
 */
class EmailService {
    private transporter: nodemailer.Transporter | null = null
    private fromEmail: string = ""

    constructor() {
        this.initialize()
    }

    private initialize() {
        const host = process.env.SMTP_HOST
        const port = parseInt(process.env.SMTP_PORT || "587", 10)
        const user = process.env.SMTP_USER
        const pass = process.env.SMTP_PASSWORD
        this.fromEmail = process.env.EMAIL_FROM || user || "noreply@seoautomation.com"

        if (host && user && pass) {
            const config: EmailConfig = {
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            }

            this.transporter = nodemailer.createTransport(config)
            console.log("Email service initialized")
        } else {
            console.warn("Email service not configured - SMTP credentials missing")
        }
    }

    /**
     * Check if email service is configured
     */
    isConfigured(): boolean {
        return this.transporter !== null
    }

    /**
     * Send a basic email
     */
    async sendEmail(
        to: string,
        subject: string,
        html: string,
        text?: string
    ): Promise<boolean> {
        if (!this.transporter) {
            console.warn("Email service not configured, skipping email send")
            return false
        }

        try {
            await this.transporter.sendMail({
                from: this.fromEmail,
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, ""),
            })
            return true
        } catch (error) {
            console.error("Failed to send email:", error)
            return false
        }
    }

    /**
     * Send weekly report email
     */
    async sendWeeklyReport(to: string, data: WeeklyReportData): Promise<boolean> {
        const subject = `SEO Automation Weekly Report - ${data.period}`

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .stat-value { font-size: 36px; font-weight: bold; color: #8b5cf6; }
            .stat-label { color: #6b7280; font-size: 14px; margin-top: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Weekly SEO Report</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">${data.period}</p>
            </div>
            <div class="content">
              <p>Here's a summary of your SEO activity this week:</p>
              
              <div class="stat-grid">
                <div class="stat-card">
                  <div class="stat-value">${data.stats.newAnalyses}</div>
                  <div class="stat-label">New Analyses</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.stats.newClusters}</div>
                  <div class="stat-label">Topic Clusters</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.stats.newKeywords}</div>
                  <div class="stat-label">Keywords Tracked</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.stats.newSerpResults}</div>
                  <div class="stat-label">SERP Analyses</div>
                </div>
              </div>
              
              <p>Keep up the great work! Visit your dashboard for more details.</p>
            </div>
            <div class="footer">
              <p>SEO Automation Platform</p>
              <p>You're receiving this because you have a weekly report scheduled.</p>
            </div>
          </div>
        </body>
      </html>
    `

        return this.sendEmail(to, subject, html)
    }

    /**
     * Send content audit alert
     */
    async sendContentAuditAlert(
        to: string,
        keyword: string,
        score: number,
        issues: number
    ): Promise<boolean> {
        const subject = `Content Audit Alert: ${keyword} (Score: ${score}/100)`

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .alert-box { background: ${score < 50 ? "#fee2e2" : "#fef3c7"}; border-left: 4px solid ${score < 50 ? "#ef4444" : "#f59e0b"}; padding: 15px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Content Audit Results</h2>
            <div class="alert-box">
              <p><strong>Keyword:</strong> ${keyword}</p>
              <p><strong>Score:</strong> ${score}/100</p>
              <p><strong>Issues Found:</strong> ${issues}</p>
            </div>
            <p style="margin-top: 20px;">Visit your dashboard to see detailed recommendations.</p>
          </div>
        </body>
      </html>
    `

        return this.sendEmail(to, subject, html)
    }

    /**
     * Send ranking change alert
     */
    async sendRankingAlert(
        to: string,
        keyword: string,
        oldPosition: number,
        newPosition: number
    ): Promise<boolean> {
        const improved = newPosition < oldPosition
        const subject = `${improved ? "📈" : "📉"} Ranking ${improved ? "Improved" : "Dropped"}: ${keyword}`

        const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2>Ranking Update</h2>
          <p><strong>Keyword:</strong> ${keyword}</p>
          <p><strong>Position Change:</strong> ${oldPosition} → ${newPosition}</p>
          <p style="color: ${improved ? "#10b981" : "#ef4444"}; font-weight: bold;">
            ${improved ? `↑ Improved by ${oldPosition - newPosition} positions` : `↓ Dropped by ${newPosition - oldPosition} positions`}
          </p>
        </body>
      </html>
    `

        return this.sendEmail(to, subject, html)
    }
}

export const emailService = new EmailService()
