
# Visualizer exemplar

This is the pattern used to write the visualizers like CayleyDiagram and Multtable. The entire code of example is contained below, with comments
interspersed.

## Visualizer invocation

The visualizer exemplar may be viewed in the browser by entering a URL like
  <br>&nbsp;&nbsp;&nbsp;&nbsp;http://localhost:8080/group-explorer/docs/visualizerExemplar.html?groupURL=/group-explorer/groups/D_4.group,
<br>which passes the visualizer the URL of a group definition in .group file XML, or
  <br>&nbsp;&nbsp;&nbsp;&nbsp;http://localhost:8080/group-explorer/docs/visualizerExemplar.html?groupJSON=/group-explorer/groups/D_4.json,
<br>which passes the visualizer the URL of a group definition in JSON format.

In the normal use of GE3 the visualizers are opened from the GroupInfo page by selecting one of the visualizer thumbnails. The GroupInfo
page opens the visualizer with a URL like
  <br>&nbsp;&nbsp;&nbsp;&nbsp;http://localhost:8080/group-explorer/Multtable.html?group=blob:http://localhost:8080/b4ecb095-f696-46d4-a065-c00a90f13920,
<br>passing it a blob containing a single group definition in JSON format. Other parameters may also be passed in the URL.
For example, this invocation of a Cayley diagram
  <br>&nbsp;&nbsp;&nbsp;&nbsp;http://localhost:8080/group-explorer/CayleyDiagram.html?group=blob:http://localhost:8080/b4ecb095-f696-46d4-a065-c00a90f13920&diagram=Truncated%20icosahedron
<br>specifies that the `Truncated icosahedron` diagram is to be displayed initially. These parameters are passed to the visualizer
the same way, regardless of how the group definition is passed.

Since the visualizer exemplar is only an example, not a functional component of GE3, the GroupInfo page has no link to it and one of
the first two methods shown must be used.

## Visualizer display

The visualizer exemplar displays
- a formatted header with the name of the group passed in the URL
- a blank graphic element
- a functional splitter element that can be used to resize the graphic and the controls panel
- a functional subgroup control panel, common to several of the visualizers
- a non-functional view control panel, with examples of a select element and a couple of sliders
- buttons to choose between viewing the subgroup control panel and the view control panel

Other visualizers extend the exemplar with different displays in the graphic element and specialized control panels that interact with the display.

```html
<html>
   <head>
      <meta charset="utf-8" />
      <base href=".."></base>

      <link rel="icon" type="image/png" href="./images/favicon.png"></link>
      <link rel="stylesheet" href="./style/fonts.css" type="text/css"></link>
      <link rel="stylesheet" href="./style/sliders.css" type="text/css"></link>
      <link rel="stylesheet" href="./visualizerFramework/visualizer.css" type="text/css"></link>
      <link rel="stylesheet" href="./subsetDisplay/subsets.css" type="text/css"></link>

      <style>
       #view-control {
          background: #E2E2E2;
          display: none;
       }
      </style>

      <script type="text/x-mathjax-config">
       MathJax.Hub.Config({
          CommonHTML: {
             scale: 95,   /* scale MathJax to match the HTML around it */
          },
          showMathMenu: false,   /* disable MathJax context menu (it interferes with subsetDisplay context menu) */
       });
      </script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=MML_CHTML"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/jquery-resizable-dom@0.32.0/dist/jquery-resizable.js"></script>
      <script src="./build/allGroupExplorer.js"></script>
      <script src="./build/allVisualizer.js"></script>
```
```javascript
      <script>
       /* Global variables */
       var group;  // group about which information will be displayed
       const panelNames = ['#subset-control', '#view-control'];

       /* Initial entry to javascript -- called once after document load */
       $(window).one('load', load);

       /*
        * Register static event managers -- called after document is assembled
        *    (The .off(--).on(--) sequence is used to avoid accumulating event handlers after a reset.)
        */
       function registerEventHandlers() {
          $('#subset-button').off('click', () => show('#subset-control') ).on('click', () => show('#subset-control') );
          $('#view-button').off('click', () => show('#view-control') ).on('click', () => show('#view-control') );
          $('#help').off('click', help).on('click', help);
          $('#reset').off('click', reset).on('click', reset);
          $('#organization-select').off('change', choose).on('change', choose);
          $(window).off('resize', resizeBody).on('resize', resizeBody);
       }

       /*
```
## Visualizer framework loading

Invokes [VC.load()](./visualizerFramework_js.md#vc-load-) to wrap visualizer framework layout around visualizer-specific controls
```javascript
       /* Load the static components of the page */
       function load() {
          // Create a Promise to load group from invocation URL
          const groupLoad = Library
             .loadFromInvocation()
             .then( ({library, groupIndex}) => {
                group = library[groupIndex];
             } )
             .catch( (error) => console.error('Error loading group (groupURL or similar required):\n\n' + error) );

          // Create a Promise to load visualizer framework around visualizer-specific code in this file
          const bodyLoad = VC.load();

          // When group and framework are loaded, insert subset_page and complete rest of the setup
          Promise.all([groupLoad, bodyLoad])
                 .then( () => SSD.load($('#subset-control')).then(completeSetup) )
                 .catch( console.error );
       }

       /*
```

```javascript
       /* Now that all the static HTML is loaded, complete the setup */
       function completeSetup() {
          // Document is assembled, register event handlers
          registerEventHandlers();

          // Create header from group name and queue MathJax to typeset it
          $('#header').html('Visualizer Example for&nbsp;' + MathML.sans(group.name));
          MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'header']);

          // Create list of subgroups for select options, one choice for each proper subgroup
          for (let inx = 1; inx < group.subgroups.length - 1; inx++) {
             // Recursive routine calculates multi-character subscript as Unicode text, since option tags cannot contain HTML
             const subscript = (jnx) =>
                (jnx == 0) ? '' : (subscript(Math.floor(jnx / 10)) + subscripts[jnx % 10]);  // subscripts defined in js/mathmlUtils.js
             const subgroup = group.subgroups[inx];
             const option =  eval(Template.HTML('organization-choice-template'));
             $('#organization-select').append(option);
          }

          // Register the splitter with jquery-resizable, so you can resize the graphic horizontally
          // by grabbing the border between the graphic and the subset control and dragging it
          $('#vert-container').resizable({
             handleSelector: '#splitter',
             resizeHeight: false,
             resizeWidthFrom: 'left',
             onDrag: function () {
                // Code to resize the graphic goes here, if needed
             }
          });

          show('#subset-control');
          resizeBody();
       }

       /*
        * Resize the body, accounting for the body margins
        *    (Note that this routine would have to resize the graphic, too, if needed.)
        */
       function resizeBody() {
          $('body').height(window.innerHeight - 8);
          $('body').width(window.innerWidth - 8);
       }

       /* Show the desired panel, hide the rest */
       function show(panel_name) {
          for (const name of panelNames) {
             if (name == panel_name) {
                $(name).show();
             } else {
                $(name).hide();
             }
          }
       }

       /* Example event handler, set up in registerCallback */
       function choose(ev) {
          alert(`subgroup ${ev.target.value} selected`);
       }

       /* Routines for Help, Reset buttons at bottom of control panel */
       function help() {
          alert('This is a simple example to show how visualizers are built.');
       }

       /*
```
## Visualizer framework reset

Uses [VC.restore()](./visualizerFramework_js.md#vs-restore-) to recover visualizer-specific layout
```javascript
       */
       function reset() {
          VC.reset();
          load();
       }
      </script>
   </head>
```
## Visualizer-specific HTML

The body contains the visualizer-specific HTML to lay out the controls for this visualizer.  This HTML will be wrapped in the visualizer framework by [VC.load()](./visualizerFramework_js.md#vc-load-), called during [initialization](#visualizer-framework-loading).
```html
   <body class="vert">
      <div id="control-options" class="horiz">
         <button id="subset-button">Subsets</button>
         <button id="view-button">View</button>
      </div>

      <div id="subset-control" class="fill-vert">
         <!-- This is filled in by subsetDisplay/subsets.html -->
      </div>

      <div id="view-control" class="fill-vert">
         <p>Organize by subgroup:</p>
         <select id="organization-select" class="select">
            <option value="0">none</option>
         </select>
         <template id="organization-choice-template">
            <option value="${inx}">H${subscript(inx)}, a subgroup of order ${subgroup.order}</option>
         </template>

         <p>Zoom level:</p>
         <input id="zoom-level" type="range" min="-10" max="10" value="0">

         <p>Line thickness:</p>
         <input id="line-thickness" type="range" min="1" max="20" value="10">
      </div>
   </body>
</html>
```
