/* eslint-env mocha */

'use strict'

const Storage = require('zeronet-storage-memory')
const Node = require('../src')
const PeerId = require('peer-id')

let n
let id

before(cb => {
  PeerId.createFromJSON(require('./id'), (err, _id) => {
    if (err) return cb(err)
    id = _id
    cb()
  })
})

it('should start', cb => {
  n = new Node({
    storage: new Storage(),
    swarm: {
      zero: {
        trackers: []
      }
    },
    id
  })
  n.start(cb)
}).timeout(20000)

it('should stop', cb => n.stop(cb))

/* TODO: move to zeronet
it("should start as bundle", cb => {
  n = require("../..")({
    id: global.id
  })
  n.start(cb)
}).timeout(20000)

it("should stop as bundle", cb => n.stop(cb))
*/
