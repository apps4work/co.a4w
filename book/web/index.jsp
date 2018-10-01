<%-- 
    Document   : index
    Created on : Sep 30, 2018, 7:37:19 PM
    Author     : root
--%><%!
    static String target = "/book/html/Home";
%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%
    response.setStatus(HttpServletResponse.SC_MOVED_TEMPORARILY);
    response.setHeader("Location", target);
%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Book</title>
    </head>
    <body>
        Redirecting to <a href='<%=target%>'><%=target%></a>
    </body>
</html>
