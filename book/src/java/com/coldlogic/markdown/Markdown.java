/*
 * COLDLOGIC CONFIDENTIAL UNTIL DETERMINED OTHERWISE
 */
package com.coldlogic.markdown;

/**
 *
 * @author root
 */
import org.commonmark.node.*;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;

public class Markdown {

    public static void main(String[] args) throws Exception {
        System.out.println(html("Home"));
    }
    public static String html(String md) throws Exception {
        
       
        Parser parser = Parser.builder().build();
        Node document = parser.parse(md);
        HtmlRenderer renderer = HtmlRenderer.builder().build();
        String html = renderer.render(document);  // "<p>This is <em>Sparta</em></p>\n"
        return html;
    }
}
