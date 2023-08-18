// Docs for plugin structure: https://beacon.support.brightcove.com/ott-plugins/javascript-modules-beacon-plugins.html

import { playerTimings } from './playerTimings.js';

window.addEventListener("message", (event) => {
  const originsAllowed = [
    'https://savoir.media'
  ];
  if (originsAllowed.includes(event.origin)) {

<<<<<<< HEAD
    switch (event.data.event) {

      case 'loadedBeaconVideoMetadata':
        playerTimings(event);
=======
    // Check for debug parameter, to activate console.log calls below
    const url = new URL(window.location.href);
    const debugParam = url.searchParams.get("debug");
    const debug = debugParam === "true";
    let player = null // Defining the player object outside the switch events to make it globally available

    // Switch through Beacon events
    switch (event.data.event) {
      case 'loadedBeaconVideoMetadata':
        const playerObjects = videojs.getPlayers() // This is the top level player object within the data model of the app
        for (let key in playerObjects) {
          if (key.startsWith("bc-player-")) {
            player = playerObjects[key].children_[0] // This is the actual HTML5 player DOM element
            const mediaInfo = playerObjects[key].mediainfo;
            debug && console.log('Media Info is: ', mediaInfo)
            const {
              customFields: {
                  beacon_agerating: age_rating,
                  beacon_cast_composer: cast_composer,
                  beacon_cast_songwriter: cast_songwriter,
                  beacon_episode_number: episode_number,
                  beacon_episode_seasonid: episode_seasonid,
                  beacon_episode_seasonnumber: episode_seasonnumber,
                  beacon_episode_seriename: episode_seriename,
                  beacon_genre: genre,
                  beacon_productionyear: productionyear,
                  beacon_rights_0_startdate: rights_0_startdate,
                  beacon_rights_0_enddate: rights_0_enddate,
                  beacon_video_type: video_type
              },
              duration,
              id,
              name,
              tags,
              referenceId    
          } = mediaInfo
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: 'mediaInfo',
              mediaInfo: {
                age_rating: age_rating,
                cast_composer: cast_composer,
                cast_songwriter: cast_songwriter,
                episode_number: episode_number,
                episode_seasonid: episode_seasonid,
                episode_seasonnumber: episode_seasonnumber,
                episode_seriename: episode_seriename,
                genre: genre,
                productionyear: productionyear,
                rights_0_startdate: rights_0_startdate.match(/^\d{4}-\d{2}-\d{2}/)[0], // Convert to YYYY-MM-DD
                rights_0_enddate: rights_0_enddate.match(/^\d{4}-\d{2}-\d{2}/)[0],
                video_type: video_type,
                duration: duration,
                id: id,
                referenceId: referenceId,
                name: name,
                tags: tags.join(', ')
              }
            });
          }
        }
        playerTimings(event, player, debug);
>>>>>>> BrightcoveBeaconAnalyticsPlugin/main
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