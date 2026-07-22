"use strict";

const express = require("express");
const path = require("path");
const http = require("http");
const compression = require("compression");
const fetch = require("node-fetch");
const { WebSocketServer, WebSocket } = require("ws");

const app = express();

const PORT =
    Number(process.env.PORT) || 3000;


const allowedDomains = new Set([

    "shellshockers.io",
    "krunker.io",
    "slope-game.com",
    "tunnelrushgame.com",
    "geometrydashlite.io",
    "flappybird.io",
    "chromedino.com",
    "cookieclicker.ee",
    "drifthunters.io",
    "madalinstuntcars2.com",
    "1v1.lol",
    "slither.io",
    "agar.io",
    "zombsroyale.io",
    "tetris.com",
    "run3.io",
    "motox3m.io",
    "fireboy-watergirl.io",
    "basketball-legends.io",
    "2048game.io"

]);


app.use(compression());


app.use(express.json({
    limit: "25mb"
}));


app.use(express.urlencoded({
    extended: true,
    limit: "25mb"
}));


function getTargetURL(value) {

    if (!value) {
        return null;
    }

    try {

        const url = new URL(value);

        if (
            url.protocol !== "http:" &&
            url.protocol !== "https:"
        ) {

            return null;

        }

        return url;

    } catch {

        return null;

    }

}


function isAllowedURL(url) {

    const hostname =
        url.hostname.toLowerCase();

    for (const domain of allowedDomains) {

        if (
            hostname === domain ||
            hostname.endsWith(`.${domain}`)
        ) {

            return true;

        }

    }

    return false;

}


function resolveURL(value, baseURL) {

    if (!value) {
        return value;
    }

    const trimmed =
        value.trim();

    if (
        trimmed.startsWith("data:") ||
        trimmed.startsWith("blob:") ||
        trimmed.startsWith("javascript:") ||
        trimmed.startsWith("#")
    ) {

        return trimmed;

    }

    try {

        return new URL(
            trimmed,
            baseURL
        ).href;

    } catch {

        return trimmed;

    }

}


function proxyURL(target) {

    return `/proxy?url=${encodeURIComponent(target)}`;

}


function rewriteHTML(html, baseURL) {

    return html.replace(

        /(<(?:script|img|iframe|audio|video|source|input)[^>]+(?:src|data)=["'])([^"']+)(["'])/gi,

        (match, start, value, end) => {

            const absolute =
                resolveURL(value, baseURL);

            if (
                !absolute ||
                absolute.startsWith("data:") ||
                absolute.startsWith("blob:")
            ) {

                return match;

            }

            return (
                start +
                proxyURL(absolute) +
                end
            );

        }

    ).replace(

        /(<link[^>]+href=["'])([^"']+)(["'])/gi,

        (match, start, value, end) => {

            const absolute =
                resolveURL(value, baseURL);

            if (
                !absolute ||
                absolute.startsWith("data:")
            ) {

                return match;

            }

            return (
                start +
                proxyURL(absolute) +
                end
            );

        }

    ).replace(

        /(<form[^>]+action=["'])([^"']+)(["'])/gi,

        (match, start, value, end) => {

            const absolute =
                resolveURL(value, baseURL);

            if (!absolute) {
                return match;
            }

            return (
                start +
                proxyURL(absolute) +
                end
            );

        }

    );

}


function rewriteCSS(css, baseURL) {

    return css.replace(

        /url\(\s*(['"]?)(.*?)\1\s*\)/gi,

        (match, quote, value) => {

            const absolute =
                resolveURL(value, baseURL);

            if (
                !absolute ||
                absolute.startsWith("data:")
            ) {

                return match;

            }

            return `url("${proxyURL(absolute)}")`;

        }

    );

}


function buildHeaders(req, targetURL) {

    const headers = {

        "user-agent":
            req.headers["user-agent"] ||
            "Mozilla/5.0",

        "accept":
            req.headers.accept ||
            "*/*",

        "accept-language":
            req.headers["accept-language"] ||
            "en-US,en;q=0.9"

    };


    const passThroughHeaders = [

        "content-type",
        "range",
        "if-none-match",
        "if-modified-since"

    ];


    for (
        const header of passThroughHeaders
    ) {

        if (req.headers[header]) {

            headers[header] =
                req.headers[header];

        }

    }


    return headers;

}


function getRequestBody(req) {

    if (
        req.method === "GET" ||
        req.method === "HEAD"
    ) {

        return undefined;

    }

    if (!req.body) {

        return undefined;

    }

    if (Buffer.isBuffer(req.body)) {

        return req.body;

    }

    if (typeof req.body === "string") {

        return req.body;

    }

    return JSON.stringify(req.body);

}


app.options("/proxy", (req, res) => {

    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "*"
    );

    res.status(204).end();

});


app.all("/proxy", async (req, res) => {

    try {

        const targetURL =
            getTargetURL(req.query.url);


        if (!targetURL) {

            return res
                .status(400)
                .send("Invalid target URL");

        }


        if (!isAllowedURL(targetURL)) {

            return res
                .status(403)
                .send("Target domain is not allowed");

        }


        const response =
            await fetch(

                targetURL.href,

                {

                    method: req.method,

                    headers:
                        buildHeaders(
                            req,
                            targetURL
                        ),

                    body:
                        getRequestBody(req),

                    redirect: "follow",

                    timeout: 30000

                }

            );


        const contentType =
            response.headers.get(
                "content-type"
            ) || "application/octet-stream";


        res.status(
            response.status
        );


        res.setHeader(
            "Content-Type",
            contentType
        );


        const cacheControl =
            response.headers.get(
                "cache-control"
            );

        if (cacheControl) {

            res.setHeader(
                "Cache-Control",
                cacheControl
            );

        }


        res.setHeader(
            "Access-Control-Allow-Origin",
            "*"
        );


        if (
            contentType.includes(
                "text/html"
            )
        ) {

            const html =
                await response.text();


            return res.send(

                rewriteHTML(
                    html,
                    targetURL.href
                )

            );

        }


        if (
            contentType.includes(
                "text/css"
            )
        ) {

            const css =
                await response.text();


            return res.send(

                rewriteCSS(
                    css,
                    targetURL.href
                )

            );

        }


        const buffer =
            await response.buffer();


        return res.send(buffer);

    }

    catch (error) {

        console.error(
            "Proxy error:",
            error.message
        );


        return res
            .status(502)
            .send(
                "Unable to load the requested resource"
            );

    }

});


app.get(
    "/health",
    (req, res) => {

        res.json({

            status: "online",

            service: "THE VAULT",

            proxy: "enabled",

            allowedDomains:
                allowedDomains.size

        });

    }
);


app.use(
    express.static(
        __dirname,
        {
            extensions: ["html"]
        }
    )
);


app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);


const server =
    http.createServer(app);


const wss =
    new WebSocketServer({
        server,
        path: "/ws"
    });


wss.on(
    "connection",
    (client, request) => {

        let target;

        try {

            const requestURL =
                new URL(
                    request.url,
                    "http://localhost"
                );


            target =
                getTargetURL(
                    requestURL.searchParams.get(
                        "url"
                    )
                );

        }

        catch {

            client.close();

            return;

        }


        if (
            !target ||
            !isAllowedURL(target)
        ) {

            client.close();

            return;

        }


        const remoteURL =
            target.href.replace(
                /^http:/i,
                "ws:"
            ).replace(
                /^https:/i,
                "wss:"
            );


        const remote =
            new WebSocket(
                remoteURL
            );


        remote.on(
            "open",
            () => {

                if (
                    client.readyState ===
                    WebSocket.OPEN
                ) {

                    client.send(
                        JSON.stringify({
                            type: "connected"
                        })
                    );

                }

            }
        );


        remote.on(
            "message",
            data => {

                if (
                    client.readyState ===
                    WebSocket.OPEN
                ) {

                    client.send(data);

                }

            }
        );


        client.on(
            "message",
            data => {

                if (
                    remote.readyState ===
                    WebSocket.OPEN
                ) {

                    remote.send(data);

                }

            }
        );


        remote.on(
            "close",
            () => {

                if (
                    client.readyState ===
                    WebSocket.OPEN
                ) {

                    client.close();

                }

            }
        );


        remote.on(
            "error",
            error => {

                console.error(
                    "WebSocket error:",
                    error.message
                );


                if (
                    client.readyState ===
                    WebSocket.OPEN
                ) {

                    client.close();

                }

            }
        );

    }
);


server.listen(
    PORT,
    () => {

        console.log(
            `THE VAULT running on port ${PORT}`
        );

        console.log(
            `Allowed domains: ${allowedDomains.size}`
        );

    }
);
