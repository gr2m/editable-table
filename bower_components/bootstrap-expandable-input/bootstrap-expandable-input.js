(function ($) {
  'use strict';

  // EXPANDABLE INPUT CLASS DEFINITION
  // =================================

  //
  //
  //
  var ExpandableInput = function (el) {
    var $input;
    var type;

    // 1. cache elements for performance reasons and
    // 2. setup event bindings
    function initialize () {
      $input = $(el);
      type = $input.attr('type');
      initStyling();

      $input.on('input', handleInput);
    }

    // Event handlers
    // --------------

    //
    //
    //
    function handleInput ( /*event*/ ) {
      cleanupIfEmpty();
    }


    // Internal Methods
    // ----------------


    //
    // adds `contenteditable-inline` or `contenteditable-block`,
    // depending of the styling of the input. This is needed to
    // prevent line breaks in inline elements, among other things.
    //
    function initStyling () {
      var display = $input.css('display');

      if (display === 'inline' || display === 'inline-block') {
        $input.addClass('contenteditable-inline');
      } else {
        $input.addClass('contenteditable-block');
      }


      // set min width to current width unless already set
      $input.css({
        'min-width': ''+$input.outerWidth()+'px'
      });
    }


    //
    //
    //
    function cleanupIfEmpty() {
      var content = $input.html();
      if (content === '<br>' || content === '<div><br></div>') {
        $input.html( '' );
      }
    }

    initialize();
  };

  // EXPANDABLE INPUT PLUGIN DEFINITION
  // ==================================

  $.fn.expandableInput = function (option) {
    return this.each(function () {
      var $this = $(this);
      var api  = $this.data('bs.expandableInput');

      if (!api) {
        $this.data('bs.expandableInput', (api = new ExpandableInput(this)));
      }
      if (typeof option === 'string') {
        api[option].call($this);
      }
    });
  };

  $.fn.expandableInput.Constructor = ExpandableInput;


  // JQUERY PATCHES
  // ==============

  //
  // implements $('[contenteditable]').val()
  //
  function patchJQueryVal () {
    var origVal = $.fn.val;
    $.fn.val = function() {
      if ($(this).is('[contenteditable]')) {
        return $.fn.text.apply(this, arguments);
      }
      return origVal.apply(this, arguments);
    };
  }

  //
  // implements $('[contenteditable]').select()
  //
  function patchJQuerySelect () {
    var origSelect = $.fn.select;
    $.fn.select = function() {
      if ($(this).is('[contenteditable]')) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(this[0]);
        selection.removeAllRanges();
        selection.addRange(range);
        return ;
      }
      return origSelect.apply(this, arguments);
    };
  }

  // EXPANDABLE INPUT DATA-API
  // =========================

  $(document).on('focus.bs.expandableInput.data-api', '[contenteditable]', function(event) {
    var $input = $(event.currentTarget);
    if (! $input.data('bs.expandableInput')) {
      $input.expandableInput();
      $input.trigger(event.type);
    }
  });


  // patch jQuery methods
  patchJQueryVal();
  patchJQuerySelect();
})(jQuery);
