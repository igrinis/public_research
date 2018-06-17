// ==UserScript==
// @name         Transcript for popover
// @namespace    http://gong.io/
// @version      0.1
// @description  highlight + scroll to transcript in popover
// @author       Golan Levy
// @match        https://app.gong.io/call/pretty-transcript?*
// @grant        none
// @require http://code.jquery.com/jquery-latest.js
// @downloadURL https://honeyfy.github.io/public_research/bookmarklets/transcriptForPopover.js
// ==/UserScript==


(function() {
    function add_style(css) {
        var head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet){
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);
    }

    function hilighter(term, element) {
        element = element || document.getElementsByTagName('body')[0];
        var rgxp = new RegExp(term, 'g');
        var repl = '<span class="gong-highlighted" data-term="'+term+'">'+term+'</span>';
        element.innerHTML = element.innerHTML.replace(rgxp, repl);
    }

    function style_hilighter(term, css_style, element) {
        element = element || document.querySelectorAll('.gong-highlighted');
        if (typeof(css_style)!="string") {
            css_style = 'font-size:'+css_style+'em';
        }
        var rgxp = new RegExp(term, 'g');
        var repl = '<span style="'+css_style+'">' + term + '</span>';
        try {
            element.innerHTML = element.innerHTML.replace(rgxp, repl);
        } catch(ex) {
            element.forEach(function(el) {
                el.innerHTML = el.innerHTML.replace(rgxp, repl);
            });
        }
    }


    function convertTimeTextToSeconds(t){
        t = t.trimEnd();
        var arr = t.split(":");
        var sum=0;
        for(var i= 0; i < arr.length ; i++){
            sum += arr[i]*Math.pow(60, arr.length-i-1);
        }

        return sum;
    }

    function find_closest_transcript_time(c) {
        var lookfor = convertTimeTextToSeconds(c)
        var selector = $('.timestamp');
        var start_time=0;
        var i;
        for (i=0; i < selector.length && start_time<=lookfor; i++){
            start_time = convertTimeTextToSeconds(selector[i].text)
        }
        return selector[i-2];
    }

    /* Scroll transcript page to specific time */
    function scroll_to_time(c) {
        //problematic in Iframes
        //find_closest_transcript_time(c).scrollIntoView();
        var elem = find_closest_transcript_time(c);
        document.documentElement.scrollTop = elem.offsetParent.offsetTop;
    }


	$(document).ready(function() {
		alret("check");
		add_style('.gong-highlighted { color: blue; }');

        if(window.innerWidth < 1000){
            add_style('.timestamp {position:static; }');
        }

		var url = new URL(window.location);
		var c = decodeURIComponent(url.searchParams.get("sentences"));
		var j = [];
		if (c) {
			j = JSON.parse(c);
			if (j) {
				j.forEach(function(e) {
					hilighter(e.text);
					style_hilighter(e.text, e.style);
				});

			} else {
				j = c.split(';');
				j.forEach(function(e) {
					hilighter(e);
				});
			}
		}

		/*
		// style_hilighter('you', 'font-size:1.5em; color:pink', document.querySelector('.gong-highlighted'));
		// style_hilighter('hear', .5);
		*/

		c = url.searchParams.get("term_weights");
		/*
		if (!c) {
			c = window.prompt('Insert JSON of term weights:', '{}');
		}
		*/
		if(c) {
			j = JSON.parse(c);
			console.log(j);
			var terms;
			for (var k in j) {
				if (j.hasOwnProperty(k)) {
					var selector = document.querySelectorAll('.gong-highlighted[data-term="'+k+'"]');
					terms = j[k];
					for (var m in terms) {
						var str;
						if (typeof(terms[m])=="string") {
							str = terms[m];
						} else {
							if (terms[m]>0) {
								str = 'font-size: '+terms[m]+'em; color:green;';
							} else {
								str = 'font-size: '+terms[m]+'em; color:red;';
							}
						}
						style_hilighter(m, str, selector);
					}
				}
			}
		}

		url = new URL(window.location);
		c = url.searchParams.get("play");
		if (c) {
			scroll_to_time(c);
		}
	});

})();