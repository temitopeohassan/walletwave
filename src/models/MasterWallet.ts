import mongoose from 'mongoose';

const MasterWalletSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  metadata: { type: Object, default: {} }
});

export default mongoose.model('MasterWallet', MasterWalletSchema);
