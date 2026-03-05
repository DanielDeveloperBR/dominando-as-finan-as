import { Request, Response, NextFunction } from 'express';

export const sessionAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.session as any)?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  next();
}