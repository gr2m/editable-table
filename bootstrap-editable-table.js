(function ($) {
  'use strict';


  // EDITABLE TABLE CLASS DEFINITION
  // ===============================

  // Editable Table provides an elegant API to list
  // to changes, adding new rows or removing existing
  // ones
  //
  //     $table = $('table').editableTable();
  //     $table.on('record:add', handler);
  //     $table.on('record:remove', handler);
  //     $table.on('record:update', handler);
  //     $table.on('record:change', handler);
  //
  var EditableTable = function (el) {
    var api = this;

    // cache
    this.$el = $(el);

    // event handlers
    function handleInput (event) {
      var $row = $(event.target).closest('tr');
      var id = $row.data('id');
      var eventName = id ? 'update' : 'add';

      if (eventName === 'add') {
        $row.data('id', generateId());
      }

      api.$el.trigger('record:change', [eventName, serializeRow($row)]);
      api.$el.trigger('record:' + eventName, [serializeRow($row)]);


      // make sure that records get created for above rows
      if (eventName === 'add') {
        $row = $row.prev();
        while($row.length) {
          if ($row.data('id')) {
            return;
          }

          $row.data('id', generateId());
          api.$el.trigger('record:change', [eventName, serializeRow($row)]);
          api.$el.trigger('record:' + eventName, [serializeRow($row)]);
          $row = $row.prev();
        }
      }
    }

    function handleClickOnRemoveButton (event) {
      var $row = $(event.target).closest('tr');
      removeRow($row);

      // if table is growable, remove empty rowns
      var growableTable = api.$el.data('bs.growableTable');
      if (growableTable) {
        growableTable.removeEmptyRows();
      }
    }

    // events
    this.$el.on('input', handleInput);
    this.$el.on('click', '[data-remove]', handleClickOnRemoveButton);
  };

  // EDITABLE TABLE PLUGIN DEFINITION
  // ================================

  $.fn.editableTable = function (option) {
    return this.each(function () {
      var $this = $(this);
      var api  = $this.data('bs.editableTable');

      if (!api) {
        $this.data('bs.editableTable', (api = new EditableTable(this)));
      }
      if (typeof option === 'string') {
        api[option].call($this);
      }
    });
  };

  $.fn.editableTable.Constructor = EditableTable;


  // EDITABLE TABLE DATA-API
  // =======================

  $(document).on('input.bs.editableTable.data-api click.bs.editableTable.data-api', 'table[data-editable-spy]', function(event) {
    $(event.currentTarget).editableTable().removeAttr('data-editable-spy');
    $(event.target).trigger(event.type);
  });


  // GROWABLE TABLE CLASS DEFINITION
  // ===============================

  // Growable Table has all logic to automtically grow
  // the table by adding new empty rows when a field in
  // the last row is selected. It also clears up empty
  // rows again.
  var GrowableTable = function (el) {
    var api = this;

    // cache
    this.$el = $(el);
    this.$body = this.$el.find('tbody');
    this.$template = this.$body.find('tr:last-child').clone();
    this.defaultValues = serializeRow(this.$template);

    // event handlers
    function handleFocusInLastRow( /*event*/ ) {
      api.addRow();
    }

    function handleFocus( event ) {
      clearTimeout(api.removeTimeout);
      api.removeEmptyRows(event.currentTarget);
    }

    function handleBlur( /*event*/ ) {
      api.removeTimeout = setTimeout( $.proxy(api.removeEmptyRows, api), 100);
    }

    function handleClick(event) {
      if (event.currentTarget === event.target) {
        $(event.target).find(':input').focus();
      }
    }

    // events
    this.$el.on('focus', 'tbody tr:last-child', handleFocusInLastRow);
    this.$el.on('focus', 'tbody tr', handleFocus);
    this.$el.on('blur', 'tbody', handleBlur);
    this.$el.on('click', 'tbody td', handleClick);
  };

  //
  // adds a new row to the end of the table.
  //
  GrowableTable.prototype.addRow = function (record) {
    var $row = this.$template.clone();

    if (record) {
      $row.data('id', record.id);

      $row.find(':input').each( function() {
        this.value = record[this.name] || '';
      });

      this.$body.find('tr:last-child').before($row);
    } else {

      this.$body.append($row);
    }
  };

  //
  // removes all rows that are empty. Optionally the
  // current row can be passed to prevent it from being
  // removed.
  //
  GrowableTable.prototype.removeEmptyRows = function ( currentRow ) {
    var $lastRow = this.$body.find('tr:last-child');
    var $prev = $lastRow.prev();
    while(this.isEmptyRow($prev) && $prev[0] !== currentRow) {
      removeRow($prev);
      $prev = $lastRow.prev();
    }
  };

  //
  // A row is considered empty when its values match
  // the templates values
  //
  GrowableTable.prototype.isEmptyRow = function ($row) {
    var record = serializeRow($row);

    for(var property in this.defaultValues) {
      if (property !== 'id' && this.defaultValues[property] !== record[property]) {
        return false;
      }
    }

    return true;
  };

  //
  // turns a row into an object
  //
  function serializeRow ($row) {
    var record = {};

    $row.find(':input').each( function() {
      record[this.name] = this.value.trim();
    });

    record.id = $row.data('id');

    return record;
  }

  //
  // removes all rows that are empty. Optionally the
  // current row can be passed to prevent it from being
  // removed.
  //
  GrowableTable.prototype.removeEmptyRows = function ( currentRow ) {
    var $lastRow = this.$body.find('tr:last-child');
    var $prev = $lastRow.prev();
    while(this.isEmptyRow($prev) && $prev[0] !== currentRow) {
      removeRow($prev);
      $prev = $lastRow.prev();
    }
  };

  //
  // removes row and triggers according events
  //
  function removeRow ($row) {
    var $table = $row.closest('table');
    var record = serializeRow($row);
    $row.remove();

    $table.trigger('record:change', ['remove', record]);
    $table.trigger('record:remove', [record]);

    return record;
  }

  //
  // generic function to generate a unique Id
  //
  var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
  var radix = chars.length;
  var idLength = 7;

  // helper to generate unique ids.
  function generateId () {
    var i, id = '';
    for (i = 0; i < idLength; i++) {
      var rand = Math.random() * radix;
      var char = chars[Math.floor(rand)];
      id += String(char).charAt(0);
    }
    return id;
  }


  // GROWABLE TABLE PLUGIN DEFINITION
  // ================================

  $.fn.growableTable = function (option) {
    return this.each(function () {
      var $this = $(this);
      var api  = $this.data('bs.growableTable');

      if (!api) {
        $this.data('bs.growableTable', (api = new GrowableTable(this)));
      }
      if (typeof option === 'string') {
        api[option].call($this);
      }
    });
  };

  $.fn.growableTable.Constructor = GrowableTable;


  // GROWABLE TABLE DATA-API
  // =======================

  $(document).on('focus.bs.growableTable.data-api', 'table[data-growable-spy]', function(event) {
    $(event.currentTarget).growableTable().removeAttr('data-growable-spy');
    $(event.target).trigger('focus');
  });
})(jQuery);
