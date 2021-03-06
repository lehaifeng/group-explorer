
SSD.Subgroup = class Subgroup extends SSD.BasicSubset {
   constructor (subgroupIndex) {
      super();

      this.subgroupIndex = subgroupIndex;
      this.elements = window.group.subgroups[subgroupIndex].members;
   }

   get name() {
      return MathML.sub('H', this.subgroupIndex);
   }

   get displayLine() {
      const generators = window.group.subgroups[this.subgroupIndex].generators.toArray()
                               .map( el => group.representation[el] );
      let templateName;
      switch (this.subgroupIndex) {
         case 0:
            templateName = 'firstSubgroup_template';	break;
         case window.group.subgroups.length - 1:
            templateName = 'lastSubgroup_template';	break;
         default:
            templateName = 'subgroup_template';	break;
      }
      return eval(Template.HTML(templateName));
   }

   get menu() {
      const $menu = $(eval(Template.HTML('subgroupMenu_template')));
      $('template.subgroup-extension').each( (_, template) => $menu.append(eval('`' + $(template).html() + '`')) );
      return $menu;
   }

   get normalizer() {
      new SSD.Subset(
         new SubgroupFinder(window.group)
            .findNormalizer(window.group.subgroups[this.subgroupIndex]).members );
   }

   get leftCosets() {
      return new SSD.Cosets(this, 'left');
   }

   get rightCosets() {
      return new SSD.Cosets(this, 'right');
   }

   static displayAll() {
      $('#subgroups').html(
         window.group
               .subgroups
               .reduce( (frag, _, inx) => frag.append(new SSD.Subgroup(inx).displayLine),
                        $(document.createDocumentFragment()) )
      );
   }
}
