const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('./../../config/config')

module.exports = (app) => {
  app.use('/api/v1/rental', router);
};

// 1. Получение списка всех аренд пользователя
router.get('/', async (req, res, next) => {
  try {
    //  Формируем ссылку для обращения к конкретному обработчику у сервиса
    let url = config.services.rental + '/rental';

    //  Отправляем HTTP запрос к сервису 
    let answer = await axios.get(url, {
      headers: {
        username: req.headers['x-user-name']
      }
    });

    //  1.  Cформировать массив уникальных id автомобилей из всех рент
    let arrayIdAutos = {}
    for (item of answer.data) {
      arrayIdAutos[item.car_uid] = true
    }
    arrayIdAutos = Object.keys(arrayIdAutos);
    //  2.  Сформировать массив id платежей
    let arrayIdPayments = []
    for (item of answer.data) {
      arrayIdPayments.push(item.payment_uid)
    }
    //  3.  Получить все автомобили с указанными id
    url = config.services.cars + '/cars/';
    let actions = []
    for (item of arrayIdAutos) {
      actions.push(axios.get(url + item))
    }
    let autos = await Promise.all(actions)
    //  4.  Получить все платежи с указанными id
    url = config.services.payment + '/payment/';
    actions = []
    for (item of arrayIdPayments) {
      actions.push(axios.get(url + item))
    }
    let payments = await Promise.all(actions)
    //  5.  Формируем финальный ответ для пользователя
    for (item of answer.data) {
      //  5.1 Объединяем запись ренты с полной записью об автомобиле из ответа от сервиса автомобилей по id
      let rentCarId = item.car_uid;
      let auto = autos.find(function (elem) {
        if (elem.data.car_uid == rentCarId) {    //если в ренте id совпадёт с id авто
          return true
        }
      })
      //  5.2 Удаляем car_uid из rent'ы
      delete item.car_uid
      item.car = Object.assign({}, auto.data);   // копируем данные из объекта auto.data в новы пустой, чтобы разъединить их и удалить car_uid не у основного объекта, т.к. иначе у второго элемента цикла возникнет проюлема с пониманием car_uid. 
      //  5.3 Объединяем запись ренты с полной записью о платеже из ответа от сервиса платежей по id
      let paymentId = item.payment_uid
      let payment = payments.find(function (elem) {
        if (elem.data.payment_uid == paymentId) {
          return true
        }
      })
      //  5.4 Удаляем payment_uid из rent'ы 
      delete item.payment_uid
      item.payment = payment.data
      //  5.5 Формируем структуру ответа по документации
      delete item.car.power
      delete item.car.price
      delete item.car.type
      delete item.car.availability
      item.car.carUid = item.car.car_uid
      delete item.car.car_uid
      item.car.registrationNumber = item.car.registration_number
      delete item.car.registration_number

      item.payment.paymentUid = item.payment.payment_uid
      delete item.payment.payment_uid

      delete item.username
      item.rentalUid = item.rental_uid
      delete item.rental_uid
      item.dateFrom = new Date(item.date_from).toISOString().split('T')[0];
      delete item.date_from
      item.dateTo = new Date(item.date_to).toISOString().split('T')[0];
      delete item.date_to
    }
    //  Ответ от сервиса пересылаем пользователю
    return res.status(200).send(answer.data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err.message });
  }
});

// 2. Получение конкретной аренды пользователя
router.get('/:id', async (req, res, next) => {
  try {
    let url = config.services.rental + '/rental/' + req.params.id
    let answer = await axios.get(url, {
      headers: {
        username: req.headers['x-user-name']
      }
    });

    //  1.  Получить запись автомобиля по id
    url = config.services.cars + '/cars/' + answer.data.car_uid;
    let auto = await axios.get(url);
    //  2.  Получить запись платежа по id
    url = config.services.payment + '/payment/' + answer.data.payment_uid;
    let payment = await axios.get(url);
    //  3.  Формируем финальный ответ для пользователя
    let item = answer.data;
    //  3.1 Удаляем car_uid из rent'ы
    delete item.car_uid
    item.car = auto.data
    //  3.2 Удаляем payment_uid из rent'ы 
    delete item.payment_uid
    item.payment = payment.data

    //  3.3 Формируем структуру ответа по документации
    delete item.car.power
    delete item.car.price
    delete item.car.type
    delete item.car.availability
    item.car.carUid = item.car.car_uid
    delete item.car.car_uid
    item.car.registrationNumber = item.car.registration_number
    delete item.car.registration_number

    item.payment.paymentUid = item.payment.payment_uid
    delete item.payment.payment_uid

    delete item.username
    item.rentalUid = item.rental_uid
    delete item.rental_uid
    item.dateFrom = new Date(item.date_from).toISOString().split('T')[0];
    delete item.date_from
    item.dateTo = new Date(item.date_to).toISOString().split('T')[0];
    delete item.date_to

    //  Ответ от сервиса пересылаем пользователю
    return res.status(200).send(answer.data);
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

// 3. Завершение аренды
router.post('/:id/finish', async (req, res, next) => {
  try {
    let url = config.services.rental + '/rental/' + req.params.id;
    // 1. Необходима запись аренды для снятия резерва с авто
    let answer = await axios.get(url, {
      headers: {
        username: req.headers['x-user-name']
      }
    })
    // 2. Проверка статуса аренды на незавершённость
    if ('IN_PROGRESS' != answer.data.status) {
      res.status(204).send()
    }

    // 3. С автомобиля снимается резерв.
    url = config.services.cars + '/cars/' + answer.data.car_uid
    await axios.patch(url, {
      availability: true
    })

    // 4. В Rental Service аренда помечается завершенной (статус FINISHED).
    url = config.services.rental + '/rental/' + req.params.id + '/finish';
    await axios.patch(url, {}, {
      headers: {
        username: req.headers['x-user-name']
      }
    })

    res.status(204).send()
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

// 4. Отмена аренды
router.delete('/:id', async (req, res, next) => {
  try {
    let url = config.services.rental + '/rental/' + req.params.id;
    let answer = await axios.get(url, {
      headers: {
        username: req.headers['x-user-name']
      }
    })

    if ('IN_PROGRESS' != answer.data.status) {
      res.status(204).send()
      return;
    }

    url = config.services.cars + '/cars/' + answer.data.car_uid
    await axios.patch(url, { availability: true })

    // В Rental Service аренда помечается завершенной (статус CANCELED).
    url = config.services.rental + '/rental/' + req.params.id;
    await axios.delete(url, {
      headers: {
        username: req.headers['x-user-name']
      }
    })

    url = config.services.payment + '/payment/' + answer.data.payment_uid
    await axios.delete(url)

    return res.status(204).send()
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

// 5. Забронировать авто
router.post('/', async (req, res, next) => {
  try {
    // 1. Агрегатор проверяет поля из req.body на соответствие шаблону ниже
    let model = {
      carUid: req.body.carUid,
      dateFrom: req.body.dateFrom,
      dateTo: req.body.dateTo
    }

    if (req.body.carUid == undefined || req.body.dateFrom == undefined || req.body.dateTo == undefined) {
      return res.status(400).send({ message: 'Некорректные данные' })
    }

    // 2. Пойти за авто указанным в req.body.carUid
    url = config.services.cars + '/cars/' + model.carUid
    let answerAuto = await axios.get(url)

    // 3. Если авто недоступно, то ответить 400 и message
    if (answerAuto.data.availability == false) {
      return res.status(400).send({ message: 'Автомобиль недоступен для бронирования' })
    }

    // 4. Приводим dateFrom к числу 
    let dateTo = new Date(model.dateTo)
    // 5. Приводим dateTo к числу
    let dateFrom = new Date(model.dateFrom)
    // 6. Считаем количество дней аренды, как dateTo - dateFrom
    let daysOfRent = (dateTo - dateFrom) / (1000 * 60 * 60 * 24)

    // 7. Считаем сумму бронирования, как (dateTo - dateFrom) * car.price - разница даты в днях
    let priceOfBooking = daysOfRent * answerAuto.data.price

    // 8. Резервируем автомобиль
    await axios.patch(url, { availability: false })

    // 9. Создаем платеж с указанным price в сервисе payment
    url = config.services.payment + '/payment'
    let answerPayment = await axios.post(url, { price: priceOfBooking })

    // 10. Создаем аренду с указанными payment_uid (получен на шаге 9),dateTo,dateFrom, username
    url = config.services.rental + '/rental'
    let answerRent = await axios.post(url, {
      username: req.headers['x-user-name'],
      payment_uid: answerPayment.data.payment_uid,
      car_uid: model.carUid,
      date_from: dateFrom.getTime(),
      date_to: dateTo.getTime()
    })

    // 11. Формируем структуру ответа по документации
    answerRent.data.rentalUid = answerRent.data.rental_uid;
    delete answerRent.data.rental_uid;

    answerRent.data.carUid = answerRent.data.car_uid;
    delete answerRent.data.car_uid;

    answerRent.data.dateFrom = new Date(answerRent.data.date_from).toISOString().split('T')[0];
    delete answerRent.data.date_from;

    answerRent.data.dateTo = new Date(answerRent.data.date_to).toISOString().split('T')[0]
    delete answerRent.data.date_to;

    delete answerRent.data.username;

    delete answerRent.data.payment_uid;

    answerPayment.data.paymentUid = answerPayment.data.payment_uid
    delete answerPayment.data.payment_uid

    answerRent.data.payment = answerPayment.data
  
    res.status(200).send(answerRent.data)
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})