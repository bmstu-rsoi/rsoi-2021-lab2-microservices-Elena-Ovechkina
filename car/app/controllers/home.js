const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CarModel = mongoose.model('Car');

module.exports = (app) => {
  app.use('/cars', router);
};

// 1. Получить список всех доступных для бронирования автомобилей
router.get('/', async function (req, res, next) {
  try {
    let filter = { availability: true };
    let page = 0;
    let size = 15;

    if (req.query.size) {
      size = Number.parseInt(req.query.size)
    }

    if (req.query.page) {                           // query параметры - настройки для запроса. Они не меняют рез-т, а уточняют его.
      page = (Number.parseInt(req.query.page) - 1) * size;       // т.к. в req.query все значения String, делаем Number, исп. иетод parseInt
    }

    if (req.query.showAll == "true") {
      delete filter.availability;
    }

    let actions = [
      CarModel.find(filter)    //  Получение документов из коллекции
        .skip(page)            //  Сколько записей в БД пропустить до получения результата
        .limit(size),          //  Сколько записей из БД берется для формирования результат
      CarModel.count(filter)   //  Получение количества документов в коллекции
    ];
    //  Ждем результата из БД
    actions = await Promise.all(actions);
    //  Помещаем автомобили в переменную cars
    let cars = actions[0];
    //  Помещаем их количество в БД в переменную count
    let count = actions[1];

    //  преобразование документов в удобный формат
    cars = cars.map(function (item) {
      return item.toJSON();
    });

    //  ответ пользователю/агрегатору со списком блюд
    return res.status(200).send({
      page: page,
      pageSize: size,
      totalElements: count,
      items: cars
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

// 2. Получить информацию по конкретному бронированию авто
router.get('/:id', async function (req, res, next) {
  try {
    //  Получаем идентификатор авто
    const carId = req.params.id;
    console.log(carId);

    //  Получаем авто из БД
    let auto = await CarModel.findOne({ car_uid: carId });

    //  Если авто нет в БД
    if (!auto) {
      return res.status(404).send({
        message: 'Авто с идентификатором ' + carId + ' в БД нет'
      });
    }

    //  Отправляем созданный документ в формате JSON объекта
    return res.status(200).send(auto.toJSON());
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

// 3. Изменить статус автомобиля 
router.patch('/:id', async function (req, res, next) {
  try {
    // 1.  Получаем идентификатор авто из запроса
    let id = req.params.id;
    // 2.  Получаем новый статус доступности "availability"
    let availability = req.body.availability;
    // 3.  Ищем и обновляем авто по идентификатору и изменяем его availability на новое
    let auto = await CarModel.findOneAndUpdate( {car_uid: id}, {$set: {availability: availability}}, {new: true, runValidators: true})
    // 4.  Если авто есть, то отвечаем на запрос (200) и данные авто
    if(auto) res.status(200).send(auto.toJSON())
    // 5.  Иначе 404 и сообщение
    else res.status(404).send({message: "Произошла ошибка"})
  } catch (err) {
    return res.status(500).send(err);
  }
});