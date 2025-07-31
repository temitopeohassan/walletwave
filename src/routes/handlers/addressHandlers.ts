import { Request, Response } from 'express';
import { tokenService } from '../../services/tokenService';

export const getAddressBalance = async (req: Request, res: Response) => {
  try {
    const { address, network = 'base' } = req.body;
    
    // Validate network
    const supportedNetworks = ['base', 'base-sepolia', 'ethereum-sepolia'];
    if (!supportedNetworks.includes(network)) {
      return res.status(400).json({ error: 'Unsupported network' });
    }

    // Get all token balances for the network
    const balances = await tokenService.getAllTokenBalances(address, network);

    res.json({
      address,
      network,
      balances,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch balance', message: err.message });
  }
};

export const listDedicatedAddresses = async (req: Request, res: Response) => {
  const {
    customer_id,
    master_wallet_id,
    network,
    is_active,
    limit = 50,
    offset = 0,
  } = req.body;

  res.json({
    customer_id,
    master_wallet_id,
    network,
    is_active,
    limit,
    offset,
    addresses: [],
  });
};

export const updateAddressSettings = async (req: Request, res: Response) => {
  const { address, network = 'base', ...updates } = req.body;
  res.json({
    address,
    network,
    updated: updates,
  });
};
