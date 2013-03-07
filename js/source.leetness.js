/*
Copyright (c) 2009 Egon Hyszczak [egon_at_hyszczak_dot_net]

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

var TransPanel = function() {
    //Canvas tweener
    var canvas = $("#container").get(0);
    var parallax_canvas = $("#parallax").get(0);
    //var tweenType = Tween.backEaseOut;
    var tweenType = Tween.strongEaseInOut;
    var duration = 1.0;
    var textarea_message = "";

    var c = new CookieMonster();

    var self = this;
    var resizeTimeoutId;

    this.getPos = function(obj) {
        var curleft = 0;
        var curtop = 0;

        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
        return [curleft, curtop];
    };

    this.gotoPage = function(container, destination) {
        var current_position = this.getPos($(container).get(0));
        var final_position = this.getPos($(destination).get(0));
        var current_x = current_position[0];
        var current_y = current_position[1];
        var final_x = final_position[0] * -1;
        var final_y = final_position[1] * -1;

        if($("#parallax").css('display') == 'none') {
            //Fade in parallax background
            $("#parallax").fadeIn(3600);
        }
        //Create parallel tween object
        var content_tween = new Parallel();
        var parallax = new Parallel();
        if((Math.abs(current_x) - Math.abs(final_x)) != 0) {
            content_tween.h = new Tween(canvas.style, 'left', tweenType, current_x, final_x, duration, 'px');
            content_tween.addChild(content_tween.h);
            parallax.h = new Tween(parallax_canvas.style, 'left', tweenType, (current_x/16), (final_x/16), duration, 'px');
            parallax.addChild(parallax.h);
            textarea_message += "\ngoto: moving horizontally [cX/fX]: "+current_x+"/"+final_x;
        }
        if((Math.abs(current_y) - Math.abs(final_y)) != 0) {
            content_tween.v = new Tween(canvas.style, 'top', tweenType, current_y, final_y, duration, 'px');
            content_tween.addChild(content_tween.v);
            parallax.v = new Tween(parallax_canvas.style, 'top', tweenType, current_y/6, final_y/6, duration, 'px');
            parallax.addChild(parallax.v);
            textarea_message += "\ngoto: moving vertically [cY/fY]: "+current_y+"/"+final_y;
        }

        //Set a cookie to track last page visited.
        c.createCookie('hyszczak.net', destination, 1);
        //Update hash to reflect current location.
        window.location.hash = destination.replace("#", "#!");

        //Track movement (start and finish).
        if(parallax.h != undefined) {
          var tween_object = parallax.h;
        } else if(parallax.v != undefined) {
          var tween_object = parallax.v;
        }
        if(tween_object != undefined) {
          tween_object.onMotionFinished = function(event) {
            //console.log("finished moving to "+destination);
          }
          tween_object.onMotionStarted = function(event) {
            //console.log("started moving to "+destination);
          }
        }

        content_tween.start();
        parallax.start();

    };

    this.setPageSizes = function() {
        //Return browser dimensions.
        this.getBrowserDimensions = function() {
            var width = 0;
            var height = 0;
            if(navigator.userAgent.indexOf("MSIE") != -1) {
                width = document.documentElement.clientWidth;
                height = document.documentElement.clientHeight;
            } else {
                width = window.innerWidth;
                height = window.innerHeight;
            }
            textarea_message += "getBrowserDimensions: [w/h] "+width+"/"+height+"\n";
            return [width, height];
        };

        dimensions = this.getBrowserDimensions();
        tPos = 0; //Top position
        lPos = 0; //Left position
        padding = 65;
        columns = 3;

        //Set width height and position of content elements
        var elements = ['#start',
                        '#contact',
                        '#print',
                        '#skills',
                        '#about',
                        '#work',
                        '#extra'];

        $.each(elements, function(index, value) {
            width = dimensions[0];
            height = dimensions[1];
            $(value).css('width', width+"px").css('height', height+"px");
            $(value).css('top', tPos+"px").css('left', lPos+"px");
            lPos += width + padding;
            if((index+1) % columns == 0) {
                lPos = 0;
                tPos += height + padding;
            }
        });

        clearTimeout(resizeTimeoutId);
        resizeTimeoutId = setTimeout(function() {
            if(window.location.hash) {
              var destination = window.location.hash.replace("!", "");
            } else {
              var destination = c.readCookie('hyszczak.net');
            }
            if(destination != "#start") {
              self.gotoPage('#container', destination);
            }
        }, 200);

        textarea_message += "set height of page elements to: "+height+"\n";
    };

    this.debug = function(message) {
        if(navigator.userAgent.indexOf("Microsoft") != -1) {
            alert(message);
        } else if(navigator.userAgent.indexOf("Chrome") != -1) {
            alert(message);
        } else {
            console.log(message);
        }
    };

    this.trackPosition = function() {
        var position = this.getPos($("#container").get(0));
        var status_message = "container position: "+position;
        $('input[name="status"]').val(status_message);
        $('textarea[name="status_area"]').val(textarea_message);
        debug("called trackPosition");
    };
};

var CookieMonster = function() {
    //Create cookie.
    this.createCookie = function(name, value, days) {
        if(days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            var expires = "; expires=" + date.toGMTString();
        } else {
            var expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    };

    //Read cookie.
    this.readCookie = function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(i in ca) {
            var c = ca[i];
            while(c.charAt(0) == ' ') {
                c = c.substring(1, c.length);
            }
            if(c.indexOf(nameEQ) == 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    };

    //Erase cookie.
    this.eraseCookie = function(name) {
        this.createCookie(name, null, -1);
    };
};

//On Document Ready
$(document).ready(function() {
    var panel = new TransPanel();

    //Rearrange content placement on window resize
    window.onresize = panel.setPageSizes;

    //Make initial call to size content correctly.
    panel.setPageSizes();
    
    //Bind click events.
    var click_objects = ['.goto_start', 
                         '.goto_about', 
                         '.goto_contact', 
                         '.goto_skills', 
                         '.goto_work', 
                         '.goto_print'];

    for(x in click_objects) {
        var obj = click_objects[x];
        $(obj).live('click', {msg: obj}, function(event) {
            event.preventDefault();
            var destination = '#'+event.data.msg.substring(6);
            panel.gotoPage('#container', destination);

            //Enable bookmarking.
            window.location.hash = destination.replace("#", "!");
        });
    }

    $("#toggle_debug").click(function() {
        textarea_message = "";
        $("#status_area").toggle();
    });

    var el = $("#status_area").get(0);
    el.scrollTop = el.scrollHeight;
    $("input[type='button']").button();
    $("input:submit").button();

    //Scrolling
    var scrollPos = new Array();
    scrollPos['work'] = 0;
    scrollPos['about'] = 0;
    scrollPos['skills'] = 0;
    var downIntervalID;
    var upIntervalID;
    var scrollAmount = 12;
    var scrollInterval = 40; //milliseconds
    $('div.scroll-up').each(function() {
        $(this).hover(function() {
            var scrollPos = 0;
            var id = $(this).parent().attr('id');
            var target = id.split('-')[0];
            //Mouseover
            upIntervalID = setInterval(function() {
                //debug("calling scrollUp");
                scrollUp(target);
            }, scrollInterval);
            //Mouseout
            },function() {
                clearInterval(upIntervalID);
            }
        );
    });
    $('div.scroll-down').each(function() {
        $(this).hover(function() {
            var id = $(this).parent().attr('id');
            var target = id.split('-')[0];
            //Mouseover
            downIntervalID = setInterval(function() {
                //debug("calling scrollDown");
                scrollDown(target);
            }, scrollInterval);
            //Mouseout
            },function() {
                clearInterval(downIntervalID);
            }
        );
    });

    function scrollDown(section) {
        scrollPos[section] += scrollAmount;
        $('div#' + section + ' div.inside div.content').scrollTo(scrollPos[section], 0);
    }

    function scrollUp(section) {
        if(scrollPos[section] > 0) {
            scrollPos[section] -= scrollAmount;
            $('div#' + section + ' div.inside div.content').scrollTo(scrollPos[section], 0);
        }
    }

    var ctrl = false;
    $(this).keydown(function(e) {
      if(e.keyCode == 17) {
        ctrl = true;
      }
      if(ctrl && e.keyCode == 49) {
        var destination = "#"+$("#menu input")[0].value;
        if(destination.search(/home/)); {
          destination = destination.replace("home", "start");
        }
        panel.gotoPage("#container", destination);
      }
      if(ctrl && e.keyCode == 50) {
        var destination = "#"+$("#menu input")[1].value;
        panel.gotoPage("#container", destination);
      }
      if(ctrl && e.keyCode == 51) {
        var destination = "#"+$("#menu input")[2].value;
        panel.gotoPage("#container", destination);
      }
      if(ctrl && e.keyCode == 52) {
        var destination = "#"+$("#menu input")[3].value;
        panel.gotoPage("#container", destination);
      }
      if(ctrl && e.keyCode == 53) {
        var destination = "#"+$("#menu input")[4].value;
        panel.gotoPage("#container", destination);
      }
    });

    $(this).keyup(function(e) {
      if(e.keyCode == 17) {
        ctrl = false;
      }
    });

    $('#contact_form').submit(function(e) {
        e.preventDefault();

        if(!$("#contact_form").validationEngine('validate')) {
            return false;
        }

        //Alternate spam prevention method. Value must stay empty.
        if($("input#human").val() != "") {
          return false;
        }

        $.ajax({
            url:"includes/mail.php",
            type:"post",
            data:{
                email_address:this.email_address.value,
                from_name:this.from_name.value,
                reason:this.reason[this.reason.selectedIndex].innerHTML,
                message:this.message.value
            },
            cache:false,
            dataType:"text",
            success:function(data) {
                if(data.match("SUCCESS")) {
                    //Run transfer effect.
                    $("#contact_block").effect("transfer", {
                      to:"#submit",
                      className:"ui-effects-transfer"
                    }, 1000, function() {
                      contact_success.dialog('open');
                      //Clear form elements and disable submit button
                      $('#contact_form input#email_address').val("");
                      $('#contact_form input#from_name').val("");
                      $('#contact_form select#reason').get(0).selectedIndex = 0;
                      $('#contact_form textarea#message').val("");
                      $('#contact_form input#submit').button('option', 'disabled', true);
                    });
                }
            },
            error:function(xhr) {
                if(xhr.statusText == "error") {
                    //Trigger error dialog
                    contact_failure.dialog('open');
                }
            }
        });

        return false;
    });

    //Re-enable submit button if page is reloaded.
    $("input#submit:disabled").button('option', 'disabled', false);

    $("#contact_form").validationEngine('attach', {promptPosition:"centerRight", scroll:false});

    var contact_success = $('<div></div>').html('<p><span class="ui-icon ui-icon-circle-check" style="float:left; margin:0px 7px 50px 0px;"></span>Thank you for your interest in my work. You will be hearing from me shortly!</p>');
    contact_success.dialog({
        modal:true,
        autoOpen:false,
        resizable:false,
        draggable:false,
        title:"Message Sent",
        buttons:{
            Ok:function() {
                $(this).dialog('close');
            }
        }
    });

    var contact_failure = $('<div></div>').html('<p><span class="ui-icon ui-icon-circle-close" style="float:left; margin:0px 7px 50px 0px;"></span>There was a problem sending the email. Please try again. If the problem persists, you can contact me directly at egon_at_hyszczak_dot_net.</p>');
    contact_failure.dialog({
        autoOpen:false,
        resizable:false,
        draggable:false,
        title:"Problem Sending Email",
        modal:true,
        buttons:{
            Ok:function() {
                $(this).dialog('close');
            }
        }
    });

    $('div#menu input[type="button"]').click(function() {
        $('#contact_form').validationEngine('hide');
    });

    //Background switcher.
    $("ul#bg-select a").click(function(e) {
      e.preventDefault();
      var bg = $(this).attr('id');
      if(bg == "bg-alt") {
        $("#parallax").css('background', 'url(../images/landscape.jpg) no-repeat scroll 0 0 transparent');
        $("#parallax").css('opacity', '0.6');
        $("body").css('background-image', 'url(../images/bg.jpg)');
      }
      if(bg == "bg-orig") {
        $("#parallax").css('background', 'url(../images/landscape2.jpg) no-repeat scroll 0 0 transparent');
        $("#parallax").css('opacity', '0.5');
        $("body").css('background-image', 'url(../images/bg.jpg)');
      }
      if(bg == "bg-pat") {
        $("#parallax").css('background', 'none');
        $("#parallax").css('opacity', '0.6');
        $("body").css('background-image', 'url(../images/bg.jpg)');
      }
      if(bg == "bg-none") {
        $("#parallax").css('background', 'none');
        $("#parallax").css('opacity', '0.6');
        $("body").css('background-image', 'none');
      }
    });

    $("img.toggle").toggle(function() {
      $(this).attr('src', 'images/ico_minus.png');
      $(this).next().slideToggle("slow");
      //$(this).parent().css('background-color', '#fff');
    },function() {
      var self = this;
      $(this).next().slideToggle("fast", function() {
        $(self).attr('src', 'images/ico_plus.png');
        //$(self).parent().css('background-color', 'transparent');
      });
    });
});
