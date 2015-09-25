var chai = require('chai'); //* Chai — библиотека поддерживает разнообразные функции для проверок.
var chaiAsPromised = require('chai-as-promised');
//* Chai-as-promised: Плагин для Chai, реально полезный при работе с функциями возвращающими promise.
//*  Он дает нам возможность писать так: expect(foo).to.be.fulfilled, или expect(foo).to.eventually.equal(bar).
chai.use(chaiAsPromised);
var expect = chai.expect; //* выносим expect в глобальную область

var mockery = require('mockery'); //*

var moduleUnderTest = '../api/api.js';
mockery.registerAllowable(moduleUnderTest);

var mongoMock = {
    test: function () {
        return 'mocked test';
    }
};
mockery.registerMock('../mongodb/mongodb.js', mongoMock);

mockery.enable({useCleanCache: true});


var api = require(moduleUnderTest);

describe('Socket Server API', function () {
    it('Function connect', function () {
        expect(api.connected({id: 'test'})).to.deep.equal({
            type: 'user_connected',
            data: {
                userId: 'test'
            }
        });
    });
    it('Function disconnect', function () {
        expect(api.disconnected({id: 'test'})).to.deep.equal({
            type: 'user_disconnected',
            data: {
                userId: 'test'
            }
        });
    });

    describe('Function processMessage', function () {
        var testUser = null;

        //* beforeEach позволяет выполнять что то перед тестом
        beforeEach(function () {
            testUser = {id: 'user'};
        });

        it('unknown command', function (done) {
            var command = {
                type: 'unknown'
            };
            var messageTest = { //DE изменил тут message на messageTest
                type: 'status',
                data: {
                    status: 'error',
                    message: 'unknown command'
                }
            };
            var res = api.processMessage(testUser, command);
            res.then(function() {
                done('Promise should be rejected');
            }, function(message) {
                expect(message).to.deep.equal(messageTest); //DE изменил тут message на messageTest
                done();
            });
        });
        // DE серверные тесты для типа сообщения Authenticate.authenticated,
        it('Authenticate.authenticated', function (done) {
            var command = {
                type: 'authenticate'
            };

            var messageTest = {
                user: testUser,
                message: {
                    type: 'authenticated',
                    data: {
                        user: testUser
                    }
                }

            };
            var res = api.processMessage(testUser, command);
            res.then(function(message) {
                expect(message).to.deep.equal(messageTest);
                done();
            },function() {
                done('Promise should be resolved');
            });
        });
    });
});