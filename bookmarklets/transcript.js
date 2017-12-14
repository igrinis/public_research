// ==UserScript==
// @name         Transcript
// @namespace    http://gong.io/
// @version      0.1.0
// @description  World domination
// @author       Omri Allouche
// @match        https://app.gong.io/*
// @grant        none
// @require http://code.jquery.com/jquery-latest.js
// @downloadURL https://honeyfy.github.io/public_research/bookmarklets/transcript.js
// ==/UserScript==


(function() {
    // Your code here...
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

    function add_track(j) {
        var color;
        var title;

        colors = [
            'rgb(238, 38, 121)',
            'rgb(166, 136, 216)',
            'rgb(115, 195, 249)',
            'rgb(5, 185, 246)',
            'rgb(98, 192, 101)',
            'rgb(132, 139, 143)',
            'rgb(148, 222, 251)',
            'rgb(255, 248, 177)',
            'rgb(149, 211, 151)'
        ];
        segments = '';
        segments_legend = '';
        existing_segments = {};
        j.segments.forEach(function(el, i) {
            if (el.length>3) {
                color = el[3];
            } else {
                color = colors[i];
            }
            if (el.length>2) {
                title = el[2];
            }

            segments += '<div class="segment" title="'+title+'" style="left: ' + el[0] + '%; width: ' + (el[1]-el[0]) + '%; background: '+color+';"></div>';

            if (el.length>2) {
                if (typeof(existing_segments[title])==="undefined") {
                    segments_legend += '<li><a class=""><i class="fa fa-circle" style="color: '+color+';"></i><span class="segment-label">'+title+'</span></a></li>';
                    existing_segments[title] = 1;
                }
            }
        });

        slider = '<div id="callRecordingVideosegmentsSliderInjectedTrack" class="slider  segments-slider-container" title=""><div class="slider-time-line"></div><div class="slider-grab" style="width: 100%;"><div class="slider-grab-inner"></div></div><div id="callRecordingVideosegmentsSliderHandleInjectedTrack" class="slider-handle"></div></div>';
        segments_legend = '<ul class="segmentsLegend ">'+segments_legend+'</ul>';

        str = '<div data-component="segments" class="segments-wrap"><div class="segments-container "><div class="fragment-header  "><h2 title="Segments">' + j.title + '</h2></div><div class="segments">' + segments + slider + '</div>'+segments_legend+'</div></div>';
        $('.player-timeline-controls-wrap').append(str);

        // Update the play slider when the video is played
        var v = document.getElementsByTagName("video")[0];
        v.addEventListener("timeupdate", function() {
            var left = $('#callRecordingVideospeaekrsSliderHandle').css('left');
            // debugger;
            $('#callRecordingVideosegmentsSliderHandleInjectedTrack').attr('style', 'left: '+left);
        }, true);

        return str;
    }

    function find_closest_transcript_time(c) {
        var selector = document.querySelectorAll('.timestamp');
        var start_time=0;
        var i=0;
        while (i<selector.length && start_time<=c) {
            start_time = parseFloat(selector[i].href.split('&play=')[1]);
            console.log(i, start_time);
            selector[i].setAttribute('name', start_time);
            i++;
        }
        return selector[i-2];
    }

    // Scroll transcript page to specific time
    function scroll_to_time(c) {
        find_closest_transcript_time(c).scrollIntoView();
        return selector;
    }


    $(document).ready(function() {
        add_style('.gong-highlighted { color: blue; }');

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

        // style_hilighter('you', 'font-size:1.5em; color:pink', document.querySelector('.gong-highlighted'));
        // style_hilighter('hear', .5);

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
                    selector = document.querySelectorAll('.gong-highlighted[data-term="'+k+'"]');
                    terms = j[k];
                    for (var m in terms) {
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

        /*
        url = new URL(window.location);
        c = url.searchParams.get("bar");
        if (c) {
            j = JSON.parse(c);
            add_track(j);
        }
        */

    });

    url = new URL(window.location);
    c = url.searchParams.get("bar");
    if (c) {
        j = JSON.parse(c);
        add_track(j);
    }


})();