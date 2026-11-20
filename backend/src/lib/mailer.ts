/**
 * Modul Pengiriman Email Transaksional & Kode OTP
 * Mendukung Resend API, SMTP kustom, atau fallback console log untuk mode dev
 */

import crypto from "crypto";

export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function kirimEmailOtp(
  email: string,
  nama: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  const subject = `[asm.invitation] Kode Verifikasi Akun Anda: ${otp}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; rounded: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #4A151E; font-size: 24px; margin: 0; font-family: serif;">asm.invitation</h2>
        <p style="color: #666666; font-size: 13px; margin: 4px 0 0 0;">Platform Katalog & Generator Undangan Digital</p>
      </div>
      
      <div style="background-color: #FAF7F2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #333333; font-size: 16px;">Halo, ${nama}!</h3>
        <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5;">
          Terima kasih telah mendaftar di <strong>asm.invitation</strong>. Untuk mengaktifkan akun Anda, silakan masukkan 6 digit kode verifikasi berikut:
        </p>
        
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4A151E; background-color: #ffffff; padding: 12px 24px; border: 2px dashed #4A151E; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        
        <p style="margin: 0; color: #777777; font-size: 12px; text-align: center;">
          * Kode ini berlaku selama <strong>15 menit</strong>. Jangan bagikan kode ini kepada siapa pun.
        </p>
      </div>
      
      <p style="color: #999999; font-size: 11px; text-align: center; margin: 0;">
        Jika Anda tidak merasa mendaftar di asm.invitation, abaikan email ini.<br>
        &copy; ${new Date().getFullYear()} asm.invitation. Hak cipta dilindungi undang-undang.
      </p>
    </div>
  `;

  // 1. Cek apakah ada RESEND_API_KEY
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "asm.invitation <onboarding@resend.dev>",
          to: [email],
          subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        console.error("[Mailer] Gagal kirim email via Resend:", errorBody);
      } else {
        console.log(`[Mailer] Email OTP berhasil dikirim via Resend ke: ${email}`);
        return { success: true, message: "Email OTP berhasil dikirim" };
      }
    } catch (err) {
      console.error("[Mailer] Error fetch Resend:", err);
    }
  }

  // 2. Fallback untuk Local Development / Server Log
  console.log("==================================================");
  console.log(`📬 [EMAIL OTP SIMULATOR] Terkirim ke: ${email}`);
  console.log(`🔑 Kode OTP: ${otp}`);
  console.log(`⏱️ Berlaku 15 menit`);
  console.log("==================================================");

  return { success: true, message: "Kode OTP berhasil digenerate" };
}

export async function kirimEmailResetPassword(
  email: string,
  nama: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  const subject = `[asm.invitation] Permintaan Reset Password: ${otp}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #4A151E; font-size: 24px; margin: 0; font-family: serif;">asm.invitation</h2>
        <p style="color: #666666; font-size: 13px; margin: 4px 0 0 0;">Platform Katalog & Generator Undangan Digital</p>
      </div>
      
      <div style="background-color: #FAF7F2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #333333; font-size: 16px;">Halo, ${nama}!</h3>
        <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5;">
          Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda di <strong>asm.invitation</strong>. Silakan gunakan 6 digit kode OTP verifikasi berikut:
        </p>
        
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4A151E; background-color: #ffffff; padding: 12px 24px; border: 2px dashed #4A151E; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        
        <p style="margin: 0; color: #777777; font-size: 12px; text-align: center;">
          * Kode ini berlaku selama <strong>15 menit</strong>. Jangan bagikan kode ini kepada siapa pun demi keamanan akun Anda.
        </p>
      </div>
      
      <p style="color: #999999; font-size: 11px; text-align: center; margin: 0;">
        Jika Anda tidak meminta perubahan kata sandi, abaikan email ini atau segera hubungi tim kami.<br>
        &copy; ${new Date().getFullYear()} asm.invitation. Hak cipta dilindungi undang-undang.
      </p>
    </div>
  `;

  // 1. Cek apakah ada RESEND_API_KEY
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "asm.invitation <onboarding@resend.dev>",
          to: [email],
          subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        console.error("[Mailer] Gagal kirim email reset password via Resend:", errorBody);
      } else {
        console.log(`[Mailer] Email reset password berhasil dikirim via Resend ke: ${email}`);
        return { success: true, message: "Email reset password berhasil dikirim" };
      }
    } catch (err) {
      console.error("[Mailer] Error fetch Resend:", err);
    }
  }

  // 2. Fallback untuk Local Development / Server Log
  console.log("==================================================");
  console.log(`📬 [EMAIL RESET PASSWORD SIMULATOR] Terkirim ke: ${email}`);
  console.log(`🔑 Kode OTP Reset: ${otp}`);
  console.log(`⏱️ Berlaku 15 menit`);
  console.log("==================================================");

  return { success: true, message: "Kode OTP reset password berhasil digenerate" };
}

