var request = require('xhr')

var parseCSV = require('./parse-csv')
var parseJSON = require('./parse-json')

module.exports = function orgs (options, callback) {
  console.log(options)
  var requestOptions = {
    url: 'https://api.github.com/repos/' + options.owner + '/' + options.repo + '/contents/' + options.path,
    headers: { authorization: 'token ' + options.token },
    json: true
  }

  var type = require('./accept-file')(options.path)
  if (typeof type === 'error') return callback(type)

  request(requestOptions, function (err, res, body) {
    if (err) return callback(err)
    if (body.message === 'Not Found') return callback(new Error(body.message))
    var content = window.atob(body.content)

    if (type === 'csv') {
      parseCSV(content, end)
    } else if (type === 'json') {
      parseJSON(content, end)
    }

    function end (err, data, properties) {
      var save = {
        type: type,
        branch: options.branch,
        owner: options.owner,
        repo: options.repo,
        location: body,
        source: 'github'
      }
      callback(err, data, properties, save)
    }
  })
}
