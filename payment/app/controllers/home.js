const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PaymentModel = mongoose.model('Payment');
const uuid = require('uuid').v4;

module.exports = (app) => {
  app.use('/payment', router);
};

// 1. Получить один конкретный платеж
router.get('/:id', async function (req, res, next) {
  try {
    const paymentId = req.params.id

    let payment = await PaymentModel.findOne({ payment_uid: paymentId })

    if (!payment) {
      return res.status(404).send({
        message: 'Платежа с индентификатором' + paymentId + 'в БД нет'
      });
    } else {
      payment = payment.toJSON()
      return res.status(200).send(payment)
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err)
  }
});

// 2. Создание платежа
router.post('/', async function (req, res, next) {
  try {
    let Payment = new PaymentModel({
      payment_uid: uuid(),
      price: req.body.price
    })

    await (Payment.validate())                        //проверка соответсвия с типовым документом (это промисы, поэтому обязателен await)
    Payment = await Payment.save()
    Payment = Payment.toJSON()
    return res.status(201).send(Payment)
  } catch (error) {
    return res.status(500).send(error)
  }
})

//  3. Отмена платежа
router.delete('/:id', async function (req, res, next) {
  try {
    let paymentId = req.params.id;
    let payment = await PaymentModel.findOne({ payment_uid: paymentId })
    if (!payment) {
      return res.status(404).send({ message: 'Платежа с индентификатором' + paymentId + 'в БД нет' });
    }
    payment = await PaymentModel.findOneAndUpdate({ payment_uid: paymentId }, {$set: {status: 'CANCELED'}});
    return res.status(202).send({ message: "Платёж отменен успешно" });
  } catch (err) {
    return res.status(500).send(err);
  }
})