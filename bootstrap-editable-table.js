/* global jQuery */

(function ($) {
  'use strict';

  // EditableTable CLASS DEFINITION
  // ==============================

  var EditableTable = function (el) {
    var api = this;

    this.$el = $(el);
    this.$body = this.$el.find('tbody');
    this.$template = this.$body.find('tr:last-child').clone();
    this.defaultValues = serializeRow(this.$template);


    this.$el.on('focus', 'tbody tr:last-child', function() {
      api.addNewRow();
    });

    this.$el.on('focus', 'tbody tr', function(event) {
      clearTimeout(api.removeTimeout);
      api.removeEmptyRows(event.currentTarget);
    });

    this.$el.on('blur', 'tbody', function() {
      api.removeTimeout = setTimeout( $.proxy(api.removeEmptyRows, api), 100);
    });

    this.$el.on('click', 'tbody td', function(event) {
      if (event.currentTarget === event.target) {
        $(event.target).find(':input').focus();
      }
    });

    this.addNewRow();
  };

  EditableTable.prototype.addNewRow = function ( values ) {
    var $row = this.$template.clone();
    if (values) {
      // put in values
    }

    this.$body.append($row);
  };

  EditableTable.prototype.removeEmptyRows = function ( currentRow ) {
    var $lastRow = this.$body.find('tr:last-child');
    var $prev = $lastRow.prev();
    while(this.isEmptyRow($prev) && $prev[0] !== currentRow) {
      $prev.remove();
      $prev = $lastRow.prev();
    }
  };

  EditableTable.prototype.isEmptyRow = function ($row) {
    var record = serializeRow($row);

    for(var property in this.defaultValues) {
      if (this.defaultValues[property] !== record[property]) {
        return false;
      }
    }

    return true;
  };

  function serializeRow ($row) {
    var record = {};

    $row.find(':input').each( function() {
      record[this.name] = this.value.trim();
    });

    return record;
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  var old = $.fn.editableTable;

  $.fn.editableTable = function (option) {
    return this.each(function () {
      var $this = $(this);
      var api  = $this.data('bs.editableTable');

      if (!api) $this.data('bs.editableTable', (api = new EditableTable(this)));
      if (typeof option == 'string') api[option].call($this);
    });
  };

  $.fn.editableTable.Constructor = EditableTable;


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old;
    return this;
  };


  // ALERT DATA-API
  // ==============

  $(document).on('focus.bs.editableTable.data-api', 'table[data-editable]', function(event) {
    $(event.currentTarget).editableTable();
  });

})(jQuery);
