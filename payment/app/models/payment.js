const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  payment_uid: { type: String, required: true },
  status: { type: String, required: true, enum: ['PAID', 'CANCELED'], default: 'PAID'},
  price: { type: Number, required: true }
});


mongoose.model('Payment', PaymentSchema);