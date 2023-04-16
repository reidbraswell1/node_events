// Complete Events Exercise
import * as http from "http"; //ES 6
// const http = require("http");
import EventEmitter from "events";
import * as fs from "fs";

const port = 3000;
const eventEmitter = new EventEmitter();

// Create an event handler
const newsLetter = (signUpInfo) => {
    console.log("Sign up info =", signUpInfo);
    try {
        fs.appendFile("signUpInfo.txt", `${signUpInfo.name},${signUpInfo.email}\n`, (err) => {
            if (err) {
                console.log("fs.append error =", err);
            }
            else {
                console.log(signUpInfo, "saved successfully");
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}

// Assign the event handler to the event
eventEmitter.on("insert", newsLetter);

const server = http.createServer((req, res) => {

    const { url, method } = req;
    const chunks = [];

    // chunk is of type buffer
    req.on("data", (chunk) => { chunks.push(chunk); });
    req.on("end", () => {
        if (url == "/newsletter_sign_up" && method == "POST") {
            let reqBodyString;
            let reqBody;
            try {
                reqBodyString = Buffer.concat(chunks).toString();
                console.log(`Request Body String = ${reqBodyString}`);
                reqBody = JSON.parse(reqBodyString);
                console.log("Request Body =", reqBody);
                res.writeHead(200, { "Content-Type": "application/json" })
                res.write(`{"msg":"Success!!"}`);
                //res.write("{'msg':'success'}");
                res.end();
                eventEmitter.emit("insert", reqBody)

            } catch (error) {
                console.log("Error =", error);
                res.writeHead(200, { "Content-Type": "application/json" })
                res.write(`{"msg":"${error}"}`);
                res.end();
            }
            res.end();
        }
        else {
            res.writeHead(200, { "Content-Type": "text/html" })
            res.write("<!DOCTYPE html>\
                        <html>\
                        <h1>Newsletter Signup<h1>\
                        <form>\
                            <label for='name'>Name</label>\
                            <input id='name' type='text'/>\
                            <br></br>\
                            <label for='email'>Email</label>\
                            <input type='email'/>\
                        </form>\
                        </html>");
            res.end();
        }
    });
});


server.listen(port, () => { console.log(`Server listening on port ${port}`) });