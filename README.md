Editable Table – A bootstrap plugin
===================================

> A Bootstrap plugin for elegant editing of data collections.


Installation
------------

Simplest way to install is using [bower](http://bower.io/):

```
bower install --save bootstrap-editable-table
```


Usage
-----

```html
<!-- load bootstrap assets -->
<link rel="stylesheet" type="text/css" href="bootstrap.css">
<script src="bootstrap.js"></script>

<!-- load editable-table assets -->
<link rel="stylesheet" type="text/css" href="editable-table.css">
<script src="editable-table.js"></script>

<!-- The data-editable is used for styling, the data-editable-spy attribute initializes the behaviour on first interaction -->
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
```

Fine Print
----------

The Expandable Input Plugin have been authored by [Gregor Martynus](https://github.com/gr2m),
proud member of [Team Hoodie](http://hood.ie/). Support our work on Hoodie: [gittip us](https://www.gittip.com/hoodiehq/).

License: MIT
