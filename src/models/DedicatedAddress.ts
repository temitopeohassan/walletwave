import mongoose from 'mongoose';

const DedicatedAddressSchema = new mongoose.Schema({
  customer_id: { type: String, required: true },
  master_wallet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterWallet' },
  address: { type: String, required: true },
  disable_auto_sweep: { type: Boolean, default: false },
  enable_gasless_withdraw: { type: Boolean, default: false },
  name: String,
  metadata: { type: Object, default: {} },
  is_active: { type: Boolean, default: true }
});

export default mongoose.model('DedicatedAddress', DedicatedAddressSchema);
