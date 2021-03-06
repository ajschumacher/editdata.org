var fromString = require('from2-string')
var JSONStream = require('JSONStream')
var schema = require('data-schema')()
var cuid = require('cuid')

module.exports = function parseJSON (json, callback) {
  var properties = {}
  var data = []
  var i = 0

  fromString(json)
    .pipe(JSONStream.parse('*'))
    .on('data', function (row) {
      var rowkey
      var prop = {}

      if (row.key && row.value) {
        rowkey = row.key
        row = row.value
      } else {
        rowkey = cuid()
      }

      Object.keys(row).forEach(function (key) {
        prop = schema.inferType(key, row[key])
        if (!schema.find(key)) {
          schema.addProperty(prop)
          properties[prop.key] = prop
        }
      })

      row = schema.format(row)
      data.push({ key: rowkey, value: row })
      i++
    })
    .on('end', function () {
      callback(null, data, properties)
    })
}
