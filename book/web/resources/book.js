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
   
    
    function doBookStuff() {
       var x = (new Showdown.converter()).makeHtml("my markdown stuff");
       alert("my markdown="+x);
    }
    
    function setBookClass(id,classname) {
        var e = document.getElementById(id);
        e.className=classname;
    }

