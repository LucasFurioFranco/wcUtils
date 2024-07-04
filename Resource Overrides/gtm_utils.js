(function() {
    var allow_log = true;

    function logger() {
        if (allow_log) console.log.apply(null, arguments);
    }

    if (location.hostname.indexOf("tagmanager.google.com") >= 0) {

        window.addEventListener("keydown", function(evt) {

            logger("### I Hear You");

            if (evt.ctrlKey && evt.shiftKey && evt.key == "Enter") {
                logger("### ### CTRL+SHIFT+Enter");

                //document.body.focus(); //Don't ask :'(
                var sv_btn = Array.from(document.querySelectorAll('[data-gtm-submit-button]')).pop();
                sv_btn && sv_btn.click();

            } else if (evt.key == 'F2') {
                logger("### ### F2");

                var name_in = Array.from(document.querySelectorAll('[data-name-value]')).pop(); //Retrieves the çast "save" button
                name_in && name_in.focus();

            }

        }, true);



    }
})()
