'use strict'

const each = require('async/each')
const Tracker = require('./')
const uuid = require('uuid')

module.exports = function TrackerManager (trackerServers, zeronet) {
  const self = this

  let trackers = []

  let lastid = -1

  function updateNext () {
    if (!trackers.length) return
    if (lastid >= trackers.length) return (lastid = 0)
    trackers[lastid].update()
    lastid++
  }

  let main

  function updateAll () {
    if (trackers[lastid]) {
      updateNext()
      main = setTimeout(updateAll, 10 * 1000)
    } else {
      lastid = 0
      main = setTimeout(updateAll, 30 * 1000)
    }
  }

  updateAll()

  function add (tracker, zite) {
    let plist

    tracker.on('peer', (addr) => {
      if (!plist) { // add async as the tracker client yields many peers sync
        plist = []
        process.nextTick(() => {
          zeronet.peerPool.addMany(plist, zite)
          plist = null
        })
      }
      if (addr.endsWith(':0')) return
      plist.push(addr)
    })

    tracker.id = uuid()

    tracker.complete()

    trackers.push(tracker)

    return tracker
  }

  function rm (tracker) {
    if (!tracker.id) throw new Error('Tracker has no id')
    trackers = trackers.filter(t => t.id !== tracker.id)
    tracker.stop()
  }

  function stop () {
    clearInterval(main)
    each(trackers, (tracker, next) => {
      tracker.once('error', next)
      tracker.once('stop', next)
      tracker.stop()
    })
  }

  function create (address) {
    return add(new Tracker(address, trackerServers, zeronet.peer_id), address)
  }

  self.servers = trackerServers
  self.create = create
  self.add = add
  self.rm = rm
  self.stop = stop
}
