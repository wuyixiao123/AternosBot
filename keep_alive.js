const http = require("http");
const express = require("express");
const app = express();

app.get("/", (request, response) => {
console.log("Ping Received");
response.sendStatus(200);
});

const server = http.createServer(app);
server.listen(5000, () => {
console.log("Server Started");
});