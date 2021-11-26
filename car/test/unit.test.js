//  start local server and init dependecies
require('./../app');
const config = require('./../config/config');
const serverAddress = config.serverAddress;

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const expect = chai.expect;
if (config.app.env == 'development')
    require('./../app');

const mongoose = require('mongoose');
const CarModel = mongoose.model('Car')

//  Раздел тестов

describe('Unit тесты', function () {
    let cars = []

    before(async function () {
        await CarModel.deleteMany({});
        let data = [{
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
            availability: false
        }]
        await CarModel.insertMany(data);
        cars = await CarModel.find({});
    })

    it('GET /', async () => {
        let answer = await chai.request(serverAddress)
            .get('/cars')
            .query({
                page: 2, size: 1, showAll: true
            })

        expect(answer).has.status(200);
        expect(answer.body.page).to.be.equal(2);
        expect(answer.body.pageSize).to.be.eq(1);
        expect(answer.body.totalElements).to.be.eq(cars.length)
        expect(answer.body.items).has.length(1);

        //  сравнение с машиной из data
        expect(answer.body.items[0].car_uid).to.be.eql(cars[1].car_uid);
        expect(answer.body.items[0].brand).to.be.eql(cars[1].brand);
        expect(answer.body.items[0].model).to.be.eql(cars[1].model);
        expect(answer.body.items[0].registration_number).to.be.eql(cars[1].registration_number);
    })

    it('GET /:id', async () => {
        let answer = await chai.request(serverAddress)
            .get('/cars/' + cars[0].car_uid)

        expect(answer).has.status(200);

        //  сравнение с машиной из data
        expect(answer.body.car_uid).to.be.eql(cars[0].car_uid);
        expect(answer.body.brand).to.be.eql(cars[0].brand);
        expect(answer.body.model).to.be.eql(cars[0].model);
        expect(answer.body.registration_number).to.be.eql(cars[0].registration_number);
    })

    it('PATCH /:id', async () => {
        let answer = await chai.request(serverAddress)
            .patch('/cars/' + cars[0].car_uid)
            .send({availability: false})

        expect(answer).has.status(200);

        //  сравнение с машиной из data
        expect(answer.body.car_uid).to.be.eql(cars[0].car_uid);
        expect(answer.body.brand).to.be.eql(cars[0].brand);
        expect(answer.body.model).to.be.eql(cars[0].model);
        expect(answer.body.registration_number).to.be.eql(cars[0].registration_number);
        expect(answer.body.availability).not.to.be.eq(cars[0].availability)
    })
});