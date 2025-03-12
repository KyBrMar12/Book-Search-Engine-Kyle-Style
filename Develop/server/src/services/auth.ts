import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY || '';

export const signToken = (username: string, email: string, _id: string | unknown) => {
  return jwt.sign({ username, email, _id: String(_id) }, secretKey, { expiresIn: '1h' });
};

export const context = async ({ req }: { req: any }) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];

  if (!token) {
    return { user: null }; // No token provided
  }

  try {
    const user = jwt.verify(token, secretKey);
    return { user };
  } catch (err) {
    console.error('Invalid token:', err);
    return { user: null }; // Invalid token
  }
};
