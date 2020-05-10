/* 
 * COLDLOGIC CONFIDENTIAL UNTIL DETERMINED OTHERWISE
 */

/* global SimpleMDE */



var simplemde = new SimpleMDE({
    element: document.getElementById("demo2"),
    spellChecker: true,
    autosave: {
        enabled: true,
        unique_id: "demo2",
    },
    //hideIcons: ["side-by-side","fullscreen","preview"],
    showIcons: ["code", "table", "strikethrough", "heading", "clean-block", "horizontal-rule"],
    toolbar: [

        {name: "bold",
            action: SimpleMDE.toggleBold, title: "Bold", className: "fa fa-bold"},
        {name: "italic",
            action: SimpleMDE.toggleItalic, title: "Italic", className: "fa fa-italic"},
        {name: "strikethrough",
            action: SimpleMDE.toggleStrikethrough, title: "Strikethrough", className: "fa fa-strikethrough"},
        {name: "heading",
            action: SimpleMDE.toggleHeadingSmaller, title: "Heading", className: "fa fa-header"},
        {name: "heading-smaller",
            action: SimpleMDE.toggleHeadingSmaller, title: "Smaller Heading", className: "fa fa-header"},
        {name: "heading-bigger",
            action: SimpleMDE.toggleHeadingBigger, title: "Bigger Heading", className: "fa fa-lg fa-header"},
        {name: "heading-1",
            action: SimpleMDE.toggleHeading1, title: "Big Heading", className: "fa fa-header fa-header-x fa-header-1"},
        {name: "heading-2",
            action: SimpleMDE.toggleHeading2, title: "Medium Heading", className: "fa fa-header fa-header-x fa-header-2"},
        {name: "heading-3",
            action: SimpleMDE.toggleHeading3, title: "Small Heading", className: "fa fa-header fa-header-x fa-header-3"},
        {name: "code",
            action: SimpleMDE.toggleCodeBlock, title: "Code", className: "fa fa-code"},
        {name: "quote",
            action: SimpleMDE.toggleBlockquote, title: "Quote", className: "fa fa-quote-left"},
        {name: "unordered-list",
            action: SimpleMDE.toggleUnorderedList, title: "Generic List", className: "fa fa-list-ul"},
        {name: "ordered-list",
            action: SimpleMDE.toggleOrderedList, title: "Numbered List", className: "fa fa-list-ol"},
        {name: "clean-block",
            action: SimpleMDE.cleanBlock, title: "Clean block", className: "fa fa-eraser fa-clean-block"},
        {name: "link",
            action: SimpleMDE.drawLink, title: "Create Link", className: "fa fa-link"},
        {name: "image",
            action: SimpleMDE.drawImage, title: "Insert Image", className: "fa fa-picture-o"},
        {name: "table",
            action: SimpleMDE.drawTable, title: "Insert Table", className: "fa fa-table"},
        {name: "horizontal-rule",
            action: SimpleMDE.drawHorizontalRule, title: "Insert Horizontal Line", className: "fa fa-minus"},
        {name: "preview",
            action: SimpleMDE.togglePreview, title: "Toggle Preview", className: "fa fa-eye no-disable"},
        {name: "side-by-side",
            action: SimpleMDE.toggleSideBySide, title: "Toggle Side by Side", className: "fa fa-columns no-disable no-mobile"},
        {name: "fullscreen",
            action: SimpleMDE.toggleFullScreen, title: "Toggle Fullscreen", className: "fa fa-arrows-alt no-disable no-mobile"},
        {name: "guide",
            action: "https://simplemde.com/markdown-guide", title: "Markdown Guide", className: "fa fa-question-circle"},
        {
            name: "Save",
            action: function thingy(editor) {
                alert("saving ...");
                var form = document.getElementById("the-form");
                form.submit();
            },
            className: "fa fa-save",
            title: "Save",
        }
    ]
});
//alert("before: simplemde.isSideBySideActive()="+simplemde.isSideBySideActive());
if (!simplemde.isSideBySideActive()) {
    simplemde.toggleSideBySide();
}
if (simplemde.isFullscreenActive()) {
    simplemde.toggleFullScreen();
}
//alert("after: simplemde.isSideBySideActive()="+simplemde.isSideBySideActive());
