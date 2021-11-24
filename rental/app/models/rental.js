const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RentalSchema = new Schema({
    rental_uid: { type: String, required: true },
    username: { type: String, required: true },
    payment_uid: { type: String, required: true },
    car_uid: { type: String, required: true },
    date_from: { type: Number, required: true },
    date_to: { type: Number, required: true },
    status: { type: String, required: true, enum: ['IN_PROGRESS', 'FINISHED', 'CANCELED'] },
});


mongoose.model('Rental', RentalSchema);