// Complete Events Exercise
import * as http from "http"; //ES 6
// const http = require("http");

const port = 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, {"Content-Type": "text/html"})
    res.write("Working");
    res.end();
});


server.listen(port, () => { console.log(`Server listening on port ${port}`)});