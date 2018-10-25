/*
 * COLDLOGIC CONFIDENTIAL UNTIL DETERMINED OTHERWISE
 */
package markdown;

/**
 *
 * @author root
 */
public class MarkdownToLatex {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        System.out.print("in markdown processor ");
        for (String arg: args) {
            System.out.print(" "+arg);
        }
        System.out.println(";");
        try {
            com.coldlogic.markdown.Markdown.run(args);
        } catch (Exception ex) {
            System.err.println(ex);
            ex.printStackTrace(System.err);
        }
        System.out.println("completed md->latex;");
    }
    
}
