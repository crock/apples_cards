export default ({ ws, setWs }) => {
    const events = []
    const client = new WebSocket( `ws://${window.location.hostname}:${process.env.WS_PORT}`)

    const send = (json) => {
        client.send(JSON.stringify(json))
    }

    const on = (name, callback) => { 
        events.push({
            name,
            callback,
            index: events.length
        })
    }

    const clearEvent = (index) => events[index] = null

    client.onopen = () => {
        setWs({
            open: true,
            send,
            on,
        })
    }
    
    client.onmessage = ({ data: string }) => {
        let json

        try {
            json = JSON.parse(string)
        } catch {
            return console.error('Invalid JSON from server')
        }

        const { event, data } = json

        for ( const { name, callback, index } of events.filter(Boolean) ) {
            if (event.includes(name)) {
                const { clear } = callback(data) || {}
                if (clear) clearEvent(index)
            }
        }
    }
}