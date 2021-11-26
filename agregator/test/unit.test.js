require('./../app');
const config = require('./../config/config');
const serverAddress = config.serverAddress;
const nock = require('nock');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const expect = chai.expect;
const uuid = require('uuid').v4;
if (config.app.env == 'development')
    require('./../app');

describe('Unit тесты', function () {
    before(async () => {

        //  CARS
        nock(config.services.cars)
            .persist(true)
            .get('/cars')
            .query(true)
            .reply(200, (uri) => {
                let page = uri.split('page=');
                let size = uri.split('size=');
                if (page.length > 1)
                    page = Number(page[1].split('&')[0]);
                else
                    page = 0;

                if (size.length > 1)
                    size = Number(size[1].split('&')[0]);
                else
                    size = 15;

                return {
                    page: page,
                    pageSize: size,
                    totalElements: 2,
                    items: [{
                        car_uid: '12345678',
                        brand: 'Audi',
                        model: 'A1',
                        registration_number: 'A001AA750',
                        power: 1,
                        price: 300600,
                        type: 'SEDAN',
                        availability: true
                    },
                    {
                        car_uid: '87654321',
                        brand: 'Mercedes',
                        model: 'B4',
                        registration_number: 'A678AA750',
                        power: 99,
                        price: 890,
                        type: 'SUV',
                        availability: true
                    }]
                }
            });

        nock(config.services.cars)
            .persist(true)
            .get(/\/cars\/\w+/)          //  /cars/:id
            .reply(200, function (uri) {
                let carUid = uri.split('/cars/');       //  carUid = ["",":id"]
                return {
                    car_uid: carUid[carUid.length - 1],
                    brand: 'Audi',
                    model: 'A1',
                    registration_number: 'A001AA750',
                    power: 1,
                    price: 300600,
                    type: 'SEDAN',
                    availability: true
                }
            })

        nock(config.services.cars)
            .persist(true)
            .patch(/\/cars\/\w+/)
            .reply(200, function (uri, body) {
                let carUid = uri.split('/cars/');
                return {
                    car_uid: carUid[carUid.length - 1],
                    brand: 'Audi',
                    model: 'A1',
                    registration_number: 'A001AA750',
                    power: 1,
                    price: 300600,
                    type: 'SEDAN',
                    availability: body.availability
                }
            })

        //  PAYMENT
        nock(config.services.payment)
            .persist(true)
            .get(/\/payment\/\w+/)      //  /payment/:id
            .reply(200, function (uri) {
                let paymentId = uri.split('/payment/');

                return {
                    payment_uid: paymentId[paymentId.length - 1],
                    status: 'PAID',
                    price: 10000
                }
            })

        nock(config.services.payment)
            .persist(true)
            .post('/payment')
            .reply(201, function (uri, body) {

                return {
                    payment_uid: uuid(),
                    status: 'PAID',
                    price: body.price
                }
            })

        nock(config.services.payment)
            .persist(true)
            .delete(/\/payment\/\w+/)
            .reply(200, function (uri) {
                let paymentUid = uri.split('/payment/');
                return {
                    payment_uid: paymentUid[paymentUid.length - 1],
                    status: 'CANCELED',
                    price: 12345
                }
            })


        //  RENTAL
        nock(config.services.rental)
            .persist(true)
            .get('/rental')
            .reply(200, function (uri) {
                return [{
                    rental_uid: '4567890',
                    username: this.req.headers.username,
                    car_uid: '123456789',
                    payment_uid: 'edfcvbnm',
                    status: "IN_PROGRESS",
                    date_from: 0,
                    date_to: 1000,
                }]
            })

        nock(config.services.rental)
            .persist(true)
            .post('/rental')
            .reply(201, function (uri, body) {
                return {
                    username: body.username,
                    payment_uid: body.payment_uid,
                    car_uid: body.car_uid,
                    date_from: body.date_from,
                    date_to: body.date_to,
                    status: 'IN_PROGRESS',
                    rental_uid: uuid()
                }
            })

        nock(config.services.rental)
            .persist(true)
            .get(/\/rental\/\w+/)
            .reply(200, function (uri) {
                let rentalUid = uri.split('/rental/');
                return {
                    username: this.req.headers.username,
                    payment_uid: '45678',
                    car_uid: '56789876',
                    date_from: 2345678,
                    date_to: 456789,
                    status: 'IN_PROGRESS',
                    rental_uid: rentalUid[rentalUid.length - 1]
                }
            })

        nock(config.services.rental)
            .persist(true)
            .delete(/\/rental\/\w+/)
            .reply(200, function (uri) {
                let rentalUid = uri.split('/rental/');
                return {
                    rentalUid: rentalUid[rentalUid.length - 1],
                    status: 'CANCELED',
                    username: this.req.headers.username
                }
            })

        nock(config.services.rental)
            .persist(true)
            .patch(/\/rental\/\w+\/finish/)
            .reply(200, function (uri) {
                let rentalUid = uri.split('/rental/');  //  ["", ":id/finish"]
                rentalUid = rentalUid[rentalUid.length - 1].split('/finish');   // [":id", ""]
                return {
                    rentalUid: rentalUid[0],
                    status: 'FINISHED',
                    username: this.req.headers.username
                }
            });
    })

    // 1. Получить список всех доступных для бронирования автомобилей
    it('GET /cars', async () => {
        let queries = {
            size: 10,
            page: 1
        };
        let answer = await chai.request(serverAddress)
            .get('/api/v1/cars')
            .query(queries);

        expect(answer).has.status(200);
        expect(answer.body.page).to.be.eql(queries.page);
        expect(answer.body.pageSize).to.be.eql(queries.size);
        expect(answer.body.totalElements).to.be.eql(2);
        expect(answer.body.items).has.length(2);
    })

    // 2. Получить информацию о всех арендах пользователя
    it('GET /rental', async () => {
        let answer = await chai.request(serverAddress)
            .get('/api/v1/rental')
            .set('X-USER-NAME', 'Marina')

        expect(answer).has.status(200);
        expect(answer.body).has.length(1);
        expect(answer.body[0].rentalUid).is.exist;
        expect(answer.body[0].status).is.exist;
        expect(answer.body[0].car).is.exist;
        expect(answer.body[0].car.carUid).is.exist;
        expect(answer.body[0].payment).is.exist;
        expect(answer.body[0].payment.paymentUid).is.exist;
    })

    // 3. Забронировать автомобиль
    it('POST /rental', async () => {
        let answer = await chai.request(serverAddress)
            .post('/api/v1/rental')
            .set('X-USER-NAME', 'Marina')
            .send({
                carUid: 'rfvgbnmkl',
                dateFrom: '2021-10-10',
                dateTo: '2021-10-11'
            })

        expect(answer).has.status(200);
        expect(answer.body.rentalUid).is.exist;
        expect(answer.body.status).to.be.eql('IN_PROGRESS');
        expect(answer.body.carUid).is.exist;
        expect(answer.body.dateFrom).is.exist;
        expect(answer.body.dateTo).is.exist;
        expect(answer.body.payment).is.exist;
        expect(answer.body.payment.paymentUid).is.exist;
        expect(answer.body.payment.status).to.be.eql('PAID');
    })

    // 4. Информация по конкретной аренде пользователя
    it('GET /rental/:id', async () => {
        let answer = await chai.request(serverAddress)
            .get('/api/v1/rental/124567')
            .set('X-USER-NAME', 'Marina')

        expect(answer).has.status(200);
        expect(answer.body.rentalUid).to.be.eq('124567');
        expect(answer.body.status).to.be.eq("IN_PROGRESS");
        expect(answer.body.dateFrom).is.exist;
        expect(answer.body.dateTo).is.exist;
        expect(answer.body.car).is.exist;
        expect(answer.body.payment).is.exist;
    })

    // 5. Отмена аренды автомобиля
    it('DELETE /rental/:id', async () => {
        let answer = await chai.request(serverAddress)
            .delete('/api/v1/rental/12345')
            .set('X-USER-NAME', 'Marina')

        expect(answer).has.status(204);
    })

    // 6. Завершение аренды автомобиля
    it('POST /rental/:id/finish', async () => {
        let answer = await chai.request(serverAddress)
            .post('/api/v1/rental/1234568765/finish')
            .set('X-USER-NAME', 'Marina')

        expect(answer).has.status(204);
    })
});