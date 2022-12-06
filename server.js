const http = require('http');

const app = require("./app");

const  {mongoConnect } = require("./src/services/mongo")

const port = process.env.PORT || 5000;

const server = http.createServer(app)


async function startServer(){

    await mongoConnect()

    server.listen(port,()=>{
        console.log(`Server listening on port ${port}`)
    })
}

startServer()
