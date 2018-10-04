/*
 * COLDLOGIC CONFIDENTIAL UNTIL DETERMINED OTHERWISE
 */
package com.coldlogic.markdown;

/**
 *
 * @author root
 */
import java.util.Set;
import org.commonmark.node.*;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.NodeRenderer;
import org.commonmark.renderer.html.HtmlRenderer;

public final class Markdown {

    static Parser parser = Parser.builder().build();
   // static HtmlRenderer.Builder rendererB = HtmlRenderer.builder();
    static HtmlRenderer renderer = HtmlRenderer.builder().build();

    
    static final String SIDEBAR_LOWER = "sidebar";
    static final String SIDEBAR_UPPER = SIDEBAR_LOWER.toUpperCase();
    static final String COMMENT_LOWER = "comment";
    static final String COMMENT_UPPER = COMMENT_LOWER.toUpperCase();
    
    
    private final Node document;
    private Node sidebar;
    
    public Markdown(String md) {
        document = parser.parse(md);
        split();
    }

    public static void main(String[] args) throws Exception {
        String md = test; //"# the title";
        Markdown markdown = new Markdown(md); 
        System.out.println(markdown.html()
                + "\n"
                + markdown.document.toString());

       System.out.println("------------------------------------- Document ------------------------------------------------");
        markdown.document.accept(new PrintVisitor());
        System.out.println("-------------------------------------SideBar------------------------------------------------");
        markdown.sidebar.accept(new PrintVisitor());
        

    }

    public String html() throws Exception {        
        return renderer.render(document);  // "<p>This is <em>Sparta</em></p>\n"
    }
    
    void split() {
        sidebar = new Document();
        document.accept(new SplitVisitor());
    }
    
    public String sidebar() {
         return copyRight + renderer.render(sidebar);
    }

    class CommentNode extends BlockQuote {


    }
    
    static class CommentRender implements NodeRenderer {

        @Override
        public Set<Class<? extends Node>> getNodeTypes() {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }

        @Override
        public void render(Node node) {
            throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
        }
        
    }
    
    class SplitVisitor extends org.commonmark.node.AbstractVisitor {
        int depth=0;
        @Override
        protected void visitChildren(Node node) {
            Node child = node;
            if(child!=null && child instanceof org.commonmark.node.BlockQuote) {
                child=child.getFirstChild();
                if(child!=null && child instanceof org.commonmark.node.Paragraph) {
                    child=child.getFirstChild();
                    if(child!=null && child instanceof org.commonmark.node.Text) {
                        Text text = (Text) child;
                        String literal = text.getLiteral();
                        String haystack = literal.trim().toLowerCase();
                        if(haystack.startsWith(SIDEBAR_LOWER)) {
                            text.setLiteral(literal.replace(SIDEBAR_LOWER,"").replace(SIDEBAR_UPPER,""));
                            node.unlink();
                            sidebar.appendChild(node);                           
                        } else if(haystack.startsWith(COMMENT_LOWER)) {
                            text.setLiteral(literal.replace(COMMENT_LOWER,"").replace(COMMENT_UPPER,""));
                            String html = renderer.render(text);
                            HtmlBlock h = new HtmlBlock();
                            h.setLiteral("<span class='comment'>"+html+"</span>");
                            node.unlink();
                            sidebar.appendChild(h);                           
                        }
                    }
                }
                
            }
            
            int m = depth;
            while(m-->0)
                System.out.print(margin);
            
            System.out.println(depth+":"+node+":"+node.getClass().getCanonicalName());
            depth++;
            super.visitChildren(node);
            depth--;
        }

    }
    static class PrintVisitor extends org.commonmark.node.AbstractVisitor {
        int depth=0;
        @Override
        protected void visitChildren(Node node) {
            Node child = node.getFirstChild();
           
            int m = depth;
            while(m-->0)
                System.out.print(margin);
            
            System.out.println(depth+":"+node);
            depth++;
            super.visitChildren(node);
            depth--;
        }

    }
    static String copyRight = "<div class='copyright'>"
            + "&copy; ColdLogic LLC, PAAT Inc. All rights reserved. Information provided on these pages may describe proprietary property owned/protected by copyright, patents, and pending patents by OnPointManufacturing Inc, PAAT Inc,  ColdLogic LLC, their parents, subsidiaries, principals, and/or owners."
            + "</div>";
    static String margin = "|  ";
    static String test = "                    # The On-Demand Business\n"
            + "_How Apps For Work revolutionize Physical Product Development_\n"
            + "\n"
            + "***\n"
            + "\n"
            + ">sidebar![lets get in a consultant](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvCcOGX5zd3jEq-FSpd-6ZMWZenYJxTzveVKbnCzdnAH-nco3ktw)\n"
            + "\n"
            + "## Start Here; Read This First\n"
            + ">sidebar The point of this section is to address Kirby's issue that there are many different audiences interest in different aspects of what we are doing and don't care about other aspects. So this section is to steer them as fast as possible to the right part of the book, rather than have them read it as a novel, and get disinterested. The web page version uses links; the physical needs some other clear mechanism. (page references, and other ways of making it easy to find. Big Pictures, Big Titles, page colors, Tabs ...), and the links we have should be automatically translated into the content (each page numbers) for the physical book. It is really important that once we have triggered someone into opening the book, that they find what triggered them easily, and find that it is consistent with what triggered them.\n"
            + "\n"
            + "> My goal is that this page is best one-page version of the whole story that we can write. And it links to the chapters, for more detail, and that each chapter starts with the best one page version of that chapter, with links the content of the chapter for detail. And the each detail page links back to big picture pages for someone who dips into the book and finds the content without a context.\n"
            + "\n"
            + "## How do you take your book?\n"
            + "This is an On Demand Business book so we intend to deliver What you want, How you Want it, When you want it.\n"
            + "\n"
            + "You can read the book from beginning to the end following to prev/next links a the bottom of the page in the online version, wipe the page on your e-book, or use a manual page turner for the dead tree edition.\n"
            + "\n"
            + "Or you can follow the links [page references] so that you can quickly get to the bits that interest you. If you are a link follower, you might find the on-line version easier. \n"
            + "It is at [http://apps4work.info](https://github.com/apps4work/co.a4w/wiki). FIXME MAKE SURE THAT THE PRINTED URL ADDRESS IS CORRECT IN THE BOOK AND WORKS !! \n"
            + "\n"
            + "If you get the wikipedia-problem, come back and read it in the sequence we hope makes most sense. You can see that [here](Contents). \n"
            + "\n"
            + "Or you can take it [a la carte](index).\n"
            + "\n"
            + "### [The Problem](Chapter-1-The-Problem)\n"
            + "\n"
            + "We had a problem with automating manufacturing. Even though we used the best tools in the industry, it was nearly impossible to get them to do the automated manufacturing we wanted. \n"
            + "We discovered this was not because the tools weren't suitable for their customers' business but that we are in a different business.\n"
            + "\n"
            + "We are in the On-Demand Business - high-volume unique products, and not the long run business of high volumes of identical products - and the On-Demand Business demands a degree of automation that isn't necessary or affordable in the long run business. But not only does the on-demand business demand the automation, the automation of manufacturing requires the value that On-Demand Business brings to justify economically the cost the automation.\n"
            + "\n"
            + "Our problem is how to get the existing industry to grasp the On-Demand Business opportunity and to retool to be able to take advantage of it\n"
            + "\n"
            + "\n"
            + "### [The Solution](Chapter-2-The-Solution)\n"
            + "\n"
            + "The solution we choose is an open competitive Marketplace for tools in contrast to the current closed limited marketplace for tools, which cannot keep up with the technology advancement, cannot embrace and exploit the power of algorithm writers nor support the needs of the  with the algorithm writers, or for them to prosper.\n"
            + "\n"
            + "This creates a dilemma for the incumbent tool providers. They can ignore the On-Demand Business, they do economically unjustifiable automation for the long run business, they can hope to stem the wave of algorithms or they can lead the way into it, or just come along for the ride. Our solution gives them the best chance to not being left behind.\n"
            + "\n"
            + "We show how existing software technology can be used to the benefit of both the existing tool providers and new algorithm providers, to the benefits of product developers and manufacturers and retailers, and ultimately to the benefit of the consumer.\n"
            + "\n"
            + "### [The Project](Chapter-3-The-Project)\n"
            + "\n"
            + "\n"
            + "\n"
            + "The Project is the means by which we can bring this to fruition. At its core it depends on the network effect, and in particular the benefits that algorithm providers can bring to the product Brands who are the data providers and data consumers. Making data available for algorithm writers to experiment with to develop successful algorithms and to prove them, is the best way for data providers and consumers to have better products. \n"
            + "\n"
            + "### Technical Details\n"
            + "\n"
            + "The technical details involve a relatively simple programming interface in a singular programming environment (JVM/WAS) that abstracts away the problem of where the data is coming from and the formatting of that data at the primitive level. it is a programming interface that speaks the same data structures as are in a JSON string.\n"
            + "\n"
            + "It is a programming interface, and not a file format, because the problem is programs talking to programs, and the solution to problems, including those inherent in Data File formats, is programs talking programs.\n"
            + "But the program can be manifested as file which makes did easy for people and systems to evolve from current practice to the future systems. \n"
            + "\n"
            + "Our system is essentially the wrapping of data sources in an abstraction analogous to JSON, which is a sufficiently comprehensive data structure to handle any current or future data format. \n"
            + "\n"
            + "Our solution is not Magic. It does not instantly make any program be able to speak to any other program.  \n"
            + "In particular programs can only work on data for which they understand  the semantics. Not just the values of primitives but the schema in which primitives are compounded into higher sematic objects.\n"
            + "This schema problem is potentially an infinite problem, since there is always more semantics that could be understood. \n"
            + "\n"
            + "Our solution breaks down the infinite schema problem into a series of finite schema problems starting at the most primitive JSON data types, through to any level of high semantics in the form of what we call typed JSON, which means schema names at any level of the hierarchy within the JSON.  It breaks down the infinite problem into a series of finite problems that we can be solved independently by interested participants, and where conflicts exist it can be solved in the only way that computers can solve complex which is with a program to translate one to the other.\n"
            + "\n"
            + "We chose infrastructure so that putting together these various programs that achieve schema transforms and algorithmic results can be made as simple as I've got an app for it.\n"
            + "The same core technology that runs apps on Android is used to run Apps for Work. The difference is that Apps For Work primarily run on a work computers/servers with an interface to a human, when necessary, using is a browser. \n"
            + "\n"
            + "In the same way that having Apps work on the phone was not an accident but requires the design of some rules to make it work, we propose rules to make Apps for Work work. There is no huge invention: little more than drawing the lines on a existing road to establish Lanes so that they can be used efficiently and effectively and avoid head-on collisions.  The technology demands that the Apps for Work makes would be very challenging but it's all been done, and is supported by major software organizations; it is battle-tested over the last 20 years, and, if it matters, it is available in versions that are free and open source.\n"
            + "\n"
            + "We have a new way for software, specifically for algorithms that add value to physical products specifications, to appropriate value  for their software, and for that software and other products in the supply-chain traditionally hidden from the consumer, to enter a vigorous, value-based, consumer-centric marketplace.\n"
            + "\n"
            + "We explain [the Part Interface](Chapter-x-The-Part-Interface) and [Apps For Work](Chapter-x-Apps-For-Work) in simple language for you to explain to your boss, and in the details you need to evaluate it and even write code.\n"
            + "\n"
            + "\n"
            + "\n"
            + "### [The Garment Industry](Chapter-4-Apps-For-Work-in-the-Garment-Industry)\n"
            + "Our initial focus is the [Garment Industry](The-Garment-Industry), since we built our own [On Demand Garment Manufacturing Factory](Chapter-5-The-OnPointManufacturing-Factory), but we have good reason to believe both that it's a good place to start and that the problems and solutions we discuss are applicable to wider industries, and to the physical product development and manufacturing industries in general.\n"
            + "\n"
            + "## Conclusion\n"
            + "This is an opportunity for product developers and for those who provide the tools for product developers and for software creators. It is an opportunity that is well suited to the state of the technology and to the desires of the consumers. It is an opportunity just begging to be taken.\n"
            + "\n"
            + "We describe how early adopters are making contributions to the creation of the network effect, be they data providers, tool providers, or algorithm providers. This is a value-feedback loop among those players, but also one that will offer significant first-mover advantages.\n"
            + "\n"
            + "There are the opportunities for software, for a [better utilization software talent](Utilization-of-Programming-Talent), and better way for [software to make money](Getting-Paid-for-Software), have no specific dependence on the Garment industry, since [the Part Interface](Chapter-x-The-Part-Interface) and [Apps For Work](Chapter-x-Apps-For-Work) do not. There are many opportunities for software to get a leg up that are \n"
            + "[Garment specific](How-to-write-Software-To-Design-Clothes-in-3D), \n"
            + "or [general purpose](The-Project), \n"
            + "into open physical product development where the generality of the Part Interface will returns on investment across all industries.\n"
            + "\n"
            + "\n"
            + "\n"
            + " \n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "## The Style of This Book\n"
            + "![The style of this book](http://stayviolation.typepad.com/.a/6a00d834515bc269e20133f48f98a4970b-pi)\n"
            + "\n"
            + "***\n"
            + "![dave and kirby](http://news.blr.com/app/uploads/sites/3/2011/08/Dilbert1.jpg)\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "\n"
            + "***\n"
            + "[Prev: none] \\| Home \\| [Next: Chapter-1-The-Problem](Chapter-1-The-Problem)  \n"
            + "Referenced by  [Contents](Contents) | [index](index) ";
}
