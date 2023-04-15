// Complete Events Exercise
import * as http from "http"; //ES 6
// const http = require("http");

const port = 3000;

const server = http.createServer((req, res) => {

    const { url, method } = req;
    const chunks = [];

    req.on("data", (chunk) => { chunks.push(chunk) })

    if (url == "/newsletter_sign_up" && method == "POST") {

    }
    else {
        res.writeHead(404, { "Content-Type": "text/html" })
        res.write("<h1>404 Page Not Found<h1>");
        res.end();
    }
});


server.listen(port, () => { console.log(`Server listening on port ${port}`) });