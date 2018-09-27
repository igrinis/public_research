// ==UserScript==
// @name         Subtitiles
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  subtitles for a Gong call
// @author       Golan Levy
// @match        https://app.gong.io/call?*
// @grant        none
// @downloadURL https://honeyfy.github.io/public_research/bookmarklets/subtitles.js
// ==/UserScript==

(function() {
    'use strict';
    var iframe;

    function find_closest_transcript_time(c) {
        var lookfor = c.trimEnd().replace(":",".");
        var selector = iframe.contents().find('.timestamp');
        var start_time=0;
        var i;
        for (i=0; i < selector.length && start_time<=lookfor; i++){
            start_time = parseFloat(selector[i].innerText.trimEnd().replace(":","."))
        }
        return selector[i-2];
    }
    
    var last_elem = 0;
    /* Scroll transcript page to specific time */
    function scroll_to_time(c) {
        //problematic in Iframes
        //find_closest_transcript_time(c).scrollIntoView();
        var elem = find_closest_transcript_time(c);
        if (last_elem != elem) (
            last_elem = elem;
            //document.documentElement.scrollTop = elem.offsetParent.offsetTop;
            iframe.contents()[0].documentElement.scrollTop = elem.offsetParent.offsetTop - 50;
        )
    }

    var sibling = $('.player-controls-wrap');

    var callID = window.location.search.split("id=")[1]
    var src = window.location.origin + "/call/pretty-transcript?call-id= " + callID;
    iframe = $('<iframe height="300px" width="100%"></iframe>');
    iframe.attr('src', src);
    sibling.after(iframe);

    $('.video-player-current-time').on('DOMSubtreeModified', function () {
        scroll_to_time($(this).text());
    });
})();
