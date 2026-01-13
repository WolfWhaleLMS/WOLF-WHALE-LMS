import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || 'noreply@learnquest.edu';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<void> {
  const toAddresses = Array.isArray(to) ? to : [to];

  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: {
      ToAddresses: toAddresses,
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: html,
          Charset: 'UTF-8',
        },
        ...(text && {
          Text: {
            Data: text,
            Charset: 'UTF-8',
          },
        }),
      },
    },
  });

  await sesClient.send(command);
}

// Email Templates
export function gradeNotificationEmail(
  studentName: string,
  assignmentTitle: string,
  score: number,
  maxScore: number,
  feedback?: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #e0f7fa; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #00d4aa, #00a8cc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .score { font-size: 48px; font-weight: bold; text-align: center; color: #00d4aa; margin: 20px 0; }
        .feedback { background: #f0fdfa; padding: 15px; border-radius: 10px; margin-top: 20px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #00d4aa, #00a8cc); color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">LearnQuest</div>
        </div>
        <h2>Hi ${studentName}!</h2>
        <p>Your assignment <strong>${assignmentTitle}</strong> has been graded.</p>
        <div class="score">${score}/${maxScore}</div>
        ${feedback ? `<div class="feedback"><strong>Feedback:</strong><br>${feedback}</div>` : ''}
        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard" class="btn">View Details</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

export function assignmentDueReminderEmail(
  studentName: string,
  assignmentTitle: string,
  courseName: string,
  dueDate: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #e0f7fa; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #00d4aa, #00a8cc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .due-date { font-size: 24px; font-weight: bold; text-align: center; color: #ff6b6b; margin: 20px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #00d4aa, #00a8cc); color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">LearnQuest</div>
        </div>
        <h2>Hi ${studentName}!</h2>
        <p>This is a reminder that your assignment is due soon:</p>
        <h3>${assignmentTitle}</h3>
        <p>Course: ${courseName}</p>
        <div class="due-date">Due: ${dueDate}</div>
        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard" class="btn">Submit Now</a>
        </p>
      </div>
    </body>
    </html>
  `;
}
