import { Hono } from 'hono'
import { testClient } from 'hono/testing'


const app = new Hono()
    .get('/', (c) => c.text('Hello Hono!'))
    .post('/message', async (c) => {
        return c.text('POST /')
    })

export default app


if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest
    it('test', async () => {
        const res = await testClient(app).index.$get()
        expect(await res.text()).toEqual('Hello Hono!')

    })

    it('test', async () => {
        const res = await testClient(app).message.$post({
            form: {
                title: 'Hello',
                body: 'Hono is a cool project',
            },
        })
        expect(await res.text()).toEqual('POST /')
    })
}