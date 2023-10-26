import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { testClient } from 'hono/testing'
import { z } from 'zod'
import { logger } from 'hono/logger'
import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions'



const app = new Hono()
    .use('*', logger())
    .get('/', (c) => c.json({ message: 'Hello Hono!' }))
    .post('/message', zValidator(
        'json',
        z.object({
            type: z.number(),
            title: z.string(),
            body: z.string(),
        })
    ), async (c) => {
        const body = await c.req.json()
        console.log(body)
        return c.text('POST /')
    })
    .post("/interactions", async (c) => {
        const signature = c.req.header('X-Signature-Ed25519');
        const timestamp = c.req.header('X-Signature-Timestamp');
        const body = await c.req.raw.clone().text();

        const DISCORD_PUBLIC_KEY = "51e134c9651ac3ad5c9ea768fe6c50a8f3703131f440964f2305784698afc068"
        

        const isValidRequest =
            signature &&
            timestamp &&
            verifyKey(body, signature, timestamp, DISCORD_PUBLIC_KEY);

        if (!isValidRequest) {
            console.log('Invalid request signature');
            return c.text('Bad request signature', 401);
        }

        const message = await c.req.json()
        console.log(message)

        if (message.type === InteractionType.PING) {
            console.log('Handling Ping request')
            return c.json({ type: InteractionResponseType.PONG })
        }

        if (message.type === InteractionType.APPLICATION_COMMAND) {
            switch (message.data.name.toLowerCase()) {
                case "awwww": {
                  console.log('handling cute request');
                  return c.json({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                      content: "https://cfm-cts.connpass.com/event/297920/",
                    },
                  });
                }

                default:
                  console.error('Unknown Command');
                  return c.json({ error: 'Unknown Type' }, { status: 400 });
              }
        }


        return c.json({ type: InteractionResponseType.PONG })
    })

export default app


if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest
    it('test', async () => {
        const res = await testClient(app).index.$get()
        expect(await res.text()).toEqual('{"message":"Hello Hono!"}')

    })

    it('test', async () => {
        const res = await testClient(app).message.$post({
            json: {
                type: 2,
                title: 'Hello',
                body: 'Hono is a cool project',
            },
        })
        expect(await res.text()).toEqual('POST /')
    })

    it('test', async () => {
        const res = await testClient(app).interactions.$post({ json: { type: 2 }, })
        expect(await res.text()).toEqual('POST /interactions')
    })

    it('test', async () => {
        const res = await testClient(app).interactions.$post({ json: { type: InteractionType.PING }, })
        expect(await res.text()).toEqual('{"type":1}')
    })
}