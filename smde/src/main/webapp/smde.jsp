
<%@page import="com.dotcomfast.base.*" %>
<%@page extends="com.dotcomfast.base.JSP"  %>

<!DOCTYPE html>
<html lang="en-us">
    <head>
        <meta charset="UTF-8">
        <title>SimpleMDE</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,700' rel='stylesheet' type='text/css'>



        <style>
            .editor-preview h1,
            .editor-preview h2,
            .editor-preview h3,
            .editor-preview h4,
            .editor-preview h5{
                margin-bottom:10px;
            }

            .editor-preview h1{
                border-bottom:1px solid #ddd;
            }

            .editor-preview h1{
                border-bottom:1px solid #eee;
            }
        </style>
    </head>
    <body>

        <%  Common cm = null;
            Parameters parm = null;

            //boolean isTest = !request.getServerName().contains(".");
            try {
                cm = begin(request, response, out);
                parm = cm.parameters();
                if (!new Authorization.By_Email(cm, session, request).authorized()) {
                    return;
                }
            } catch (Throwable e) {%><%=catch_(cm, e)%><%} finally {%><%=finally_(cm)%><%}%>


        <form id="the-form">
            <textarea id="demo2">
# Intro
Go ahead, play around with the editor! Be sure to check out **bold** and *italic* styling, or even [links](https://google.com). You can type the Markdown syntax, use the toolbar, or use shortcuts like `cmd-b` or `ctrl-b`.

## Lists
Unordered lists can be started using the toolbar or by typing `* `, `- `, or `+ `. Ordered lists can be started by typing `1. `.

#### Unordered
* Lists are a piece of cake
* They even auto continue as you type
* A double enter will end them
* Tabs and shift-tabs work too

#### Ordered
1. Numbered lists...
2. ...work too!

## What about images?
![Yes](https://i.imgur.com/sZlktY7.png)

#### This one fff autosaves!
By default, it saves every 10 second, but this can be changed. 
When this textarea is included in a form, it will automatically forget the saved value when the form is submitted.
            </textarea>

        </form>



        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.css">
        <script src="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.js"></script>
        <script src="smde.js"></script>

    </body>
</html>
