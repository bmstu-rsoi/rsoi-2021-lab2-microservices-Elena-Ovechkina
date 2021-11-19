const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CarSchema = new Schema({
  car_uid: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  registration_number: { type: String, required: true },
  power: Number,
  price: { type: Number, required: true },
  type: { type: String, enum: ['SEDAN', 'SUV', 'MINIVAN', 'ROADSTER'] },
  availability: { type: Boolean, required: true, default: true }
});


mongoose.model('Car', CarSchema);