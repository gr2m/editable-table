Editable Table – A bootstrap plugin
===================================

> A simple plugin that makes editing a collection of records a
  breeze.


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

<!-- The data-editable attribute initializes the table on first interaction -->
<table data-editable class="table">
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
      <td><input name="email" placeholder="joe@example.com" type="email"></td>
    </tr>
  </tbody>
</table>
```