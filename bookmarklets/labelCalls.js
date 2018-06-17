// ==UserScript==
// @name         Label calls
// @namespace    http://gong.io/
// @version      0.2
// @description  pophovers on snippets in calls' search for labeling data. Notice for the SAVE button at the top of the page to save your results as a csv file.
// @author       Golan Levy
// @match        https://app.gong.io/calls?*
// @grant        none
// @require https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js
// @downloadURL https://honeyfy.github.io/public_research/bookmarklets/labelCalls.js
// ==/UserScript==

'use stirct';

$(document).ready(function(e) {
    function prepare_label_links() {

        const entry = "ActionItemClassificationData";
        const transcriptUrl = "https://app.gong.io/call/pretty-transcript?call-id=";
        var classficationValues = [
            "No",
            "No?",
            "Skip",
            "Yes?",
            "Yes"
        ];



        window.save = function(filename){

            if(!data || data.length === 0) {
                console.error('Console.save: No data')
                return;
            }

            if(!filename) filename = 'export.csv'

            var fields = Object.keys(data[0]);
            var replacer = function(key, value) { return value === null ? '' : value } ;
            var csv = data.map(function(row){
                return fields.map(function(fieldName){
                    return JSON.stringify(row[fieldName], replacer);
                }).join(',')
            });
            csv.unshift(fields.join(',')); // add header column
            var allText = csv.join('\r\n');

            var blob = new Blob([allText], {type: 'text/json'});
            var e = document.createEvent('MouseEvents');
            var a = document.createElement('a');

            a.download = filename;
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
            e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);

            data = [];
            localStorage.removeItem(entry);
        }

        var data = localStorage.getItem(entry);
        if (data === null){
            data = "[]";
        }

        data = JSON.parse(data);

        function updateStorage(item){
            data.push(item);
            localStorage.setItem(entry, JSON.stringify(data));
        }

        function addSaveButton(){
            var saveButton = $("<li class='app-nav-item-left'><a href='javascript:save();' class='hidden-xs'><span>SAVE</span></a></li>");
            $(".app-nav-item-left").last().after(saveButton);
        }

        addSaveButton();

        // Cancel propogation while creating popovers unless creating an infinite loop
        $('.insights-results').on('DOMNodeInserted', '.call-details', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });

        $('.insights-results').on('DOMNodeInserted', '.call-list', function (e) {
            createPopovers();
        });

        createPopovers();

        function createPopovers(){
            $('.popover').remove();

            $('.call-snippet').on('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
            });
            $('.call-snippet').each(function(el) {
                var $this = $(this);
                var callDetails = $this.parents(".call-details");
                var callSnippet = $this;
                var callID = callDetails.find(".call-link").attr("data-call-id");

                var ul = $("<ul></ul>");

                ul.append(
                    classficationValues.map(
                        x=> $("<li><a>" + x +"</a></li>"))
                );

                function arrToMinutes(arr)
                {
                    var sum=0;

                    for(var i= 0; i < arr.length ; i++){
                        sum += arr[i]*Math.pow(60, arr.length-i-1);
                    }

                    return sum;
                }

                // Handle 1m, 22m, 3h 4m, 55h 59m
                function convertCallDurationToMinutes(t){
                    var arr = t.split(new RegExp('h|m| ', 'g')).filter(x=> x !== "")

                    return arrToMinutes(arr)
                }

                // Handle 12:34:56
                function convertStartTimeToSeconds(t){
                    t = t.trimEnd();
                    var arr = t.split(":");
                    return arrToMinutes(arr);
                }


                ul.click(function(e){
                    if (e.target.tagName !== 'A') return;					

                    $this.popover('hide');

                    var item = {
                        'callDuration': convertCallDurationToMinutes(callDetails.find(".call-duration").text()),
                        'callID': callID,
                        'title': callDetails.find(".call-title>.call-link").text(),
                        'date': callDetails.find(".call-date").text(),
                        'callOwner': callDetails.find(".call-owner").text(),
                        'account': callDetails.find(".call-account-name").text(),
                        'snippetStartTime': convertStartTimeToSeconds(callSnippet.find(".snippet-start-time").text()),
                        'speaker': callSnippet.find(".call-fragment-speaker").text(),
                        'snippetText': callSnippet.find(".snippet-content").text(),
                        'classification' : e.target.text
                    }

                    console.log(item);

                    updateStorage(item);
					
					callSnippet[0].style.color = "lightgrey";

                });

                var params = {
                    sentences: encodeURIComponent(JSON.stringify([{text: callSnippet.find('em').first().text()}])),
                    //play : callSnippet.attr('href').split('&play=')[1].split("&q=")[0]
                    play: callSnippet.find(".snippet-start-time").text()
                }

                var src = transcriptUrl + callID + "&" + $.param(params);

                var div = $("<div><iframe></iframe></div>");

                div.children().first().attr('src', src);

                div.append(ul);

                $this.popover({
                    title: "Choose label:",
                    html: true,
                    content: div,
                    container: "body"
                }).on("show.bs.popover", function(){ $(this).data("bs.popover").tip().css({maxWidth: "600px"})});

                var txt = $this.html().replace(/\./g, '.<br/>').replace(/\?/g, '?<br/>').replace(/\!/g, '!<br/>');
                $this.html(txt);
            });
        }
    }

    //setTimeout(prepare_label_links, 4000);
    prepare_label_links();
});

