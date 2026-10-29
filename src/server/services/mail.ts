import nodemailer, { type Transporter } from 'nodemailer';

// Correo de recuperación de contraseña. En desarrollo sin SMTP usa una cuenta de prueba de Ethereal.
// En producción sin SMTP no se envía nada y queda un error en el log.
let transporter: Transporter | null | undefined;
let devPreview = false;

async function getTransporter(): Promise<Transporter | null> {
  if (transporter !== undefined) return transporter;

  const host = process.env.SMTP_HOST;
  if (host) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return transporter;
  }

  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  if (isProduction) {
    console.error('SMTP_HOST no está definido: no se enviarán correos (recuperación de contraseña).');
    transporter = null;
    return transporter;
  }

  const account = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: account.user, pass: account.pass },
  });
  devPreview = true;
  console.warn(`=== EMAIL DE DESARROLLO (Ethereal) === login: ${account.user} · ver correos: https://ethereal.email/login`);
  return transporter;
}

// Nunca lanza: si el correo no sale, queda en el log y la respuesta al usuario no cambia (no revela si el correo existe).
export async function sendPasswordReset(email: string, resetUrl: string): Promise<void> {
  try {
    const mailer = await getTransporter();
    if (!mailer) {
      console.error(`No se envió el correo de recuperación a ${email}: falta configurar SMTP.`);
      return;
    }
    const info = await mailer.sendMail({
      // MAIL_FROM debe ser una dirección de un dominio verificado en el proveedor SMTP.
      from: process.env.MAIL_FROM ?? '"Eventos App" <onboarding@resend.dev>',
      to: email,
      subject: 'Recuperación de Contraseña',
      html: passwordResetHtml(resetUrl),
    });
    if (devPreview) console.warn(`Email preview: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (e) {
    console.error(`No se pudo enviar el correo de recuperación a ${email}: ${(e as Error).message}`);
  }
}

function passwordResetHtml(resetUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f1a; border-radius: 16px; color: #e5e7eb;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 24px; margin: 0; color: #fff;">Recupera tu Contraseña</h1>
      </div>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 24px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva contraseña:</p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #06b6d4, #a855f7); color: #fff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px;">Restablecer Contraseña</a>
      </div>
      <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Si no solicitaste esto, ignora este correo.</p>
      <p style="font-size: 12px; color: #6b7280;">Este enlace expira en 1 hora.</p>
      <p style="font-size: 12px; color: #6b7280; word-break: break-all;">${resetUrl}</p>
    </div>
  `;
}
