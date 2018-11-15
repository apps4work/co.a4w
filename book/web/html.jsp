
<%@page import="java.net.URI"%>
<%@page import="com.coldlogic.markdown.Markdown"%>
<%@page import="java.util.StringTokenizer"%>
<%
// COLDLOGIC CONFIDENTIAL UNTIL DETERMINED OTHERWISE
// serves the book in html
//
%>
<%@page import="com.dotcomfast.base.*" %><%!
    boolean require_login = false;
    boolean require_email = true;

    static String clean(String filename) {
        return filename.replace("-", " ");
    }
    static String chap = "Chapter-x-";

    static String chapter_name(int number, String filename) {
        if (number < 1) {
            return "";
        }

        if (filename.startsWith("Chapter")) {
            filename = filename.substring(chap.length());
        }
        return number + ". " + filename.replace("-", " ");
    }

    static String link(String filename) {
        return link(clean(filename), filename);
    }

    static String link(String callout, String filename) {
        return "<a id='" + filename + "'href='" + filename + "' >" + callout + "</a>";
    }

    static String source(String pageFileName) throws Exception {
        //String source = "https://raw.githubusercontent.com/wiki/apps4work/co.a4w/" + pageFileName + ".md";
        URI uri = new URI(
                "https",
                "raw.githubusercontent.com",
                "/wiki/apps4work/co.a4w/" + pageFileName + ".md",
                null);
        String source = uri.toString();
        return com.dotcomfast.net.LinkAccessor.get(source);
    }

    static class Contents {

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
                        b.append("<ol  >\n");
                    } else {
                        b.append("<li  >\n").append(link(line)).append("</li>\n");
                    }

                    if (current.equals(line)) {
                        prev = running_prev;

                        chapter = running_chapter;
                        chapter_number = running_chapter_number;
                        chapter_name = chapter_name(chapter_number, chapter);

                        is_chapter = current.equals(chapter);
                        page_name = is_chapter ? chapter_name : clean(current);

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

    static boolean has_editor_mark(String page) throws Exception {
        String source = source(page);
        return source.contains("\n>|");
    }

    static String nextPage(String current, boolean prev) throws Exception {
        StringTokenizer sequence = new StringTokenizer(source("_sequence"), "\n");
        String prevPage = null;
        while (sequence.hasMoreTokens()) {
            String line = sequence.nextToken();

            if (current.equals(line)) {
                if (prev) {
                    if (prevPage == null) {
                        return "Home";
                    } else {
                        return prevPage;
                    }
                }
                while (sequence.hasMoreTokens()) {
                    line = sequence.nextToken();
                    if (has_editor_mark(line)) {
                        return line;
                    }
                }
            } else if (prev) {
                if (has_editor_mark(line)) {
                    prevPage = line;
                }
            }
        }
        return "Home";
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
                parm = cm.parameters();
                Authorization auth = null;
                if (require_login) {
                    auth = new Authorization(cm, session, request);
                }
                if (require_email && !"localhost".equalsIgnoreCase(request.getServerName())) {
                    auth = new Authorization.By_Email(cm, session, request);
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
                        if (parm.has("editor_mark")) {
                            String nextPage = nextPage(pageFileName,parm.is("prev")); 
                            response.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
                            response.setHeader("Location", "" + nextPage);
                            return;
                        }

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
                                + "<div id='page' class='page'>");
                        String links = ("<span class='chapter_name'>"
                                + (contents.is_chapter ? "" : contents.chapter_name)
                                + "</span>"
                                + "<span class='editlinks'>"
                                + " <a href='#' onclick='book_toggle_links();return false;' >links</a>"
                                + " <a class='editlink' href='https://github.com/apps4work/co.a4w/wiki/" + pageFileName + "/_edit' target='" + pageFileName + "' >Edit</a>"
                                + " <a class='editlink' href='" + contents.prev + "' >prev</a>"
                                + " <a class='editlink' href='" + contents.next + "' >next</a>"
                                + "</span>");
                        cm.out(links);
                        cm.out("<h1>" + contents.page_name
                                + "</h1>\n");
                        Markdown markdown = null;
                        try {
                            markdown = new Markdown(source(pageFileName));
                            markdown.split();
                            cm.out(markdown.html());

                        } catch (Throwable e) {
                            cm.out(cm.exception(e).replace("</table>", ""));
                        }
                        cm.out(links);
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
                                + "    book_scroll_to('" + contents.chapter + "');\n "
                                + " var book_max_editor_mark_number = " + markdown.book_max_editor_mark_number + ";"
                                + "  </script>\n");

                    }

                }
                cm.pageFooter();

            } catch (Throwable e) {%><%=catch_(cm, e)%><%} finally {%><%=finally_(cm)%><%}%>


        <!-- logout? -->
    </body>
</html>