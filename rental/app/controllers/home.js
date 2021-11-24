const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const RentalModel = mongoose.model('Rental');
const uuid = require('uuid').v4;

module.exports = (app) => {
  app.use('/rental', router);
};

// 1. Получение списка всех аренд пользователя
router.get('/', async (req, res, next) => {
  try {
    //  1. Получаем имя пользователя из header['username']
    let username = req.headers.username
    //  2. Ищем все документы у которых username == username
    let rents = await RentalModel.find({ username: username })
    //  3. Преобразуем список аренд в формат пригодных для передачи (toJSON)
    for (item of rents) {
      item = item.toJSON()
    }
    //  4. Отвечаем на запрос список аренд
    return res.status(200).send(rents)
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
});

// 2. Получение конкретной аренды пользователя
router.get('/:id', async (req, res, next) => {
  try {
    let id = req.params.id
    let username = req.headers.username

    let Onerent = await RentalModel.findOne({ rental_uid: id, username: username })
    if (Onerent) {
      Onerent = Onerent.toJSON()
      res.status(200).send(Onerent)
    }
    else res.status(404).send({ message: "Запись в БД отсутствует" })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

// 3. Завершение аренды
router.patch('/:id/finish', async (req, res, next) => {
  try {
    //  1. Получить id ренты из запроса
    let id = req.params.id;
    let username = req.headers.username;
    //  2. Обновить ренту по этому id и установить у него новый статус 'FINISHED'
    let updateRent = await RentalModel.findOneAndUpdate({
      rental_uid: id,
      username: username
    }, {
      $set: { 
        status: 'FINISHED'
      }
    },{
      new: true,
      runValidators: true
    })
    //  3. Если обновление успешно, вернуть ответ (200) с данными ренты
    if (updateRent) res.status(200).send(updateRent.toJSON())
    //  4. Иначе (404) и сообщение
    else res.status(404).send({message: "Не получилось завершить аренду"})
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

// 4. Отмена аренды
router.delete('/:id', async (req, res, next) => {
  try {
    //  1. Получить id ренты из запроса
    let id = req.params.id;
    let username = req.headers.username;
    //  2. Обновить ренту по этому id и установить у него новый статус 'CANCELED'
    let updateRent = await RentalModel.findOneAndUpdate({
      rental_uid: id,
      username: username
    }, {
      $set: { 
        status: 'CANCELED'
      }
    },{
      new: true,
      runValidators: true
    })
    //  3. Если обновление успешно, вернуть ответ (200) с данными ренты
    if (updateRent) res.status(200).send(updateRent.toJSON())
    //  4. Иначе (404) и сообщение
    else res.status(404).send({message: "Не получилось завершить аренду"})
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

// 5. Забронировать авто
router.post('/', async (req, res, next) => {
  try {
    //  1. Формируем объект по данным из тела запроса
    let data = {
      username: req.body.username,
      payment_uid: req.body.payment_uid,
      car_uid: req.body.car_uid,
      date_from: req.body.date_from,
      date_to: req.body.date_to,
    };
    //  2. Генерируем rental_uid и добавляем в запись
    data.rental_uid = uuid();
    //  3. В запись добавляем статус 'IN_PROGRESS'
    data.status = 'IN_PROGRESS';
    let Rental = new RentalModel(data);
    //  4. Проверяем документ
    await Rental.validate()
    //  5. Сохраняем документ
    let doc = await Rental.save()
    //  6. Отвечаем на запрос (201) и данные записи
    res.status(201).send(doc.toJSON())
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message })
  }
})