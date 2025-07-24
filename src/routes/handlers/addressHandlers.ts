import { Request, Response } from 'express';
import { ethers } from 'ethers';

export const getAddressBalance = async (req: Request, res: Response) => {
  try {
    const { address } = req.body;
    const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);

    const abi = ["function balanceOf(address) view returns (uint256)"];
    const usdc = new ethers.Contract("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", abi, provider);
    const usdt = new ethers.Contract("0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", abi, provider);

    const [usdcBal, usdtBal] = await Promise.all([
      usdc.balanceOf(address),
      usdt.balanceOf(address),
    ]);

    res.json({
      address,
      balances: {
        usdc: usdcBal.toString(),
        usdt: usdtBal.toString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch balance', message: err.message });
  }
};

export const listDedicatedAddresses = async (req: Request, res: Response) => {
  const {
    customer_id,
    master_wallet_id,
    is_active,
    limit = 50,
    offset = 0,
  } = req.body;

  res.json({
    customer_id,
    master_wallet_id,
    is_active,
    limit,
    offset,
    addresses: [],
  });
};

export const updateAddressSettings = async (req: Request, res: Response) => {
  const { address, ...updates } = req.body;
  res.json({
    address,
    updated: updates,
  });
};
