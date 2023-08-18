// Docs for plugin structure: https://beacon.support.brightcove.com/ott-plugins/javascript-modules-beacon-plugins.html

import { playerTimings } from './playerTimings.js';

window.addEventListener("message", (event) => {
  const originsAllowed = [
    'https://savoir.media'
  ];
  if (originsAllowed.includes(event.origin)) {

    // Check for debug parameter, to activate console.log calls below
    const url = new URL(window.location.href);
    const debugParam = url.searchParams.get("debug");
    const debug = debugParam === "true";  

    // Switch through Beacon events
    switch (event.data.event) {
      case 'loadedBeaconVideoMetadata':
        const playerObjects = videojs.getPlayers() // This is the player object within the data model of the app
        for (let key in playerObjects) {
          if (key.startsWith("bc-player-")) {
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
                rights_0_startdate: rights_0_startdate,
                rights_0_enddate: rights_0_enddate,
                video_type: video_type,
                duration: duration,
                id: id,
                referenceId: referenceId,
                name: name,
                tags: tags
              }
            });
          }
        }
        playerTimings(event, debug);
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