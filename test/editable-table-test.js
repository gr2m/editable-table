/* global describe, beforeEach, it */

// we delete the cached require of '@gr2m/frontend-test-setup'
// to make it work with mocha --watch.
delete require.cache[require.resolve('@gr2m/frontend-test-setup')]
require('@gr2m/frontend-test-setup')

var expect = require('chai').expect

function toValue (result) {
  if (typeof result !== 'object') {
    return result
  }

  if (isError(result.value)) {
    var error = new Error(result.value.message)
    Object.keys(result.value).forEach(function (key) {
      error[key] = result.value[key]
    })
    throw error
  }

  return result.value
}

function isError (value) {
  return value && value.name && /error/i.test(value.name)
}

describe('=== expandable-input ===', function () {
  this.timeout(90000)

  beforeEach(function () {
    return this.client.url('/')
  })

  it('sanity check', function () {
    return this.client
      .url('/index.html')
      .execute(function getTitle () {
        return document.title
      }).then(toValue)
      .then(function (title) {
        expect(title).to.equal('Editable Table – A jQuery plugin')
      })
  })
})
