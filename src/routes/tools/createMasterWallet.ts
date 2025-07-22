import { Request, Response } from 'express';
import { createMasterWallet } from '../../tools/createMasterWallet';

export const createMasterWalletHandler = async (req: Request, res: Response) => {
  try {
    const result = await createMasterWallet(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.error('Error creating master wallet:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
