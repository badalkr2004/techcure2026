# Auth Configuration

This is the exact Better Auth configuration used by the backend.

**Source**
- `lib/auth.ts`

---

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle"; // your drizzle instance
import * as schema from "@/auth-schema";
import { sendVerificationEmail as se } from "./resend";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 1000 * 60 * 60 * 24, // 24 hours
    async sendVerificationEmail({ user, url, token }, request) {
      void se(url, token, user);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

---

## Email Service

Verification emails are sent using Resend. The mailer is implemented in `lib/resend.ts`. It provides:
- `sendVerificationEmail(url, token, user)`
- `sendPasswordResetEmail(url, token, user)`
- `sendWelcomeEmail(user)`

For backend recreation, the Resend integration must match these semantics and be wired into Better Auth's verification callbacks.
