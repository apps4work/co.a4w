
<%@page import="com.coldlogic.markdown.Markdown"%>
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
    static String chap = "Chapter-x-";

    String chapter_name(int number, String filename) {
        if (number<1)
           return "";

        if (filename.startsWith("Chapter")) {
            filename = filename.substring(chap.length());
        }
        return number + ". " + filename.replace("-", " ");
    }

    String link(String filename) {
        return link(clean(filename), filename);
    }

    String link(String callout, String filename) {
        return "<a href='" + filename + "' >" + callout + "</a>";
    }

    String source(String pageFileName) throws Exception {
        String source = "https://raw.githubusercontent.com/wiki/apps4work/co.a4w/" + pageFileName + ".md";
        return com.dotcomfast.net.LinkAccessor.get(source);
    }

    class Contents {

        String prev;
        String next;
        String chapter;
        String chapter_name = "";
        String page_name = "";
        int chapter_number;
        boolean is_chapter = false;

        String contents(String current) throws Exception {
            StringBuilder b = new StringBuilder();
            StringTokenizer sequence = new StringTokenizer(source("_sequence"), "\n");
            b.append("<ol>\n");
            String running_prev = "Home";
            String running_chapter = running_prev;
            int running_chapter_number = 0;

            while (sequence.hasMoreTokens()) {
                String line = sequence.nextToken();

                if (line.length() > 0) {

                    if (line.contains("Chapter")) {
                        running_chapter = line;
                        running_chapter_number++;

                        b.append("</ol>\n");
                        b.append(link(chapter_name(running_chapter_number, running_chapter), line));
                        b.append("<ol id='" + line + "' >\n");
                    } else {
                        b.append("<li id='" + line + "' >\n").append(link(line)).append("</li>\n");
                    }

                    if (current.equals(line)) {
                        prev = running_prev;

                        chapter = running_chapter;
                        chapter_number = running_chapter_number;
                        chapter_name = chapter_name(chapter_number, chapter);

                        is_chapter = current.equals(chapter);
                        page_name=is_chapter ? chapter_name : clean(current);

                    } else {
                        if (prev != null && next == null) {
                            next = line;
                        }
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
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
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
                    String pageFileName = pathInfo.substring(pathInfo.indexOf("/") + 1); // remove slash

                    if (pathInfo == null || pathInfo.length() == 0 || pathInfo.equals("/")) {
                        cm.out("<script>\ndocument.location='Home';\n</script>\nGoing Home ..");
                    } else if (pathInfo.startsWith("/images")) {
                        response.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
                        response.setHeader("Location", "https://raw.githubusercontent.com/wiki/apps4work/co.a4w/" + pageFileName);
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
                        cm.out(contents.contents(pageFileName));
                        cm.out("</div></td>\n"
                                + "<td class='page'>\n"
                                + "<div class='page'>");
                        cm.out("<span class='chapter_name'>"
                                + (contents.is_chapter?"":contents.chapter_name)
                                + "</span>"
                                + "<span class='editlinks'>"
                                + " <a href='#' onclick='book_toggle_links();return false;' >links</a>"
                                + " <a class='editlink' href='https://github.com/apps4work/co.a4w/wiki/" + pageFileName + "/_edit' target='" + pageFileName + "' >Edit</a>"
                                + " <a class='editlink' href='" + contents.prev + "' >prev</a>"
                                + " <a class='editlink' href='" + contents.next + "' >next</a>"
                                + "</span>"
                        );
                        cm.out("<h1>" + contents.page_name
                                + "</h1>\n");
                        Markdown markdown = null;
                        try {
                            markdown = new Markdown(source(pageFileName));
                            cm.out(markdown.html());

                        } catch (Throwable e) {
                            cm.out(cm.exception(e).replace("</table>", ""));
                        }
                        cm.out("</div>"
                                + "</td>"
                                + "<td class='sidebar'>"
                                + "<div class='contents'>"
                                + (markdown == null ? "" : markdown.sidebar())
                                + "</div></td>"
                                + "</tr></table>\n");

                        cm.out("<script>\n"
                                + "    setBookClass('" + pageFileName + "','currentPage');\n "
                                + "    setBookClass('" + contents.chapter + "','currentChapter');\n "
                                + "  </script>\n");

                    }

                }
                cm.pageFooter();

            } catch (Throwable e) {%><%=catch_(cm, e)%><%} finally {%><%=finally_(cm)%><%}%>


        <!-- logout? -->
    </body>
</html>