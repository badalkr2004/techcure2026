import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { db } from "../db/drizzle";
import { user as userTable } from "../db/schema";
import { eq } from "drizzle-orm";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const [dbUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (!dbUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    req.user = dbUser;
    req.session = session.session;
    return next();
  } catch (error) {
    console.error("Auth error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
