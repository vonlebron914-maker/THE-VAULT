const express = require("express");
const path = require("path");
const { createServer } = require("http");
const WebSocket = require("ws");
const { WebSocketServer } = WebSocket;
const cheerio = require("cheerio");
const fetch = require("node-fetch");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());

app.use(express.static(__dirname, {
  extensions: ["html"]
}));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(express.raw({ limit: "100mb", type: "*/*" }));

const allowedDomains = [
  "shellshockers.io",
  "krunker.io",
  "slope-game.com",
  "tunnelrushgame.com",
  "geometrydashlite.io",
  "crossyroadgame.com",
  "flappybird.io",
  "chromedino.com",
  "cookieclicker.ee",
  "bitlifegame.com",
  "pacman.live",
  "playsnake.org",
  "drifthunters.io",
  "madalinstuntcars2.com",
  "1v1.lol",
  "paper-io.com",
  "hole-io.com",
  "slither.io",
  "agar.io",
  "zombsroyale.io",
  "tetris.com",
  "run3.io",
  "motox3m.io",
  "fireboy-watergirl.io",
  "portalflash.io",
  "basketball-legends.io",
  "dinorunner.io",
  "spaceinvaders.io",
  "2048game.io",
  "stickman-hook.io"
];

function isAllowed(url) {
  try {
    const host = new URL(url).hostname;

    return allowedDomains.some(domain =>
      host === domain ||
      host.endsWith("." + domain)
    );

  } catch {
    return false;
  }
}


function resolveUrl(value, base) {

  if (!value) return value;

  if (
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    value.startsWith("javascript:")
  ) {
    return value;
  }

  try {
    return new URL(value, base).href;
  } catch {
    return value;
  }
}



app.all("/proxy", async (req,res)=>{

  try {

    const target = req.query.url;

    if(!target)
      return res.status(400).send("Missing URL");


    if(!isAllowed(target))
      return res.status(403).send("Blocked domain");


    const url = new URL(target);


    const headers = {

      "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",

      "Accept":
      "*/*",

      "Accept-Language":
      "en-US,en;q=0.9"

    };


    // forward content type when needed
    if(req.headers["content-type"])
      headers["content-type"] =
        req.headers["content-type"];



    let body;


    if(req.method !== "GET" &&
       req.method !== "HEAD") {

      body=req.body;

    }



    const response = await fetch(
      target,
      {
        method:req.method,
        headers,
        body,
        redirect:"follow"
      }
    );



    const type =
      response.headers.get("content-type") || "";



    res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
    );


    res.setHeader(
      "Access-Control-Allow-Headers",
      "*"
    );


    res.setHeader(
      "Cross-Origin-Resource-Policy",
      "cross-origin"
    );


    /*
       HTML
    */

    if(type.includes("text/html")){


      let html =
        await response.text();


      html =
        rewriteHTML(
          html,
          target
        );


      res.type("html");

      return res.send(html);

    }



    /*
       Javascript
    */

    if(
      type.includes("javascript") ||
      type.includes("ecmascript")
    ){

      let js =
        await response.text();


      js =
        rewriteJS(
          js,
          target
        );


      res.type("application/javascript");

      return res.send(js);

    }



    /*
       CSS
    */

    if(type.includes("text/css")){


      let css =
        await response.text();


      css =
        rewriteCSS(
          css,
          target
        );


      res.type("text/css");

      return res.send(css);

    }



    /*
       Everything else:
       wasm/images/audio/fonts/etc
    */

    const buffer =
      await response.buffer();


    res.setHeader(
      "Content-Type",
      type
    );


    res.send(buffer);


  }

  catch(err){

    console.error(
      "Proxy error:",
      err
    );

    res.status(500)
    .send("Proxy error");

  }

});
function rewriteHTML(html, baseUrl) {

  const $ = cheerio.load(
    html,
    {
      decodeEntities:false
    }
  );


  const rewriteAttribute = (selector, attr)=>{

    $(selector).each((i,el)=>{

      const value=$(el).attr(attr);

      if(
        value &&
        !value.startsWith("data:") &&
        !value.startsWith("#") &&
        !value.startsWith("javascript:")
      ){

        const absolute =
          resolveUrl(
            value,
            baseUrl
          );


        $(el).attr(
          attr,
          "/proxy?url=" +
          encodeURIComponent(absolute)
        );

      }

    });

  };



  rewriteAttribute(
    "script[src]",
    "src"
  );


  rewriteAttribute(
    "link[href]",
    "href"
  );


  rewriteAttribute(
    "img[src]",
    "src"
  );


  rewriteAttribute(
    "audio[src]",
    "src"
  );


  rewriteAttribute(
    "video[src]",
    "src"
  );


  rewriteAttribute(
    "source[src]",
    "src"
  );


  rewriteAttribute(
    "iframe[src]",
    "src"
  );


  rewriteAttribute(
    "object[data]",
    "data"
  );



  $("form[action]").each((i,el)=>{

    const action =
      $(el).attr("action");


    if(action){

      $(el).attr(
        "action",
        "/proxy?url=" +
        encodeURIComponent(
          resolveUrl(
            action,
            baseUrl
          )
        )
      );

    }

  });



  // inject browser compatibility script

  const inject = `

<script>

window.__VAULT_PROXY__ = "${baseUrl}";


(function(){


const originalFetch =
window.fetch;


window.fetch=function(input,options){


 let url =
 typeof input==="string"
 ? input
 : input.url;



 if(
 url &&
 !url.startsWith("/proxy") &&
 !url.startsWith("data:")
 ){

    url =
    new URL(
      url,
      window.__VAULT_PROXY__
    ).href;


    input =
    "/proxy?url=" +
    encodeURIComponent(url);

 }


 return originalFetch(
   input,
   options
 );

};



const oldXHR =
XMLHttpRequest.prototype.open;


XMLHttpRequest.prototype.open =
function(method,url,...args){


 if(
 url &&
 !url.startsWith("/proxy") &&
 !url.startsWith("data:")
 ){

   url =
   new URL(
     url,
     window.__VAULT_PROXY__
   ).href;


   url =
   "/proxy?url=" +
   encodeURIComponent(url);

 }


 return oldXHR.call(
   this,
   method,
   url,
   ...args
 );

};



const OldWorker =
window.Worker;


if(OldWorker){

 window.Worker =
 function(url,options){


   if(
    !url.startsWith("/proxy")
   ){

    url =
    "/proxy?url=" +
    encodeURIComponent(
      new URL(
        url,
        window.__VAULT_PROXY__
      ).href
    );

   }


   return new OldWorker(
    url,
    options
   );

 };

}



})();


</script>

`;


  if(html.includes("</head>")){

    html =
    html.replace(
      "</head>",
      inject +
      "</head>"
    );

  }
  else {

    html += inject;

  }



  return $.html();

}







function rewriteJS(js,baseUrl){


 // fetch()

 js =
 js.replace(
 /fetch\((['"`])(.*?)\1/g,
 (match,q,url)=>{


   if(
    url.startsWith("http") ||
    url.startsWith("/")
   ){

    const fixed =
    resolveUrl(
      url,
      baseUrl
    );


    return (
      "fetch('" +
      "/proxy?url=" +
      encodeURIComponent(fixed) +
      "'"
    );

   }


   return match;


 });




 // XMLHttpRequest URLs

 js =
 js.replace(
 /(open\(['"`][A-Z]+['"`],\s*['"`])(.*?)(['"`])/g,
 (match,start,url,end)=>{


   const fixed =
   resolveUrl(
     url,
     baseUrl
   );


   return (
    start +
    "/proxy?url=" +
    encodeURIComponent(fixed) +
    end
   );


 });




 return js;

}







function rewriteCSS(css,baseUrl){


 return css.replace(

 /url\((.*?)\)/g,

 (match,url)=>{


   url =
   url.replace(
    /['"]/g,
    ""
   );


   if(
    url.startsWith("data:")
   )
    return match;



   return (

    "url(" +
    "/proxy?url=" +
    encodeURIComponent(
      resolveUrl(
        url,
        baseUrl
      )
    )
    +
    ")"

   );


 }

 );


}
const server = createServer(app);



/*
 WebSocket Proxy
 Supports games that use
 ws:// / wss:// connections
*/

const wss = new WebSocketServer({
  server,
  path:"/ws"
});


wss.on(
"connection",
(client,request)=>{


 try {


  const params =
  new URL(
    request.url,
    "http://localhost"
  );


  const target =
  params.searchParams.get("url");


  if(!target){

    client.close();
    return;

  }



  const wsTarget =
  target
  .replace(
    /^http/,
    "ws"
  );



  const remote =
  new WebSocket(
    wsTarget,
    {
      headers:{
        "User-Agent":
        "Mozilla/5.0"
      }
    }
  );



  remote.on(
  "open",
  ()=>{

    if(
      client.readyState === WebSocket.OPEN
    ){

      client.send(
        JSON.stringify({
          type:"connected"
        })
      );

    }

  });



  remote.on(
  "message",
  data=>{

    if(
      client.readyState === WebSocket.OPEN
    ){

      client.send(data);

    }

  });



  client.on(
  "message",
  data=>{

    if(
      remote.readyState === WebSocket.OPEN
    ){

      remote.send(data);

    }

  });



  remote.on(
  "close",
  ()=>{

    client.close();

  });



  remote.on(
  "error",
  err=>{

    console.log(
      "Remote WS error:",
      err.message
    );

    client.close();

  });



 }

 catch(err){

  console.log(
    "WS proxy error:",
    err.message
  );

  client.close();

 }


});





app.get(
"/",
(req,res)=>{

 res.sendFile(
  path.join(
   __dirname,
   "index.html"
  )
 );

});





app.get(
"/health",
(req,res)=>{

 res.json({
  status:"online",
  proxy:"THE VAULT custom proxy"
 });

});





app.use(
(req,res)=>{

 res.status(404).json({
  error:"Not found"
 });

});





server.listen(
PORT,
()=>{

 console.log(
 `
================================
 THE VAULT CUSTOM PROXY v4
================================

Running:
http://localhost:${PORT}

Features:
✓ HTML rewriting
✓ JS rewriting
✓ CSS rewriting
✓ WASM support
✓ WebSocket proxy
✓ Worker support
✓ Fetch interception
✓ XHR interception

================================
 `
 );

});
