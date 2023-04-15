// Complete Events Exercise
import * as http from "http"; //ES 6
// const http = require("http");

const port = 3000;

const server = http.createServer((req, res) => {

    const { url, method } = req;
    const chunks = [];

    // chunk is of type buffer
    req.on("data", (chunk) => { chunks.push(chunk) });
    req.on("end", () => {
        if (url == "/newsletter_sign_up" && method == "POST") {
            let reqBodyString;
            let reqBody;
            try {
                reqBodyString = Buffer.concat(chunks).toString();
                console.log(`Request Body String = ${reqBodyString}`);
                reqBody = JSON.parse(reqBodyString);
                console.log("Request Body =",reqBody);
                res.writeHead(200, { "Content-Type": "application/json" })
                res.write("{msg:Success!!}");
                res.end();

            } catch (error) {
                console.log("Error =",error);
                res.writeHead(404, { "Content-Type": "text/html" })
                res.write("<h1>404 Page Not Found<h1>");
                res.end();
            }
            res.end();
        }
        else {
            res.writeHead(404, { "Content-Type": "text/html" })
            res.write("<h1>404 Page Not Found<h1>");
            res.end();
        }
    });
});


server.listen(port, () => { console.log(`Server listening on port ${port}`) });