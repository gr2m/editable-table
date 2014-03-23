(function ($) {
  'use strict';

  // EDITABLE TABLE CLASS DEFINITION
  // ===============================

  // Editable Table provides an elegant API to listen
  // to changes, adding new rows or removing existing
  // ones
  //
  //     $table = $('table').editableTable();
  //     $table.on('record:add', function(event, record, index) { /* ... */ });
  //     $table.on('record:remove', function(event, record, index) { /* ... */ });
  //     $table.on('record:update', function(event, record, index) { /* ... */ });
  //     $table.on('record:change', function(event, eventType, record, index) { /* ... */ });
  //
  // To get records out of the table, do
  //
  //     $table.editableTable('get', function(records) {})
  //
  // To add one or multiple records, do
  //
  //    $table.editableTable('add', recordOrRecords /*, atIndex */ )
  //
  var EditableTable = function (el) {
    var $table, $body, $template;
    var defaultValues, removeTimeout;
    var api = this;

    // we keep track of records count to differentiate wheter a record
    // for the current row has been created yet. We can do it this way
    // is we do not allow for "gaps", meaning that if I make a change
    // in row 1 and row 4, records get created for 2 & 3 automatically
    var recordsCount = 0;

    // 1. cache elements for performance reasons and
    // 2. setup event bindings
    function initialize() {
      $table = $(el);
      $body = $table.find('tbody');
      $template = $body.find('tr:last-child').clone();
      defaultValues = serializeRow($template);

      $body.on('blur', 'tr', handleBlur);
      $body.on('click', '[data-remove]', handleClickOnRemoveButton);
      $body.on('click', 'td', handleClick);
      $body.on('focus', 'tr:last-child', handleFocusInLastRow);
      $body.on('focus', 'tr', handleFocus);
      $body.on('input', '[name]', handleInput);
      // select and check boxes do not trigger input events, so listen to change
      $body.on('change', 'select,input[type=checkbox],input[type=radio]', handleInput);
      $body.on('DOMNodeRemoved', 'tr', handleRemove);
      $body.on('DOMNodeInserted', 'tr', handleInsert);
    }

    // JS API
    // ------

    //
    // get & return all records from table
    //
    api.get = function get(callback) {
      var records = [];
      $body.find('tr:not(:last-child)').each(function() {
        records.push(serializeRow($(this)));
      });
      callback(records);
    };

    //
    //
    //
    var isAddingViaApi = false;
    api.add = function add(records, options) {
      isAddingViaApi = true;
      options = options || {};
      options.at = (typeof options.at !== 'undefined') ? options.at : ($body.find('tr').length - 1);

      if (! $.isArray(records)) {
        isAddingViaApi = false;
        return addRow(records, options);
      }

      recordsCount = recordsCount + records.length;
      records.forEach(function(record) {
        addRow(record, options);
        options.at++;
      });
      isAddingViaApi = false;
    };

    //
    //
    //
    api.update = function update(changedProperties, options) {
      var position = options && options.at;
      var $row;
      if (typeof position === 'undefined') return;
      $row = $body.find('tr').eq(position);

      for(var key in changedProperties) {
        if (changedProperties.hasOwnProperty(key)) {
          $row.find('[name="'+key+'"]').val(changedProperties[key]);
        }
      }
    };

    //
    //
    //
    var isRemovingViaApi = false;
    api.remove = function remove(options) {
      var position = options && options.at;
      if (typeof position === 'undefined') return;
      isRemovingViaApi = true;

      $body.find('tr').eq(position).remove();
      isRemovingViaApi = false;
    };


    // Event handlers
    // --------------

    //
    // on blur, we remove empty rows at the end of the table.
    // We need to give it a timeout though, otherwise rows would
    // be removed before I can set focus in one of them
    //
    function handleBlur( event ) {
      $(event.currentTarget).closest('tr').removeClass('active');
      removeTimeout = setTimeout( removeEmptyRows, 100);
    }

    //
    // If an element with a `data-remote` attribute gets clicked,
    // remove the row
    //
    function handleClickOnRemoveButton (event) {
      var $row = $(event.target).closest('tr');
      $row.remove();

      removeEmptyRows();
    }

    //
    // Catch clicks outside of the inputs and set focus accordingly
    // 1. Ignore clicks that are not on <td> elements
    //
    function handleClick(event) {
      if (event.currentTarget === event.target) { /* [1] */
        $(event.target).find('[name]').focus();
      }
    }

    //
    // add a new row when focus is set in the last one. That makes
    // the table grow automatically, no need for extra buttons.
    //
    function handleFocusInLastRow( /*event*/ ) {
      addRow();
    }

    //
    // When an element is focused, remove empty rows at the bottom,
    // but only until the currently focussed row is reached.
    // 1. Stop the timout started in `handleBlur`
    //
    function handleFocus( event ) {
      $(event.currentTarget).closest('tr').addClass('active');
      removeEmptyRows(event.currentTarget);
      clearTimeout(removeTimeout); /* [1] */
    }

    //
    // Trigger events
    // 1. If the user left empty rows before making a change, make
    //    sure to create records for the empty rows above as well,
    //    otherwise they can't be stored, and maybe the user left
    //    them empty on purpose
    //
    function handleInput (event) {
      var $input = $(event.target);
      var $row = $input.closest('tr');
      var index = $row.index();
      var record = serializeRow($row);
      var isNew = (index + 1) > recordsCount;
      var eventName = isNew ? 'add' : 'update';

      if (eventName === 'update') {
        record[$input.attr('name')] = $input.val();
      }

      $table.trigger('record:change', [eventName, record, index]);
      $table.trigger('record:' + eventName, [record, index]);

      if (eventName === 'add') {
        recordsCount = recordsCount + 1;
        createRecordsAbove($row); /* [1] */
      }
    }

    //
    // handle when a <tr> has been removed from DOM
    //
    // [1] We have to ignore the event in case the removed
    //     row has only been moved to another place. In that
    //     case, handleInsert will set lastRemovedRow to
    //     undefined, see below
    //
    var lastRemovedRow;
    function handleRemove (event) {
      var index;
      lastRemovedRow = event.currentTarget;
      index = $(lastRemovedRow).index();
      setTimeout(function() {
        if (! lastRemovedRow) return; // [1]
        removeRow( $(lastRemovedRow), index );
      });
    }


    //
    // handle when a <tr> has been added to DOM
    //
    // [1] When inserted row comes from calling api.add(), ignore
    // [2] We have to ignore the event in case the added
    //     row has been removed beforehand, that means it
    //     has only been moved to another place. See handleRemove
    //
    function handleInsert (event) {
      var $row = $(event.target);
      var record;
      var index;

      if (isAddingViaApi) return; // [1]

      if (event.target === lastRemovedRow) { // [2]
        lastRemovedRow = undefined;
        return;
      }

      // ignore if new row is an auto-insert to the end of the table
      if ( $row.is(':last-child') ) return;


      record = serializeRow($row);
      index = $row.index();

      $table.trigger('record:change', ['add', record, index]);
      $table.trigger('record:add', [record, index]);
    }

    // Internal Methods
    // ----------------

    //
    // adds a new row to the end of the table.
    //
    function addRow(record, options) {
      var $row = $template.clone();
      var index = options && options.at;

      if (! record) {
        return $body.append($row);
      }

      $row.find('[name]').each( function() {
        var $input = $(this);
        $input.val(record[$input.attr('name')] || '');
      });

      if (index === undefined) {
        return $body.find('tr:last-child').before($row);
      }

      if (options.decorate) {
        options.decorate($row, record);
      }

      $body.find('tr').eq(index).before($row);
    }

    //
    // A row is considered empty when its values match
    // the templates values
    //
    function isEmptyRow($row) {
      var record = serializeRow($row);

      for(var property in defaultValues) {
        if (defaultValues[property] !== record[property]) {
          return false;
        }
      }

      return true;
    }

    //
    // removes all rows that are empty. Optionally the
    // current row can be passed to prevent it from being
    // removed.
    //
    function removeEmptyRows( currentRow ) {
      var $lastRow = $body.find('tr:last-child');
      var $prev = $lastRow.prev();

      while($prev[0] !== currentRow && isEmptyRow($prev)) {
        $prev.remove();
        $prev = $lastRow.prev();
      }
    }

    // helpers

    //
    // turns a row into an object
    //
    function serializeRow ($row) {
      var record = {};
      $row.find('[name]').each( function() {
        var $input = $(this);
        record[$input.attr('name')] = $input.val().trim();
      });

      return record;
    }

    //
    // removes row and triggers according events
    // 1. there can be no "gaps" records. If we have 3 records
    //    and the fourth row gets removed, we can be sure that
    //    it hasn't been touched yet.
    function removeRow ($row, index) {
      var record;
      var isNew = (index + 1) > recordsCount; /* [1] */

      if (isNew) {
        return;
      }

      record = serializeRow($row);
      index = index;
      recordsCount = recordsCount - 1;

      $table.trigger('record:change', ['remove', record, index]);
      $table.trigger('record:remove', [record, index]);
    }

    //
    // assure that all rows above the current row have
    // existing records.
    //
    function createRecordsAbove ($row) {
      var record;
      var newRecordsCount;
      var index;
      var $rows = $row.siblings().andSelf();
      newRecordsCount = $row.index() + 1;

      for (;recordsCount < newRecordsCount; recordsCount++) {
        index = recordsCount - 1;
        $row = $rows.eq(index);

        record = serializeRow($row);
        $table.trigger('record:change', ['add', record, index]);
        $table.trigger('record:add', [record, index]);
      }
    }

    initialize();
  };


  // EDITABLE TABLE PLUGIN DEFINITION
  // ================================

  $.fn.editableTable = function (option) {
    var jsApiArgs =  Array.prototype.slice.apply(arguments, [1]);
    return this.each(function () {
      var $this = $(this);
      var api  = $this.data('bs.editableTable');

      if (!api) {
        $this.data('bs.editableTable', (api = new EditableTable(this)));
      }
      if (typeof option === 'string') {
        api[option].apply($this, jsApiArgs);
      }
    });
  };

  $.fn.editableTable.Constructor = EditableTable;

  // EDITABLE TABLE DATA-API
  // =======================

  $(document).on('focus.bs.editableTable.data-api', 'table[data-editable-spy]', function(event) {
    var $table = $(event.currentTarget);

    event.preventDefault();
    event.stopImmediatePropagation();

    $table.removeAttr('data-editable-spy');
    $table.editableTable();
    $(event.target).trigger($.Event(event));
  });
})(jQuery);
