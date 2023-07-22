window.wcTools = {

    restore_console: function() {
        var iframe = document.createElement("iframe");
        iframe.setAttribute("hidden", true);
        document.body.appendChild(iframe)

        window.console = iframe.contentWindow.console;

        //Preciso colocar um bind da vida aqui, até lá, segue sem excluir o dito cujo
        //iframe.parentElement.removeChild(iframe);
    },

    navigate: {
        utm: function(base, source, medium, campaign, content, tern) {
            window.location = base + "?" + [source, medium, campaign, content, tern].join("&");
        },

        gclid: function(base, gclid) {
            gclid = gclid || ((new Date()).getTime());
            window.location = base + "?gclid=" + gclid;
        }
    },

    find_first_ancestor: function(elem, css_selector) {
        try {
            while (!elem.matches(css_selector))
                elem = elem.parentElement;
            return elem;

        } catch (ex) {
            return null;
        }
    },

    find_ancestors: function(elem, css_selector, reverse) {
        var ancestors = [];
        try {
            while (!!elem) {
                elem.matches(css_selector) && ancestors.push(elem);
                elem = elem.parentElement;
            }

        } catch (ex) {
            console.error(ex);
            return null;

        }
        return reverse ? ancestors.reverse() : ancestors;
    },

    getFirstId: function(elem) {
        var maxtries = 20;
        for (var i = 0; i < maxtries; i++) {
            var id = elem.getAttribute("id");
            if (id) return id;
            else elem = elem.parentElement;
        }
    },


    dataLayer_splice: function(dl_name) {
        dl_name = dl_name || "dataLayer";
        window[dl_name].splice(0, dataLayer.length)
    },

    testMessage: function() {
        var msg = "This is a test. Please, disconsider it.";
        console.log(msg, "text is copied to clipboard");
        copy(msg);

    },

    internet_check: function() {
        if (window.location.href.indexOf("lucasfuriofranco.com.br?internet_check=") >= 0) {
            setTimeout(function() {
                window.location = "https://lucasfuriofranco.com.br?internet_check=" + Date.now();
            }, 5000)
        } else {
            window.location = "https://lucasfuriofranco.com.br?internet_check=" + Date.now();
        }
    },

    ga4HitView: function(str, clr) {
        /*
            str: the string for the requested payload
            clr: boolean flag where if true, the console will be cleared before the return of the formatted data
        */
        if (clr) console && console.clear && console.clear();
        var data = str.split("&").map(x => decodeURIComponent(x));

        var last_key; //For custom properties

        try {
            var prod_data = data.filter(k => k.match(/^pr\d.*/))
                .map(k => {
                    let pr = k.split("=")[1]
                        .split("~")
                        .reduce((dict, tuple) => {

                            if (tuple.match(/^[kv]\d/)) {
                                if (tuple[0] == "k") {
                                    //Custom property key
                                    last_key = "[c]" + tuple.match(/^k\d+(.+)$/)[1];
                                } else {
                                    //Custom property value
                                    dict[last_key] = tuple.match(/^v\d+(.+)$/)[1];
                                }

                            } else {
                                //Defaut property
                                let splitted = tuple.match(/^(..)(.+)$/);
                                dict[splitted[1]] = decodeURIComponent(splitted[2]);

                            }
                            return dict;
                        }, {})
                    return pr;
                })
        } catch (ex) {
            console.error(ex)
        };

        console.table(data.map(tuple => {
            var splitted = tuple.split("=");
            return [
                splitted.shift(),
                splitted.join("=")
            ];

        }))

        console.table(prod_data);

        data.prods = prod_data;

        //console.log(data);
        return data;
    },

    blockUnload: function() {
        if (!window.wcTools.blockUnload.blocking) {
            window.onbeforeunload = function(e) {
                return 'Dialog text here.';
            };
            window.wcTools.blockUnload.blocking = true;
        }
    },

    gtm: {
        cookie_debugging_log: function(x) {
            if (x) {
                document.cookie = "gtm_debugging_log=true; path=/;";

            } else {
                document.cookie = "gtm_debugging_log=true; path=/; expires=" + new Date(0);

            }
        }


    },


    dataLayer_merged: function(dl_name) {
        dl_name = dl_name || "dataLayer";
        var ret = {};

        function merger(source, destine) {
            destine = destine || {};
            Object.keys(source).forEach(function(key) {

                try {

                    if (typeof source[key] == "object") {
                        destine[key] = destine[key] || {};

                        if (typeof source[key].length == "undefined") { //It is a dict
                            merger(source[key], destine[key])

                        } else { //It is an array
                            source[key].forEach(x => {
                                merger(x, destine[key])
                            })

                        }

                    } else {
                        destine[key] = destine[key] || {};
                        var type = typeof source[key];
                        destine[key][(type == "object") ? "array" : type] = destine[key][(type == "object") ? "array" : type] || 0;
                        destine[key][(type == "object") ? "array" : type] += 1;
                    }

                } catch (ex) {
                    console.warning && console.warning("DL Push Listener failed:", ex);
                    debugger
                    throw ex;

                } finally {
                    return destine

                }

            });
            return destine;
        }


        window[dl_name].forEach(function(pos) {
            merger(pos, ret);
        })

        return ret;

    },

    tesouro_direto: {
        total_cart: function() {
            try {
                //Para o tesouro direto
                var value = Array.from(document.querySelectorAll(".td-carrinho-resumo-info--valor")).reduce((sum, x) => {
                    return sum + x.innerText
                        .replaceAll(".", "")
                        .replace(/R\$ ?/g, "")
                        .replace(",", ".") * 1
                }, 0);
                console.log("Cart total value:", value);

            } catch (ex) {
                console.log("Unable to calculate")

            }
            return Math.round(value * 100) / 100;
        },

        auto_fix_total_cart: function() {
            //Carrinho Tesouro Direto
            if (location.href.indexOf("https://portalinvestidor.tesourodireto.com.br/Carrinho") >= 0) {


                let cb = function(evt) {
                    try {

                        if (!!document.querySelector("#carrinhoQuantidade")) {
                            setTimeout(function() {
                                document.querySelector("#carrinhoQuantidade")
                                    .setAttribute("data-valor-carrinho", wcTools.tesouro_direto.total_cart());
                            }, 100)

                        }

                    } catch (ex) {}
                }

                setTimeout(cb, 1000);
                window.addEventListener("click", cb);

            }
        }
    }


}
