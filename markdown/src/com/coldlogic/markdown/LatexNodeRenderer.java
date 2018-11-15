package com.coldlogic.markdown;

import com.coldlogic.markdown.Markdown.Found;
import com.dotcomfast.net.LinkAccessor;
import com.dotcomfast.util.FileUtil;
import java.io.File;
import java.util.*;
import org.commonmark.node.*;
import org.commonmark.renderer.NodeRenderer;
import org.commonmark.renderer.html.HtmlNodeRendererContext;

/**
 * The node renderer that renders all the core nodes in latex!
 */
public class LatexNodeRenderer extends AbstractVisitor implements NodeRenderer {

    protected final HtmlNodeRendererContext context;
    private final LatexWriter latex;

    public LatexNodeRenderer(HtmlNodeRendererContext context) {
        this.context = context;
        this.latex = (LatexWriter) context.getWriter();
    }

    @Override
    public Set<Class<? extends Node>> getNodeTypes() {
        return new HashSet<>(Arrays.asList(
                Document.class,
                Heading.class,
                Paragraph.class,
                BlockQuote.class,
                BulletList.class,
                FencedCodeBlock.class,
                HtmlBlock.class,
                ThematicBreak.class,
                IndentedCodeBlock.class,
                Link.class,
                ListItem.class,
                OrderedList.class,
                Image.class,
                Emphasis.class,
                StrongEmphasis.class,
                Text.class,
                Code.class,
                HtmlInline.class,
                SoftLineBreak.class,
                HardLineBreak.class
        ));
    }

    @Override
    public void render(Node node) {
        node.accept(this);
    }

    @Override
    public void visit(Document document) {
        //System.out.println("using Latex");
        latex.raw("\\documentclass[twoside]{book}");
        latex.line_command("usepackage", "graphicx");
        latex.line_command("usepackage", "hyperref");
        latex.line_command("usepackage", "fixltx2e");
        latex.line_command("usepackage", "footnote");
        latex.line_command("usepackage", "listings");
        latex.line_command("usepackage", "wrapfig");
        latex.line_command("usepackage", "tcolorbox");
        latex.raw(
                "\\newenvironment{WrapText}[1][r]\n"
                + "  {\\wrapfigure{#1}{0.5\\textwidth}\\tcolorbox}\n"
                + "  {\\endtcolorbox\\endwrapfigure}");

        latex.raw("\\title{The On-Demand Business}\n"
                + "\\author{Dave Pullin and Kirby Best \\thanks{with help from lots of people}}\n"
                + "\\date{November 2018}\n"
                + " \n");
        latex.begin("document");
        latex.line_command("pagestyle", "headings");
        latex.line();
        latex.raw(
                "\\begin{titlepage}\n"
                + "\\maketitle\n"
                + "\\end{titlepage}");
        visitChildren(document);
        latex.line();
//        latex.raw("this is just ordinary text\n"
//                + "\\begin{WrapText}\n"
//                + "The is sidebar text\n"
//                + "\\end{WrapText}");

        boolean first = true;
        for (Label label : labels.values()) {
            if (label.defCount == 0) {
                if (first) {
                    latex.line_command("chapter", "Not Included in this Version");
                    latex.text("This is a list of chapters not included in this version of the book.");
                    latex.text("They may be found at http://apps4work.info/book ");

                    first = false;
                }
                latex.line_command("paragraph", label.unique);
                latex.command("label", label.unique);
            }
        }
        latex.raw("\\tableofcontents");
        latex.end("document");
        latex.line();
    }

    static String[] heading_units = new String[]{"part", "chapter", "section", "subsection", "subsubsection", "paragraph", "subparagraph", "emph"};

    @Override
    public void visit(Heading heading) {
        int htagI = heading.getLevel();
        String htag = "h" + htagI;
        latex.line();
        latex.tag(htag, getAttrs(heading, htag));
        String sheading = getTextOnly(heading);
        latex.command(heading_units[Math.min(htagI, heading_units.length - 1)], sheading);
        String label = label(sheading, true);
        latex.command("label", label);
        latex.line();
        ExceptTextVisitor exceptTextVisitor = new ExceptTextVisitor(this);
        heading.accept(exceptTextVisitor);
        //visitChildren(heading); //duplicates sheading?
    }

    @Override
    public void visit(Paragraph paragraph) {
        if (isInTightList(paragraph) || latex.in_quotation || latex.in_list) {
            visitChildren(paragraph);
        } else {
            latex.line();
            latex.tag("p", getAttrs(paragraph, "p"));
            latex.line_command("paragraph*", "");
            visitChildren(paragraph);
            //command_with_children_in_body("paragraph*", paragraph);
        }

    }

    @Override
    public void visit(BlockQuote blockQuote) {
        if (latex.in_quotation) {
            throw new RuntimeException("nested quotes");
        }
        Found found = Markdown.is_what(blockQuote);
        String command = found.type.latex;
        found.fix_text();

        latex.line();
        latex.begin(command);
        latex.in_quotation = true;
        latex.tag("blockquote", getAttrs(blockQuote, "blockquote"));
        //latex.line_command("section", ""); // redundant to fix bug/error in linux latex processor 
        //latex.line();
        latex.text(found.type.preamble);
        visitChildren(blockQuote);
        latex.line();
        latex.end(command);//blockquote");
        latex.in_quotation = false;
        latex.line();
    }

    @Override
    public void visit(BulletList bulletList) {
        renderListBlock(bulletList, "itemize", getAttrs(bulletList, "ul"));
    }

    @Override
    public void visit(FencedCodeBlock fencedCodeBlock) {
        String literal = fencedCodeBlock.getLiteral();
        Map<String, String> attributes = new LinkedHashMap<>();
        String info = fencedCodeBlock.getInfo();
        if (info != null && !info.isEmpty()) {
            int space = info.indexOf(" ");
            String language;
            if (space == -1) {
                language = info;
            } else {
                language = info.substring(0, space);
            }
            attributes.put("class", "language-" + language);
        }
        renderCodeBlock(literal, fencedCodeBlock, attributes);
    }

    @Override
    public void visit(HtmlBlock htmlBlock) {
        latex.line();
        if (context.shouldEscapeHtml()) {
            latex.tag("p", getAttrs(htmlBlock, "p"));
            latex.begin("verbatim");
            latex.text(htmlBlock.getLiteral());
            latex.begin("verbatim");
        } else {
            latex.raw(htmlBlock.getLiteral());
        }
        latex.line();
    }

    @Override
    public void visit(ThematicBreak thematicBreak) {
        latex.line();
        latex.tag("hr", getAttrs(thematicBreak, "hr"), true);
        latex.raw("\\begin{center}\\rule{0.5\\linewidth}{\\linethickness}\\end{center}");
        latex.line();
    }

    @Override
    public void visit(IndentedCodeBlock indentedCodeBlock) {
        renderCodeBlock(indentedCodeBlock.getLiteral(), indentedCodeBlock, Collections.<String, String>emptyMap());
    }

    @Override
    public void visit(Link link) {
        Map<String, String> attrs = new LinkedHashMap<>();
        String url = context.encodeUrl(link.getDestination());
        //attrs.put("href", url);
        latex.tag("a", getAttrs(link, "a", attrs));
        visitChildren(link);
        String link_text = getTextOnly(link);
        if (link.getTitle() != null) {
            attrs.put("title", link.getTitle());
        }
        //latex.just_command("protected");

        if (isRemote(url)) {
            if (!url.equals(link_text)) {// avoid redundant footnote           
                latex.open_command("footnote");
                latex.text("See ");
                latex.text(url);
                latex.close_command();
            }

        } else {// internal book reference
            latex.open_command("footnote");
            String label = label(url, false);
            latex.text("See ");
            latex.command("ref", label);
            latex.text(" ");
            latex.command("emph", url);
            latex.text(" ");
            latex.text(" on Page ");
            latex.command("pageref", label);
            latex.close_command();
        }

    }

    @Override
    public void visit(ListItem listItem) {
        latex.tag("li", getAttrs(listItem, "li"));
        latex.unit_command("item ", "");
        visitChildren(listItem);
        latex.line();
    }

    @Override
    public void visit(OrderedList orderedList) {
        int start = orderedList.getStartNumber();
        Map<String, String> attrs = new LinkedHashMap<>();
        if (start != 1) {
            attrs.put("start", String.valueOf(start));
        }
        renderListBlock(orderedList, "enumerate", getAttrs(orderedList, "ol", attrs));
    }

    @Override
    public void visit(Image image) {
        String url = context.encodeUrl(image.getDestination());
        if (false) {
            latex.text("Omitted Image\n" + url + "\n");
            return;
        }

        OnlyTextVisitor onlyTextVisitor = new OnlyTextVisitor();
        image.accept(onlyTextVisitor);
        String altText = onlyTextVisitor.getOnlyText();

        if (isRemote(url)) {
            try {
                url = localUrl(url);
            } catch (Exception ex) {
                latex.text(ex.toString());
                return;
            }
        }

        Map<String, String> attrs = new LinkedHashMap<>();
        attrs.put("src", url);
        attrs.put("alt", altText);
        if (image.getTitle() != null) {
            attrs.put("title", image.getTitle());
        }
        latex.begin("figure");
        latex.raw("\\includegraphics[width=\\linewidth]{" + url + ".eps}");
        String figlabel = label("fig:" + altText, true);
        latex.raw("\\caption{" + altText + "}\n"
                + "  \\label{" + figlabel + "}");
        latex.line();
        latex.end("figure");
        //latex.tag("img", getAttrs(image, "img", attrs), true);
    }

    @Override
    public void visit(Emphasis emphasis) {
        latex.tag("em", getAttrs(emphasis, "em"));
        command_with_children_in_body("emph", emphasis);

    }

    @Override
    public void visit(StrongEmphasis strongEmphasis) {
        latex.tag("strong", getAttrs(strongEmphasis, "strong"));
        command_with_children_in_body("emph", strongEmphasis);
    }

    @Override
    public void visit(Text text) {
        latex.text(text.getLiteral());
    }

    @Override
    public void visit(Code code) {
        latex.tag("code", getAttrs(code, "code"));
        latex.raw("{\\fontfamily{pcr}\\selectfont ");
        latex.text(code.getLiteral());
        latex.raw("}");
//        latex.begin("lstlisting");
//        latex.line();
//        latex.text(code.getLiteral());
//        latex.end("lstlisting");
    }

    @Override
    public void visit(HtmlInline htmlInline) {
        if (context.shouldEscapeHtml()) {
            latex.text(htmlInline.getLiteral());
        } else {
            latex.raw(htmlInline.getLiteral());
        }
    }

    @Override
    public void visit(SoftLineBreak softLineBreak) {
        latex.raw(context.getSoftbreak());
    }

    @Override
    public void visit(HardLineBreak hardLineBreak) {
        latex.tag("br", getAttrs(hardLineBreak, "br"), true);
        latex.line();
    }

    @Override
    protected void visitChildren(Node parent) {
        Node node = parent.getFirstChild();
        while (node != null) {
            Node next = node.getNext();
            context.render(node);
            node = next;
        }
    }

    private void renderCodeBlock(String literal, Node node, Map<String, String> attributes) {
        latex.line();
        latex.tag("pre", getAttrs(node, "pre"));
        latex.tag("code", getAttrs(node, "code", attributes));
        latex.begin("lstlisting");
        latex.line();
        latex.text(literal);
        latex.end("lstlisting");
        latex.line();
    }

    private void renderListBlock(ListBlock listBlock, String command, Map<String, String> attributes) {

        latex.line();
        latex.begin(command);
        latex.tag(command, attributes);
        latex.line();
        boolean nested_in_list = latex.in_list;
        latex.in_list = true;
        visitChildren(listBlock);
        latex.in_list = nested_in_list;
        latex.line();
        latex.end(command);
        latex.line();
    }

    private boolean isInTightList(Paragraph paragraph) {
        Node parent = paragraph.getParent();
        if (parent != null) {
            Node gramps = parent.getParent();
            if (gramps != null && gramps instanceof ListBlock) {
                ListBlock list = (ListBlock) gramps;
                return list.isTight();
            }
        }
        return false;
    }

    private Map<String, String> getAttrs(Node node, String tagName) {
        return getAttrs(node, tagName, Collections.<String, String>emptyMap());

    }

    private Map<String, String> getAttrs(Node node, String tagName, Map<String, String> defaultAttributes) {
        return context.extendAttributes(node, tagName, defaultAttributes);
    }

    private void command_with_children_in_body(String command, Node body) {
        latex.open_command(command);
        visitChildren(body);
        latex.close_command();
    }

    private boolean isRemote(String url) {
        return url.startsWith("http://") || url.startsWith("https://");
    }

    private String localUrl(String url) throws Exception {
        String path = "/s/repo/co.a4w.wiki/images/remote/";
        path = "./images/remote/";
        String filename = url.substring(url.lastIndexOf("/") + 1).replace("?", FILLER).replace("=", FILLER).replace("&", FILLER).replace(":", FILLER).replace("%", FILLER);
        if (!filename.contains(".") || filename.lastIndexOf(".") < (filename.length() - 8)) {
            filename += ".jpeg";
        }
//        if (!filename.endsWith(".png") 
//                //&& !filename.endsWith(".jpeg") 
//                //&& !filename.endsWith(".jpg")
//                ) {
//            throw new Exception("Omitted Image\n" + url + "\n");
//        } 

        String localFile = path + filename;
        File f = new File(localFile);
        if (!f.canRead()) {
            byte[] s = LinkAccessor.getBytes(url);
            FileUtil.storeBytesInFile(s, localFile, false);
        }
        return localFile;
    }
    static final String FILLER = "_";

    class Label {

        private String unique;
        private int defCount = 0;
        private int refCount = 0;

    }
    HashMap<String, Label> labels = new HashMap<>();

    private String label(String key, boolean isDef) {
        key = key.replace(" ", "-").replace("#", "--");
        Label label = labels.get(key);
        if (label == null) {
            label = new Label();
            label.unique = key;
            //i = labels.size() + 1;
            labels.put(key, label);
        }
        if (isDef) {
            if (label.defCount > 0) {// duplicately defined label
                return label(key + "-duplicate", true
                );
            }
            label.defCount++;
        } else {
            label.refCount++;
        }
        return label.unique;
    }

    private String getTextOnly(Node node) {
        OnlyTextVisitor onlyTextVisitor = new OnlyTextVisitor();
        node.accept(onlyTextVisitor);
        return onlyTextVisitor.getOnlyText();
    }

    private static class ExceptTextVisitor extends AbstractVisitor {

        AbstractVisitor proxy;

        public ExceptTextVisitor(AbstractVisitor proxy) {
            this.proxy = proxy;
        }

        @Override
        public void visit(Text text) {
            return; // ignore text
        }

        @Override
        public void visit(CustomNode cn) {
            proxy.visit(cn); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(CustomBlock cb) {
            proxy.visit(cb); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(StrongEmphasis se) {
            proxy.visit(se); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(SoftLineBreak slb) {
            proxy.visit(slb); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(Paragraph prgrph) {
            proxy.visit(prgrph); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(OrderedList ol) {
            proxy.visit(ol); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(ListItem li) {
            proxy.visit(li); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(Link link) {
            proxy.visit(link); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(IndentedCodeBlock icb) {
            proxy.visit(icb); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(Image image) {
            proxy.visit(image); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(HtmlBlock hb) {
            proxy.visit(hb); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(HtmlInline hi) {
            proxy.visit(hi); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(ThematicBreak tb) {
            proxy.visit(tb); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(Heading hdng) {
            //proxy.visit(hdng); //To change body of generated methods, choose Tools | Templates.
            return; // ignore heading
        }

        @Override
        public void visit(HardLineBreak hlb) {
            proxy.visit(hlb); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(FencedCodeBlock fcb) {
            proxy.visit(fcb); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(Emphasis emphs) {
            proxy.visit(emphs); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(Document dcmnt) {
            proxy.visit(dcmnt); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(Code code) {
            proxy.visit(code); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(BulletList bl) {
            proxy.visit(bl); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void visit(BlockQuote bq) {
            proxy.visit(bq); //To change body of generated methods, choose Tools | Templates.
        }

    }

    private static class OnlyTextVisitor extends AbstractVisitor {

        private final StringBuilder sb = new StringBuilder();

        String getOnlyText() {
            return sb.toString();
        }

        @Override
        public void visit(Text text) {
            sb.append(text.getLiteral());
        }

        @Override
        public void visit(SoftLineBreak softLineBreak) {
            sb.append('\n');
        }

        @Override
        public void visit(HardLineBreak hardLineBreak) {
            sb.append('\n');
        }
    }

    public static void main(String[] args) throws Exception {
        Markdown.main(args);
    }
}
