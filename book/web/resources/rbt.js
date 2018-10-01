/* (c) Dave Pullin 2014. BEWARE CLONE OF factory/rbt.js because I'm lazy
 * RBT is a name scoping singleton
 * 
 * note add new function at bottom using RBT.xx = function() {}
 *          <script src="terri_js.jsp"></script>
 <LINK REL="stylesheet" href="terri_css.jsp" type="text/css" media="screen, print">
 */
/* RBT  */
if (typeof RBT === 'undefined')
    RBT = new Object();
RBT = new function () {
    this.version = /**********************************************/ "V180426a";
    this.debug = false;
    this.jsonServerURL = "/";

    this.debugging_notes = function (s) {
        RBT.log(s);
    };
    this.newAjax = function () {
        var ajax = null;
        if (window.XMLHttpRequest)// code for IE7+, Firefox, Chrome, Opera, Safari
            ajax = new XMLHttpRequest();
        else// code for IE6, IE5
            ajax = new ActiveXObject("Microsoft.XMLHTTP");
        ajax.handle_success = function () {
            this.end_at = (new Date()).getTime();
            RBT.debugging_notes("ajax took:" + (this.end_at - this.start_at) + "msecs");
            if (RBT.debug)
                RBT.debugging_notes("ajax returned:" + this.responseText);

            try
            {
                eval(this.responseText);
                var evaled_at = (new Date()).getTime();
                RBT.debugging_notes("eval took:" + (evaled_at - this.end_at) + "msecs");
            } catch (err)
            {
                if (this.target_element)
                    this.target_element.innerHTML = "Widget Failed";

                if (RBT.suppress_error_notifications)
                    ;
                else if (RBT.suppress_error_text) {
                    RBT.suppress_error_notifications = confirm("Another error occurred. Click OK to suppress notifications.");
                    if (!RBT.suppress_error_notifications)
                        RBT.suppress_error_text = !confirm("Show the error?");
                }
                if (!RBT.suppress_error_text) {
                    RBT.set_autorun(false);

                    var txt = "There was an error on this page: " + err.message + "\n";
                    txt += "Error stack: " + err.stack + "\n\n";

                    RBT.suppress_error_text = confirm(txt + "\n\nClick OK to continue and suppress error text.\nClick cancel to show more.");
                    var log = document.getElementById("rbt_log");
                    if (log)
                        log.innerHTML = (txt + "ResponseText:\n" + this.responseText).replace(/</g, '&lt;').replace(/\n/g, '<br>');
                    else
                        alert("no log field to display error text");

                    //var win = window.open(); //null,"debug");
                    //win.document.title="Debug";
                    // win.document.body.innerHTML=txt;
                }
            }
        };
        return ajax;
    };
    this.suppress_error_text = false;
    this.suppress_error_notifications = false;
    this.async_script_auto_retry = true;
    this.async_script = function (url, target_element) {
        var ajax = RBT.newAjax();
        ajax.target_element = target_element;
        ajax.onreadystatechange = function () {
            if (this.readyState === 4)
                if (this.status === 200) {
                    this.handle_success();
                    //if(debug)alert("document.cookie="+document.cookie);
                } else {
                    var msg = "Ajax Status=" + this.status;
                    RBT.status(msg);
                    /* add to chain */
                    RBT.status("Server is not responding");
                    if (RBT.async_script_auto_retry) {
                        this.next_ajax = null;
                        if (RBT.ajax_tail)
                            RBT.ajax_tail.next_ajax = this;
                        else
                            RBT.ajax_head = this;
                        RBT.ajax_tail = this;
                        if (RBT.ajax_head === this)
                            setTimeout("RBT.ajax_retry();", 2000);
                    }
                }
        };

        ajax.start_at = (new Date()).getTime();
        if (RBT.page_updated_at)
            url += '&since=' + RBT.page_updated_at;
        ajax.open("GET", url + '&op=js', true);

        ajax.send(null);
        return ajax;
    };
    this.sync_script = function (url, target_element) {
        var ajax = RBT.newAjax();
        ajax.target_element = target_element;

        ajax.start_at = (new Date()).getTime();
        if (RBT.page_updated_at)
            url += '&since=' + RBT.page_updated_at;
        ajax.open("GET", url + '&op=js', false);
        ajax.send(null);
        if (ajax.status === 200) {
            ajax.handle_success();
            //if(debug)alert("document.cookie="+document.cookie);
        } else {
            alert("button press failed"); /***************************** ??????????????????????????? ****************************/
        }
        return ajax;
    };
    this.ajax_head = null;
    this.ajax_tail = null;
    this.ajax_retry = function () {
        while (RBT.ajax_head) {
            var ajax = RBT.ajax_head;
            RBT.ajax_head = ajax.next_ajax;
            if (RBT.ajax_tail === ajax)
                RBT.ajax_tail = null;
            RBT.status("retrying Ajax");
            ajax.send(null);
        }
    };
    this.click_layout = function (e) {
        var layout = RBT.mouseover_layout(e);
        RBT.last_x = RBT.xPosition;
        RBT.last_y = RBT.yPosition;
        //this.send(this.choice,RBT.xPosition,RBT.yPosition);
        var r = document.getElementById("rbt_results");
        r.innerHTML += "<br>" + this.choice + " " + RBT.xPosition + " " + RBT.yPosition;

        var sprite = document.getElementById("rbt_sprite");
        //sprite.style.top=RBT.yPosition+"px";
        //sprite.style.left=RBT.xPosition+"px";

        var img = document.createElement("IMG");
        img.src = "images/rbt/sprite.png";
        img.className = "rbt_marker";
        img.style.position = "absolute";
        img.style.top = (RBT.yPosition - 8) + "px";
        img.style.left = (RBT.xPosition - 8) + "px";
        layout.appendChild(img);
        RBT.layout_items[RBT.layout_items_count] = img;
        RBT.layout_items_count++;

        var url = "layout_set.jsp?x=" + RBT.xPosition + "&y=" + RBT.yPosition + "&type=" + RBT.choice + "&name=" + document.getElementById("rbt_name").value;
        RBT.async_script(url);
    };
    this.mouseover_layout = function (e) {
        e = e || window.event;
        var layout = target = document.getElementById("rbt_layout");
        RBT.xPosition = e.clientX;
        RBT.yPosition = e.clientY;
        while (target != null) {
            RBT.xPosition -= target.offsetLeft;
            RBT.yPosition -= target.offsetTop;
            target = target.offsetParent;
        }
        var lock_x = document.getElementById("rbt_lock_x");
        if (lock_x.checked)
            RBT.xPosition = RBT.last_x;
        var lock_y = document.getElementById("rbt_lock_y");
        if (lock_y.checked)
            RBT.yPosition = RBT.last_y;
        document.getElementById("answerX").innerHTML = "X:" + RBT.xPosition;
        document.getElementById("answerY").innerHTML = "Y:" + RBT.yPosition;

        return layout;
    };
    this.layout_items = [];
    this.layout_items_count = 0;
    this.choice = "Segment";
    this.clicked_choice = function (f) {
        this.choice = f.innerHTML;
        var c = document.getElementsByName("rbt_choice");
        for (var i = 0; i < c.length; i++)
            c[i].className = "rbt_choice";
        f.className = "rbt_choice_on";
    };
    this.layout_step_inserted = function () {
        // do nothing?
    };

    this.get_segments = function () {
        var url = "run.jsp?action=get_segments";
        RBT.async_script(url);
    };


    //Totes
    // positions in returned tote list
    this.TOTE_X = 0;
    this.TOTE_Y = 1;
    this.TOTE_NAME = 2;
    this.TOTE_BARCODE = 3;
    this.TOTE_DESTINATION = 4;
    this.movement = 20; //pixels per step
    this.draw_millis = 10; // millis per step
    //
    this.totes = [];
    this.tote = function (iTote, data) {
        this.x = data[RBT.TOTE_X];
        this.y = data[RBT.TOTE_Y];
        this.name = data[RBT.TOTE_NAME];

        var d = document.createElement("DIV");
        d.className = "rbt_tote";
        d.style.position = "absolute";
        var t = document.createTextNode(this.name);
        d.appendChild(t);
        this.div = d;

        this.setData = function (data) {
            this.div.innerHTML = this.name + (data[RBT.TOTE_DESTINATION] == "null" || data[RBT.TOTE_DESTINATION] === null ? "" : "(" + data[RBT.TOTE_DESTINATION] + ")");
        };
        this.setData(data);
        this.paint = function () {
            this.div.style.left = (this.x - 8) + "px";
            this.div.style.top = (this.y - 8) + "px";
        };
        this.paint();
        this.newPosition = function (oldV, newV) {
            var dif = newV - oldV;
            var sign = dif > 0 ? 1 : -1;
            return oldV + Math.min(Math.abs(dif), RBT.movement) * sign;
        };
        this.moveTowards = function (x, y) {
            //single step
            this.x = this.newPosition(this.x, x);
            this.y = this.newPosition(this.y, y);
            this.paint();
            return (this.x === x) && (this.y === y); // got there?            
        };

        var layout = document.getElementById("rbt_layout");
        layout.appendChild(this.div);
        RBT.totes[iTote] = this;
    };

    //
    this.tote_list_tail = null;
    this.tote_list_head = null;
    this.tote_list_count = 0;

    this.tote_list = function (args) {
        this.draw = function () {
            var gotThere = true;
            for (var i = 0; i < this.XYs.length; i++) {
                var data = this.XYs[i];
                var tote = RBT.totes[i];
                if (tote) {
                    tote.setData(data);
                    gotThere &= RBT.totes[i].moveTowards(data[RBT.TOTE_X], data[RBT.TOTE_Y]);
                } else
                    RBT.totes[i] = tote = new RBT.tote(i, data);

            }
            return gotThere;

        };
        this.XYs = args;
        this.next = null;
    };
    /**
     * Gets a list of XYs, saves list in a queue to buffer 
     * drawing vs receiving
     **/
    this.set_tote_XYs = function () {
        var tote_list = new RBT.tote_list(arguments);
        if (RBT.tote_list_tail)
            RBT.tote_list_tail.next = tote_list;
        RBT.tote_list_tail = tote_list;
        RBT.tote_list_count++;
        if (!RBT.tote_list_head) {
            RBT.tote_list_head = tote_list;
            RBT.tote_draw_all();
        }
    };
    this.set_tote_XYs_from = function (tote_XYs_from) {
        RBT.tote_XYs_from = tote_XYs_from;
        RBT.draw_millis = RBT.tote_list_count > 0 ? RBT.auto_refresh_time / RBT.tote_list_count : 100;
    };

    this.tote_draw_count = 0;
    this.tote_draw_all = function () {
        RBT.tote_draw_count++;
        var tgt = document.getElementById("rbt_emulator_message");
        if (tgt)
            tgt.innerHTML = RBT.tote_draw_count + ": " +
                    RBT.tote_list_count + " XY-lists pending. " + (RBT.tote_list_head ? RBT.tote_list_head.XYs.length + " XYs" : "");
        while (RBT.tote_list_head) {
            if (RBT.tote_list_head.draw()) {
                if (RBT.tote_list_tail === RBT.tote_list_head) {
                    RBT.tote_list_tail = null;
                }
                RBT.tote_list_head = RBT.tote_list_head.next;
                RBT.tote_list_count--;

            } else {
                setTimeout("RBT.tote_draw_all();", RBT.draw_millis);
                return;
            }
        }
    };
    this.autorun = false;
    this.set_class_for_id = function (id, className) {
        var e = document.getElementById(id);
        if (e)
            e.className = className;
    };
    this.set_autorun = function (isOn) {
        RBT.autorun = isOn;
        RBT.set_class_for_id("rbt_button_pause", isOn ? "rbt_button_active" : "rbt_button_grey");
        RBT.set_class_for_id("rbt_button_run", !isOn ? "rbt_button_active" : "rbt_button_grey");
        RBT.set_class_for_id("rbt_button_step", !isOn ? "rbt_button_active" : "rbt_button_grey");
    };
    this.run = function (auto) {
        RBT.set_autorun(auto);
        var url = "run.jsp?action=get&report_from=" + this.report_from;
        RBT.async_script(url);
        if (auto)
            var timeOut = setTimeout('RBT.run(RBT.autorun);', 500);
    };
    this.pause = function () {
        RBT.set_autorun(false);
    };
    this.show_segments = function () {
        var layout = document.getElementById("rbt_layout");
        var log = document.getElementById("rbt_segments");
        log.innerHTML = "Segments:";
        var seglist = arguments;
        for (var is = 0; is < seglist.length; is++) {
            var segData = seglist[is];
            var d = document.createElement("DIV");
            d.className = "rbt_segment rbt_segment_" + segData[0];
            d.style.position = "absolute";
            var t = document.createTextNode(is); // + segData[0]);
            d.appendChild(t);
            d.style.left = (segData[1] - 8) + "px";
            d.style.top = (segData[2] - 8) + "px";
            layout.appendChild(d);
            log.innerHTML = log.innerHTML + "<br>" + is + " <span class='rbt_segment_" + segData[0] + "'> " + segData[0] + "</span>:" + segData[1] + "," + segData[2] + " - " + segData[3];
        }
    };
    //    this.put_loop_report = function(s) {
    //        var log = document.getElementById("rbt_log");
    //        log.innerHTML = "Loop Report:" + s;
    //    }
    this.report_from = 0;
    this.report_item = function (msgNbr, level, time, text, repeats) {

        var id = "rbt_log_item_" + msgNbr;
        var is = time + " " + text + (repeats > 1 ? "[" + repeats + " times]" : "");
        var d = document.getElementById(id);
        if (d) {
            d.innerHTML = is;
            d.className = "rbt_log_item_updated";
        } else {
            d = document.createElement("DIV");
            d.className = "rbt_log_item_new";
            d.id = id;
            var t = document.createTextNode(is); // + segData[0]);
            d.appendChild(t);
            var log = document.getElementById("rbt_log");
            log.insertBefore(d, log.firstChild);
        }
        d.level = level;
        //d.className += " rbt_log_level_"+level;
        if (msgNbr > this.report_from) {
            var old = document.getElementById("rbt_log_item_" + this.report_from);
            if (old)
                old.className = "rbt_log_item_old rbt_log_level_" + old.level;
        }
        this.report_from = msgNbr;
    };

    /* operations editor */
    this.operation_style_condition_set = function () {
        var list = arguments;
        for (var i = 0; i < list.length; i++) {
            var data = list[i];
            var id = "condition_" + data[0] + "_" + data[1];
            var conditionNbr = "" + data[2]; //convert to string
            var sequence = data[3];
            var e = document.getElementById(id);
            if (e === null || !RBT.operation_style_condition_set1(e, conditionNbr)) {
                /* RBT.operation_style_condition_set1(e, conditionNbr); */
                alert("failed to operation_style_condition_set1: "
                        + (!e ? " cant find" : "cant set " + conditionNbr) + " for id=" + id
                        );
            }
            var e = document.getElementById(id + "_sequence");
            if (e === null || !RBT.operation_style_condition_set2(e, sequence)) {
                alert("failed to operation_style_condition_set2: "
                        + (!e ? " cant find" : "cant set " + conditionNbr) + " for id=" + id
                        );
            }
        }
    };
    this.operation_style_condition_set1 = function (e, conditionNbr) {
        if (e === null)
            return false;
        var list = e.options;
        for (var i = 0; i < list.length; i++) {
            if (list[i].value === conditionNbr) { //IGNORE THE WARNING it shoudl be == NOT NOT NOT ===
                e.selectedIndex = i;
                return true;
            }
        }
        return false;
    };
    this.operation_style_condition_set2 = function (e, sequence) {
        if (sequence) {
            e.value = sequence;
            return true;
        }
        e.outerHTML = "<input type='submit' id='" + e.id + "' name='enable' value='use' onclick='return RBT.submit_form_async_script(this);'>";
        return true;
    };

    this.runJStest = function () {
        RBT.status("currently no runJStest defined");
    };
    /*************************
     *  auto_refresh of the page
     *************************/
    this.autoRefreshSubmit = function () {
        var thisForm = document.getElementById("rbt_autorefresh");
        thisForm.auto.value = "yes";
        thisForm.submit();
    };
    this.autoRefreshTick = function (secs) {
        // RBT.status("tick "+secs);
        var wait = (secs > 20 ? 10 : 1);
        secs = secs - wait;
        var obj = document.getElementById("rbt_autoRefreshTime");
        obj.innerHTML = secs;
        if (secs <= 0)
            RBT.autoRefreshSubmit();
        var timeOut = setTimeout('RBT.autoRefreshTick(' + secs + ')', 1000 * wait);
    };
    this.notExists = function (t) {
        return t == undefined;
    };
    this.submit_form_async_script = function (tag) {
        var id = tag.id;
        if (RBT.notExists(tag.saved_backgroundColor))
            tag.saved_backgroundColor = tag.style.backgroundColor;
        tag.style.backgroundColor = "orange";
        var url = "?" + RBT.submit_form_parameters(tag) + "&id=" + id;
        RBT.async_script(url);
        return false;
    };
    this.submit_form_async_script_highlight = function (tag) {
        if (RBT.notExists(tag.saved_backgroundColor))
            tag.saved_backgroundColor = tag.style.backgroundColor;
        tag.style.backgroundColor = "yellow";
    };
    this.submit_form_async_confirm = function (success, id, msg) {
        var tag = document.getElementById(id);
        if (tag) {
            if (!RBT.notExists(tag.saved_backgroundColor)) {
                if (success) {
                    tag.style.backgroundColor = tag.saved_backgroundColor;
                    tag.saved_backgroundColor = null;
                    if (msg)
                        tag.outerHTML = msg;
                    return;
                } else {
                    tag.style.backgroundColor = "red";
                }
            }
            RBT.exception(msg);
            return;
        }
        alert("cant find tag " + id);
    };
    //the following is duplicate in/froom hypersite.js and therefore has teh has bugs to fix.
    this.submit_form_parameters = function (tag) {
        var form = tag.form;
        var txt = "";
        for (var i = 0; i < form.length; i++) {

            var fe = form.elements[i];
            var fet = fe.type;
            if (!(fet === "checkbox" && !fe.checked)
                    && !(fet === "radio" && !fe.checked)
                    && !(fet === "submit" && fe != tag)
                    //20170925:dave: fix discard of no name
                    && (fe.name.length > 0)
                    ) {
                if (txt.length > 0)
                    txt += "&";
                txt += fe.name;
                txt += "=";
                txt += encodeURIComponent(
                        fe.tagName === "SELECT"
                        ? fe.options[fe.selectedIndex].value
                        : fe.value
                        );
            }
        }
        return txt;
    };


    /*************************
     *  Widget control
     *************************/
    this.widgets = [];
    this.widgets_by_id = [];
    this.widget = function (id) {
        var w = RBT.widgets_by_id[id];
        if (w)
            return w;
        RBT.exception("Can't find widget with id " + id);
        return w;
    };
    this.widget_setup = function (javascript_class, name, id) {
        var e = document.getElementById(id);
        if (e) {
            try {
                var w;
                eval("var w =new RBT." + javascript_class + "(name,id,e);");
                RBT.widgets[RBT.widgets.length] = RBT.widgets_by_id[id] = w;
                w.refresh(); // do it here when subclass has been constructed

            } catch (err) {
                e.innerHTML = "Widget error " + err.message + "\n";
                +"Error stack: " + err.stack + "\n\n";
            }

        } else {
            RBT.exception("no widget " + name + "," + id);
        }
    };
    this.widget_set = function (name, id, content) {
        RBT.widgets_by_id[id].putContent(content);

    };
    this.widget_set_html = function (id, content) {
        var e = document.getElementById(id);
        if (e) {
            e.innerHTML = content;
        } else
            RBT.exception("no field " + id);

    };
    this.widget_prepend_html = function (id, content) {
        var e = document.getElementById(id);
        if (e) {
            e.innerHTML = content + e.innerHTML;
        } else
            RBT.exception("no field " + id);

    };
    this.auto_refresh = true; //debugging!
    this.auto_refresh_time = 2000; //debugging!
    this.widgets_refresh = function () {
        var count = 0;
        for (var i = 0; i < RBT.widgets.length; i++) {
            count += RBT.widgets[i].auto_refresh() ? 1 : 0;
        }
        RBT.status("requesting " + count + " (" + RBT.auto_refresh_time + "ms)");
        if (RBT.auto_refresh)
            var timeOut = setTimeout('RBT.widgets_refresh();', RBT.auto_refresh_time);
    };


    this.status = function (msg) {
        var area = document.getElementById("rbt_status");
        if (area) {
            area.innerHTML = new Date().toLocaleTimeString() + " : " + msg;
            area.onclick = function (event) {
                if (RBT.auto_refresh) {
                    RBT.auto_refresh = false;
                    this.innerHTML = "Refreshing Turned off (" + RBT.version + ")";
                } else {
                    var msg = "Refreshing Turned on...";
                    RBT.auto_refresh = true;
                    var log = document.getElementById("rbt_log");
                    if (log) {
                        log.style.display = "none";
                        msg += "Log hidden. ";
                    } else {
                        msg += "No log";
                    }
                    this.innerHTML = msg;
                    RBT.widgets_refresh();
                }
            };
            return;
        }
        RBT.exception(msg);
    };
    this.exception = function (msg) {
        if (!RBT.log(msg))
            alert(msg);
    };
    this.log = function (msg) {
        var log = document.getElementById("rbt_log");
        if (log) {
            log.innerHTML = msg.replace(/</g, '&lt;').replace(/\n/g, '<br>') + "<br>"
                    + log.innerHTML;
            return true;
        }
        return false;
    };
    this.edit_operations_toggle = function (tag) {
        var cls = 'rbt_edit_operation_togglable';
        var show = tag.value === 'show';
        tag.value = show ? 'hide' : 'show';
        var els = document.getElementsByClassName(cls);
        for (var i = 0; i < els.length; i++) {
            var e = els[i];
            e.style.display = show ? "inline" : "none";
        }
    };

    this.mouseover = function (tag, s) {
        RBT.status(s);
    };


    this.downloadRequestWatcher = function (filename, type) {
        RBT.downloadFile("download.jsp?file=" + type + "&name=" + filename, filename + '.' + type);
//        var win = window.open("", name, "width=1000, height=1000");
//        if (win) {
//            var html = "<input name='filename' value='" + filename + "'>";
//            win.document.write(html);
//            win.document.title = "Fetching Cut File";
//        } else {
//            alert("Pop up window required for downloading. Enable pop-ups in browser, please");
//        }
    };


    this.downloadFile = function (sUrl, targetfile) {

        //If in Chrome - download via virtual link click
        //Creating new link node.
        var link = document.createElement('a');
        link.href = sUrl;

        //Set HTML5 download attribute. This will prevent file from opening if supported.
        link.download = targetfile;


        //Dispatching click event.

        var e = document.createEvent('MouseEvents');
        e.initEvent('click', true, true);
        link.dispatchEvent(e);
        return true;



    };

    this.hideById = function (id, hide) {
        var e = document.getElementById(id);
        if (e) {
            if (hide) {
                e.style.oldDisplay = e.style.display;
                e.style.display = "none";
            } else {
                if (e.style.oldDisplay)
                    e.style.display = e.style.oldDisplay;
            }
        }
    };

//window.downloadFile.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') &gt; -1;
//window.downloadFile.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') &gt; -1;
    this.barcode_focus = function (isFocus, tag) {
        if (!tag) {
            tag = document.getElementById("rbt_barcode_entry");
        }
        if (!isFocus) {
            tag.focus();
        }
    };

};

//********** Widgets ****************/
RBT.Widget = function (name, id, e) {
    this.name = name;
    this.id = id;
    this.e = e;

    this.refresh = function (more, synchronous) {
        var url = "svc/widgets.jsp?name=" + this.name + "&id=" + this.id;
        if (RBT.tote_XYs_from)
            url += "&tote_XYs_from=" + RBT.tote_XYs_from;
        if (RBT.report_from)
            url += "&report_from=" + RBT.report_from;
        if (more)
            url += "&" + more;
        if (synchronous) {
            RBT.sync_script(url, this.e);
        } else
            RBT.async_script(url, this.e);
    };
    this.auto_refresh = function () {
        if (this.is_auto_refresh) {
            this.refresh(this.auto_refresh_more);
            return true;
        }
        return false;
    };
    this.putContent = function (content) {
        this.e.innerHTML = content;

    };
    this.select_tag = function (tag) {
        var value = tag.options[tag.selectedIndex].value;
        this.refresh("action=" + tag.name + "&value=" + value);
    };
    this.submit_tag = function (tag, value) {
        //var value = tag.options[tag.selectedIndex].value;
        if (value)
            this.refresh(tag.name + "=" + value);
        else
            this.refresh("action=" + tag.name);
        return false;
    };
    this.submit_form = function (tag, more) {
        var txt = RBT.submit_form_parameters(tag);
        if (more) {
            txt += (txt === "" ? "?" : "&") + more;
        }
        this.refresh(txt);
        return false;
    };
    this.go_button_pressed = function () {
        if (this.go_button_pressed_once)
            return;
        this.go_button_pressed_once = true;
        var e = document.getElementById('rbt_widget_Zund_go_button');
        if (e)
            e.className = 'rbt_widget_Zund_go_button_pressed';
        this.refresh('action=go', true);
        this.go_button_pressed_once = false;
    };
    this.go_button_reset = function () {
        var e = document.getElementById('rbt_widget_Zund_go_button');
        if (e)
            e.className = 'rbt_widget_Zund_go_button';
    };
    this.print = function (name, html) {
        var win = window.open("", name, "width=1000, height=1000");
        if (win) {
            win.document.title = name;
            win.document.write(html + "<script>window.print();setTimeOut('window.onfocus = function(){window.close();};',2000);</script>");
            //win.document.title = name;
            //win.print();
            //win.onfocus = function(){window.close();};
        } else {
            alert("Pop up window required for printing. Enable pop-ups in browser, please");
        }
    };
    this.changed = function (tag) {
        /* if defective checked, check 'redo'; if not-defective, uncheck redo */
        var redo_name = tag.name.replace('manu_', 'manu_redo_');
        var redo = document.getElementsByName(redo_name); //should be only 1!
        redo[0].checked = (tag.value === 'defective');
    };
    this.barcode_focus = function (isFocus, tag) {
        //        RBT.status(tag.name+" "+(isFocus?"focus":"blur")+" value="+value);
        if (!isFocus) {
            tag.focus();
        }
    };
    this.barcode_init = function () {
        this.tag = document.getElementById("rbt_barcode_entry");
        this.tag.widget = this;
        this.input_handler = this.barcode_input;
        RBT.handle_f1();
        this.tag.onkeyup = function (e) {
            var keycode = 0;
            if (window.event)
                keycode = window.event.keyCode;
            else if (e)
                keycode = e.which;
            if (keycode === 27) {
                this.widget.barcode_reset();
            } else if (keycode === 112) {
                //alert("F1?");
            } else if (keycode === 13 || keycode === 9 || keycode === 10) {
                this.widget.input_handler(this.value);
            }
            return;
        };
        this.tag.style.background = "lightgreen";
        this.tag.focus();
    };

    this.barcode_input = function (barcode) {
        if (barcode.length > 0) {
            this.refresh("barcode=" + barcode);
        }
        ;
        this.tag.value = "";
        this.tag.focus();

    };
    this.suspend_refresh = function () {
        for (var i = 0; i < RBT.widgets.length; i++) {
            RBT.widgets[i].saved_is_auto_refresh = RBT.widgets[i].is_auto_refresh;
            RBT.widgets[i].is_auto_refresh = false;
        }
        this.is_auto_refresh = false;
        document.onkeydown = function (e) {
            var keycode = 0;
            if (window.event)
                keycode = window.event.keyCode;
            else if (e)
                keycode = e.which;
            if (keycode === 112)
                return false;
            if (keycode === 13 || keycode === 9 || keycode === 10) {
                return true;
            }
            if (keycode < 48)
                return false;

            if (keycode >= 48 && keycode <= 90)
                return true;
            if (keycode >= 97 && keycode <= 122)
                return true;
            if (confirm("ending key? " + keycode)) {
                var tag = document.getElementById("rbt_barcode_entry");
                tag.widget.input_handler(tag.value);
            }
            return false;
        };
    };
    this.zund_barcode_init = function (manuNbr, rgb) {
        if (!manuNbr)
            return;
        this.suspend_refresh();
        this.barcode_init();
        this.input_handler = this.zund_barcode_input;


        this.barcode_div = document.getElementById("rbt_barcode_entry_div");
        this.prompt = document.getElementById("rbt_barcode_entry_prompt");

        this.manuNbr = manuNbr;
        this.prompt.innerHTML = "Scan Paper for M" + this.manuNbr;
        this.manuScanned = false;
        this.prompt.style.backgroundColor = 'white';
        this.barcode_div.style.backgroundColor = rgb;
        this.barcode_div.style.display = "block";

    };
    this.zund_barcode_input = function (barcode) {
        if (barcode.length > 0) {
            if (barcode === 'c') {/*cheat*/
                this.manuScanned = true;
                barcode = '9999';
            }

            if (this.manuScanned === true) {
                for (var i = 0; i < RBT.widgets.length; i++) {
                    RBT.widgets[i].is_auto_refresh = RBT.widgets[i].saved_is_auto_refresh;
                }
                //RBT.async_script("svc/put.jsp?f=zund_barcode&manuNbr=" + this.manuNbr + "&barcode=" + barcode);
                this.prompt.innerHTML = "M" + this.manuNbr + ":" + barcode;
                this.refresh("&manuNbr=" + this.manuNbr + "&barcode=" + barcode);
                this.barcode_div.style.display = "none";
            } else if (barcode === 'M' + this.manuNbr) {
                this.prompt.innerHTML = "M" + this.manuNbr + ":  Tote?";
                this.prompt.style.backgroundColor = 'white';
                this.manuScanned = true;
            } else {
                this.prompt.innerHTML = "Wrong!. Scan Paper for M" + this.manuNbr;
                this.prompt.style.backgroundColor = 'pink';
            }
            //alert("barcode input=" + barcode);
            //this.refresh("barcode=" + barcode);
        }
        ;
        this.tag.value = "";
        this.tag.focus();

    };
    this.barcode_reset = function () {
        this.msg.innerHTML = "Reset";
        this.tote_barcode.innerHTML = "";
        this.piece_barcode.innerHTML = "";

    };
    this.sewer_barcode_init = function () {
        this.suspend_refresh();
        this.barcode_init();
        this.input_handler = this.sewer_barcode_input;

        this.barcode_div = document.getElementById("rbt_barcode_entry_div");
        this.prompt = document.getElementById("rbt_barcode_entry_prompt");


        this.prompt.innerHTML = "";
        this.commandScanned = false;
        this.command = null;
        this.prompt.style.backgroundColor = 'white';
        this.barcode_div.style.display = "block";

        this.barcode_entry = document.getElementById("rbt_barcode_entry");
        this.barcode_entry.focus();

    };
    this.sewer_barcode_input = function (barcode) {
        if (barcode.length > 0) {
            if (this.commandScanned === true || barcode.substring(0, 3) !== "CMD") {
                for (var i = 0; i < RBT.widgets.length; i++) {
                    RBT.widgets[i].is_auto_refresh = RBT.widgets[i].saved_is_auto_refresh;
                }
                //RBT.async_script("svc/put.jsp?f=zund_barcode&manuNbr=" + this.manuNbr + "&barcode=" + barcode);
                this.prompt.innerHTML = this.command + ":" + barcode;
                this.refresh("&barcode1=" + this.command + "&barcode2=" + barcode);
                this.barcode_div.style.display = "none";
            } else if (true) {
                this.prompt.innerHTML = "which one?";
                this.prompt.style.backgroundColor = 'white';
                this.command = barcode;
                this.commandScanned = true;
            } else {
                this.prompt.innerHTML = "Wrong!. ";
                this.prompt.style.backgroundColor = 'pink';
            }
            //alert("barcode input=" + barcode);
            //this.refresh("barcode=" + barcode);

        }
        ;
        this.tag.value = "";
        this.tag.focus();

    };
    this.is_auto_refresh = true;
    // this.refresh(); cant do it here else subclass refreshers before it is constructed

};
/**************************************************************
 * Create a subclass of Widget, overriding refresh mechanism
 **************************************************************/
RBT.Widget_chart = function (name, id, e) {
    this.base = RBT.Widget;
    this.base(name, id, e);
    this.instance = 0;
    this.img_id = "rbt_Widget_chart_" + this.id;
    this.original_src = null;
    this.refresh = function (more) {
        var image = document.getElementById(this.img_id);
        if (this.original_src === null)
            this.base
        this.original_src = image.src;
        image.src = this.original_src + ";" + this.instance;
        this.instance++;
    };
};
RBT.Widget_chart.prototype = new RBT.Widget;



/**************************************************************
 * Add new RBT functions here 
 */
RBT.manager_refresh_row = function (field, url) {
    RBT.async_script(url + "&" + field.name + '=' + field.options[field.selectedIndex].value);
};
RBT.Set_Zund_position = function (x, y, ison) {
    var e = document.getElementById("tool");
    e.setAttribute("transform", "translate(" + x + "," + y + ")");
    e.setAttribute("stroke", (ison === 1 ? "green" : "red"));
    var e = document.getElementById("tool_feedback");
    e.innerHTML = new Date().toLocaleTimeString() + " : " + "" + x + "," + y + "," + ison;
    ;
};
RBT.Set_Zund_message = function (text) {
    var e = document.getElementById("tool_feedback");
    e.innerHTML = new Date().toLocaleTimeString() + " : " + text;
};
RBT.Get_Zund_position = function (url) {
    var e = document.getElementById("tool_feedback");
    RBT.async_script(url, e);
//    e.innerHTML='requested';
//    var e = document.getElementById("tool");
//    if (!e.origin) {
//        e.origin = 1000;
//        e.toolon = true;
//    } else {
//        e.origin += 1000;
//        e.toolon=!e.toolon;
//    }
//    RBT.Set_Zund_position(e.origin,e.origin,(e.toolon?1:0));


};
RBT.zund_move = function (newX) {
    var e = document.getElementById("cut_data");
    var animate = "<animateTransform attributename='transform' attributetype='XML' type='translate' from='0 0' to='" + newX + " 0' dur=10s repeatCount='1' fill='freeze' />";
    e.innerHTML += animate;
};
RBT.zund_projector_update = function (newOrigin) {
    //RBT.zund_projector_newStyles = newStyles.replace("<style>", "").replace("</style>", "");
    //setTimeout("RBT.zund_projector_update_styles()", 1000);
    //RBT.zund_projector_update_styles();
    var e = document.getElementById("cut_data");
    if (!e)
        return;
    if (!RBT.zund_projector_old_origin) {
        RBT.zund_projector_old_origin = 0;
    }
    if (RBT.zund_projector_base_origin) {
        newOrigin -= RBT.zund_projector_base_origin;
    }

    RBT.zund_projector_secs = 4 * Math.abs(newOrigin - RBT.zund_projector_old_origin) / 180000;

    RBT.remove_by_id("mytrany");
    var animate = "<animateTransform id='mytrany' begin='indefinite' attributename='transform' attributetype='XML' type='translate' "
            + " from='" + RBT.zund_projector_old_origin + " 0' "
            + " to='" + newOrigin + " 0' dur=" + RBT.zund_projector_secs + "s repeatCount='1' fill='freeze' />";
    RBT.zund_projector_old_origin = newOrigin;
    e.innerHTML += animate;
    var t = document.getElementById("mytrany");
    t.beginElement();

};
RBT.zund_projector_message = function (l1, l2, l3) {
    RBT.zund_projector_message1(1, l1);
    RBT.zund_projector_message1(2, l2);
    RBT.zund_projector_message1(3, l3);
};
RBT.zund_projector_message1 = function (i, line) {
    var e = document.getElementById("projection_message_" + i);
    if (e)
        e.innerHTML = line;
    else
        RBT.exception("No projection_message element: " + line);
};
RBT.zund_projector_update_styles = function () {
    var sheet = document.createElement("style");
    sheet.innerHTML = RBT.zund_projector_newStyles;
    document.body.appendChild(sheet);
};
RBT.remove_by_id = function (id) {
    var t = document.getElementById(id);
    if (t)
        t.parentNode.removeChild(t);
};
RBT.zund_style = function (block_suffix, style, invert) {
    RBT.zund_style_1("strokes_" + block_suffix, style, "red", "none", "white", "none", false);
    RBT.zund_style_1("fills_" + block_suffix, style, "none", "black", "none", style, true);
    RBT.zund_style_1("text_" + block_suffix, style, "none", "red", "none", invert, false);
};

RBT.zund_style_1 = function (blockId, style, wait_stroke, wait_fill, stroke_color, fill_color, animate) {
    var e = document.getElementById(blockId);
    if (e) {
        if (style === "none") {
            e.style.display = "none";
            return;
        }
        e.style.display = "inherit";
        if (style === "wait") {
            if (animate)
                RBT.zund_animate(blockId, e, "fill", wait_fill);
            else
                e.style.fill = wait_fill;
            //
            e.style.stroke = wait_stroke;
        } else {

            if (animate)
                RBT.zund_animate(blockId, e, "fill", fill_color);
            else
                e.style.fill = fill_color;
            e.style.stroke = stroke_color;
        }
    }
};
//RBT.zund_style_2 = function (blockId, style, wait_stroke, wait_fill, stroke_color, fill_color) {
//    var e = document.getElementById(blockId);
//    if (e) {
//        if (style === "none") {
//            e.style.display = "none";
//            // RBT.zund_animate(blockId,e,"fill","grey");
//            // e.style.stroke = "none";
//        } else if (style === "wait") {
//            //e.style.fill = wait_fill;
//            RBT.zund_animate(blockId, e, "fill", wait_fill);
//            e.style.stroke = wait_stroke;
//        } else {
//            //e.style.fill = fill_color;
//            RBT.zund_animate(blockId, e, "fill", fill_color);
//            e.style.stroke = stroke_color;
//        }
//    }
//};
RBT.zund_animate = function (blockId, e, style, value) {
    e.style.fill = value;
    return;
    /*dont animate because it refreshes !*/
    var id = "svg_animate_" + blockId;
    RBT.remove_by_id(id);
    var animate = "<animate id='" + id + "' attributeName='" + style + "' attributetype='XML' to='" + value + "' begin='indefinite' dur='" + RBT.zund_projector_secs + "s' repeatCount='1' fill='freeze' />";
    e.innerHTML += animate;
    var t = document.getElementById(id);
    t.beginElement();
};

RBT.zund_shoot = function (shootNbr, text, flash, color, invcolor) {
    var e = document.getElementById("svg_text_" + shootNbr);
    if (e)
        e.innerHTML = text;

    var e = document.getElementById("svg_text_g_" + shootNbr);
    if (e)
        e.style.fill = invcolor;
    var e = document.getElementById("svg_hilite_" + shootNbr);
    if (e) {
        e.parentNode.removeChild(e);
    }
    var e = document.getElementById("svg_path_" + shootNbr);
    if (e) {
        e.style.fill = color;
        if (flash === 1) {
            var animate = "<animate id='" + "svg_hilite_" + shootNbr + "' attributeName='fill' attributetype='XML' from='" + color + "' to='#808080' dur='1s' repeatCount='indefinite' />";
            e.innerHTML += animate;
        }
    }
};

RBT.svg_fullscreen = function (id, svg) {


    var onclick = ' onclick="RBT.zund_projector_transform_onclick(event, this);"';

    //FIXME: use of RBT level data for zund_projector_transform violates the widget rules - and prevents the project widget being on the same screen
    // but for now - whatever.

    if (id === "rbt_widget_ZundProjector") {
        RBT.zund_projector_transform_projector = 'picking';
    } else if (id === "rbt_widget_ZundProjectorTotes") {
        RBT.zund_projector_transform_projector = 'totes';
    } else
        onclick = "";

    var e = document.getElementById(id);
    e.innerHTML =
            '<div style="width:' + window.screen.availWidth + 'px;height:' + window.screen.availHeight + 'px;background:green"'
            + onclick
// other handlers set by mouse_down
            + '>\n'
            + '   <svg width="' + window.screen.availWidth + '" height="' + window.screen.availHeight + '"  '
            + '              version="1.1"  xmlns="http://www.w3.org/2000/svg">\n '
            + svg
            + '</svg>\n '
            + '</div>\n';
};

RBT.request_fullscreen = function (id) {
    var elem = document.getElementById(id);
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
};




RBT.zund_batch = 0;
RBT.zund_currentX = 0;
RBT.zund_currentY = 0;
RBT.zund_moveNbr = 0;
RBT.zund_speed_cm_sec = 64;
RBT.zund_speed_change = function (factor) {
    RBT.zund_speed_cm_sec = RBT.zund_speed_cm_sec * factor;
    var e = document.getElementById("speed").innerHTML = "" + RBT.zund_speed_cm_sec + " cm/sec";
};
RBT.zund_feed_length = 991;
RBT.zund_datastream = "";
RBT.zund_datastream_processing = false;
RBT.zund_datastream_at = 0;
RBT.zund_movement_by_batch = [];

RBT.zund_emulate_duration = function (x, y) {
    var d = Math.sqrt(Math.pow(x - RBT.zund_currentX, 2) + Math.pow(y - RBT.zund_currentY, 2));
    return (d / RBT.zund_speed_cm_sec);
};

RBT.zund_emulate_move_cloth = function (movement) {
    for (var batch = 0; batch <= RBT.zund_batch; batch++) {
        var id = "cutting_area_" + batch;
        var e = document.getElementById(id);
        if (!e)
            continue;
        var millis = 10 * RBT.zund_emulate_duration(movement, 0);
        if (true) {
            if (typeof RBT.zund_movement_by_batch[batch] === "undefined")
                RBT.zund_movement_by_batch[batch] = 0;
            if (RBT.zund_movement_by_batch[batch] < -360000) {
                RBT.remove_by_id(id);
                continue;
            }

            var id = "zund_move_cloth_" + batch;


            var a = "<animateTransform begin='indefinite' id='" + id + "' attributeName='transform' type='translate' from='" + RBT.zund_movement_by_batch[batch] + ",0' to='";
            RBT.zund_movement_by_batch[batch] -= movement;
            a += RBT.zund_movement_by_batch[batch] + ",0' "
                    + "dur='" + (millis / 1000) + "s' repeatCount='3' fill='freeze' />";

            RBT.remove_by_id(id);
            e.innerHTML += a;
            RBT.beginElement_by_id(id);
        } else {
            var a = "<animateTransform additive='sum' attributeName='transform' type='translate' from='0,0' to='" +
                    (-movement) + ",0' "
                    + "dur='" + (millis / 1000) + "s' repeatCount='1' fill='freeze' />";
            e.innerHTML += a;
            //RBT.beginElement_by_id(id);
        }


    }
    RBT.zund_batch++;
    return millis;
};
/*
 * 
 * @param {type} x
 * @param {type} y
 * @returns millis that the move should table
 */
RBT.zund_emulate_move = function (x, y, millis) {
    var e = document.getElementById("tool");
    var id = "zund_move"; // + RBT.zund_moveNbr;
    var a = "<animateTransform id='" + id + "'"
            //+(RBT.zund_moveNbr===0?"begin='0ms'":" begin='zund_move_"+RBT.zund_moveNbr+".end'");
            + " begin='indefinite' "
            + "' attributeName='transform' type='translate' from='" + RBT.zund_currentX + "," + RBT.zund_currentY + "' to='" + x + "," + y
            + "' dur='" + (millis / 1000) + "s' repeatCount='1' fill='freeze' />";
    RBT.remove_by_id(id);
    e.innerHTML += a;
    RBT.beginElement_by_id(id);
    RBT.zund_currentX = x;
    RBT.zund_currentY = y;
    RBT.zund_moveNbr++;
    return millis;
};
RBT.beginElement_by_id = function (id) {
    var a_e = document.getElementById(id);
    a_e.beginElement();
};
RBT.zund_emulate_draw = function (x, y) {
    var millis = RBT.zund_emulate_duration(x, y);
    if (RBT.zund_pen_down) {
        var id = "cutting_area_" + RBT.zund_batch;
        var e = document.getElementById(id);
        if (!e) {
            var e = document.getElementById("cutting_area");
            e.innerHTML += "<g id='" + id + "'></g>";
            var e = document.getElementById(id);
        }
        var id = "zund_draw";// + RBT.zund_moveNbr;
        RBT.remove_by_id(id + "_x");
        RBT.remove_by_id(id + "_y");

        var b = " begin='zund_move"
                //+ RBT.zund_moveNbr 
                + ".begin'"
                + " dur='" + (millis / 1000) + "s' repeatCount='1' fill='freeze' />";
        var a = "<line stroke='green' x1='" + RBT.zund_currentX + "' y1='" + RBT.zund_currentY + "' x2='" + x + "' y2='" + y + "' style='stroke-width:200' >"
                + " <animate id='" + id + "_y' attributeName='y2' from='" + RBT.zund_currentY + "' to='" + y + "'" + b
                + " <animate id='" + id + "_x' attributeName='x2'  from='" + RBT.zund_currentX + "' to='" + x + "'" + b
                + "</line>";
        e.innerHTML += a;
    }
    return RBT.zund_emulate_move(x, y, millis);
};
RBT.zund_emulate_redraw = function () {
    var e = document.getElementById("svg_emulator");
    if (e)
        e.beginElement();
};
RBT.zund_emulate_run = function () {
    //var e = document.getElementById("ds_div");
    RBT.async_script('?get=ds', null);
};
RBT.zund_emulate_write = function (ds) {
//    var e = document.getElementById("ds_div");
//    if (e)
//        e.innerHTML += ds;
    RBT.zund_datastream += ds;
    if (RBT.zund_datastream.length > 0 && !RBT.zund_datastream_processing) {
        RBT.zund_datastream_processing = true;
        RBT.zund_emulate_execute();
    }
    setTimeout("RBT.zund_emulate_run();", ds.length > 0 ? 100 : 1000);
};
RBT.zund_next_or = function (ds, s, i, orThis) {
    var n = ds.indexOf(s, i);
    if (n > -1 && n < orThis)
        return n;
    return orThis;

};
RBT.zund_parameter = function (ds) {
    var next = RBT.zund_next_or(ds, ',', 2, ds.length);
    next = RBT.zund_next_or(ds, ',', 2, next);
    return ds.substring(2, next);

};
/**
 * executes the next ONE drawing instruction ONLY! (proccesses sequence of non drawing instructions)
 * @returns {undefined}
 */
RBT.zund_emulate_execute = function () {
    while (RBT.zund_datastream_processing) {
        var millis = RBT.zund_emulate_execute_some();
        if (millis > 0) {
            setTimeout("RBT.zund_emulate_execute()", millis);
            return;
        }
    }
};
RBT.zund_emulate_execute_some = function () {
    var e = document.getElementById("ds_display_done");
    var s = e.innerHTML + RBT.zund_datastream.substring(0, RBT.zund_datastream_at);
    if (s.length > 80)
        s = "..." + s.substring(s.length - 80);
    e.innerHTML = s;
    RBT.zund_datastream = RBT.zund_datastream.substring(RBT.zund_datastream_at);
    RBT.zund_datastream_at = 0;
    var next = RBT.zund_datastream.indexOf(';');
    if (next < 2) {
        RBT.zund_datastream_processing = false;
        return 0;
    }


    var ds_segment = RBT.zund_datastream.substring(0, next);
    RBT.widget_set_html("ds_display", ds_segment);
    RBT.widget_set_html("ds_display_todo", RBT.zund_datastream.substring(0, Math.min(80, RBT.zund_datastream.length)));
    if (RBT.zund_coordinates)
        return (RBT.zund_emulate_execute_coords(ds_segment));
    return(RBT.zund_emulate_execute_one(ds_segment));
};
/**
 * 
 * @param {type} ds
 * @returns millis that oper should take - wait for it!
 */
RBT.zund_emulate_execute_one = function (ds) {
    var op = ds.substring(0, 2);
    if (op === "PU" || op === "PD") {
        RBT.zund_pen_down = op === "PD";
        RBT.zund_datastream_at += 2;
        return RBT.zund_emulate_execute_coords(ds.substring(2));
    }
    if (op === 'FF') {
        RBT.zund_datastream_at += ds.length + 1;
        return  RBT.zund_emulate_move_cloth(RBT.zund_feed_length);
    }
    if (op === 'ZP') {
        RBT.widget_set_html("zund_emulate_message", ds);
    } else if (op === "JB") {
        RBT.async_script('?put=' + ds);
    } else if (op === "OP") {
        RBT.async_script('?put=[OP]' + ds);
    } else if (op === 'FL') {
        RBT.zund_feed_length = RBT.zund_parameter(ds);
    }
    RBT.zund_datastream_at += ds.length + 1;
    return 0;
};

RBT.zund_emulate_execute_coords = function (ds) {


    var next = RBT.zund_next_or(ds, ',', 0, ds.length);
    if (next < 0 || ds.length === 0) {
        RBT.zund_coordinates = false;
        RBT.zund_datastream_at += ds.length + 1;
        return 0;
    }
    var x = ds.substring(0, next);
    var i = next + 1;
    next = ds.indexOf(' ', i);
    if (next < 0) {
        var y = ds.substring(i);
        RBT.zund_coordinates = false;
        RBT.zund_datastream_at += ds.length + 1;
    } else {
        var y = ds.substring(i, next);
        RBT.zund_coordinates = true;
        RBT.zund_datastream_at += next + 1;
    }
    return RBT.zund_emulate_draw(x, y);
};

RBT.zund_barcode = function (manuNbr, rgb) {
    RBT.widget("rbt_widget_Zund").zund_barcode_init(manuNbr, rgb);
};
RBT.zund_error = function (msg) {
    RBT.exception(msg);
};
RBT.sewer_barcode = function () {
    RBT.widget("rbt_widget_Sewer").sewer_barcode_init();
};

RBT.getClickPosition = function (e) {
    var parentPosition = getPosition(e.currentTarget);
    var xPosition = e.clientX - parentPosition.x;
    var yPosition = e.clientY - parentPosition.y;
};

RBT.getPosition = function (element) {
    var xPosition = 0;
    var yPosition = 0;

    while (element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return {x: xPosition, y: yPosition};
};
RBT.handle_f1 = function () {
    RBT.handle_f1_count = 0;
    shortcut.add("F1", function () {
        //alert("F1");
        RBT.handle_f1_count++;
    });
    //alert("handling F8");
    shortcut.remove("F8");
    shortcut.add("F8", function () {
        //alert("F8 pressed");
        var widget = RBT.widget('rbt_widget_Zund');
        if (widget) {
            widget.go_button_pressed();
        }
    });
};
RBT.explore_button = function (form, what, which, value) {
    return (confirm("Are you sure you want to " + value + " " + what + " " + which + "?"));
};

//fix me: needs to be widget based, not global
RBT.zund_projector_click = 0;
RBT.zund_projector_click_X = [];
RBT.zund_projector_click_Y = [];
RBT.zund_projector_draged = null;

RBT.select_option = function (value, text) {
    var opt = document.createElement("option");
    opt.value = value;
    opt.innerHTML = text;
    return opt;
};
RBT.zund_projector_transform_move = function (e, element) {
    if (RBT.zund_projector_draged) {
        RBT.zund_projector_transform(e, element, RBT.zund_projector_click);
    }
};
RBT.zund_projector_transform_down = function (e, element) {

    if (RBT.zund_projector_click === 0) {
        RBT.zund_projector_transform(e, element, 0, "lock");
        RBT.zund_projector_draged = RBT.zund_projector_transform(e, element, 1, "drag");
    } else if (RBT.zund_projector_click === 1) {
        RBT.zund_projector_transform(e, element, 2, "pick");
        RBT.zund_projector_draged = RBT.zund_projector_transform(e, element, 3, "stretch");
    }
    ;
    document.body.onmousemove = RBT.zund_projector_transform_move;
    document.body.onclick = RBT.zund_projector_transform_up;
    document.body.onmouseout = RBT.zund_projector_transform_up;

};
RBT.zund_projector_transform_onclick = function (e, element) {

    if (RBT.zund_projector_click === 0) {
        RBT.zund_projector_transform(e, element, 0, "lock");
    } else if (RBT.zund_projector_click === 1) {
        RBT.zund_projector_transform(e, element, 1, "drag");
    } else if (RBT.zund_projector_click === 2) {
        RBT.zund_projector_transform(e, element, 2, "pick");
    } else if (RBT.zund_projector_click === 3) {
        RBT.zund_projector_transform(e, element, 3, "stretch");
    }
    ;
    if ((++RBT.zund_projector_click) > 3)
        RBT.zund_projector_click = 0;
//    document.body.onmousemove = RBT.zund_projector_transform_move;
//    document.body.onclick = RBT.zund_projector_transform_up;
//    document.body.onmouseout = RBT.zund_projector_transform_up;

};
RBT.zund_projector_transform_up = function (e, element) {
    if (RBT.zund_projector_draged) {
        RBT.zund_projector_draged = null;

        if (RBT.zund_projector_click === 1) {
        } else {
            RBT.zund_projector_click = 0;
        }
    } else {

    }
};

RBT.zund_projector_transform_markerid = "zund_projector_transform_marker_";
RBT.zund_projector_transform_projector = "totes";

RBT.zund_projector_transform = function (e, element, click, action) {
    RBT.zund_projector_click = click;
    var inputX = 0;
    var inputY = 0;
    if (!e)
        var e = window.event;
    if (e.pageX || e.pageY) {
        inputX = e.pageX;
        inputY = e.pageY;
    } else if (e.clientX || e.clientY) {
        inputX = e.clientX;
        inputY = e.clientY;
    }

    if (typeof action !== "undefined") {
        var id = RBT.zund_projector_transform_markerid + action;

        var marker = document.getElementById(id);
        if (!marker) {
            marker = document.createElement("div");
            marker.id = id;
            marker.style.position = "absolute";
            marker.className = "zund_projector_transform_marker";
            document.body.appendChild(marker);
            marker.innerHTML = action; //RBT.zund_projector_click + ': X=' + inputX + ' Y=' + inputY;
        }
    } else {
        marker = RBT.zund_projector_draged;
    }
//    var b = document.createElement("select");
//    b.onchan
//    b.innerHTML = "OK";
//    b.onclick = function () {
//        RBT.zund_projector_click = (RBT.zund_projector_click + 1) % 4;
//        return false;
//    };
//    marker.appendChild(b);
    marker.style.left = inputX + "px";
    marker.style.top = inputY + "px";


    RBT.zund_projector_click_X[RBT.zund_projector_click] = inputX;
    RBT.zund_projector_click_Y[RBT.zund_projector_click] = inputY;

    if ((RBT.zund_projector_click % 2) === 1) {
        var url = "svc/transform.jsp?p=" + RBT.zund_projector_transform_projector + "&n=" + Math.floor((RBT.zund_projector_click + 1) / 2);
        for (var i = 0; i <= RBT.zund_projector_click; i++) {
            url += "&x" + (i + 1) + "=" + RBT.zund_projector_click_X[i] + "&y" + (i + 1) + "=" + RBT.zund_projector_click_Y[i];
        }
        RBT.zund_projector_click_X[0] = RBT.zund_projector_click_X[1];
        RBT.zund_projector_click_Y[0] = RBT.zund_projector_click_Y[1];
        RBT.zund_projector_click_X[2] = RBT.zund_projector_click_X[3];
        RBT.zund_projector_click_Y[2] = RBT.zund_projector_click_Y[3];
        RBT.async_script(url);
    }

    return marker;
};


RBT.widget_set_ticker = function (id, since) {
    var e = document.getElementById(id);
    if (e) {
        if (typeof since !== "undefined")
            e.since = since;

        var secs = Math.floor((new Date() - (e.since ? e.since : 0)) / 1000);
        var text = "";
        var sleep = 1000;
        if (secs < 60) {
            text = secs + " secs";

        } else {
            var mins = Math.floor(secs / 60);
            secs = secs - 60 * mins;
            if (mins < 60)
                text = mins + " mins " + secs + " secs;";
            else {
                sleep = 60000;
                var hours = Math.floor(mins / 60);
                mins = mins - hours * 60;
                text = hours + " hours " + mins + " mins";
            }
        }
        e.innerHTML = text;
        if (e.timeout)
            clearTimeout(e.timeout);
        e.timeout = setTimeout("RBT.widget_set_ticker('" + id + "');", sleep);
    }
}

/***********************************************************************************************/
/**
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.B
 * By Binny V A
 * License : BSD
 */
shortcut = {
    'all_shortcuts': {}, //All the shortcuts are stored in this array
    'add': function (shortcut_combination, callback, opt) {
        //Provide a set of default options
        var default_options = {
            'type': 'keydown',
            'propagate': false,
            'disable_in_input': false,
            'target': document,
            'keycode': false
        }
        if (!opt)
            opt = default_options;
        else {
            for (var dfo in default_options) {
                if (typeof opt[dfo] == 'undefined')
                    opt[dfo] = default_options[dfo];
            }
        }

        var ele = opt.target;
        if (typeof opt.target == 'string')
            ele = document.getElementById(opt.target);
        var ths = this;
        shortcut_combination = shortcut_combination.toLowerCase();

        //The function to be called at keypress
        var func = function (e) {
            e = e || window.event;

            if (opt['disable_in_input']) { //Don't enable shortcut keys in Input, Textarea fields
                var element;
                if (e.target)
                    element = e.target;
                else if (e.srcElement)
                    element = e.srcElement;
                if (element.nodeType == 3)
                    element = element.parentNode;

                if (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA')
                    return;
            }

            //Find Which key is pressed
            if (e.keyCode)
                code = e.keyCode;
            else if (e.which)
                code = e.which;
            var character = String.fromCharCode(code).toLowerCase();

            if (code == 188)
                character = ","; //If the user presses , when the type is onkeydown
            if (code == 190)
                character = "."; //If the user presses , when the type is onkeydown

            var keys = shortcut_combination.split("+");
            //Key Pressed - counts the number of valid keypresses - if it is same as the number of keys, the shortcut function is invoked
            var kp = 0;

            //Work around for stupid Shift key bug created by using lowercase - as a result the shift+num combination was broken
            var shift_nums = {
                "`": "~",
                "1": "!",
                "2": "@",
                "3": "#",
                "4": "$",
                "5": "%",
                "6": "^",
                "7": "&",
                "8": "*",
                "9": "(",
                "0": ")",
                "-": "_",
                "=": "+",
                ";": ":",
                "'": "\"",
                ",": "<",
                ".": ">",
                "/": "?",
                "\\": "|"
            }
            //Special Keys - and their codes
            var special_keys = {
                'esc': 27,
                'escape': 27,
                'tab': 9,
                'space': 32,
                'return': 13,
                'enter': 13,
                'backspace': 8,
                'scrolllock': 145,
                'scroll_lock': 145,
                'scroll': 145,
                'capslock': 20,
                'caps_lock': 20,
                'caps': 20,
                'numlock': 144,
                'num_lock': 144,
                'num': 144,
                'pause': 19,
                'break': 19,
                'insert': 45,
                'home': 36,
                'delete': 46,
                'end': 35,
                'pageup': 33,
                'page_up': 33,
                'pu': 33,
                'pagedown': 34,
                'page_down': 34,
                'pd': 34,
                'left': 37,
                'up': 38,
                'right': 39,
                'down': 40,
                'f1': 112,
                'f2': 113,
                'f3': 114,
                'f4': 115,
                'f5': 116,
                'f6': 117,
                'f7': 118,
                'f8': 119,
                'f9': 120,
                'f10': 121,
                'f11': 122,
                'f12': 123
            }

            var modifiers = {
                shift: {wanted: false, pressed: false},
                ctrl: {wanted: false, pressed: false},
                alt: {wanted: false, pressed: false},
                meta: {wanted: false, pressed: false}	//Meta is Mac specific
            };

            if (e.ctrlKey)
                modifiers.ctrl.pressed = true;
            if (e.shiftKey)
                modifiers.shift.pressed = true;
            if (e.altKey)
                modifiers.alt.pressed = true;
            if (e.metaKey)
                modifiers.meta.pressed = true;

            for (var i = 0; k = keys[i], i < keys.length; i++) {
                //Modifiers
                if (k == 'ctrl' || k == 'control') {
                    kp++;
                    modifiers.ctrl.wanted = true;

                } else if (k == 'shift') {
                    kp++;
                    modifiers.shift.wanted = true;

                } else if (k == 'alt') {
                    kp++;
                    modifiers.alt.wanted = true;
                } else if (k == 'meta') {
                    kp++;
                    modifiers.meta.wanted = true;
                } else if (k.length > 1) { //If it is a special key
                    if (special_keys[k] == code)
                        kp++;

                } else if (opt['keycode']) {
                    if (opt['keycode'] == code)
                        kp++;

                } else { //The special keys did not match
                    if (character == k)
                        kp++;
                    else {
                        if (shift_nums[character] && e.shiftKey) { //Stupid Shift key bug created by using lowercase
                            character = shift_nums[character];
                            if (character == k)
                                kp++;
                        }
                    }
                }
            }

            if (kp == keys.length &&
                    modifiers.ctrl.pressed == modifiers.ctrl.wanted &&
                    modifiers.shift.pressed == modifiers.shift.wanted &&
                    modifiers.alt.pressed == modifiers.alt.wanted &&
                    modifiers.meta.pressed == modifiers.meta.wanted) {
                callback(e);

                if (!opt['propagate']) { //Stop the event
                    //e.cancelBubble is supported by IE - this will kill the bubbling process.
                    e.cancelBubble = true;
                    e.returnValue = false;

                    //e.stopPropagation works in Firefox.
                    if (e.stopPropagation) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                    return false;
                }
            }
        }
        this.all_shortcuts[shortcut_combination] = {
            'callback': func,
            'target': ele,
            'event': opt['type']
        };
        //Attach the function with the event
        if (ele.addEventListener)
            ele.addEventListener(opt['type'], func, false);
        else if (ele.attachEvent)
            ele.attachEvent('on' + opt['type'], func);
        else
            ele['on' + opt['type']] = func;
    },
    //Remove the shortcut - just specify the shortcut and I will remove the binding
    'remove': function (shortcut_combination) {
        shortcut_combination = shortcut_combination.toLowerCase();
        var binding = this.all_shortcuts[shortcut_combination];
        delete(this.all_shortcuts[shortcut_combination])
        if (!binding)
            return;
        var type = binding['event'];
        var ele = binding['target'];
        var callback = binding['callback'];

        if (ele.detachEvent)
            ele.detachEvent('on' + type, callback);
        else if (ele.removeEventListener)
            ele.removeEventListener(type, callback, false);
        else
            ele['on' + type] = false;
    }
};

RBT.chatGet = function (p) {
    //document.writeln(p);
    var arr1 = JSON.parse(p);
    var dateTime = arr1.dateTime;
    var arr = arr1.data;
    //document.writeln(dateTime);
    function sortByKey(array, key) {
        return array.sort(function (a, b) {
            var x = a[key];
            var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }
    //console.log("count\n");
    people = sortByKey(arr, 'chatnbr');
    if (arr.length === 0) {
        var textnode = document.createTextNode("No messages");
        var node = document.createElement("div");
        node.appendChild(textnode);
        document.getElementById("messages").appendChild(node);
    } else {
        //document.getElementById("messages").append("<li>"+json+"</li>"); 
        for (var i = 0; i < arr.length; i++) {
            //document.writeln(arr[i].chatnbr);
            if (document.getElementById(arr[i].chatnbr) === null) {

                var text1 = document.createTextNode(arr[i].chat_reference_nbr.substring(0, 7));
                var span1 = document.createElement('span');
                span1.classList.add('span1');
                span1.appendChild(text1);

                var text2 = document.createTextNode(arr[i].chat_creator.substring(0, 7));
                var span2 = document.createElement('span');
                span2.classList.add('span2');
                span2.appendChild(text2);

                var text3 = document.createTextNode(RBT.chatDateTime(dateTime, arr[i].sent_at));
                var span3 = document.createElement('span');
                span3.classList.add('span3');
                span3.appendChild(text3);

                var text4 = document.createTextNode(arr[i].chat_content);
                var span4 = document.createElement('span');
                span4.classList.add('span4');
                span4.appendChild(text4);

                var node = document.createElement("div");
                node.id = arr[i].chatnbr;
                node.appendChild(span1);
                node.appendChild(span2);
                node.appendChild(span3);
                node.appendChild(span4);
                document.getElementById("messages").appendChild(node);
//                window.location.hash ='#'+node.id;                
//                if (parseInt(node.id)%2 === 1) {            
//                  node.classList.add('alternate');
//                  console.log(node.id%2);
//                }
                node.classList.add('new-message');

            }
        }
    }
};
RBT.chatDateTime = function (dateTime, sent_at) {
    if (sent_at.substring(0, 10) && dateTime.substring(0, 10)) {
        if (dateTime.substring(0, 10) === sent_at.substring(0, 10)) {
            return sent_at.substring(11, 16);
        } else {
            return sent_at.substring(5, 10);
        }
    } else {
        return "none";
    }

}

RBT.chatHighlight = function () {
    var x = document.getElementsByClassName("new-message");
    for (var i = 0; i < x.length; i++) {
        //console.log("x",x[i]);  
        //console.log(x[i].id);
        if (parseInt(x[i].id) % 2 === 1) {
            x[i].classList.add('alternateOdd');
        } else {
            x[i].classList.add('alternateEven');
        }
    }
};
//RBT.chatChange = function(node) {    
//    return new Promise(function(resolve, reject){
//        node.classList.add('new-message');
//        setTimeout( function() { node.classList.remove('new-message'); }, 3000);
//        if (parseInt(node.id)%2 === 1) {            
//            node.classList.add('alternate');
//            console.log(node.id%2);            
//        }
//    })
//}  

RBT.chatPut = function () {
    var data = {};
    data.chat_content = document.getElementById("message").value;
    data.chat_creator = document.getElementById("user").value;
    data.chat_reference_nbr = document.getElementById("ref_num").value;
    var output = JSON.stringify(data);
    //console.log(output);
    if (data.chat_content && data.chat_creator && data.chat_reference_nbr) {
        document.getElementById("message").value = "";
        document.getElementById("required").innerHTML = null;
        RBT.widget("rbt_widget_Chat").refresh("json=" + encodeURIComponent(output));
    } else {
        document.getElementById("required").innerHTML = "*All fields required";
    }
};

RBT.hopperGet = function (p) {
    console.log(p);
    var arr1 = JSON.parse(p);
    var dateTime = arr1.dateTime;
    var arr = arr1.data;
    //document.writeln(dateTime);
//    function sortByKey(array, key) {
//        return array.sort(function(a, b) {
//        var x = a[key]; var y = b[key];
//        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
//       });
//    }
//    //console.log("count\n");
//    people = sortByKey(arr, 'chatnbr');
    if (arr.length === 0) {
        var textnode = document.createTextNode("No hoppers present");
        var node = document.createElement("div");
        node.appendChild(textnode);
        document.getElementById("hoppers").appendChild(node);
    } else {
        //document.getElementById("messages").append("<li>"+json+"</li>"); 
        for (var i = 0; i < arr.length; i++) {
            //console.log(arr[i].HopperID);
            if (document.getElementById(arr[i].HopperID) === null) {

                var text1 = document.createTextNode(RBT.HopperShortenText(arr[i].hopper_name));
                var span1 = document.createElement('span');
                span1.classList.add('hspan1');
                span1.appendChild(text1);

                var text2 = document.createTextNode(RBT.HopperShortenText(arr[i].task_type));
                var span2 = document.createElement('span');
                span2.classList.add('hspan2');
                span2.appendChild(text2);

                var text3 = document.createTextNode(RBT.HopperShortenText(arr[i].description));
                var span3 = document.createElement('span');
                span3.classList.add('hspan3');
                span3.appendChild(text3);

                var text4 = document.createTextNode(RBT.HopperShortenText(arr[i].peopleid));
                var span4 = document.createElement('span');
                span4.classList.add('hspan4');
                span4.appendChild(text4);

                var text5 = document.createTextNode(RBT.HopperShortenText(arr[i].assignedby));
                var span5 = document.createElement('span');
                span5.classList.add('hspan5');
                span5.appendChild(text5);
                var text6 = document.createTextNode(RBT.HopperShortenText(arr[i].priority_level));
                var span6 = document.createElement('span');
                span6.classList.add('hspan6');
                span6.appendChild(text6);
                var text7 = document.createTextNode(RBT.HopperShortenText(arr[i].current_status));
                var span7 = document.createElement('span');
                span7.classList.add('hspan7');
                span7.appendChild(text7);
                var text8 = document.createTextNode(RBT.chatDateTime(dateTime, arr[i].date_created));
                var span8 = document.createElement('span');
                span8.classList.add('hspan8');
                span8.appendChild(text8);

                var node = document.createElement("div");
                node.id = arr[i].HopperID;
                node.appendChild(span1);
                node.appendChild(span2);
                node.appendChild(span3);
                node.appendChild(span4);
                node.appendChild(span5);
                node.appendChild(span6);
                node.appendChild(span7);
                node.appendChild(span8);
                document.getElementById("hoppers").appendChild(node);
//                window.location.hash ='#'+node.id;                
//                if (parseInt(node.id)%2 === 1) {            
//                  node.classList.add('alternate');
//                  console.log(node.id%2);
//                }
//                node.classList.add('new-message');

            }
        }
    }
};

RBT.HopperShortenText = function (text) {

    return (text === undefined || text === null ? "null" : text.length > 25 ? text.substring(0, 23) + "..." : text);
};
//Function to parse any json
function parseJson(json) {

    if (jsonValueType(json) === "array") {
        createTable(json);
    }
}
;

//Function to check the type of json
function jsonValueType(obj) {
    var stringConstructor = "test".constructor;
    var arrayConstructor = [].constructor;
    var objectConstructor = {}.constructor;

    if (obj === null) {
        return "null";
    } else if (obj === undefined) {
        return "undefined";
    } else if (obj.constructor === stringConstructor) {
        return "string";
    } else if (obj.constructor === arrayConstructor) {
        return "array";
    } else if (obj.constructor === objectConstructor) {
        return "object";
    } else {
        return "Unknown";
    }
}
;

RBT.hopperPut = function () {
    var form = document.getElementById("hopper_form").elements;
    data = {};
    for (var i = 0; i < form.length; i++) {
        data[form[i].name] = form[i].value;
    }
    var output = JSON.stringify(data);
    console.log(output);
    RBT.widget("rbt_widget_Hopper").refresh("json=" + encodeURIComponent(output));
//     if(data.chat_content && data.chat_creator && data.chat_reference_nbr) {
//        document.getElementById("message").value = "";
//        document.getElementById("required").innerHTML = null;
//        RBT.widget("rbt_widget_Chat").refresh("json="+encodeURIComponent(output));
//    } else {
//        document.getElementById("required").innerHTML = "*All fields required";
//    }
};

RBT.putGetJson = function (name, json, receiver, saveButtonElement) {

    if (saveButtonElement) {
        saveButtonElement.savedStyle = saveButtonElement.style;
        saveButtonElement.savedHTML = saveButtonElement.innerHTML;
        saveButtonElement.innerHTML = '<i class="fa fa-cog fa-spin fa-1x fa-fw"></i>';
        saveButtonElement.style.background = "orange";
    }
    $.ajax({
        method: "POST",
        url: RBT.jsonServerURL + "factory/svc/json_process.jsp?ajax=y&widget=" + name,
        contentType: 'text/plain',
        data: json,
        crossDomain: true,
        success: function (result) {
            if (result.success) {
                if (saveButtonElement) {
                    saveButtonElement.innerHTML = saveButtonElement.savedHTML;
                    //saveButtonElement.style.background = "white";
                    saveButtonElement.style = saveButtonElement.savedStyle;
                }
                if (false && result.message) {
                    alert(result.message);
                }
                console.log("success ", result);
                receiver(result);
            } else
                alert(result.message);
        },
        error: function (result) {
            console.log("error ", result);
            if (result.status == 200) {
                try {
                    JSON.parse(result.responseText);
                } catch (err)
                {


                    var txt = "Return JSON did not parse: " + err.message + "\n";
                    txt += "Error stack: " + err.stack + "\n\n";

                    alert(txt + "ResponseText:\n" + result.responseText).replace(/</g, '&lt;').replace(/\n/g, '<br>');


                }
            }
            receiver(result);
            if (saveButtonElement) {
                saveButtonElement.style.background = "red";
                saveButtonElement.innerHTML = '<i class="fa fa-exclamation-triangle"></i>';
            }
        },
        processData: true, //default=true
        dataType: "json"
    });
};
/*************************************************************
 * General JSON receivers
 *************************************************************/
RBT.widget_refresh_receivers = [];
RBT.widget_refresh_receiver = function (id, fun) {
    RBT.widget_refresh_receivers[id] = fun;
};
/**************************************************************
 * Create a subclass of Widget, overriding refresh mechanism
 **************************************************************/
RBT.JsonWidget = function (name, id, e) {
    //this.base = RBT.Widget;
    //this.base(name, id, e);
    RBT.Widget.call(this, name, id, e);
    this.refresh = function (more, synchronous) {
        var data = {};
        data.id = this.id;
        //var url = "svc/widgets.jsp?name=" + this.name + "&id=" + this.id;
        if (RBT.tote_XYs_from)
            data.tote_XYs_from = RBT.tote_XYs_from;
        if (RBT.report_from)
            data.report_from = RBT.report_from;
        if (more)
            data.more = more; // fixme - it is key value pairs
        var fun = RBT.widget_refresh_receivers[this.id];
        if (fun) {
            //alert("BEFORE:widget " + this.name +"("+this.id +") DOES have a receive_refresh()");
            RBT.putGetJson(this.name, JSON.stringify(data), fun, null);
        } else {
            // alert("BEFORE:widget " + this.name +"("+this.id +") does not have a receive_refresh()");
            RBT.putGetJson(this.name, JSON.stringify(data), this.receive_refresh, null);
        }
//        if (synchronous) {
//            RBT.sync_script(url, this.e);
//        } else
//            RBT.async_script(url, this.e);
    };
    this.receive_refresh = function (result) {
        var rj = JSON.stringify(result);
        var fun = RBT.widget_refresh_receivers[id];
        if (fun) {
            //alert("widget " + this.name +"("+this.id +") DOES have a receive_refresh(): result" + rj);
            fun(result);
        } else {
            //  alert("widget " + this.name +"("+this.id +") does not have a receive_refresh(): result" + rj);
        }
    };

};
RBT.JsonWidget.prototype = new RBT.Widget;


