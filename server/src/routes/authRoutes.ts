import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import dotenv from 'dotenv';
import { verifyToken } from '../middleware/auth';

dotenv.config();

const router = express.Router();



router.post('/signup', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Add validation
  if (!username || !password) {
    res.status(400).json({ message: 'All fields (username, password) are required' });
    return;
  }

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ message: 'Username already exists. Please choose a different username.' });
      return;
    }

    // Hash password and create new user
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashed });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error. Please try again.' });
  }
});

// Login route
router.post('/login', async (req: Request, res: Response)=> {
  const { username, password }= req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || !user.password) {
      res.status(404).json({ message: 'User not found' });
      return;
    } 

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid password' });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.setHeader("Authorization", `Bearer ${token}`);
    res.json({
      token,
      userId : user._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

export default router;