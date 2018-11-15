/* 
 * COLDLOGIC CONFIDENTIAL UNTIL DETERMINED OTHERWISE
 */

/*
class Person {                                          // The 'class' keyword
    constructor(name, age) {                            // Constructors
        this.name = name;
        this.age = age;
    }
}

class Developer extends Person {                        // The 'extends' keyword
    constructor(name, age, ...languages) {              // Rest parameters
        super(name, age);                               // Super calls
        this.languages = [...languages];                // The spread operator
    }
    printLanguages() {                                  // Short method definitions
        for(let lang of this.languages) {               // The for..of loop
            console.log(lang);
        }
    }
}

let me = new Developer("James", 23, "ES5", "ES6");     // Block scoping
function getDefaultOpts(b) {
    return {};
}


import * as showdown from './showdown.js';

   var converter = new showdown.Converter(),
    text      = '# hello, markdown!',
    html      = converter.makeHtml(text);
    */
   
    
    /* global book_max_editor_mark_number */

function doBookStuff() {
       var x = (new Showdown.converter()).makeHtml("my markdown stuff");
       alert("my markdown="+x);
    }
    
    function setBookClass(id,classname) {
        var e = document.getElementById(id);
        e.className=classname;
    }
    
    function book_toggle_links() {
        $("a").addClass("highlighted_link");
        return false;
    }
    
    function book_scroll_to(id) {
        var element = document.getElementById(id);
        var top = element.offsetTop;
        var op = element.offsetParent;
        var p = element.parentNode;
        op.scrollTop=(top);
        p.scrollTop=(top);
        var t = p.scrollTop;
        return t;
    }
    
    function book_next_editor_mark(n) {
        var max_n = book_max_editor_mark_number;
        if(n>=max_n) {
            if (confirm("next n "+n+"/"+max_n+". No more on this page. Go to next page that has editor notes? (takes a few secs to find it)")) {
                document.location="?editor_mark=next";
            }
            
        } else if(n<1) {
            if (confirm("next n "+n+"/"+max_n+". No prev on this page. Go to prev page that has editor notes? (takes a few secs to find it)")) {
                document.location="?editor_mark=prev";
            }
            
        } else {
           n++;
           //alert("scroll to "+n+"/"+max_n);
           book_scroll_edit_to("EDITOR_NOTE_"+n); 
       }
    }
    
    function book_scroll_edit_to(id) {
        var element = document.getElementById(id);
        var page = document.getElementById("page");
        var top = element.offsetTop;
        var op = element.offsetParent;
        var p = element.parentNode;
        p=page;
        //op.scrollTop=(top);
        p.scrollTop=(top);
        var t = p.scrollTop;
        return t;
    }

