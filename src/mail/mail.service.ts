import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendVerificationEmail(email: string, code: string) {
    await this.transporter.sendMail({
      from: 'islamawadgh30@gmail.com',
      to: email,
      subject: 'تأكيد البريد الإلكتروني',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50; text-align: center;">تأكيد البريد الإلكتروني</h1>
          <p style="color: #34495e; font-size: 16px;">مرحباً بك في تطبيقنا</p>
          <p style="color: #34495e; font-size: 16px;">رمز التحقق الخاص بك هو:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f8f9fa;
                        padding: 15px;
                        font-size: 24px;
                        font-weight: bold;
                        letter-spacing: 5px;
                        color: #2c3e50;
                        border-radius: 5px;">
              ${code}
            </div>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">إذا لم تقم بإنشاء حساب، يمكنك تجاهل هذا البريد الإلكتروني.</p>
        </div>
      `
    });
  }

  async sendPasswordResetEmail(email: string, code: string) {
    await this.transporter.sendMail({
      from: 'islamawadgh30@gmail.com',
      to: email,
      subject: 'إعادة تعيين كلمة المرور',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50; text-align: center;">إعادة تعيين كلمة المرور</h1>
          <p style="color: #34495e; font-size: 16px;">لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.</p>
          <p style="color: #34495e; font-size: 16px;">رمز إعادة التعيين الخاص بك هو:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f8f9fa;
                        padding: 15px;
                        font-size: 24px;
                        font-weight: bold;
                        letter-spacing: 5px;
                        color: #2c3e50;
                        border-radius: 5px;">
              ${code}
            </div>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">ينتهي هذا الرمز خلال ساعة واحدة.</p>
          <p style="color: #7f8c8d; font-size: 14px;">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.</p>
        </div>
      `
    });
  }

  async sendTeamInvitation(email: string, teamName: string, invitationCode: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `دعوة للانضمام إلى فريق ${teamName}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50; text-align: center;">دعوة للانضمام إلى فريق</h1>
          <p style="color: #34495e; font-size: 16px;">لقد تمت دعوتك للانضمام إلى فريق ${teamName}</p>
          <p style="color: #34495e; font-size: 16px;">رمز الدعوة الخاص بك هو:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f8f9fa;
                        padding: 15px;
                        font-size: 24px;
                        font-weight: bold;
                        letter-spacing: 5px;
                        color: #2c3e50;
                        border-radius: 5px;">
              ${invitationCode}
            </div>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">هذا الرمز صالح لمدة 7 أيام.</p>
          <p style="color: #7f8c8d; font-size: 14px;">إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل هذا البريد الإلكتروني.</p>
        </div>
      `
    });
  }
} 