var gClean = function () {
    return {
        dbConn:null,
        repeatRun:function (cD) {
            if (cD && !cD.getElementsByClassName("one")[0] && cD.getElementsByTagName('body')[0] && cD.getElementsByTagName('body')[0].className == "") {
                gClean.run(cD);
            }
        },

        loadReloadOrAddTab:function () {
            try {
                //global_tab_cont = gBrowser.tabContainer.childNodes.length;

                //for (var i = 0; i < gBrowser.browsers.length; i++) {

                setInterval(function () {
                    //    var b = gBrowser.getBrowserAtIndex(i);
                    var b = gBrowser;

                    if (b && b.contentDocument && b.currentURI) {

                        var cD = b.contentDocument;
                        var body = cD.getElementsByTagName('body')[0];
                        if (body && body.className.indexOf('theme_') == -1) {

                            var currentURI = b.currentURI.spec;
                            if (currentURI.indexOf('google.') > -1) {
                                if (currentURI.indexOf('plus.google.') == -1
                                    && currentURI.indexOf('maps.google.') == -1
                                    && currentURI.indexOf('play.google.') == -1
                                    && currentURI.indexOf('news.google.') == -1
                                    && currentURI.indexOf('mail.google.') == -1
                                    && currentURI.indexOf('drive.google.') == -1
                                    && currentURI.indexOf('translate.google.') == -1
                                    && currentURI.indexOf('books.google.') == -1
                                    && currentURI.indexOf('video.google.') == -1
                                    ) {


                                    gClean.repeatRun(cD);
                                }
                            }
                        }
                    }


                }, 500);
                //}
                // Do, or call to, all your code here.
            } catch (e) {
                try {
                    if (e.stack) {


                    }
                    // Show the error console.
                    toJavaScriptConsole();
                } finally {
                    throw e;
                }
            }

        },


        init:function () {
            var file = Components.classes["@mozilla.org/file/directory_service;1"]
                .getService(Components.interfaces.nsIProperties)
                .get("ProfD", Components.interfaces.nsIFile);
            file.append("gCleanDatabase.sqlite");

            var storageService = Components.classes["@mozilla.org/storage/service;1"]
                .getService(Components.interfaces.mozIStorageService);
            gClean.dbConn = storageService.openDatabase(file); // Will also create the file if it does not exist
            gClean.dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS hidden_results (id INTEGER, search TEXT , result TEXT)");
            gClean.dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS minimized_results (id INTEGER, search TEXT , result TEXT)");
            gClean.dbConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS favorite_results (search TEXT , result TEXT)");


            gBrowser.addEventListener("load", gClean.loadReloadOrAddTab, true);
            //gBrowser.addEventListener("load", gClean.loadReloadOrAddTab, true);
            // var container = gBrowser.tabContainer;
            //  container.addEventListener("TabOpen", gClean.loadReloadOrAddTab, false);
        },

        run:function (doc) {
            var head = doc.getElementsByTagName("head")[0];
            var search_id_div = doc.getElementById("search");
            if (search_id_div) {
                //alert("searchdiv");

                var ires = doc.getElementById("ires");
                if (ires) {
                    var ol = ires.getElementsByTagName("ol")[0];
                    if (ol) {
                        //      alert("ol");

                        var allList = ol.children;
                        var appbar = doc.getElementById("appbar");

                        if (doc.getElementById('leftnav'))
                            doc.getElementById("leftnav").style.background = "none repeat scroll 0 0";
                        if (doc.getElementById('tbd'))
                            doc.getElementById("tbd").style.background = "none repeat scroll 0 0";

                        console.log(doc.getElementById('style_select'));
                        if (doc.getElementById('style_select')) {
                            //alert("select_style=true");
                            if (doc.cookie.split('style=')[1]) {
                                doc.getElementsByTagName('body')[0].className = 'theme_' + doc.cookie.split('style=')[1].split(';')[0];
                            }
                        } else {
                            //alert("select_style=false");
                            gCleanStyle.load_dropdown_options(doc);
                        }


                        if (doc.getElementsByTagName("form")[0]) {
                            var search_form = doc.getElementsByTagName("form")[0];
                            if (doc.getElementsByName("num")[0]) {

                            } else {
                                var input = doc.createElement("input");
                                input.setAttribute("type", "hidden");
                                input.setAttribute("name", "num");
                                input.setAttribute("id", "num");
                                input.setAttribute("value", "50");
                                search_form.appendChild(input);

                            }


                            var foundLinks = 0;
                            var style = doc.getElementById("g-clean-style");
                            if (!style) {
                                style = doc.createElement("link");
                                style.id = "g-clean-style";
                                style.type = "text/css";

                                style.rel = "stylesheet";
                                style.href = "chrome://gclean/skin/my_style.css";
                                if (head) {

                                    head.appendChild(style);
                                }

                            }
                            if (doc.getElementsByName("q") && doc.getElementsByName("q")[0]) {
                                //  alert("be4 list");

                                var search = doc.getElementsByName("q")[0].value;
                                for (var i = 0, il = allList.length; i < il; i++) {
                                    var elm = allList[i];
                                    if (elm && elm.getElementsByTagName("h3") && elm.getElementsByTagName("h3")[0]) {

                                        if (elm.getAttribute("class") && elm.getAttribute("class").indexOf("g") >= 0) {
                                            var href = elm.getElementsByTagName("h3")[0].childNodes[0].href || "";
                                            if (href != "") {
                                                var result = GClean_extra.clean_result_string(href);
                                                var result_domain = result.split('/')[0] + "//" + result.split('/')[2];

                                                elm.setAttribute('id', result);
                                                elm.setAttribute('name', result_domain);

                                                if (GClean_extra.exists_hidden("all", result) || GClean_extra.exists_hidden(search, result) || GClean_extra.exists_hidden("domain", result_domain)) {
                                                    gCleanPrepareResults.toggle(elm, doc, search);

                                                    if (elm.className.indexOf('hidden_off') == -1)
                                                        elm.className += " hidden_off"
                                                }
                                                else {
                                                    gCleanPrepareResults.toggle(elm, doc, search);
                                                }
                                                if (GClean_extra.exists_minimized(result)) {
                                                    elm.className = elm.className.replace('parent_on', 'parent_off');
                                                    elm.getElementsByClassName('vspib')[0].className = elm.getElementsByClassName('vspib')[0].className.replace('magnify_on', 'magnify_off');
                                                    elm.childNodes[0].className = 'max';
                                                }
                                            }
                                            foundLinks++;
                                        }
                                    } else {
                                        if (elm.getAttribute("class") && elm.getAttribute("class").indexOf("g") >= 0) {
                                            elm.innerHTML = "";
                                        }
                                    }
                                }
                                if (foundLinks == 0) {
                                    // alert("No links found with g class ");
                                }
                                else {
                                    //  alert("Found " + foundLinks + " list entries with g class");
                                }
                                var toggle_result;
                                if (doc.getElementById("toggle_hidden_elements")) {
                                    toggle_result = doc.getElementById("toggle_hidden_elements");
                                } else {
                                    toggle_result = doc.createElement("div");
                                    toggle_result.setAttribute("id", "toggle_hidden_elements");

                                    toggle_result.innerHTML = "";

                                    toggle_result.addEventListener("click", function () {
                                        gCleanStyle.toggle_hidden();
                                    }, true);
                                    if (!doc.getElementById('toggle_hidden_elements')) {// use insertBefore only in direct parents, no subtree support
                                        search_id_div.insertBefore(toggle_result, ires);
                                    }
                                }
                                if (doc.getElementsByClassName("hidden_off")[0]) {
                                    toggle_result.innerHTML = "SHOW HIDDEN RESULTS";
                                    toggle_result.className = "toggle_hidden_elements";
                                } else {
                                    toggle_result.innerHTML = "";
                                    toggle_result.className = "";

                                }

                            }
                        }

                    }
                }
            }

        }
    };
}();//dont remove the brakets!!!!!!!!!!!
var gCleanStyle = function () {
    return {

        toggle_border:function () {
            label_on = "Border OFF";
            label_off = "Border ON";
            if (content.document.getElementById("style_border").innerHTML == label_on) {
                GClean_extra.setCookie("border=true");

                if (content.document.getElementsByTagName('body')[0].className.indexOf("no_border") > -1) {
                    content.document.getElementsByTagName('body')[0].className = content.document.getElementsByTagName('body')[0].className.replace("no_border", "");
                }
                content.document.getElementById("style_border").innerHTML = label_off;
                content.document.getElementById("style_border").className = "on";
            }
            else if (content.document.getElementById("style_border").innerHTML == label_off) {
                GClean_extra.setCookie("border=false");

                if (content.document.getElementsByTagName('body')[0].className.indexOf("no_border") == -1) {
                    content.document.getElementsByTagName('body')[0].className += " no_border";
                }
                content.document.getElementById("style_border").innerHTML = label_on;
                content.document.getElementById("style_border").className = "off";

            }

        },

        toggle_shadow:function () {
            label_on = "Shadow OFF";
            label_off = "Shadow ON";
            if (content.document.getElementById("style_shadow").innerHTML == label_on) {
                GClean_extra.setCookie("shadow=true");
                if (content.document.getElementsByTagName('body')[0].className.indexOf("no_shadow") > -1) {
                    content.document.getElementsByTagName('body')[0].className = content.document.getElementsByTagName('body')[0].className.replace("no_shadow", "");
                }

                content.document.getElementById("style_shadow").innerHTML = label_off;
                content.document.getElementById("style_shadow").className = "on";

            }
            else if (content.document.getElementById("style_shadow").innerHTML == label_off) {
                GClean_extra.setCookie("shadow=false");

                if (content.document.getElementsByTagName('body')[0].className.indexOf("no_shadow") == -1) {
                    content.document.getElementsByTagName('body')[0].className += " no_shadow";

                }
                content.document.getElementById("style_shadow").innerHTML = label_on;
                content.document.getElementById("style_shadow").className = "off";

            }

        },

        toggle_round_corner:function () {
            label_on = "Round corner OFF";
            label_off = "Round corner ON";

            if (content.document.getElementById("style_round_corner").innerHTML == label_on) {
                GClean_extra.setCookie("round_corner=true");

                if (content.document.getElementsByTagName('body')[0].className.indexOf("no_round_corner") > -1) {

                    content.document.getElementsByTagName('body')[0].className = content.document.getElementsByTagName('body')[0].className.replace("no_round_corner", "");

                }
                content.document.getElementById("style_round_corner").innerHTML = label_off;
                content.document.getElementById("style_round_corner").className = "on";

            }
            else if (content.document.getElementById("style_round_corner").innerHTML == label_off) {
                GClean_extra.setCookie("round_corner=false");

                if (content.document.getElementsByTagName('body')[0].className.indexOf("no_round_corner") == -1) {
                    content.document.getElementsByTagName('body')[0].className += " no_round_corner";

                }
                content.document.getElementById("style_round_corner").innerHTML = label_on;
                content.document.getElementById("style_round_corner").className = "off";

            }
        },

        load_dropdown_options:function (doc) {
            //alert("load dropdown option")
            var style_vars = [
                //["NONE", "#ffffff"],
                ["AliceBlue", "#F0F8FF"],
                ["AntiqueWhite", "#FAEBD7"],
                ["Aqua", "#00FFFF"],
                ["Aquamarine", "#7FFFD4"],
                ["Azure", "#F0FFFF"],
                ["Beige", "#F5F5DC"],
                ["Bisque", "#FFE4C4"],
                ["Black", "#000000"],
                ["BlanchedAlmond", "#FFEBCD"],
                ["Blue", "#0000FF"],
                ["BlueViolet", "#8A2BE2"],
                ["Brown", "#A52A2A"],
                ["BurlyWood", "#DEB887"],
                ["CadetBlue", "#5F9EA0"],
                ["Chartreuse", "#7FFF00"],
                ["Chocolate", "#D2691E"],
                ["Coral", "#FF7F50"],
                ["CornflowerBlue", "#6495ED"],
                ["Cornsilk", "#FFF8DC"],
                ["Crimson", "#DC143C"],
                ["Cyan", "#00FFFF"],
                ["DarkBlue", "#00008B"],
                ["DarkCyan", "#008B8B"],
                ["DarkGoldenRod", "#B8860B"],
                ["DarkGray", "#A9A9A9"],
                ["DarkGreen", "#006400"],
                ["DarkKhaki", "#BDB76B"],
                ["DarkMagenta", "#8B008B"],
                ["DarkOliveGreen", "#556B2F"],
                ["Darkorange", "#FF8C00"],
                ["DarkOrchid", "#9932CC"],
                ["DarkRed", "#8B0000"],
                ["DarkSalmon", "#E9967A"],
                ["DarkSeaGreen", "#8FBC8F"],
                ["DarkSlateBlue", "#483D8B"],
                ["DarkSlateGray", "#2F4F4F"],
                ["DarkTurquoise", "#00CED1"],
                ["DarkViolet", "#9400D3"],
                ["DeepPink", "#FF1493"],
                ["DeepSkyBlue", "#00BFFF"],
                ["DimGray", "#696969"],
                ["DodgerBlue", "#1E90FF"],
                ["FireBrick", "#B22222"],
                ["FloralWhite", "#FFFAF0"],
                ["ForestGreen", "#228B22"],
                ["Fuchsia", "#FF00FF"],
                ["Gainsboro", "#DCDCDC"],
                ["GhostWhite", "#F8F8FF"],
                ["Gold", "#FFD700"],
                ["GoldenRod", "#DAA520"],
                ["Gray", "#808080"],
                ["Green", "#008000"],
                ["GreenYellow", "#ADFF2F"],
                ["HoneDew", "#F0FFF0"],
                ["HotPink", "#FF69B4"],
                ["IndianRed ", "#CD5C5C"],
                ["Indigo ", "#4B0082"],
                ["Ivory", "#FFFFF0"],
                ["Khaki", "#F0E68C"],
                ["Lavender", "#E6E6FA"],
                ["LavenderBlush", "#FFF0F5"],
                ["LawnGreen", "#7CFC00"],
                ["LemonChiffon", "#FFFACD"],
                ["LightBlue", "#ADD8E6"],
                ["LightCoral", "#F08080"],
                ["LightCyan", "#E0FFFF"],
                ["LightGoldenRodYellow", "#FAFAD2"],
                ["LightGrey", "#D3D3D3"],
                ["LightGreen", "#90EE90"],
                ["LightPink", "#FFB6C1"],
                ["LightSalmon", "#FFA07A"],
                ["LightSeaGreen", "#20B2AA"],
                ["LightSkyBlue", "#87CEFA"],
                ["LightSlateGray", "#778899"],
                ["LightSteelBlue", "#B0C4DE"],
                ["LightYellow", "#FFFFE0"],
                ["Lime", "#00FF00"],
                ["LimeGreen", "#32CD32"],
                ["Linen", "#FAF0E6"],
                ["Magenta", "#FF00FF"],
                ["Maroon", "#800000"],
                ["MediumAquaMarine", "#66CDAA"],
                ["MediumBlue", "#0000CD"],
                ["MediumOrchid", "#BA55D3"],
                ["MediumPurple", "#9370D8"],
                ["MediumSeaGreen", "#3CB371"],
                ["MediumSlateBlue", "#7B68EE"],
                ["MediumSpringGreen", "#00FA9A"],
                ["MediumTurquoise", "#48D1CC"],
                ["MediumVioletRed", "#C71585"],
                ["MidnightBlue", "#191970"],
                ["MintCream", "#F5FFFA"],
                ["MistyRose", "#FFE4E1"],
                ["Moccasin", "#FFE4B5"],
                ["NavajoWhite", "#FFDEAD"],
                ["Navy", "#000080"],
                ["OldLace", "#FDF5E6"],
                ["Olive", "#808000"],
                ["OliveDrab", "#6B8E23"],
                ["Orange", "#FFA500"],
                ["OrangeRed", "#FF4500"],
                ["Orchid", "#DA70D6"],
                ["PaleGoldenRod", "#EEE8AA"],
                ["PaleGreen", "#98FB98"],
                ["PaleTurquoise", "#AFEEEE"],
                ["PaleVioletRed", "#D87093"],
                ["PapayaWhip", "#FFEFD5"],
                ["PeachPuff", "#FFDAB9"],
                ["Peru", "#CD853F"],
                ["Pink", "#FFC0CB"],
                ["Plum", "#DDA0DD"],
                ["PowderBlue", "#B0E0E6"],
                ["Purple", "#800080"],
                ["Red", "#FF0000"],
                ["RosyBrown", "#BC8F8F"],
                ["RoyalBlue", "#4169E1"],
                ["SaddleBrown", "#8B4513"],
                ["Salmon", "#FA8072"],
                ["SandyBrown", "#F4A460"],
                ["SeaGreen", "#2E8B57"],
                ["SeaShell", "#FFF5EE"],
                ["Sienna", "#A0522D"],
                ["Silver", "#C0C0C0"],
                ["SkyBlue", "#87CEEB"],
                ["SlateBlue", "#6A5ACD"],
                ["SlateGray", "#708090"],
                ["Snow", "#FFFAFA"],
                ["SpringGreen", "#00FF7F"],
                ["SteelBlue", "#4682B4"],
                ["Tan", "#D2B48C"],
                ["Teal", "#008080"],
                ["Thistle", "#D8BFD8"],
                ["Tomato", "#FF6347"],
                ["Turquoise", "#40E0D0"],
                ["Violet", "#EE82EE"],
                ["Wheat", "#F5DEB3"],
                ["White", "#FFFFFF"],
                ["WhiteSmoke", "#F5F5F5"],
                ["Yellow", "#FFFF00"],
                ["YellowGreen", "#9ACD32"]
            ];
            var stylebox = doc.createElement("span");
            stylebox.id = "stylebox";
            //START BACK BUTTON
            var prev = doc.createElement("span");
            prev.style.cursor = "pointer";
            prev.innerHTML = "Back";
            prev.addEventListener("click", function () {
                gCleanStyle.previous_style();
            }, true);
            //END BACK BUTTON
            //START NEXT BUTTON
            var next = doc.createElement("span");
            next.style.cursor = "pointer";
            next.innerHTML = "Next";
            next.addEventListener("click", function () {
                gCleanStyle.next_style();
            }, true);
            //END NEXT BUTTON
            //START select options
            var select = doc.createElement("select");
            var style_length = 0;
            select.setAttribute("id", "style_select");
            var new_style;

            for (var i = 0 , li = style_vars.length; i < li; i++) {
                var option = doc.createElement("option");
                option.setAttribute("name", "style_options");
                if (style_length < style_vars[i][0].length && GClean_extra.getCookie(style_vars[i][0]) > -1) {

                    style_length = style_vars[i][0].length;
                    option.setAttribute("selected", "selected");
                    new_style = 'theme_' + style_vars[i][0];

                } else {
                    // new_style = '';
                }
                option.setAttribute("value", style_vars[i][0]);
                option.innerHTML = style_vars[i][0];
                option.setAttribute("style", "background-color:" + style_vars[i][1]);
                select.appendChild(option);
            }
            select.addEventListener("change", function () {
                gCleanStyle.selected_style();
            }, true);

            stylebox.appendChild(prev);
            stylebox.appendChild(select);
            stylebox.appendChild(next);
            var border = doc.createElement("span");
            border.style.cursor = "pointer";
            border.style.marginLeft = "15px";
            border.id = "style_border";
            border.innerHTML = "Border ON";
            border.addEventListener("click", function () {
                gCleanStyle.toggle_border();
            }, true);
            stylebox.appendChild(border);
            //END border

            //START  shadow
            var shadow = doc.createElement("span");
            shadow.style.cursor = "pointer";
            shadow.style.marginLeft = "15px";
            shadow.id = "style_shadow";
            shadow.innerHTML = "Shadow ON";
            shadow.addEventListener("click", function () {
                gCleanStyle.toggle_shadow();
            }, true);
            //END border
            stylebox.appendChild(shadow);

            //START  round_corner
            var round_corner = doc.createElement("span");
            round_corner.style.cursor = "pointer";
            round_corner.style.marginLeft = "15px";
            round_corner.id = "style_round_corner";
            round_corner.innerHTML = "Round corner ON";
            round_corner.addEventListener("click", function () {
                gCleanStyle.toggle_round_corner();
            }, true);
            //END border
            stylebox.appendChild(round_corner);
            var cnt = doc.getElementById("cnt");

            if (cnt) {
                var resultStats = doc.getElementById("resultStats");
                if (resultStats) {
                    //insert stylebox after resultStats
                    resultStats.parentNode.insertBefore(stylebox, resultStats.nextSibling);
                }
            }
            if (GClean_extra.getCookie("border=false") > -1) {
                new_style += " no_border";
                content.document.getElementById("style_border").innerHTML = "Border OFF";
                content.document.getElementById("style_border").className = "off";
            } else {
                content.document.getElementById("style_border").innerHTML = "Border ON";
                content.document.getElementById("style_border").className = "on";
            }
            if (GClean_extra.getCookie("shadow=false") > -1) {
                new_style += " no_shadow";
                content.document.getElementById("style_shadow").innerHTML = "Shadow OFF";
                content.document.getElementById("style_shadow").className = "off";

            } else {
                content.document.getElementById("style_shadow").innerHTML = "Shadow ON";
                content.document.getElementById("style_shadow").className = "on";

            }
            if (GClean_extra.getCookie("round_corner=false") > -1) {
                new_style += " no_round_corner";
                content.document.getElementById("style_round_corner").innerHTML = "Round corner OFF";
                content.document.getElementById("style_round_corner").className = "off";

            } else {
                content.document.getElementById("style_round_corner").innerHTML = "Round corner ON";
                content.document.getElementById("style_round_corner").className = "on";

            }
            doc.getElementsByTagName('body')[0].className = new_style;
        },
        next_style:function () {

            drop_down = content.document.getElementById('style_select');
            new_index = drop_down.selectedIndex + 1;
            if (new_index >= 0 && drop_down.options[new_index]) {
            } else {
                new_index = 0;
            }
            color = drop_down.options[new_index].value;
            next_color = drop_down.options[new_index + 1].style.backgroundColor;
            drop_down.selectedIndex = new_index;
            gCleanStyle.updateStyle();
            GClean_extra.setCookie("style=" + color)
        },

        previous_style:function () {
            drop_down = content.document.getElementById('style_select');
            new_index = drop_down.selectedIndex - 1;
            if (new_index >= 0 && drop_down.options[new_index]) {
            } else {
                new_index = drop_down.length - 1;
            }
            color = drop_down.options[new_index].value;
            drop_down.selectedIndex = new_index;
            gCleanStyle.updateStyle();
            GClean_extra.setCookie("style=" + color)
        },
        selected_style:function () {
            drop_down = content.document.getElementById('style_select');
            color = drop_down.options[drop_down.selectedIndex].value;
            gCleanStyle.updateStyle();
            GClean_extra.setCookie("style=" + color)
        },
        updateStyle:function () {
            var cn = content.document.getElementsByTagName('body')[0].className;
            var acn = cn.split(" ");
            acn[0] = "theme_" + color;
            content.document.getElementsByTagName('body')[0].className = acn.join(" ");
        },


        toggle_hidden:function () {

            if (content.document.getElementsByClassName('hidden_off') && content.document.getElementsByClassName('hidden_off').length > 0) {
                s1 = 'hidden_off';
                s2 = 'hidden_on';
                s3 = 'HIDE RESULTS';
            } else if (content.document.getElementsByClassName('hidden_on') && content.document.getElementsByClassName('hidden_on').length > 0) {
                s1 = 'hidden_on';
                s2 = 'hidden_off';
                s3 = 'SHOW HIDDEN RESULTS'
            } else {
                s1 = 'not_hidden_on_not_hidden_off';
                s3 = '';
            }
            while (content.document.getElementsByClassName(s1) && content.document.getElementsByClassName(s1)[0]) {
                content.document.getElementsByClassName(s1)[0].className = content.document.getElementsByClassName(s1)[0].className.replace(s1, s2);
            }
            content.document.getElementById("toggle_hidden_elements").style.cursor = 'pointer';
            content.document.getElementById("toggle_hidden_elements").innerHTML = s3;
        }
    };
}
    ();//dont remove the brakets!!!!!!!!!!!

var GClean_extra = {
        setCookie:function (data) {
            var exp = new Date();
            var numdays = 7;
            exp.setTime(exp.getTime() + (1000 * 60 * 60 * 24 * numdays));
            content.document.cookie = data + ";  expires=" + exp.toGMTString();
        },
        getCookie:function (data) {
            return content.document.cookie.indexOf(data);
        },
        clean_result_string:function (result) {
            if (result.indexOf("google.") > -1 && result.indexOf("url=") > -1) {
                result = result.split('url=')[1].split("&")[0];
            }
            return result;
        },

        exists_minimized:function (result) {
            condition = "SELECT result FROM minimized_results WHERE result = :result";
            statement = gClean.dbConn.createStatement(condition);
            statement.params.result = result;
            var exists = false;
            while (statement.executeStep()) {
                exists = true;
            }
            statement.reset();
            return exists;
        },
        exists_hidden:function (search, result) {

            var statement;
            if (result && search) {
                condition = "SELECT search,result FROM hidden_results WHERE result = :result AND search = :search";
                statement = gClean.dbConn.createStatement(condition);
                statement.params.result = result;
                statement.params.search = search;
            }
            else if (!result && search) {
                condition = "SELECT search FROM hidden_results WHERE search = :search";
                statement = gClean.dbConn.createStatement(condition);
                statement.params.search = search;
            }
            else if (result && !search) {
                condition = "SELECT result FROM hidden_results WHERE result = :result";
                statement = gClean.dbConn.createStatement(condition);
                statement.params.result = result;
            }
            var exists = false;
            while (statement.executeStep()) {
                exists = true;
            }
            statement.reset();
            return exists;
        },
        exists_favorite:function (search, result) {

            var statement;
            if (result && search) {
                condition = "SELECT search,result FROM favorite_results WHERE result = :result AND search = :search";
                statement = gClean.dbConn.createStatement(condition);
                statement.params.result = result;
                statement.params.search = search;
            }
            else if (!result && search) {
                condition = "SELECT search FROM favorite_results WHERE search = :search";
                statement = gClean.dbConn.createStatement(condition);
                statement.params.search = search;
            }
            else if (result && !search) {
                condition = "SELECT result FROM favorite_results WHERE result = :result";
                statement = gClean.dbConn.createStatement(condition);
                statement.params.result = result;
            }
            var exists = false;
            while (statement.executeStep()) {
                exists = true;
            }
            statement.reset();
            return exists;
        },
        do_statement:function (search, result, condition) {
            var statement = gClean.dbConn.createStatement(condition);
            if (result != false)
                statement.params.result = result;
            if (search != false)
                statement.params.search = search;
            statement.execute();
            //   return statement;
        }

    }
    ;
var gCleanPrepareResults = {
    toggle:function (elm, doc, search) {
        //elm.style.overflow = "hidden";
        elm.style.position = "relative";
        if (elm.className.indexOf('nice_outer_div') == -1)
            elm.className += " nice_outer_div";
        if (elm.className.indexOf('parent_on') == -1)
            elm.className += " parent_on";
        var result = elm.getElementsByTagName('h3')[0].childNodes[0].href;
        if (result.indexOf('google.') > -1 && result.indexOf('url=') > -1) {
            result = unescape(result.split('url=')[1].split('&')[0]);
        }
        gCleanPrepareResults.prepare_result(result, search, elm);

        elm.style.backgroundColor = "#ffffff";
//        var close = doc.createElement("div");  //need content.document
//        close.id = "close";
//        close.className = "min";
//        close.title = "Minimize";
//        close.innerHTML = "_";
//        close.addEventListener("click", function () {
//
//            if (this.parentNode.className.indexOf('parent_on') == -1) {
//                this.parentNode.className = this.parentNode.className.replace('parent_off', 'parent_on');
//                this.className = 'min';
//                this.innerHTML = '_';
//                this.title = 'Minimize';
//                gCleanResultActions.maximize(this.parentNode.id);
//            }
//            else if (this.parentNode.className.indexOf('parent_off') == -1) {
//                this.parentNode.className = this.parentNode.className.replace('parent_on', 'parent_off');
//                this.className = 'max';
//                this.innerHTML = '[]';
//                this.title = 'Maximize';
//                gCleanResultActions.minimize(this.parentNode.id);
//            }
//        }, true);
//        if (elm.children && elm.children[0] && elm.children[0].id == "close") {
//
//        } else {//add close box at the beginning of li
//            var list_child = elm.childNodes[0];
//            elm.insertBefore(close, list_child);
//
//        }
    },

    prepare_result:function (result, search, elm) {
        var result_domain = result.split('/')[0] + "//" + result.split('/')[2];
        if (result.length > 0) {
            if (GClean_extra.exists_hidden(search, result)) {
                gCleanPrepareResults.add_option(true, false, false, true, false, true, result, search, elm);
            } else if (GClean_extra.exists_hidden("all", result)) {
                gCleanPrepareResults.add_option(false, true, true, false, false, true, result, search, elm);
            } else if (GClean_extra.exists_hidden("domain", result_domain)) {
                gCleanPrepareResults.add_option(false, false, false, false, true, false, result_domain, '', elm);
            }
            else {
                gCleanPrepareResults.add_option(false, true, false, true, false, true, result, search, elm);
            }
        }
    },
    add_option:function (add, remove, add_all, remove_all, add_domain, remove_domain, result, search, elm) {
        var toggleHiddenElement = content.document.getElementById('toggle_hidden_elements');

        var favResult = content.document.createElement("div");  //need content.document
        favResult.id = "favResult";
        favResult.className = "favResult ";
        favResult.title = "Fav Result";
        favResult.style.cursor = "pointer";
        favResult.innerHTML = "favResult";
        var favDomain = content.document.createElement("div");  //need content.document
        favDomain.id = "favDomain";
        favDomain.className = "favDomain ";
        favDomain.title = "Fav Domain";
        favDomain.style.cursor = "pointer";
        favDomain.innerHTML = "favDomain";
        var one = content.document.createElement("div");  //need content.document
        one.id = "one";
        one.className = "one ";
        one.title = "Hide for this search";
        one.style.cursor = "pointer";
        one.innerHTML = "X";
        var two = content.document.createElement("div");  //need content.document
        two.id = "two";
        two.className = "two ";
        two.title = "Hide always";
        two.style.cursor = "pointer";
        two.innerHTML = "A";
        var three = content.document.createElement("div");  //need content.document
        three.id = "three";
        three.className = "three ";
        var result_domain = result.split('/')[0] + "//" + result.split('/')[2];
        three.title = "Hide Domain " + result_domain;
        three.style.cursor = "pointer";
        three.innerHTML = "D";
        if (add) {
            one.title = "Show for this search";
            one.className = "one r_here";
        }
        else if (remove) {
            one.title = "Hide for this search";
            one.className = "one a_here";
        }
        one.addEventListener("click", function () {
            if (this.title == "Hide for this search") {
                this.title = "Show for this search";
                gCleanResultActions.remove_result_from_search(false, false, result, search);
            } else {
                this.title = "Hide for this search";
                gCleanResultActions.add_result_to_search(false, false, result, search);
            }
        }, true);

        if (add_all) {
            two.title = "Show always";
            two.className = "two r_always";
        }
        else if (remove_all) {
            two.title = "Hide always";
            two.className = "two a_always";
        }
        two.addEventListener("click", function () {
            if (this.title == "Hide always") {
                this.title = "Show always";
                gCleanResultActions.remove_result_from_search(true, false, result, search);
            } else {
                this.title = "Hide always";
                gCleanResultActions.add_result_to_search(true, false, result, search);
            }

        }, true);
        if (add_domain) {
            three.title = "Show Domain " + result_domain;
            three.className = "three r_domain";
            one.innerHTML = "";
            two.innerHTML = "";
        }
        else if (remove_domain) {
            three.title = "Hide Domain " + result_domain;
            three.className = "three a_domain";
        }
        three.addEventListener("click", function () {
            if (this.title == "Hide Domain " + result_domain) {
                this.title = "Show Domain " + result_domain;
                gCleanResultActions.remove_result_from_search(false, true, result, search);
            } else {
                this.title = "Hide Domain " + result_domain;


                gCleanResultActions.add_result_to_search(false, true, result, search);
            }
        }, true);
        favResult.addEventListener("click", function () {
            if (GClean_extra.exists_favorite(false, result)) {
                gCleanResultActions.remove_favorite(search, result);
            } else {
                gCleanResultActions.add_favorite(search, result);
            }
        }, true);
        favDomain.addEventListener("click", function () {
            var result_domain = result.split('/')[0] + "//" + result.split('/')[2];
            if (GClean_extra.exists_favorite("domain", result_domain)) {
                gCleanResultActions.remove_favorite("domain", result_domain);
            } else {
                gCleanResultActions.add_favorite("domain", result_domain);
            }
        }, true);
        var list_child = elm.childNodes[0];
        elm.insertBefore(one, list_child);
        elm.insertBefore(two, list_child);
        elm.insertBefore(three, list_child);
        //TODO style fav buttons
        //elm.insertBefore(favResult, list_child);
        //elm.insertBefore(favDomain, list_child);

    }
};//dont remove the brakets!!!!!!!!!!!
var gCleanResultActions = {
    minimize:function (result) {
        GClean_extra.do_statement(false, result, "INSERT INTO minimized_results (result) SELECT :result WHERE NOT EXISTS (SELECT 1 FROM minimized_results WHERE result = :result );");
    },
    maximize:function (result) {
        GClean_extra.do_statement(false, result, "DELETE FROM minimized_results WHERE result = :result");
    },
    add_favorite:function (search, result) {
        GClean_extra.do_statement(search, result, "INSERT INTO favorite_results (search, result) SELECT :search,:result WHERE NOT EXISTS (SELECT 1 FROM favorite_results WHERE search = :search AND result = :result );");
    },
    remove_favorite:function (search, result) {
        GClean_extra.do_statement(search, result, "DELETE FROM favorite_results WHERE search = :search AND result = :result");
    },
    remove_result_from_search:function (all, domain, result, search) {
        var one;
        var two;
        var three;
        var doc = content.document;
        var result_domain = result.split('/')[0] + "//" + result.split('/')[2];
        var toggleHiddenElement = doc.getElementById('toggle_hidden_elements').innerHTML;
        if (domain) {

            GClean_extra.do_statement("domain", result_domain, "INSERT INTO hidden_results (search, result) SELECT :search,:result WHERE NOT EXISTS (SELECT 1 FROM hidden_results WHERE search = :search AND result = :result );");
            var list = doc.getElementsByName(result_domain);
            for (var i = 0, il = list.length; i < il; i++) {

                GClean_extra.do_statement(false, list[i].id, "DELETE FROM hidden_results WHERE result = :result");

                if (toggleHiddenElement == "SHOW HIDDEN RESULTS" || toggleHiddenElement == "") {

                    list[i].className += ' hidden_off';
                } else {
                    if (list[i].className.indexOf('hidden_on') == -1) {
                        list[i].className += ' hidden_on';
                    }
                }
                //one
                //one = this.parentNode.getElementsByClassName("one")[0];
                one = list[i].getElementsByClassName("one")[0];
                one.className = one.className.replace("r_here", "");
                one.className = one.className.replace("a_here", "");
                one.innerHTML = "";


                //two
                two = list[i].getElementsByClassName("two")[0];
                two.className = two.className.replace("r_always", "");
                two.className = two.className.replace("a_always", "");
                two.innerHTML = "";

                //three
                three = list[i].getElementsByClassName("three")[0];
                three.className = three.className.replace("a_domain", "r_domain");

            }


        } else {
            var result_element = doc.getElementById(result);
            if (all) {
                if (GClean_extra.exists_hidden(false, result)) {
                    GClean_extra.do_statement(false, result, "DELETE FROM hidden_results WHERE result = :result");
                }
                else if (GClean_extra.exists_hidden("domain", result_domain)) {
                    GClean_extra.do_statement("domain", result_domain, "DELETE FROM hidden_results WHERE search = :search AND result = :result");
                }
                GClean_extra.do_statement("all", result, "INSERT INTO hidden_results (search, result) SELECT :search,:result WHERE NOT EXISTS (SELECT 1 FROM hidden_results WHERE search = :search AND result = :result );");

                //one
                one = result_element.getElementsByClassName("one")[0];
                one.className = one.className.replace("r_here", "a_here");
                //two
                two = result_element.getElementsByClassName("two")[0];
                two.className = two.className.replace("a_always", "r_always");
                //three
                three = result_element.getElementsByClassName("three")[0];
                three.className = three.className.replace("r_domain", "a_domain");
                //three.innerHTML="D";

                result_element.children[0].title = "Hide for this search";
                result_element.children[1].title = "Show always";
            } else {
                if (GClean_extra.exists_hidden("all", result)) {
                    GClean_extra.do_statement("all", result, "DELETE FROM hidden_results WHERE search = :search AND result = :result");
                }
                else if (GClean_extra.exists_hidden("domain", result_domain)) {
                    GClean_extra.do_statement("domain", result_domain, "DELETE FROM hidden_results WHERE search = :search AND result = :result");
                }
                GClean_extra.do_statement(search, result, "INSERT INTO hidden_results (search, result) SELECT :search,:result WHERE NOT EXISTS (SELECT 1 FROM hidden_results WHERE search = :search AND result = :result );");
                result_element.children[0].title = "Show for this search";
                result_element.children[1].title = "Hide always";
                //one
                one = result_element.getElementsByClassName("one")[0];
                one.className = one.className.replace("a_here", "r_here");
                //two
                two = result_element.getElementsByClassName("two")[0];
                two.className = two.className.replace("r_always", "a_always");
                //three
                three = result_element.getElementsByClassName("three")[0];
                three.className = three.className.replace("r_domain", "a_here");

            }
            if (toggleHiddenElement == "SHOW HIDDEN RESULTS" || toggleHiddenElement == "") {

                result_element.className += ' hidden_off';
            } else {

                if (result_element.className.indexOf('hidden_on') == -1) {

                    result_element.className += ' hidden_on';
                }
            }
        }
        if (doc.getElementsByClassName('hidden_off')[0]) {
            doc.getElementById('toggle_hidden_elements').innerHTML = "SHOW HIDDEN RESULTS";
            doc.getElementById('toggle_hidden_elements').className = "toggle_hidden_elements";
        }
        if (doc.getElementsByClassName('hidden_on')[0]) {
            doc.getElementById('toggle_hidden_elements').innerHTML = "HIDE RESULTS";
            doc.getElementById('toggle_hidden_elements').className = "toggle_hidden_elements";
        }
        if (!doc.getElementsByClassName('hidden_on')[0] && !doc.getElementsByClassName('hidden_off')[0]) {
            doc.getElementById('toggle_hidden_elements').innerHTML = "";
            doc.getElementById('toggle_hidden_elements').className = "";
        }
    },

    add_result_to_search:function (all, domain, result, search) {
        var one;
        var two;
        var three;

        var doc = content.document;
        if (domain) {
            var result_domain = result.split('/')[0] + "//" + result.split('/')[2];

            GClean_extra.do_statement("domain", result_domain, "DELETE FROM hidden_results WHERE search = :search AND result = :result");
            var list = doc.getElementsByName(result_domain);
            for (var i = 0, il = list.length; i < il; i++) {
                list[i].className = list[i].className.replace('hidden_on', '');
                list[i].children[0].title = "Hide for this search";
                list[i].children[1].title = "Hide always";
                list[i].children[2].title = "Hide Domain " + result_domain;

                //one
                one = list[i].getElementsByClassName("one")[0];
                one.className = "one a_here";
                one.innerHTML = "X";
                //two
                two = list[i].getElementsByClassName("two")[0];
                two.className = "two a_always";
                two.innerHTML = "A";
                //three
                three = list[i].getElementsByClassName("three")[0];
                three.className = three.className.replace("r_domain", "a_domain");

            }
        } else {
            var result_element = doc.getElementById(result);
            if (all) {
                GClean_extra.do_statement(false, result, "DELETE FROM hidden_results WHERE result = :result");

            } else {
                GClean_extra.do_statement(search, result, "DELETE FROM hidden_results WHERE search = :search AND result = :result");

            }
            //one
            one = result_element.getElementsByClassName("one")[0];
            one.className = one.className.replace("r_here", "a_here");
            //two
            two = result_element.getElementsByClassName("two")[0];
            two.className = two.className.replace("r_always", "a_always");
            //three
            three = result_element.getElementsByClassName("three")[0];
            three.className = three.className.replace("r_domain", "a_domain");
            if (result_element) {
                result_element.className = result_element.className.replace('hidden_on', '');

            }

        }
        if (doc.getElementsByClassName('hidden_off')[0]) {
            doc.getElementById('toggle_hidden_elements').innerHTML = "SHOW HIDDEN RESULTS";
            doc.getElementById('toggle_hidden_elements').className = "toggle_hidden_elements";
        }
        if (doc.getElementsByClassName('hidden_on')[0]) {
            doc.getElementById('toggle_hidden_elements').innerHTML = "HIDE RESULTS";
            doc.getElementById('toggle_hidden_elements').className = "toggle_hidden_elements";
        }
        if (!doc.getElementsByClassName('hidden_on')[0] && !doc.getElementsByClassName('hidden_off')[0]) {
            doc.getElementById('toggle_hidden_elements').innerHTML = "";
            doc.getElementById('toggle_hidden_elements').className = "";
        }
    }
};


window.addEventListener("load", gClean.init, true);
//gClean.init();
