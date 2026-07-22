(function () {

    "use strict";

    /*
        THE VAULT - Browser compatibility layer

        Handles:
        - fetch rewriting
        - XHR rewriting
        - WebSocket routing
        - dynamic script loading
        - image loading
        - worker loading
        - storage fixes
    */


    const params = new URLSearchParams(window.location.search);

    const originalGame =
        params.get("url") || window.location.href;


    function proxyURL(url) {

        if (!url) return url;

        if (
            url.startsWith("/proxy") ||
            url.startsWith("data:") ||
            url.startsWith("blob:")
        ) {
            return url;
        }


        try {

            const absolute =
                new URL(url, originalGame).href;


            return "/proxy?url=" +
                encodeURIComponent(absolute);

        } catch {

            return url;

        }

    }



    // FETCH FIX

    const originalFetch = window.fetch;

    window.fetch = function(resource, options) {

        if (typeof resource === "string") {

            resource = proxyURL(resource);

        }

        return originalFetch.call(
            this,
            resource,
            options
        );

    };



    // XHR FIX

    const originalOpen =
        XMLHttpRequest.prototype.open;


    XMLHttpRequest.prototype.open =
    function(method, url, async, user, password) {


        url = proxyURL(url);


        return originalOpen.call(
            this,
            method,
            url,
            async,
            user,
            password
        );

    };



    // IMAGE FIX

    const originalImage =
        window.Image;


    window.Image = function(width, height) {

        const img =
            new originalImage(width, height);


        const descriptor =
            Object.getOwnPropertyDescriptor(
                HTMLImageElement.prototype,
                "src"
            );


        Object.defineProperty(img, "src", {

            set(value) {

                descriptor.set.call(
                    this,
                    proxyURL(value)
                );

            },


            get() {

                return descriptor.get.call(this);

            }

        });


        return img;

    };



    // WEBSOCKET FIX

    const OriginalWebSocket =
        window.WebSocket;


    window.WebSocket =
    function(url, protocols) {


        try {


            if (
                url.startsWith("ws://") ||
                url.startsWith("wss://")
            ) {


                const converted =
                    "/ws?url=" +
                    encodeURIComponent(url);


                url =
                    (
                        location.protocol === "https:"
                        ? "wss://"
                        : "ws://"
                    )
                    +
                    location.host
                    +
                    converted;

            }


        } catch(e){}



        return new OriginalWebSocket(
            url,
            protocols
        );

    };



    // SCRIPT LOADING FIX

    const originalCreateElement =
        document.createElement;


    document.createElement =
    function(tag) {


        const element =
            originalCreateElement.call(
                document,
                tag
            );


        if (
            tag.toLowerCase()
            === "script"
        ) {


            const descriptor =
                Object.getOwnPropertyDescriptor(
                    HTMLScriptElement.prototype,
                    "src"
                );


            Object.defineProperty(element,"src",{

                set(value){

                    descriptor.set.call(
                        this,
                        proxyURL(value)
                    );

                },


                get(){

                    return descriptor.get.call(this);

                }

            });

        }


        return element;

    };



    // WORKER FIX

    const OriginalWorker =
        window.Worker;


    window.Worker =
    function(scriptURL, options){


        return new OriginalWorker(
            proxyURL(scriptURL),
            options
        );


    };



    // LINK CLICK FIX

    document.addEventListener(
        "click",
        function(event){


            const link =
                event.target.closest("a");


            if (
                link &&
                link.href &&
                !link.href.startsWith("#")
            ){

                event.preventDefault();


                location.href =
                    proxyURL(link.href);

            }


        },
        true
    );



    // SERVICE WORKER BLOCK FIX

    if (
        navigator.serviceWorker
    ) {


        navigator.serviceWorker.register =
        function(scriptURL, options){


            return Promise.reject(
                new Error(
                    "Service workers disabled in proxy"
                )
            );


        };


    }



    console.log(
        "[THE VAULT] Compatibility layer loaded"
    );


})();
