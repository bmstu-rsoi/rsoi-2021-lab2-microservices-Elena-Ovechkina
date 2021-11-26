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
const PaymentModel = mongoose.model('Payment')

//  Раздел тестов

describe('Unit тесты', function () {
    let payment = []

    before(async function () {
        await PaymentModel.deleteMany({});
        let data = [{
            payment_uid: '1039-5789',
            status: 'PAID',
            price: 807120
        },
        {
            payment_uid: '7593-5678',
            status: 'CANCELED',
            price: 78903607
        }]
        await PaymentModel.insertMany(data);
        payment = await PaymentModel.find({});
    })

    it('GET /:id', async () => {
        let answer = await chai.request(serverAddress)
            .get('/payment/' + payment[0].payment_uid)

        expect(answer).has.status(200);

        //  сравнение с payment из data
        expect(answer.body.payment_uid).to.be.eql(payment[0].payment_uid);
        expect(answer.body.status).to.be.eql(payment[0].status);
        expect(answer.body.price).to.be.eql(payment[0].price);
    })

    it('POST /', async () => {
        let answer = await chai.request(serverAddress)
            .post('/payment')
            .send({ price: 465789 })

        expect(answer).has.status(201);

        //  сравнение с payment из data
        let trueId = await PaymentModel.findOne({ payment_uid: answer.body.payment_uid })
        expect(answer.body.payment_uid).to.be.eql(trueId.payment_uid);
        expect(answer.body.status).to.be.eql('PAID');
        expect(answer.body.price).to.be.eql(465789);
    })

    it('DELETE /:id', async () => {
        let answer = await chai.request(serverAddress)
            .delete('/payment/' + payment[0].payment_uid)

        expect(answer).has.status(202);

        //  сравнение с машиной из data
        let verifiedPayment = await PaymentModel.findOne({ payment_uid: payment[0].payment_uid });
        expect(verifiedPayment.status).to.be.eql('CANCELED');
    })
});