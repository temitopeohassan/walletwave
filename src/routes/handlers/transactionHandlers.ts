import { Request, Response } from 'express';
import { tokenService } from '../../services/tokenService';

export const getTransactionHistory = async (req: Request, res: Response) => {
  const { address, network = 'base', token_symbol } = req.body;
  
  // Validate token if specified
  if (token_symbol) {
    const isValid = await tokenService.validateToken(token_symbol, network);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid token symbol for network' });
    }
  }
  
  res.json({ 
    address, 
    network,
    token_symbol,
    transactions: [] 
  });
};

export const initiateSweep = async (req: Request, res: Response) => {
  const { address, token_symbol, amount, network = 'base' } = req.body;
  
  // Validate token
  const isValid = await tokenService.validateToken(token_symbol, network);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid token symbol for network' });
  }
  
  res.json({
    address,
    token_symbol,
    network,
    amount: amount || 'full',
    status: 'sweep_initiated',
  });
};

export const initiateWithdrawal = async (req: Request, res: Response) => {
  const { to_address, token_symbol, amount, master_wallet_id, network = 'base' } = req.body;
  
  // Validate token
  const isValid = await tokenService.validateToken(token_symbol, network);
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid token symbol for network' });
  }
  
  res.json({
    to_address,
    token_symbol,
    network,
    amount,
    master_wallet_id,
    status: 'withdrawal_initiated',
  });
};

export const getTransactionDetails = async (req: Request, res: Response) => {
  const { tx_hash, network = 'base' } = req.body;
  res.json({ 
    tx_hash, 
    network,
    details: {} 
  });
};
