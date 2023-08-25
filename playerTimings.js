// Docs for page events: https://beacon-help.support.brightcove.com/ott-plugins/working-with-page-events.html
const playerTimings = (playerEvent, player, debug) => {
  // Get the video player from the event
  const data = playerEvent.data.data;
  debug && console.log('data is: ', data);
  debug && console.log('Player is: ', player);

  // Add a slot for timings data within the player object
  player.timingData = {
    totalTimePlayed: 0,
    totalPercentPlayed: 0
  };

  // Array of percentages where we want to push a dataLayer event
  const datalayerEvents = [0, 5, 25, 50, 75, 90, 100]
  let pushedEvents = [] // We will store already pushed events here, to avoid double pushing

  // Define global vars
  let totalTime = 0
  let percentTime = 0
  let intPercent = 0
  let previousTime // Init previousTime to undefined so that currentTime is used for totalTime on the first call
  window.timingData = {video_id: data.video_id, percent: 0, time: 0} // Adding timing data to the global window object, to be able to access it within other contexts
  
  // Add event listener to fire updates on video time updates
  player.addEventListener("timeupdate", (event) => {
    if (!player.seeking) { // We need this check for rare events where, on a seek, timeupdate fires before seeking
      const currentTime = event.target.currentTime;
      let difference = currentTime - (previousTime || currentTime); // Set to 0 if previousTime is undefined
            
      if (difference < 0 || difference > 30) { // Extra check just in case
        difference = 0
      }

      // Calculating total time played so far
      totalTime = difference + totalTime;
      if (totalTime) {
        player.timingData.totalTimePlayed = totalTime; //Adding the value to the player object for access in other contexts
        window.timingData.time = totalTime; //Adding the value to the window object for access in other contexts if the player is destroyed
      }
      // Calculating percent played so far (it can go over 100% for videos that were rewatched within the same play session)
      percentTime = (totalTime / player.duration) * 100
      if (percentTime) {
        player.timingData.totalPercentPlayed = percentTime;
        window.timingData.percent = percentTime;
        intPercent = Math.floor(percentTime) 
      }
      // Push a dataLayer.push event if within our list of events we want to push, but don't push if it's already been pushed
      if ( datalayerEvents.includes(intPercent) && !pushedEvents.includes(intPercent)) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event : `video_view_${intPercent}`,
          beaconData : {
            asset_id: data.asset_id,
            device: data.device,
            slug: data.slug,
            user_language: data.user_language,
            video_id: data.video_id
          }, 
          playerData: {
            video_duration: player.duration
          }
        });
        pushedEvents.push(intPercent)
        debug && console.log('Event pushed to dataLayer: ', `video_view_${intPercent}`);
      }
      
      previousTime = currentTime;
    };
  });

  // Remove data from previousTime if a seek event is fired. 
  // The order of event fires on a seek is pause -> seeking -> seeked -> play
  // We're using the "seeking" event, as it's the earliest in the chain on a seek (we don't want to dump previousTime on pauses)
  // timeupdate generally fires after, but can (and will) fire at any time in the previous chain of events
  player.addEventListener("seeking", (event) => {
    previousTime = undefined // Set previousTime to undefined so that currentTime is used for totalTime on the first call
  });
};

export { playerTimings };