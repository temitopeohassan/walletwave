"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressSettings = exports.listDedicatedAddresses = exports.getAddressBalance = void 0;
const ethers_1 = require("ethers");
const getAddressBalance = async (req, res) => {
    try {
        const { address } = req.body;
        const provider = new ethers_1.ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
        const abi = ["function balanceOf(address) view returns (uint256)"];
        const usdc = new ethers_1.ethers.Contract("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", abi, provider);
        const usdt = new ethers_1.ethers.Contract("0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", abi, provider);
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
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch balance', message: err.message });
    }
};
exports.getAddressBalance = getAddressBalance;
const listDedicatedAddresses = async (req, res) => {
    const { customer_id, master_wallet_id, is_active, limit = 50, offset = 0, } = req.body;
    res.json({
        customer_id,
        master_wallet_id,
        is_active,
        limit,
        offset,
        addresses: [],
    });
};
exports.listDedicatedAddresses = listDedicatedAddresses;
const updateAddressSettings = async (req, res) => {
    const { address, ...updates } = req.body;
    res.json({
        address,
        updated: updates,
    });
};
exports.updateAddressSettings = updateAddressSettings;
