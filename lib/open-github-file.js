var h = require('virtual-dom/h')
var orgs = require('./github-organizations')
var repos = require('./github-user-repos')
var orgRepos = require('./github-org-repos')
var repoFiles = require('./github-repo-files')
var branches = require('./github-get-branches')
var createPopup = require('../elements/popup')
var popupList = require('../elements/popup-list')

module.exports = function openGithubFile (state) {
  var popup = createPopup()

  orgs(state.user, function (err, orgList) {
    if (err) return popup.send('error', err)

    var orgListEl = popupList(orgList, {
      key: 'login',
      onclick: function (org) {
        orgRepos(state.user, org.login, function (err, repoList) {
          if (err) return popup.send('error', err)

          var repoListEl = popupList(repoList, {
            key: 'name',
            onclick: function (repo) {
              branches({
                token: state.user.token,
                owner: org.login,
                repo: repo.name
              }, function (err, branchList) {
                if (err) return popup.send('error', err)
                var branchListEl = popupList(branchList, {
                  key: 'name',
                  onclick: function (branch) {
                    repoFiles(state.user, org, repo, function (err, fileList) {
                      if (err) return popup.send('error', err)
                    
                      var fileListEl = popupList(fileList, {
                        key: 'path',
                        onclick: function (file) {
                          require('./github-get-blob')({
                            owner: org.login,
                            repo: repo.name,
                            token: state.user.token,
                            path: file.path,
                            branch: branch.name
                          }, function (err, data, properties, save) {
                            if (err) return popup.send('error', err)
                            popup.send('done', data, properties, save)
                          })
                        }
                      })
                    
                      var popupEl = popup.open([
                        h('h1', 'Open a file from GitHub'),
                        h('h2', 'Choose a file:'),
                        h('ul.item-list', fileListEl)
                      ])
                    
                      popup.send('render', popupEl)
                    })
                  }
                })

                var popupEl = popup.open([
                  h('h1', 'Open a file from GitHub'),
                  h('h2', 'Choose a branch:'),
                  h('ul.item-list', branchListEl)
                ])

                popup.send('render', popupEl)
              })
            }
          })

          var popupEl = popup.open([
            h('h1', 'Open a file from GitHub'),
            h('h2', 'Choose a repository:'),
            h('ul.item-list', repoListEl)
          ])

          popup.send('render', popupEl)
        })
      }
    })

    orgListEl.unshift(h('li.item', {
      onclick: function (e) {
        repos(state.user, function (err, repoList) {
          if (err) return popup.send('error', err)
          var repoListEl = popupList(repoList, {
            key: 'name',
            onclick: function (repo) {
              branches({
                token: state.user.token,
                owner: state.user.profile.login,
                repo: repo.name
              }, function (err, branchList) {
                if (err) return popup.send('error', err)
                var branchListEl = popupList(branchList, {
                  key: 'name',
                  onclick: function (branch) {
                    console.log(branch)
                    repoFiles(state.user, state.user.profile, repo, function (err, fileList) {
                      if (err) return popup.send('error', err)
                    
                      var fileListEl = popupList(fileList, {
                        key: 'path',
                        onclick: function (file) {
                          require('./github-get-blob')({
                            owner: state.user.profile.login,
                            repo: repo.name,
                            token: state.user.token,
                            path: file.path,
                            branch: branch.name
                          }, function (err, data, properties, save) {
                            if (err) return popup.send('error', err)
                            popup.send('done', data, properties, save)
                          })
                        }
                      })
                    
                      var popupEl = popup.open([
                        h('h1', 'Open a file from GitHub'),
                        h('h2', 'Choose a file:'),
                        h('ul.item-list', fileListEl)
                      ])
                    
                      popup.send('render', popupEl)
                    })
                  }
                })

                var popupEl = popup.open([
                  h('h1', 'Open a file from GitHub'),
                  h('h2', 'Choose a branch:'),
                  h('ul.item-list', branchListEl)
                ])

                popup.send('render', popupEl)
              })
            }
          })




          var popupEl = popup.open([
            h('h1', 'Open a file from GitHub'),
            h('h2', 'Choose a repository:'),
            h('ul.item-list', repoListEl)
          ])

          popup.send('render', popupEl)
        })
      }
    }, state.user.profile.login))

    var popupEl = popup.open([
      h('h1', 'Open a file from GitHub'),
      h('h2', 'Choose an organization:'),
      h('ul.item-list', orgListEl)
    ])

    popup.send('render', popupEl)
  })

  popup.send('render', null)
  return popup
}
