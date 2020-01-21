import { useState, useEffect } from 'react'
import Head from 'next/head'
import axios from 'axios'
import WSConnector from '../scripts/ws-connector'
import '../sass/global.sass'

export default ({ Component, pageProps }) => {
    const [ws, setWs] = useState({ open: false })
    const [nickname, setNickname] = useState(null)
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        if (process.browser) {
            WSConnector({ ws, setWs })
        }
    }, [])

    useEffect(() => {
        axios('/api/nickname/get').then(
            ({ data }) => setNickname(data.nickname)
        ).catch(() => setNickname(false))
    }, [])

    useEffect(() => {
        if (ws.open && nickname) {
            ws.on('error', console.error)

            axios('/api/rooms/connect').then(
                ({ data: { token } }) => {
                    ws.send({
                        event: 'connect',
                        data: { token },
                    })

                    ws.on('connected', () => setConnected(true))
                }
            ).catch(console.error)
        }
    }, [ws, nickname])

    return (
        <>
            <Head>
                <title>CAH</title>
                <link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet" />
                <meta name="theme-color" content="#272727"></meta> 
            </Head>
            <Component 
                {...pageProps} 
                ws={ws} 
                nickname={nickname} 
                setNickname={setNickname} 
                connected={connected}
            />
        </>
    )
}