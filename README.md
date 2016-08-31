# Editable Table – A jQuery plugin

> A jQuery plugin for elegant editing of data collections.

[![Build Status](https://travis-ci.org/gr2m/editable-table.svg)](https://travis-ci.org/gr2m/editable-table)
[![Dependency Status](https://david-dm.org/gr2m/editable-table.svg)](https://david-dm.org/gr2m/editable-table)
[![devDependency Status](https://david-dm.org/gr2m/editable-table/dev-status.svg)](https://david-dm.org/gr2m/editable-table#info=devDependencies)

## Download / Installation

You can download the latest JS & CSS code here:

- https://unpkg.com/editable-table/dist/editable-table.js
- https://unpkg.com/editable-table/dist/editable-table.css

Or install via [npm](https://www.npmjs.com/)

```
npm install --save editable-table
```

The JS code can be required with

```js
var jQuery = require('jquery')
var editableTable = require('editable-table')

// init
editableTable(jQuery)
```

The CSS code lives at `node_modules/editable-table/editable-table.css`

## Usage

```html
<!-- load jquery -->
<script src="jquery.js"></script>

<!-- load editable-table assets -->
<link rel="stylesheet" type="text/css" href="editable-table.css">
<script src="editable-table.js"></script>

<!-- The data-editable is used for styling, the data-editable-spy attribute
     initializes the behavior on first interaction -->
<table data-editable data-editable-spy class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>E-Mail</th>
      <th>Birthday</th>
    </tr>
  </thead>
  <tbody>
    <!-- The last <tr> in the <tbody> will be used as template for new rows -->
    <tr>
      <td><input name="name" placeholder="Joe Doe"></td>
      <td><input name="email" placeholder="joe@example.com" type="email"></td>
      <td><input name="birthday" placeholder="10/20/2000" type="date"></td>
    </tr>
  </tbody>
</table>
```

You can get or add records using the JS API:

```js
// get records out of table
$table.editableTable('get', function(records) {})
// add a new record to the end of the table
$table.editableTable('add', {name: 'Joe', email: 'joe@example.com'})
// add a new record after the 2nd
$table.editableTable('add', {name: 'Joe', email: 'joe@example.com'}, {at: 2})
// add multiple records at once
$table.editableTable('add', records)
// before adding rows, decorate them with custom logic
$table.editableTable('add', record, {decorate: function($tr, record) {
  $tr.toggleClass('error', ! record.isValid)
}})
// update 1st row
$table.editableTable('update', {email: 'new.joe@example.com'}, {at: 0})
// remove 3rd row
$table.editableTable('remove', {at: 2})
```

## Local Setup

```bash
git clone git@github.com:gr2m/editable-table.git
cd editable-table
npm install
```

## Test

You can start a local dev server with

```bash
npm start
```

Run tests with

```bash
npm test
```

While working on the tests, you can start Selenium / Chrome driver
once, and then tests re-run on each save

```bash
npm run test:mocha:watch
```

## Fine Print

The Expandable Input Plugin have been authored by [Gregor Martynus](https://github.com/gr2m),
proud member of the [Hoodie Community](http://hood.ie/).

License: MIT
