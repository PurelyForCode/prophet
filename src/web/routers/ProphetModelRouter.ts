import { Hono } from "hono"
const app = new Hono()

app.get()
app.post()
app.delete()
app.patch()

export default app
