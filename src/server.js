// Complete Events Exercise
import * as http from "http"; //ES 6
// const http = require("http");
import EventEmitter from "events";
import * as fs from "fs";
import ejs from "ejs";
import { exit } from "process";

const port = 3000;
const textFile = "newsletter.csv";
const eventEmitter = new EventEmitter();

// Create an event handler
const newsLetter = (signUpInfo) => {
    console.log("Sign up info =", signUpInfo);
    try {
        // Using the sync version so the file can be re-read for html display
        fs.appendFileSync(textFile, `${signUpInfo.name},${signUpInfo.email}\n`);
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
            case "/newsletter_signup":
                console.log(`--- Begin Case ${url} Route ---`);
                renderSignUpPage(req, res);
                console.log(`--- End Case ${url} Route ---`);
                break;
            case "/api/newsletter_signup":
                console.log(`--- Begin Case ${url} Route ---`);
                let newsLetterSignUpText = Buffer.concat(chunks).toString().replace(/[\n\r]+/g, '').replace(/\s{2,10}/g, '');
                //let newsLetterSignUpText = Buffer.concat(chunks).toString();
                newsLetterSignUpText= Buffer.concat(chunks).toString();
                let newsLetterJSON;
                try {
                    console.log("Newsletter Sign Up Text", newsLetterSignUpText);
                    newsLetterJSON = JSON.parse(newsLetterSignUpText);
                    console.log("NewsLetterJSON =", newsLetterJSON);
                    res.writeHead(200);
                    let successMsg = "{success:".concat(JSON.stringify(newsLetterJSON).concat("}"));
                    res.write(successMsg);

                }
                catch (error) {
                    console.log(error);
                    res.writeHead(400);
                    res.write("{failure:{".concat('"').concat(error.toString()).concat('"').concat("}"));
                }
                console.log(`--- End Case ${url} Route ---`);
                break;
            case "/styles/signUpStyle.css":
                console.log(`--- Begin Case ${url} Route ---`);
                signUpStyle(req, res);
                console.log(`--- End Case ${url} Route ---`);
                break;
            case "/styles/resultsStyle.css":
                console.log(`--- Begin Case ${url} Route ---`);
                resultsStyle(req, res);
                console.log(`--- End Case ${url} Route ---`);
                break;
            case "/styles/errorStyle.css":
                console.log(`--- Begin Case ${url} Route ---`);
                errorStyle(req, res);
                console.log(`--- End Case ${url} Route ---`);
                break;
            case "/process_newsletter_signup":
                switch (method) {
                    case "POST":
                        console.log("Chunks = ", Buffer.concat(chunks).toString())
                        processPostRequest(req, res, Buffer.concat(chunks).toString());
                        break;
                    default:
                        console.log(`--- Begin Case ${url} Route ---`);
                        renderErrorPage(req, res, `URL ${url} ${req.method} method not allowed.`);
                        console.log(`--- End Case ${url} Route ---`);
                        break;
                }
                break;
            default:
                renderErrorPage(req, res, `URL ${url} not found on this server`);
                break;
        }
        res.end();
    });
});

// Process a POST request
const processPostRequest = (req, res, body) => {
    console.log(`--- Begin function processPostRequest() ---`);
    console.log("Body = ", body);
    const params = new URLSearchParams(`?${body}`);
    console.log("Post Params = ", params);
    // Redirect to index page if no parameters
    if (!params.has("name") ||
        !params.has("email")) {
        // Redirect to home page
        res.writeHead(302, {
            location: "/",
        });
        return;
    }
    //res.writeHead(200, { "Content-Type": "application/json " });
    let responseObject = {};

    for (let pair of params.entries()) {
        if (pair[1].indexOf(",") < 0) {
            responseObject[`${pair[0]}`] = pair[1];
        }
        else {
            responseObject[`${pair[0]}`] = pair[1].split(",").map((str) => str.trim());
        }
    }
    console.log("Response Object = ", responseObject);
    eventEmitter.emit("insert", responseObject);
    renderResultsPage(req, res, responseObject);
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

// Render sign up page
const renderSignUpPage = (req, res, data) => {
    console.log(`--- Begin Function signUpPage() ---`);
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
    console.log(`--- End Function signUpPage() ---`);
}

// Serve stylesheet information for results page
const resultsStyle = (req, res) => {
    console.log(`--- Begin Function resultsStyle() ---`);
    const styleSheetDirectory = "./styles/";
    const styleSheet = "resultsStyle.css";

    let fileStream = fs.createReadStream(
        `${styleSheetDirectory}${styleSheet}`,
        "utf-8"
    );
    let css = fs.readFileSync(`${styleSheetDirectory}${styleSheet}`, "utf-8");
    res.writeHead(200, { "Content-Type": "text/css" });
    res.write(css);
    console.log(`--- End Function resultsStyle() ---`);
}

// Render results page
const renderResultsPage = (req, res, data) => {
    console.log(`--- Begin Function resultspage() ---`);
    const htmlPage = "results.ejs";

    try {
        const template = fs.readFileSync(`./views/${htmlPage}`, "utf-8");
        const data = fs.readFileSync(textFile, { encoding: 'utf8', flag: 'r' });
        console.log("Data = ", data);
        // Eliminate end of line from last record
        const records = data.trim().split("\n");
        const renderedTemplate = ejs.render(template, { title: "Results Page", tableData: records });
        res.write(renderedTemplate);
        res.end();

    }
    catch (error) {
        console.log("Error", error);
    }
    console.log(`--- End Function resultspage() ---`);
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
const renderErrorPage = (req, res, errMsg) => {
    console.log(`--- Begin Function renderErrorPage() ---`);
    const htmlPage = "error.ejs";

    const template = fs.readFileSync(`./views/${htmlPage}`, "utf-8");
    const renderedTemplate = ejs.render(template, { "title": "Error Page", "errMsg": errMsg });

    res.writeHead(505, { "Content-Type": "text/html" });
    res.write(renderedTemplate);
    console.log(`--- End Function renderErrorPage() ---`);
}