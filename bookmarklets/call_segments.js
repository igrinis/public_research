// ==UserScript==
// @name         Call Segments
// @namespace    http://gong.io/
// @version      0.1.1
// @description  World domination
// @author       Omri Allouche
// @match        https://app.gong.io/call?id=*
// @grant        none
// @require http://code.jquery.com/jquery-latest.js
// @downloadURL https://honeyfy.github.io/public_research/bookmarklets/call_segments.js
// ==/UserScript==


(function() {
    // Your code here...
    function add_track(j) {
        var call_duration = parseFloat($('#callRecordingVideoSlider').attr('aria-valuemax'));

        var color;
        var title;

        var colors = [
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
        var segments = '';
        var segments_legend = '';
        var existing_segments = {};
        j.segments.forEach(function(el, i) {
            if (el.length>3) {
                color = el[3];
            } else {
                color = colors[i];
            }
            if (el.length>2) {
                title = el[2];
            }

            el[0] = el[0]/call_duration*100;
            el[1] = el[1]/call_duration*100;

            segments += '<div class="segment" title="'+title+'" style="left: ' + el[0] + '%; width: ' + (el[1]-el[0]) + '%; background: '+color+';"></div>';

            if (el.length>2) {
                if (typeof(existing_segments[title])==="undefined") {
                    segments_legend += '<li><a class=""><i class="fa fa-circle" style="color: '+color+';"></i><span class="segment-label">'+title+'</span></a></li>';
                    existing_segments[title] = 1;
                }
            }
        });

        var slider = '<div id="callRecordingVideosegmentsSliderInjectedTrack" class="slider  segments-slider-container" title=""><div class="slider-time-line"></div><div class="slider-grab" style="width: 100%;"><div class="slider-grab-inner"></div></div><div id="callRecordingVideosegmentsSliderHandleInjectedTrack" class="slider-handle"></div></div>';
        segments_legend = '<ul class="segmentsLegend ">'+segments_legend+'</ul>';

        var str = '<div data-component="segments" class="segments-wrap"><div class="segments-container "><div class="fragment-header  "><h2 title="Segments">' + j.title + '</h2></div><div class="segments">' + segments + slider + '</div>'+segments_legend+'</div></div>';
        $('.player-timeline-controls-wrap').append(str);

        // Update the play slider when the video is played
        /*
        var v = document.getElementsByTagName("video")[0];
        v.addEventListener("timeupdate", function() {
            var left = $('#callRecordingVideospeaekrsSliderHandle').css('left');
            // debugger;
            $('#callRecordingVideosegmentsSliderHandleInjectedTrack').attr('style', 'left: '+left);
        }, true);
        */
        return str;
    }

    $(document).ready(function() {
        var url = new URL(window.location);
        var c = url.searchParams.get("bar");
        if (c) {
            var j = JSON.parse(c);
            add_track(j);
        }
    });
})();
