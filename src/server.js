// Complete Events Exercise
import * as http from "http"; //ES 6
// const http = require("http");
import EventEmitter from "events";
import * as fs from "fs";
import ejs from "ejs";

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
    console.log("url=", url)
    // chunk is of type buffer
    req.on("data", (chunk) => { chunks.push(chunk); });
    req.on("end", () => {
        switch (url) {
            case "/":
                console.log(`--- Begin Case ${url} Route ---`);
                renderHomepage(req, res);
                console.log(`--- End Case ${url} Route ---`);
                break;
            case "/styles/signUpStyle.css":
                console.log(`--- Begin Case ${url} Route ---`);
                signUpStyle(req, res);
                console.log(`--- End Case ${url} Route ---`);
                break;
                break;
            case "/styles/errorStyle.css":
                console.log(`--- Begin Case ${url} Route ---`);
                errorStyle(req, res);
                console.log(`--- End Case ${url} Route ---`);
                break;
            case "/newsletter_sign_up":
                switch (method) {
                    case "POST":
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
                        break;
                    default:
                        console.log(`--- Begin Case ${url} Route ---`);
                        renderErrorPage(req, res, `URL ${url} ${req.method} method not allowed.`);
                        console.log(`--- End Case ${url} Route ---`);
                        break;
                }
                break;
            default:
                renderErrorPage(req,res, `URL ${url} not found on this server`);
                break;
        }
        res.end();
    });
});

// Process a POST request
const processPostRequest = (req, res, body) => {
    console.log(`--- Begin function processPostRequest() ---`);
    console.log(`body = ${body}`);
    const params = new URLSearchParams(`?${body}`);
    console.log(params);
    // Redirect to index page if no parameters
    if (!params.has("name") ||
        !params.has("email")) {
        // Redirect to home page
        res.writeHead(302, {
            location: "/",
        });
        return;
    }
    res.writeHead(200, { "Content-Type": "application/json " });
    let responseObject = {};

    for (let pair of params.entries()) {
        if (pair[1].indexOf(",") < 0) {
            responseObject[`${pair[0]}`] = pair[1];
        }
        else {
            responseObject[`${pair[0]}`] = pair[1].split(",").map((str) => str.trim());
        }
    }
    res.write(JSON.stringify(responseObject));
    console.log(`--- End function processPostRequest() ---`);
}

server.listen(port, () => { console.log(`Server listening on port ${port}`) });

// Serve stylesheet information for error page
const signUpStyle = (req, res) => {
    console.log(`--- Begin Function signUpStyle() ---`);
    const styleSheetDirectory = "./styles/";
    const styleSheet = "signUpStyle.css";
  
    let fileStream = fs.createReadStream(
      `${styleSheetDirectory}${styleSheet}`,
      "utf-8"
    );
    let css = fs.readFileSync(`${styleSheetDirectory}${styleSheet}`, "utf-8");
    res.writeHead(200, { "Content-Type": "text/css" });
    res.write(css);
    console.log(`--- End Function signUpStyle() ---`);
  }

// Render homepage
const renderHomepage = (req, res, data) => {
    console.log(`--- Begin Function homepage() ---`);
    const htmlPage = "signUp.ejs";

    try {
        const template = fs.readFileSync(`./views/${htmlPage}`, "utf-8");
        const renderedTemplate = ejs.render(template, { title: "Sign up Page" });
        console.log(renderedTemplate)
        res.write(renderedTemplate);
    }
    catch (error) {
        console.log("Error", error);
    }
    console.log(`--- End Function homepage() ---`);
}

// Serve stylesheet information for error page
const errorStyle = (req, res) => {
    console.log(`--- Begin Function errorStyle() ---`);
    const styleSheetDirectory = "./styles/";
    const styleSheet = "errorStyle.css";
  
    let fileStream = fs.createReadStream(
      `${styleSheetDirectory}${styleSheet}`,
      "utf-8"
    );
    let css = fs.readFileSync(`${styleSheetDirectory}${styleSheet}`, "utf-8");
    res.writeHead(200, { "Content-Type": "text/css" });
    res.write(css);
    console.log(`--- End Function oopsStyle() ---`);
  }

// Render an error page
function renderErrorPage(req, res, errMsg) {
    console.log(`--- Begin Function renderErrorPage() ---`);
    const htmlPage = "error.ejs";

    const template = fs.readFileSync(`./views/${htmlPage}`, "utf-8");
    const renderedTemplate = ejs.render(template, { "title": "Error Page", "errMsg": errMsg });

    res.writeHead(505, { "Content-Type": "text/html" });
    res.write(renderedTemplate);
    console.log(`--- End Function renderErrorPage() ---`);
}