Inbox for Testing
=================

Before implementing actual tests, I'm going to just list all
cases that I want to be tested

- auto adding / removing rows
  - When clicking on last row, a new row gets added
  - When clicking on a row above, all empty rows below shall
    be removed
  - When removing focus, all empty rows shall be removed
  - when changing a field in a row, it shall not be removed anymore
  - when there are empy rows above a non-empty row, they do not
    get removed
  - the table can be initialized with existing rows
  - when template row has a value in it, it shall be treated
    as the "empty" state.
- events
  - shall trigger `record:add`, `record:update`, `record:remove`,
    `record:change` accordingly
- when clicking on a cell, outside an input, the input shall be
  focused / selected