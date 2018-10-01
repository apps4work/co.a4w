
<%@page import="java.util.StringTokenizer"%>
<%
// COLDLOGIC CONFIDENTIAL UNTIL DETERMINED OTHERWISE
// serves the book in html
//
%>
<%@page import="com.dotcomfast.base.*" %><%!
    boolean require_login = false;

    String clean(String filename) {
        return filename.replace("-", " ");
    }

    String link(String filename) {
        return "<a href='" + filename + "' >" + clean(filename) + "</a>";
    }

    String source(String pageName) throws Exception {
        String source = "https://raw.githubusercontent.com/wiki/apps4work/co.a4w/" + pageName + ".md";
        return com.dotcomfast.net.LinkAccessor.get(source);
    }

    void outPage(Common cm, String pageName) throws Exception {
        cm.out(com.coldlogic.markdown.Markdown.html(source(pageName)));
    }

    class Contents {

        String prev;
        String next;
        String chapter;

        String contents(String current) throws Exception {
            StringBuilder b = new StringBuilder();
            StringTokenizer sequence = new StringTokenizer(source("_sequence"), "\n");
            b.append("<ol>\n");
            String running_prev = null;
            String running_chapter = null;

            while (sequence.hasMoreTokens()) {
                String line = sequence.nextToken();

                if (line.length() > 0) {
                    if (current.equals(line)) {
                        prev = running_prev;
                        chapter = running_chapter;
                    } else {
                        if (prev != null && next == null) {
                            next = line;
                        }
                    }
                    if (line.contains("Chapter")) {
                        running_chapter = line;
                        b.append("</ol>\n");
                        b.append(link(line));
                        b.append("<ol id='" + line + "' >\n");
                    } else {
                        b.append("<li id='" + line + "' >\n").append(link(line)).append("</li>\n");
                    }
                    running_prev = line;
                }
            }
            b.append("</ol>\n");
            return b.toString();

        }
    }
%>

<!DOCTYPE html>
<html>
    <head>
        <title>Book</title>
        <!-- link rel="stylesheet" type="text/css" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css"/ -->
        <link rel="stylesheet" type="text/css" href="/book/resources/book.css"/>
        <!-- script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js"></script -->
        <script src='/book/resources/book.js' ></script>
        <script src='/book/resources/rbt.js' ></script>

    </head>
    <body>
        <%@page extends="com.dotcomfast.base.JSP"               
                %>
        <%@page contentType="text/html" pageEncoding="UTF-8"%><%!

        %><%
            Common cm = null;
            Parameters parm = null;

            //boolean isTest = !request.getServerName().contains(".");
            try {
                cm = begin(request, response, out);
                Authorization auth = null;
                if (require_login) {
                    auth = new Authorization(cm, session, request);
                }

                if (auth == null || auth.authorized()) {
                    String pathInfo = request.getPathInfo();
                    String pageName = pathInfo.substring(pathInfo.indexOf("/") + 1); // remove slash

                    if (pathInfo == null || pathInfo.length() == 0 || pathInfo.equals("/")) {
                        cm.out("<script>\ndocument.location='Home';\n</script>\nGoing Home ..");
                    } else if (pathInfo.startsWith("/images")) {
                        response.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
                        response.setHeader("Location", "https://raw.githubusercontent.com/wiki/apps4work/co.a4w/" + pageName);
                        return;
                    } else {

                        cm.out("<table class='singlepage'>"
                                + "<tr>"
                                + "<td class='contents'>"
                                + "<div class='contents' "
                                //+ "style='overflow:scroll;height:400px; '"
                                + " >");
                        //outPage(cm,"Contents");
                        Contents contents = new Contents();
                        cm.out(contents.contents(pageName));
                        cm.out("</div></td>\n"
                                + "<td class='page'>\n"
                                + "<div class='page'>");
                        cm.out("<span class='editlinks'>"
                                + " <a class='editlink' href='https://github.com/apps4work/co.a4w/wiki/" + pageName + "/_edit' target='" + pageName + "' >Edit</a>"
                                + " <a class='editlink' href='" + contents.prev + "' >prev</a>"
                                + " <a class='editlink' href='" + contents.next + "' >next</a>"
                                + "</span>"
                        );
                        cm.out("<h1>" + clean(pageName)
                                + "</h1>\n");
                        try{
                            outPage(cm, pageName);
                         } catch (Throwable e) {
                             cm.out(cm.exception(e).replace("</table>",""));
                         }
                        cm.out("</div>"
                                + "</td>"
                                + "<td class='sidebar'>"
                                + "<div class='contents'>"
                                + "sidebar"
                                + "</div></td>"
                                + "</tr></table>\n");

                        cm.out("<script>\n"
                                + "    setBookClass('" + pageName + "','currentPage');\n "
                                + "    setBookClass('" + contents.chapter + "','currentChapter');\n "
                                + "  </script>\n");

                    }

                }
                cm.pageFooter();

            } catch (Throwable e) {%><%=catch_(cm, e)%><%} finally {%><%=finally_(cm)%><%}%>


        <!-- logout? -->
    </body>
</html>