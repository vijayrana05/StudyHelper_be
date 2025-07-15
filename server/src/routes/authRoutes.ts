import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();



router.post('/signup', async (req: Request, res: Response)=> {
  const { name, email, password }= req.body;

  // Add validation
  if (!name || !email || !password) {
    res.status(400).json({ error: 'All fields (name, email, password) are required' });
    return;
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed });

    await newUser.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists or other error' });
  }
});

// Login route
router.post('/login', async (req: Request, res: Response)=> {
  const { email, password }= req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid password' });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.setHeader("Authorization", `Bearer ${token}`);
    res.json({
      token,
      userId : user._id
    });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;