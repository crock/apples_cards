const WebSocket = require('ws');

const log = require('../../log')

const { WS_PORT } = process.env

const wss = new WebSocket.Server({ port: WS_PORT })

const events = []
const rooms = {}

const on = (
    name, 
    callback, 
) => events.push({
    name, 
    callback, 
    index: events.length,
})

const clearEvent = (index) => events[index] = null

wss.on('connection', ws => {
    log.success('api/middleware/ws-middleware.js', 'Client connected')

    ws.reply = json => ws.send( JSON.stringify(json) )

    ws.on('message', message => {
        let json

        try {
            json = JSON.parse(message)
        } catch { 
            return ws.reply({ 
                event: 'error', 
                data: 'malformed json' 
            })
        }

        const { event, data } = json

        if (!event) return ws.reply({ 
            event: 'error', 
            data: 'no event provided' 
        })

        for ( const { name, callback, index } of events.filter(Boolean) ) {
            if (event.includes(name)) {
                const { clear } = callback(ws, data) || {}
                if (clear) clearEvent(index)
            }
        }
    })
})

require('../game')({ 
    on, 
    rooms, 
    clearEvent,
})

log.success('api/middleware/ws-middleware.js', `WebSockets server started on port ${WS_PORT}`)

module.exports = (req, res, next) => {
    req.ws = { on, rooms, clearEvent }

    next()
}