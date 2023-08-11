// Docs for plugin structure: https://beacon.support.brightcove.com/ott-plugins/javascript-modules-beacon-plugins.html

import { playerTimings } from './playerTimings.js';

window.addEventListener("message", (event) => {
  const originsAllowed = [
    'https://savoir.media'
  ];
  if (originsAllowed.includes(event.origin)) {

    switch (event.data.event) {

      case 'loadedBeaconVideoMetadata':
        playerTimings(event);
      break;

      case 'beforeBeaconPageLoad':
        // console.log('beforeBeaconPageLoad Event data: ', event.data.data);
        break;

      case 'onBeaconPageLoad':
        // console.log('onBeaconPageLoad Event data: ', event.data.data);
        break;

      case 'onBeaconPageChange':
        // console.log('onBeaconPageChange Event data: ', event.data.data);
      break;

      case 'onBeaconPageUnload':
        // console.log('onBeaconPageUnload Event data: ', event.data.data);
      break;
    }
  }
},
false
);