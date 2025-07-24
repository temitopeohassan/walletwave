import { Request, Response } from 'express';
import { ethers } from 'ethers';

export const createMasterWallet = async (req: Request, res: Response) => {
  const { name, metadata } = req.body;
  const wallet = ethers.Wallet.createRandom();
  res.json({ name, address: wallet.address, metadata: metadata || {} });
};

export const createDedicatedAddress = async (req: Request, res: Response) => {
  const {
    customer_id,
    master_wallet_id,
    name,
    disable_auto_sweep,
    enable_gasless_withdraw,
    metadata,
  } = req.body;
  const wallet = ethers.Wallet.createRandom();
  res.json({
    customer_id,
    address: wallet.address,
    master_wallet_id,
    name,
    disable_auto_sweep,
    enable_gasless_withdraw,
    metadata,
  });
};
