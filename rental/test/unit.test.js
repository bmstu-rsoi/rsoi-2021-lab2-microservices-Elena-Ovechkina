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
const RentalModel = mongoose.model('Rental')

//  Раздел тестов

describe('Unit тесты', function () {
    let rental = []

    before(async function () {
        await RentalModel.deleteMany({});
        let data = [{
            rental_uid: 56,
            username: 'Vas9',
            payment_uid: '380',
            car_uid: '039',
            date_from: 1633121648000,
            date_to: 1635713648000,
            status: 'IN_PROGRESS',
        },
        {
            rental_uid: 90,
            username: 'Irina',
            payment_uid: '1909',
            car_uid: '38201',
            date_from: 1635800048000,
            date_to: 1638392048000,
            status: 'FINISHED',
        }]
        await RentalModel.insertMany(data);
        rental = await RentalModel.find({});
    })

    it('GET /', async () => {
        const username = rental[0].username;   // это 'Вася' (чтобы не зависить от изменений в модели)
        let answer = await chai.request(serverAddress)
            .get('/rental')
            .set('username', username)

        expect(answer).has.status(200);

        let Vasya = rental.filter(function (item) {
            if (item.username == username) {
                return true
            }
        })
        expect(answer.body.length).to.be.eql(Vasya.length);
        expect(answer.body[0].rental_uid).to.be.eql(Vasya[0].rental_uid)
        expect(answer.body[0].status).to.be.eql(Vasya[0].status);
        expect(answer.body[0].date_from).to.be.eql(Vasya[0].date_from);
        expect(answer.body[0].date_to).to.be.eql(Vasya[0].date_to)
        expect(answer.body[0].payment_uid).to.be.eql(Vasya[0].payment_uid)
        expect(answer.body[0].car_uid).to.be.eql(Vasya[0].car_uid)
    });

    it('GET /:id', async () => {
        let answer = await chai.request(serverAddress)
            .get('/rental/' + rental[0].rental_uid)
            .set('username', rental[0].username)

        expect(answer).has.status(200);
        expect(answer.body.rental_uid).to.be.eql(rental[0].rental_uid)
        expect(answer.body.status).to.be.eql(rental[0].status);
        expect(answer.body.date_from).to.be.eql(rental[0].date_from);
        expect(answer.body.date_to).to.be.eql(rental[0].date_to)
        expect(answer.body.payment_uid).to.be.eql(rental[0].payment_uid)
        expect(answer.body.car_uid).to.be.eql(rental[0].car_uid)
    })

    it('PATCH /:id/finish', async () => {
        let answer = await chai.request(serverAddress)
            .patch('/rental/' + rental[1].rental_uid + '/finish')
            .set('username', rental[1].username)

        expect(answer).has.status(200);
        expect(answer.body.rental_uid).to.be.eql(rental[1].rental_uid)
        expect(answer.body.status).to.be.eql('FINISHED');
        expect(answer.body.date_from).to.be.eql(rental[1].date_from);
        expect(answer.body.date_to).to.be.eql(rental[1].date_to)
        expect(answer.body.payment_uid).to.be.eql(rental[1].payment_uid)
        expect(answer.body.car_uid).to.be.eql(rental[1].car_uid)
    })

    it('DELETE /:id', async () => {
        let answer = await chai.request(serverAddress)
            .delete('/rental/' + rental[1].rental_uid)
            .set('username', rental[1].username)

        expect(answer).has.status(200);
        expect(answer.body.rental_uid).to.be.eql(rental[1].rental_uid)
        expect(answer.body.status).to.be.eql('CANCELED');
        expect(answer.body.date_from).to.be.eql(rental[1].date_from);
        expect(answer.body.date_to).to.be.eql(rental[1].date_to)
        expect(answer.body.payment_uid).to.be.eql(rental[1].payment_uid)
        expect(answer.body.car_uid).to.be.eql(rental[1].car_uid)
    })

    it('POST /', async () => {
        let answer = await chai.request(serverAddress)
            .post('/rental/')
            .set('username', rental[1].username)
            .send({
                username: 'Игорь',
                payment_uid: '345678',
                car_uid: '7654e',
                date_from: 1609534448000,
                date_to: 1609534448779,
            })
            
        expect(answer).has.status(201);
        let rent = await RentalModel.findOne({rental_uid: answer.body.rental_uid})
        expect(answer.body.rental_uid).to.be.eql(rent.rental_uid)
        expect(answer.body.status).to.be.eql('IN_PROGRESS');
        expect(answer.body.username).to.be.eql('Игорь');
        expect(answer.body.date_from).to.be.eql(rent.date_from);
        expect(answer.body.date_to).to.be.eql(rent.date_to)
        expect(answer.body.payment_uid).to.be.eql(rent.payment_uid)
        expect(answer.body.car_uid).to.be.eql(rent.car_uid)
    })
});