import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface decodedType {
  id: string,
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    // console.log("headers = ",req.headers)
    
  const token = req.headers.authorization?.split(' ')[1];
//   console.log("token is",token)
  if (!token) { 
    res.status(401).json({ error: 'Access denied' });
    return;
    
}

  try {
    // console.log(token)
    const decoded  = jwt.verify(token, process.env.JWT_SECRET!);
    if(decoded) {
      console.log(decoded)
    }
    else{
      console.log("nothing")
    }
    // {console.log(decoded)}
    
    (req as any).user = decoded; // you can type this better later
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = {
    verifyToken: verifyToken
};
