#!/usr/bin/env node

var exec = require('child_process').exec

var GH_TOKEN = process.env.GH_TOKEN
var repo = require('../package.json').repository.url

if (!(process.env.CI && GH_TOKEN && repo)) {
  console.log('[authorize-push] ignodered because condition not fullfillled (process.env.CI: %s, GH_TOKEN: %s, repo: %s)', !!process.env.CI, !!GH_TOKEN, !!repo)
  process.exit(1)
}

var commands = [
  'git remote set-url origin ' + repo.replace('https://', 'https://' + GH_TOKEN + '@'),
  'git config user.email "gregor@martynus.net"',
  'git config user.name "gr2m"'
]
commands.forEach(function (command) {
  console.log('[authorize-push] %s', command.replace(GH_TOKEN, '***GH_TOKEN***'))
  exec(command)
})
