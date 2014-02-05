Navigable Table – A bootstrap plugin
====================================

> A Bootstrap plugin for elegant navigating along table inputs


Installation
------------

Simplest way to install is using [bower](http://bower.io/):

```
bower install --save bootstrap-navigable-table
```


Usage
-----

```html
<!-- load bootstrap assets -->
<link rel="stylesheet" type="text/css" href="bootstrap.css">
<script src="bootstrap.js"></script>

<!-- load navigable-table assets -->
<script src="navigable-table.js"></script>

<!-- The data-navigable-spy attribute initializes the table on first interaction -->
<table data-navigable-spy class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>E-Mail</th>
      <th>Birthday</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><input name="name" value="Raphael Saadiq" placeholder="Joe Doe"></td>
      <td><input name="email" value="raphael@example.com" placeholder="joe@example.com" type="email"></td>
      <td><input name="birthday" value="05/14/1966" placeholder="01/01/1980" type="date"></td>
    </tr>
    <tr>
      <td><input name="name" value="Dawn Robinson" placeholder="Joe Doe"></td>
      <td><input name="email" value="dawn@example.com" placeholder="joe@example.com" type="email"></td>
      <td><input name="birthday" placeholder="11/24/1965" type="date"></td>
    </tr>
    <tr>
      <td><input name="name" value="Ali Shaheed Muhammad" placeholder="Joe Doe"></td>
      <td><input name="email" value="ali@example.com" placeholder="joe@example.com" type="email"></td>
      <td><input name="birthday" placeholder="08/11/1970" type="date"></td>
    </tr>
  </tbody>
</table>
```
