"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionDetails = exports.initiateWithdrawal = exports.initiateSweep = exports.getTransactionHistory = void 0;
const getTransactionHistory = async (req, res) => {
    const { address } = req.body;
    res.json({ address, transactions: [] });
};
exports.getTransactionHistory = getTransactionHistory;
const initiateSweep = async (req, res) => {
    const { address, token_symbol, amount } = req.body;
    res.json({
        address,
        token_symbol,
        amount: amount || 'full',
        status: 'sweep_initiated',
    });
};
exports.initiateSweep = initiateSweep;
const initiateWithdrawal = async (req, res) => {
    const { to_address, token_symbol, amount, master_wallet_id } = req.body;
    res.json({
        to_address,
        token_symbol,
        amount,
        master_wallet_id,
        status: 'withdrawal_initiated',
    });
};
exports.initiateWithdrawal = initiateWithdrawal;
const getTransactionDetails = async (req, res) => {
    const { tx_hash } = req.body;
    res.json({ tx_hash, details: {} });
};
exports.getTransactionDetails = getTransactionDetails;
