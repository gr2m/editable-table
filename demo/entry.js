require('bootstrap/dist/css/bootstrap.css')
require('../editable-table.css')
require('./demo.css')

var jQuery = require('jquery')
var editableTable = require('../editable-table')
// var navigableTable = require('navigable-table')
var expandableInput = require('expandable-input')

expandableInput(jQuery)
editableTable(jQuery)
// navigableTable(jQuery)

window.$ = window.jQuery = jQuery
