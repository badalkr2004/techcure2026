import type { Request, Response, NextFunction } from "express";

export const requireRole = (role: "user" | "volunteer" | "admin") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (req.user.role !== role) {
        return res.status(403).json({ error: "Forbidden" });
      }

      return next();
    } catch (error) {
      console.error("Role check error", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};
