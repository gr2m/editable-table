export class EditableTable extends HTMLElement {
  constructor() {
    super();

    this.$body = this.querySelector("tbody");
    this.$template = this.$body.querySelector("tr:last-child").cloneNode(true);
    this.$lastRemoveRow = undefined;

    this.defaultValues = serializeRow(this.$template);
    this.recordsCount = 0;
  }

  connectedCallback() {
    this.addEventListener("focus", event => handleFocus(this, event), {
      capture: true,
      passive: true
    });
    this.addEventListener("blur", event => handleBlur(this, event), {
      capture: true,
      passive: true
    });
    this.addEventListener("click", event => handleClick(this, event), {
      capture: true,
      passive: true
    });
    this.addEventListener("input", event => handleInput(this, event), {
      capture: true,
      passive: true
    });
    this.addEventListener("change", event => handleChange(this, event), {
      capture: true,
      passive: true
    });
  }

  // custom public APIs

  /**
   * Retrieve all records from table
   */
  get() {
    return Array.prototype.slice
      .call(this.$body.children, 0, -1)
      .map(serializeRow);
  }

  /**
   * Add one or multiple records. By default, new records are added to the end
   * of the table. Set `options.at` to add them at a specific index.
   *
   * @param {object | object[]} records
   * @param {object} options
   */
  add(records, options = {}) {
    options.at =
      typeof options.at !== "undefined"
        ? options.at
        : this.$body.children.length - 1;

    if (!Array.isArray(records)) {
      addRow(this, records, options);
      return;
    }

    for (const record of records) {
      addRow(this, record, options);
      options.at++;
    }
  }

  /**
   * Update properties of the record at given index (`options.at`)
   *
   * @param {object} changedProperties
   * @param {object} options
   */
  update(changedProperties = {}, options = {}) {
    if (typeof options.at !== "number") return;

    const $row = this.$body.children[options.at];
    if (!$row) return;

    for (const [name, value] of Object.entries(changedProperties)) {
      $row.querySelector(`[name="${name}"]`).value = value;
    }
    dispatchEvents(this, {
      changeType: "update",
      index: options.at,
      record: serializeRow($row)
    });
  }

  /**
   * Remove a record at given index (`options.at`)
   *
   * @param {object} options
   */
  remove(options = {}) {
    if (typeof options.at !== "number") return;
    const $row = this.$body.children[options.at];
    if (!$row) return;

    const record = serializeRow($row);
    this.$body.removeChild($row);
    this.recordsCount--;

    dispatchEvents(this, {
      changeType: "remove",
      index: options.at,
      record
    });
  }
}

window.customElements.define("editable-table", EditableTable);

// EVENT HANDLERS

/**
 * Set the current raw to "active" and add a new row if it's the last one.
 *
 * @param {EditableTable} editableTable
 * @param {Event} event
 */
function handleFocus(editableTable, event) {
  const $row = event.target.closest("tr");
  if ($row.matches("tr:last-child")) {
    addRow(editableTable);
  }

  $row.classList.add("active");
  removeEmptyRows(editableTable, $row);

  // Stop the timout started in `handleBlur`
  clearTimeout(editableTable.removeTimeout);
}

/**
 * on blur, empty rows get removed from the end of the table after a timeout.
 *
 * @param {EditableTable} editableTable
 * @param {Event} event
 */
function handleBlur(editableTable, event) {
  event.target.closest("tr").classList.remove("active");

  editableTable.removeTimeout = setTimeout(
    () => removeEmptyRows(editableTable),
    100
  );
}

/**
 * If the remove button is pressed, remove the current row and all empty rows at the end.
 * Otherwise find the closest input and focus it.
 *
 * @param {EditableTable} editableTable
 * @param {Event} event
 */
function handleClick(editableTable, event) {
  if (event.target.matches("[name]")) {
    return;
  }

  if (event.target.matches("[data-remove]")) {
    var $row = event.target.closest("tr");
    const index = [...editableTable.$body.children].indexOf($row);
    editableTable.$body.removeChild($row);

    dispatchEvents(editableTable, {
      changeType: "remove",
      index,
      record: serializeRow($row)
    });
    editableTable.recordsCount--;

    removeEmptyRows(editableTable);
    return;
  }

  event.target.querySelector("[name]").focus();
}

/**
 * Handle `input` events as well as `change` events of <select>s and other
 * tags which do not support `input`.
 *
 * @param {EditableTable} editableTable
 * @param {Event} event
 */
function handleInput(editableTable, event) {
  const $input = event.target;
  const $row = $input.closest("tr");
  const index = [...$row.parentNode.children].indexOf($row);
  const record = serializeRow($row);
  const isNew = index + 1 > editableTable.recordsCount;
  const changeType = isNew ? "add" : "update";

  if (changeType === "update") {
    record[$input.getAttribute("name")] = $input.value;
  }

  if (changeType === "add") {
    editableTable.recordsCount += +1;
    createRecordsAbove(editableTable, index);
  }

  dispatchEvents(editableTable, {
    changeType,
    index,
    record
  });
}

/**
 * Forward event to `handleInput` for tags that do not support the `input` event.
 *
 * @param {EditableTable} editableTable
 * @param {Event} event
 */
function handleChange(editableTable, event) {
  if (event.target.matches("select,input[type=checkbox],input[type=radio]")) {
    editableTable.handleInput(event);
    return;
  }
}

// HELPER METHODS

/**
 * add a new row when focus is set in the last one. That makes
 * the table grow automatically, no need for extra buttons.
 *
 * @param {EditableTable} editableTable
 * @param {object} record
 * @param {object} options
 */
function addRow(editableTable, record, options) {
  const $row = editableTable.$template.cloneNode(true);

  if (!record) {
    return editableTable.$body.appendChild($row);
  }

  for (const input of $row.querySelectorAll("[name]")) {
    input.value = record[input.name];
  }

  let index = options && options.at;

  if (typeof index !== "number") {
    editableTable.$body.insertBefore($row, editableTable.$body.lastChild);
    editableTable.recordsCount++;
    dispatchEvents(editableTable, {
      changeType: "add",
      index,
      record
    });
    return;
  }

  if (index > editableTable.recordsCount) {
    index = editableTable.recordsCount;
  }

  editableTable.$body.insertBefore($row, editableTable.$body.children[index]);
  editableTable.recordsCount++;
  dispatchEvents(editableTable, {
    changeType: "add",
    index,
    record
  });
}

/**
 * A row is considered empty when its values match
 * the template's values
 *
 * @param {EditableTable} editableTable
 * @param {HTMLTableRowElement} $row
 */
function isEmptyRow(editableTable, $row) {
  var record = serializeRow($row);

  for (const [property, defaultValue] of Object.entries(
    editableTable.defaultValues
  )) {
    if (defaultValue !== record[property]) {
      return false;
    }
  }

  return true;
}

/**
 * turns a row into an object
 *
 * @param {HTMLTableRowElement} $row
 */
function serializeRow($row) {
  var record = {};
  for (const $input of $row.querySelectorAll("[name]")) {
    record[$input.getAttribute("name")] = $input.value.trim();
  }

  return record;
}

/**
 * removes all rows that are empty above the last row (the template row).
 * Optionally the current row can be passed to prevent it from being removed.
 *
 * @param {EditableTable} editableTable
 * @param {HTMLTableRowElement} $currentRow
 */
function removeEmptyRows(editableTable, $currentRow) {
  const $lastRow = editableTable.$body.querySelector("tr:last-child");
  let $prev = $lastRow.previousElementSibling;
  let index = editableTable.$body.children.length - 2;

  while ($prev && $prev !== $currentRow && isEmptyRow(editableTable, $prev)) {
    editableTable.$body.removeChild($prev);

    if (index <= editableTable.recordsCount) {
      dispatchEvents(editableTable, {
        changeType: "remove",
        index,
        record: serializeRow($prev)
      });
    }

    $prev = $lastRow.previousElementSibling;
    index--;
    editableTable.recordsCount--;
  }
}

/**
 * Dispatch custom events for adding, updating, and removing records
 *
 * @param {EditableTable} editableTable
 * @param {objects} options
 */
function dispatchEvents(editableTable, { changeType, index, record }) {
  const changeEvent = new CustomEvent("record:change", {
    bubbles: true,
    cancelable: false,
    composed: true,
    detail: {
      changeType,
      record,
      index
    }
  });
  const addOrUpdateEvent = new CustomEvent(`record:${changeType}`, {
    bubbles: true,
    cancelable: false,
    composed: true,
    detail: {
      record,
      index
    }
  });

  editableTable.dispatchEvent(changeEvent);
  editableTable.dispatchEvent(addOrUpdateEvent);
}

/**
 * assure that all rows above the current row have existing records.
 *
 * @param {EditableTable} editableTable
 * @param {HTMLTableRowElement} $row
 */
function createRecordsAbove(editableTable, index) {
  const $rows = editableTable.$body.children;
  const newRecordsCount = index + 1;

  for (
    ;
    editableTable.recordsCount < newRecordsCount;
    editableTable.recordsCount++
  ) {
    index = editableTable.recordsCount - 1;
    const record = serializeRow($rows[index]);
    dispatchEvents(editableTable, { changeType: "add", index, record });
  }
}
