import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";

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

    req.user = session.user;
    req.session = session.session;
    return next();
  } catch (error) {
    console.error("Auth error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
