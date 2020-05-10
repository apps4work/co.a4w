<%-- 
    Document   : smde
    Created on : Nov 23, 2018, 8:19:51 AM
    Author     : root
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>SMDE</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css">
        <script src="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.js"></script>
    </head>
    <body>
        <h1>Hello World!</h1>
        <textarea id="editarea" ></textarea>
        
        <script>
            // Most options demonstrate the non-default behavior
            var simplemde = new SimpleMDE({
                element: document.getElementById("editarea") ,
                autofocus: true,
                autosave: {
                    enabled: true,
                    uniqueId: "MyUniqueID",
                    delay: 1000,
                },
                blockStyles: {
                    bold: "__",
                    italic: "_"
                },
               
                forceSync: true,
                hideIcons: ["guide", "heading"],
                indentWithTabs: false,
                initialValue: "Hello world!",
                insertTexts: {
                    horizontalRule: ["", "\n\n-----\n\n"],
                    image: ["![](http://", ")"],
                    link: ["[", "](http://)"],
                    table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"],
                },
                lineWrapping: false,
                parsingConfig: {
                    allowAtxHeaderWithoutSpace: true,
                    strikethrough: false,
                    underscoresBreakWords: true,
                },
                placeholder: "Type here...",
        //        previewRender: function (plainText) {
        //            return customMarkdownParser(plainText); // Returns HTML from a custom parser
        //        },
        //        previewRender: function (plainText, preview) { // Async method
        //            setTimeout(function () {
        //                preview.innerHTML = customMarkdownParser(plainText);
        //            }, 250);

        //            return "Loading...";
        //        },
                promptURLs: true,
                renderingConfig: {
                    singleLineBreaks: false,
                    codeSyntaxHighlighting: true,
                },
                shortcuts: {
                    drawTable: "Cmd-Alt-T"
                },
                showIcons: ["code", "table"],
                spellChecker: false,
             //   status: false,
             //   status: ["autosave", "lines", "words", "cursor"], // Optional usage
                status: ["autosave", "lines", "words", "cursor", {
                        className: "keystrokes",
                        defaultValue: function (el) {
                            this.keystrokes = 0;
                            el.innerHTML = "0 Keystrokes";
                        },
                        onUpdate: function (el) {
                            el.innerHTML = ++this.keystrokes + " Keystrokes";
                        }
                    }], // Another optional usage, with a custom status bar item that counts keystrokes
                styleSelectedText: false,
                tabSize: 4,
                toolbar: false,
                toolbarTips: false,
            });
           
            alert("before: simplemde.isSideBySideActive()="+simplemde.isSideBySideActive());
            simplemde.toggleSideBySide();
             alert("after: simplemde.isSideBySideActive()="+simplemde.isSideBySideActive());
            //simplemde.value("This text will appear in the editor");
        </script>
        
    </body>
</html>
