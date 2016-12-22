var Gate = require('message-network').Gate
var inherits = require('util').inherits
var defualtTransport = require('http')

module.exports = HttpGate

inherits(HttpGate, Gate)

function HttpGate (options) {

    if (!(this instanceof HttpGate)) {
        return new HttpGate(options)
    }

    options = options || {}

    Gate.call(this, options)

    this.transport = options.transport || defualtTransport
    this.transportOptions = options.transportOptions || {}
    if (options.listen) {

        var gate = this

        this.transport.createServer(function (req, res) {
            var buffer
            req.on('data', function (data) {
                if (!buffer) { buffer = data }
                else { buffer = Buffer.concat(buffer, data) }
            })

            function onError (e) {
                // gate.transfer({
                //     isRefuse: true,
                //     externalId: data.externalId,
                // })
            }

            req.once('error', onError)
            req.once('end', function () {
                res.end()

                var data
                if (!buffer) { data = {} }
                else { data = buffer.toString() }
                try {
                    data = JSON.parse(data)
                    gate.receive(data)
                } catch (e) {
                    onError(e)
                }
            })
        })
        .listen(options.listen)
    }
}

HttpGate.prototype._transfer = function (data) {
    var gate = this
    function onError (e) {
        gate.receive({
            id: data.externalId,
            externalId: data.id,
            isRefuse: true,
            data: e,
        })
    }

    var strData

    try {
        strData = JSON.stringify(data)
    } catch (e) {
        onError(e)
        return
    }
    this.transportOptions.headers = {'Content-Length': Buffer.byteLength(strData)}
    var req = this.transport.request(this.transportOptions)

    req.once('error', onError)
    req.write(strData)
    req.end()
}
