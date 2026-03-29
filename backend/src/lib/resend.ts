import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM || "noreply@example.com";

const resend = apiKey ? new Resend(apiKey) : null;

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!resend) {
    console.log("Email service not configured. Email not sent", {
      to,
      subject,
      html,
    });
    return;
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email", { to, subject, error });
  }
}

export async function sendVerificationEmail(
  url: string,
  token: string,
  user: { email: string; name: string }
): Promise<void> {
  console.log(`[DEV EMAIL] To: ${user.email} | URL: ${url}`);
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>Verify your Bihar Sahayata account</h2>
      <p>Hello ${user.name || "there"},</p>
      <p>Please verify your email address to activate your account.</p>
      <p>
        <a href="${url}" style="display: inline-block; padding: 10px 16px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">Verify Email</a>
      </p>
      <p>If the button doesn't work, copy and paste this link:</p>
      <p><a href="${url}">${url}</a></p>
    </div>
  `;

  await sendEmail(user.email, "Verify your Bihar Sahayata account", html);
}

export async function sendPasswordResetEmail(
  url: string,
  token: string,
  user: { email: string; name: string }
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>Reset your Bihar Sahayata password</h2>
      <p>Hello ${user.name || "there"},</p>
      <p>Use the link below to reset your password.</p>
      <p><a href="${url}">${url}</a></p>
    </div>
  `;

  await sendEmail(user.email, "Reset your Bihar Sahayata password", html);
}

export async function sendWelcomeEmail(user: {
  email: string;
  name: string;
}): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>Welcome to Bihar Sahayata</h2>
      <p>Hello ${user.name || "there"},</p>
      <p>We're glad you're here. Your account is ready.</p>
    </div>
  `;

  await sendEmail(user.email, "Welcome to Bihar Sahayata", html);
}
