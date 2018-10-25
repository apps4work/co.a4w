/*
 * COLDLOGIC CONFIDENTIAL UNTIL DETERMINED OTHERWISE
 */
package com.coldlogic.markdown;

import java.util.Map;
import org.commonmark.renderer.html.HtmlWriter;

/**
 *
 * @author root
 */
public class LatexWriter extends HtmlWriter {
    boolean in_quotation = false;
    boolean in_list = false;

    public LatexWriter(Appendable out) {
        super(out);
    }

    protected void append(String s) {
//        super.append("appending from LatexWriter");
        super.append(s);
    }

    void begin(String unit) {
        line_command("begin", unit);
    }

    void end(String unit) {
        line_command("end", unit);
    }

    void command(String command, String body) {
        open_command(command);
        append(LatexEscaping.escapeLatex(body));
        close_command();
    }

    void line_command(String command, String body) {
        line();
        command(command, LatexEscaping.escapeLatex(body));
        line();
    }

    void open_command(String command) {
        just_command(command);
        append("{");
    }

    void just_command(String command) {
        append("\\");
        append(command);

    }

    void close_command() {
        append("}");
    }

    @Override
    public void tag(String name, Map<String, String> attrs) {
        if (attrs.size() > 0) {
            RuntimeException e = new RuntimeException("for tag " + name + ": non empty attrs " + attrs);
            System.err.println(e.getMessage());
            e.printStackTrace(System.err);
        }
        // no op
    }

    public void tag(String name, Map<String, String> attrs, boolean voidElement) {
        tag(name, attrs);
    }

    void unit_command(String command, String options) {
        append("\\");
        append(command);
        if (options != null && options.length() > 0) {
            append("[");
            append(options);
            append("]");
        }
    }

    @Override
    public void text(String string) {
        append(LatexEscaping.escapeLatex(string));
    }

}
