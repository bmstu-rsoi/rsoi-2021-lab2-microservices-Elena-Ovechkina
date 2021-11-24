const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('./../../config/config')

module.exports = (app) => {
  app.use('/api/v1/cars', router);
};

//  пример запроса: /cars? 10&page=20&showAll=true
// 1. Получить список всех доступных для бронирования автомобилей
router.get('/', async (req, res, next) => {
  try {
    let params = {};

    if (req.query.size) {
      params.size = req.query.size;
    }

    if (req.query.page) {
      params.page = req.query.page;
    }

    if (req.query.showAll == 'true') {
      params.showAll = true
    }

    url = config.services.cars + '/cars'
    let answer = await axios.get(url, {
      params: params
    })

    //  Формирование ответа
    answer.data.items = answer.data.items.map(function (car) {
      return {
        "carUid": car.car_uid,
        "brand": car.brand,
        "model": car.model,
        "registrationNumber": car.registration_number,
        "power": car.power,
        "type": car.type,
        "price": car.price,
        "available": car.availability
      }
    });

    res.status(200).send(answer.data);
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})