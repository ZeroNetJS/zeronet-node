'use strict'

const Tracker = require('zeronet-tracker')
const crypto = require('crypto')
const sha1 = text => crypto.createHash('sha1').update(text).digest()
module.exports = function ZeroNetTracker (zite, trackers, peer) {
  const client = new Tracker({
    infoHash: sha1(zite),
    peerId: Buffer.from(peer),
    announce: trackers,
    port: 15543 // XXX: tmp fix for announce, hard to dev otherwise TODO: Fix
  })

  return client
}
