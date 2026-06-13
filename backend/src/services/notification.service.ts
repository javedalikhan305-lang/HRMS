import nodemailer from 'nodemailer';

export class NotificationService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendEmail(to: string, subject: string, html: string) {
        try {
            await this.transporter.sendMail({
                from: `"HRMS PRO" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html
            });
        } catch (error) {
            console.error("Email sending failed:", error);
        }
    }

    async notifyLeaveApproval(email: string, employeeName: string, status: string) {
        const subject = `Leave Request ${status}`;
        const html = `<h1>Hello ${employeeName},</h1><p>Your leave request has been <strong>${status}</strong>.</p>`;
        await this.sendEmail(email, subject, html);
    }

    static async sendInApp(data: {
        userId: string,
        tenantId: string | any,
        title: string,
        message: string,
        type?: 'info' | 'success' | 'warning' | 'error',
        link?: string
    }) {
        try {
            const { Notification } = await import('../models/notification.model');
            const payload: any = {
                userId: data.userId,
                tenantId: data.tenantId,
                title: data.title,
                message: data.message,
                type: data.type || 'info'
            };
            if (data.link) payload.link = data.link;
            return await Notification.create(payload);
        } catch (error) {
            console.error("In-app notification failed:", error);
        }
    }
}
