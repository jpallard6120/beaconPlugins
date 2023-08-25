// Docs for plugin structure: https://beacon.support.brightcove.com/ott-plugins/javascript-modules-beacon-plugins.html
import { playerTimings } from './playerTimings.js';

// Function definitions
const getMediaInfo = (playerObjects) => {
  for (let key in playerObjects) {
    if (key.startsWith("bc-player-")) {
      const mediaInfo = playerObjects[key].mediainfo; // This comes from the parent JS player (not the HTML5 player)
      return mediaInfo;
      }
    }
  }

const flattenMediaInfo = (mediaInfo) => {
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
    return { 
      age_rating , 
      cast_composer, 
      cast_songwriter, 
      episode_number, 
      episode_seasonid, 
      episode_seasonnumber, 
      episode_seriename, 
      genre, 
      productionyear, 
      rights_0_startdate: rights_0_startdate.match(/^\d{4}-\d{2}-\d{2}/)[0], // Convert to YYYY-MM-DD
      rights_0_enddate: rights_0_enddate.match(/^\d{4}-\d{2}-\d{2}/)[0],
      video_type, 
      duration, 
      id, 
      name, 
      tags: tags.join(', '),
      referenceId 
    }
}

const getPlayer = (playerObjects) => {
  for (let key in playerObjects) {
    if (key.startsWith("bc-player-")) {
      const player = playerObjects[key].children_[0] // This is the actual HTML5 player DOM element
      return player;
      }
    }
  }

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
        // Parent JS Player Media Info
        const playerObjects = videojs.getPlayers() // This is the top level player object within the data model of the app
        const mediaInfo = getMediaInfo(playerObjects, debug)
        debug && console.log('Media Info is: ', mediaInfo)
        const flattenedMediaInfo = flattenMediaInfo(mediaInfo)
        debug && console.log('Flattened Media Info is: ', flattenedMediaInfo)
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: 'mediaInfo',
              mediaInfo: flattenedMediaInfo
            });

        // HTML5 Player Timings
        const player = getPlayer(playerObjects);
        playerTimings(event, player, debug);

        // Send video_closed hit if the tab / browser is closed
        window.addEventListener("beforeunload", (event) => {
          if (mediaInfo.id == window.timingData.video_id) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: 'video_closed',
              mediaInfo: flattenedMediaInfo,
              timingData: {
                video_id: window.timingData.video_id,
                time_watched: window.timingData.time,
                percent_watched: window.timingData.percent
              }
            });
          }
        });

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

      case 'onBeaconPageUnload': // This doesn't fire on tab close, need alternate method. 
        if (event.data.data.page_type == 'player_vod') {
          // If the video play was unloaded, this means the user navved away from the video. 
          const mediaInfoEvent = dataLayer.find(item => item.event === 'mediaInfo'); // If the video is unloaded, the mediaInfo event must exist
          const mediaInfo = mediaInfoEvent.mediaInfo
          if (mediaInfo.id == window.timingData.video_id) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: 'video_closed',
              mediaInfo: mediaInfo,
              timingData: {
                video_id: window.timingData.video_id,
                time_watched: window.timingData.time,
                percent_watched: window.timingData.percent
              }
            });
          }
        }
      break;
    }
  }
},
false
);