<em>A general collections of gotchas encountered in developing GE3, together with references to parts they affected. It may explain why some things were done in an unusual way.</em>


If you have an entity like "&amp;Zopf;" (&Zopf;, double-strike Z) in an XML file without defining it (as in a DTD), the browser's built-in XML parser will fail to parse it.  All the XML group definition files have such entities. Get around this by replacing the string "$amp;Zopf;" with "&amp;#8484;", its unicode character code. See [XMLGroup](../js/XMLGroup.js), around line 29.


There is a limit to the number of html canvas elements a browser can handle: having one canvas for each thumbnail in the GroupExplorer opening page easily exceeds that number. To work around this limitation only a few canvases are used. The thumbnails are drawn to the canvas and the data extracted in png format, which is then displayed in an &lt;img&gt; element. See the [GroupExplorer](../GroupExplorer.html) calls to `getImage` in the `displayGroup` function.


There is a limit to the size of a canvas, depending on the browser. It's 2^14-1 pixels square on Chrome/Ubuntu, others browser/systems are comparable. This caused initial implementations of the [Multtable](../Multtable.html) and [CycleDiagram](../CycleDiagram.html) visualizers to be unable to display larger groups, like the 168.group.  This in turn informed the design of the [DisplayCycleGraph](../js/DisplayCycleGraph.js) and [DisplayMulttable](../js/DisplayMulttable.js) classes and their interfaces.


You can have fractional-sized fonts (who knew?). For example `context.font = '0.7pt Arial';` is OK. There are limitations, though:
* They can't be smaller than 0.008pt for Arial in Chrome/Ubuntu, and similar for other browsers/systems and fonts.
* You can't use something like `` context.font = `${3/7}pt Arial`; ``, you've got to convert it to a fixed representation with the expression `` context.font = `${(3/7).toFixed(6)}pt Arial`; `` (6 isn't magic, other numbers work too).
* You've got to use pt, not px in the font spec for fractional fonts, thus: `context.font = '0.7pt Arial'`. While the way they fail varies, no browser/system combination seems to work completely without error if you don't use pt.
See [DisplayCycleGraph](../js/DisplayCycleGraph.js) at the end of the `showLargeGraphic` routine for an example.


Drag-and-drop was surprisingly consistent. A couple of small-ish exceptions:
* Across platforms Firefox has an odd pre-condition: you have to set the data in the `event.dataTransfer` object, thus: `event.originalEvent.dataTransfer.setData('text/plain', 'anything');`.  It doesn't seem to be used for anything, you just have to do it.
* The image drag on Chrome/Ubuntu doesn't work, a bug in that browser/system.
You can see the effect of these in [CycleDiagram](../CycleDiagram.html) in the `dragstart` routine.

    
THREE.js raycasting works with lines, but it doesn't work with meshLines, and you need meshlines to display anything thicker than about a pixel in any browser except Safari. Workaround in [DisplayDiagram](../js/DisplayDiagram.js) is to set `Diagram3D.lineWidth` to 1, run `DisplayDiagram.updateLines(..)`, and then restore previous lineWidth. Since the scene is never rendered with the skinny lines, the user never sees it; and it only happens on the grab.


MathJax can be configured to break lines automatically (cf. http://docs.mathjax.org/en/latest/options/output-processors/CommonHTML.html ), but it is not fast enough to keep up with something like resizing the subset display panel. In addition executes asynchronously, so if you need to know the size of the text in order to proceed (as when formatted text is included in a menu which must be placed on the page) the programming is a bit convoluted. The browser is much more performant when re-flowing text, so you can compose lines with MathML in them out of smaller pieces of relatively indivisible <math>...</math> chunks and let MathJax do the formatting and let the browser do the text placement. Setting MathML next to browser fonts is generally not pretty, so it's usually best to make the whole line MathML chunks, not a mixture of the two.
