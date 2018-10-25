/*
 * COLDLOGIC CONFIDENTIAL UNTIL DETERMINED OTHERWISE
 */
package com.coldlogic.markdown;

import org.commonmark.node.Node;
import org.commonmark.renderer.NodeRenderer;
import org.commonmark.renderer.html.HtmlNodeRendererContext;
import org.commonmark.renderer.html.HtmlNodeRendererFactory;
import org.commonmark.renderer.html.HtmlRenderer;

/**
 *
 * @author root
 */
public class LatexRenderer extends HtmlRenderer {

    private LatexRenderer(Builder builder) {
        super(builder);
    }

    public static Builder builder() {
        return new Builder();
    }

    @Override
    public void render(Node node, Appendable output) {
        HtmlRenderer.RendererContext context = new HtmlRenderer.RendererContext(new LatexWriter(output));
        context.render(node);
    }

//    @Override
//    public void render(Node node, Appendable output) {
//        LatexRenderer.LatexRendererContext context = new LatexRenderer.LatexRendererContext((output));
//        context.render(node);
//    }
//
//    @Override
//    public String render(Node node) {
//        StringBuilder sb = new StringBuilder();
//        render(node, sb);
//        return sb.toString();
//    }
//
//    private static class LatexRendererContext {
//
//        Appendable output;
//
//        public LatexRendererContext(Appendable output) {
//            this.output = output;
//        }
//
//        private void render(Node node) {
//            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
//        }
//    }
    public static class Builder extends HtmlRenderer.Builder {

//        @Override
//        public void render(Node node, Appendable output) {
//            LatexRendererContext context = new LatexRendererContext(new HtmlWriter(output));
//            context.render(node);
//        }

        @Override
        public LatexRenderer build() {

            this.nodeRendererFactory(new HtmlNodeRendererFactory() {
                @Override
                public NodeRenderer create(HtmlNodeRendererContext context) {
                    return new LatexNodeRenderer(context);
                }
            });
            return new LatexRenderer(this);
        }
    }

    public class LatexRendererContext extends HtmlRenderer.RendererContext {

        public LatexRendererContext(LatexWriter htmlWriter) {
            super(htmlWriter);
        }

    }
}
