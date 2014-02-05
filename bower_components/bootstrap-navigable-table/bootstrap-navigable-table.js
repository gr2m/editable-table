(function ($) {
  'use strict';

  // NAVIGABLE TABLE CLASS DEFINITION
  // ================================

  //
  var NavigableTable = function (el) {
    var $table, $body;
    var keyboardShortcutsMetakey;

    //
    //
    //
    function initialize() {
      $table = $(el);
      $body = $table.find('tbody');

      if (window.navigator.appVersion.indexOf('Mac') !== -1) {
        keyboardShortcutsMetakey = 'metaKey';
      } else {
        keyboardShortcutsMetakey = 'altKey';
      }

      $body.on('keydown', 'tr', handleKeyDown);
    }

    // Event handlers
    // --------------

    //
    //
    //
    function handleKeyDown( event ) {
      var input = event.target;
      var shiftKeyPressed = event.shiftKey;
      var keyCode = event.keyCode;
      if (!event[keyboardShortcutsMetakey]) {
        return;
      }

      return navigate(input, keyCode, shiftKeyPressed);
    }


    // Methods
    // -------

    function navigate (input, keyCode, shiftKeyPressed) {
      switch (keyCode) {
        case 37: // left
          return jumpLeft(input);
        case 39: // right
          return jumpRight(input);
        case 38: // up
          return shiftKeyPressed ? moveUp(input) : jumpUp(input);
        case 40: // down
          return shiftKeyPressed ? moveDown(input) : jumpDown(input);
        case 68: // d (duplicate)
          return shiftKeyPressed ? duplicateUp(input) : duplicateDown(input);
        case 13: // enter (insert)
          return shiftKeyPressed ? insertUp(input) : insertDown(input);
        case 8: // del
          return shiftKeyPressed ? remove(input) : true;
      }
    }

    //
    function jumpLeft (input) {
      var $cell = $(input).closest('td');
      $cell.prev().find(':input').focus().select();
      return false;
    }

    //
    function jumpRight (input) {
      var $cell = $(input).closest('td');
      $cell.next().find(':input').focus().select();
      return false;
    }

    //
    function jumpUp (input) {
      var $row = $(input).closest('tr');
      $row.prev().find('[name=' + (input.name) + ']').focus().select();
      return false;
    }

    //
    function jumpDown (input) {
      var $row = $(input).closest('tr');
      $row.next().find('[name=' + (input.name) + ']').focus().select();
      return false;
    }

    //
    function moveUp (input) {
      var $row = $(input).closest('tr');
      var $prev = $row.prev();

      if ($prev.length === 0) {
        return false;
      }

      $prev.insertAfter($row);
      return false;
    }

    //
    function moveDown (input) {
      var $row = $(input).closest('tr');
      var $next = $row.next();

      if ($next.length === 0) {
        return false;
      }

      $next.insertBefore($row);
      return false;
    }

    //
    function duplicateUp (input) {
      var $row = $(input).closest('tr');
      var $newRow = $row.clone();
      $row.before($newRow);

      return false;
    }

    //
    function duplicateDown (input) {
      var $row = $(input).closest('tr');
      var $newRow = $row.clone();
      $row.after($newRow);
      return false;
    }

    //
    function insertUp (input) {
      var $row = $(input).closest('tr');
      var $newRow = $row.clone();
      $newRow.find(':input').val('');
      $row.before($newRow);
      return false;
    }

    //
    function insertDown (input) {
      var $row = $(input).closest('tr');
      var $newRow = $row.clone();
      $newRow.find(':input').val('');
      $row.after($newRow);
      return false;
    }

    //
    function remove (input) {
      var $row = $(input).closest('tr');
      if ($row.next().length) {
        jumpDown(input);
      } else {
        jumpUp(input);
      }
      $row.remove();
      return false;
    }

    initialize();
  };


  // EDITABLE TABLE PLUGIN DEFINITION
  // ================================

  $.fn.navigableTable = function () {
    return this.each(function () {
      var $this = $(this);
      var api  = $this.data('bs.navigableTable');

      if (!api) {
        $this.data('bs.navigableTable', (api = new NavigableTable(this)));
      }
    });
  };

  $.fn.navigableTable.Constructor = NavigableTable;


  // EDITABLE TABLE DATA-API
  // =======================

  $(document).on('keydown.bs.navigableTable.data-api click.bs.navigableTable.data-api focus.bs.navigableTable.data-api', 'table[data-navigable-spy]', function(event) {
    $(event.currentTarget).navigableTable().removeAttr('data-navigable-spy');
  });
})(jQuery);
