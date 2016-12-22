var assert = require('assert')
var Net = require('message-network').Net
var Node = require('message-network').Node
var HttpGate = require('../../lib/HttpGate')

describe('HttpGate class', function () {

    it('is used as http transport gate', function (done) {
        var net1 = Net()
        var net2 = Net()

        var node1 = Node()
        var node2 = Node()

        var gate1 = HttpGate({
            transportOptions: {
                port: 3002,
            },
            listen: 3001
        })
        var gate2 = HttpGate({
            transportOptions: {
                port: 3001,
            },
            listen: 3002,
        })

        net1
            .connect('node1', node1)
            .connect('gate1', gate1)

        net2
            .connect('node2', node2)
            .connect('gate2', gate2)

        gate1.listen({
            to: 'node1',
            topic: 'test',
        })

        node2.listen({
            to: {
                gate: 'gate2',
                node: 'node1',
            },
            topic: 'test',
            success: function (data, context) {
                context.reply(5)
            },
        })

        node1.send({
            to: {
                gate: 'gate1',
                node: 'node2',
            },
            topic: 'test',
            success: function (data, context) {
                assert.equal(data, 5)
                done()
            },
        })

    })

    describe('_transfer method', function () {

    })

})
