/* *
const DeviceDiscovery = require('sonos').AsyncDeviceDiscovery
let discovery = new DeviceDiscovery()
console.log("Start");
discovery.discover().then((device, model) => {
	console.log("Found: ", device);
    // Do stuff, see examples/devicediscovery.js
})
.catch((err) => {
	console.log(err.message);
})
console.log("Hunt");
/* */

/* *
const Sonos = require('sonos')
console.log('Searching for Sonos devices for 5 seconds...')

const discovery = new Sonos.AsyncDeviceDiscovery()

discovery.discover({ timeout: 50000 }).then((device, model) => {
  console.log('Found one sonos device %s getting all groups', device.host)
  return device.getAllGroups().then((groups) => {
    console.log('Groups %s', JSON.stringify(groups, null, 2))
    return groups[0].CoordinatorDevice().togglePlayback();
  })
}).catch(e => {
  console.warn(' Error in discovery %j', e)
})
/* */

/* */
const Sonos = require('sonos').Sonos;
var sonos;

sonos = new Sonos(process.env.SONOS_HOST || '192.168.86.169')
// sonos.flush();

// try {
// 	sonos = new Sonos("24874");
// 	sonos.on("error", function(err) {
// 		console.log("Event: ", err);
// 	})
// } catch(ex) {
// 	console.log("Fault: " + ex.message);
// }

// sonos.play("https://sounds.tabletopaudio.com/309_Bloodgate.mp3")
// .then(function(result) {
// 	console.log('Started playing %j', result)
// })
// .catch(err => { console.log('Error occurred ' + err.message) })

// sonos.stop().then(result => {
//   console.log('Stopped playing %j', result)
// }).catch(err => { console.log('Error occurred %s', err) })

sonos.getVolume().then(volume => {
  console.log('The volume is %d', volume)
}).catch(err => { console.log('Error occurred %s', err) })

// sonos.setVolume(50).then(volume => {
//   console.log('The volume is %d', volume)
// }).catch(err => { console.log('Error occurred %s', err) })
/* */

sonos.getMusicLibrary('playlists', { start: 0, total: 25 }).then(playlists => {
	console.log('Got current playlists %j', playlists)
  }).catch(err => { console.log('Error occurred %j', err) })
  
sonos.currentTrack().then(track => {
	console.log('Got current track %j', track)
  }).catch(err => { console.log('Error occurred %j', err) })
  
  