import type { auth } from "../lib/auth";
import type { user as userTable } from "../db/schema";

type Session = typeof auth.$Infer.Session.session;
type User = typeof userTable.$inferSelect;

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
      validated?: any;
    }
  }
}

export {};
