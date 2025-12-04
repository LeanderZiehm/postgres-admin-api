import {get,add} from "./database.ts";
import dotenv from "dotenv";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Fastify from 'fastify'

dotenv.config();

const port = 3000;
const app = Fastify({
  logger: true,
})

const swaggerOptions = {
    swagger: {
        info: {
            title: "BookmarksDB",
            description: "My Description.",
            version: "1.0.0",
        },
        host: "localhost",
        schemes: ["http", "https"],
        consumes: ["application/json"],
        produces: ["application/json"],
        tags: [{ name: "Default", description: "Default" }],
    },
};

const swaggerUiOptions = {
    routePrefix: "/docs",
    exposeRoute: true,
};

app.register(fastifySwagger, swaggerOptions);
app.register(fastifySwaggerUi, swaggerUiOptions);

app.register((app, options, done) => {
    app.get("/", {
        schema: {
            tags: ["Default"],
            response: {
                200: {
                    type: "object",
                    properties: {
                        anything: { type: "string" },
                    },
                },
            },
        },
        handler: (req, res) => {
            res.send({ anything: "meaningfull" });
        },
    });



    app.get('/hello', (request, reply) => {
      reply.send({ hello: 'world' })
    })

    app.get('/get', async (request, reply) => {
        const res = await get();
        reply.send(res)
    })

    app.get('/add/:text', async (request, reply) => {
        await add(request.params.text)
    })


    done();
});

app.listen(
    {
        port: Number(process.env.APP_PORT) ?? 3000, // Pulled from env file.
        host: '',
    },
    (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    }
);


export default app;