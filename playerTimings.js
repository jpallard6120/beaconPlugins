// Docs for page events: https://beacon-help.support.brightcove.com/ott-plugins/working-with-page-events.html
const playerTimings = (playerEvent, debug) => {
  // Get the video player from the event
  const data = playerEvent.data.data;
  debug && console.log('data is: ', data);
  const video_id = data.video_id;
  const player = document.querySelector(`video-js[data-video-id="${video_id}"] > video`); // This is the html5 player DOM element
  debug && console.log('Player is: ', player);

  // Add a slot for timings data within the player object
  player.timingData = {
    totalTimePlayed: 0,
    totalPercentPlayed: 0
  };

  // Array of percentages where we want to push a dataLayer event
  const datalayerEvents = [0, 5, 25, 50, 75, 90, 100]
  let pushedEvents = [] // We will store already pushed events here, to avoid double pushing

  // Add event listener to fire updates on video time updates
  let totalTime = 0
  let percentTime = 0
  let previousTime // Init previousTime to undefined so that currentTime is used for totalTime on the first call
  player.addEventListener("timeupdate", (event) => {
    if (!player.seeking) { // We need this check for rare events where, on a seek, timeupdate fires before seeking
      const currentTime = event.target.currentTime;
      let difference = currentTime - (previousTime || currentTime); // Set to 0 if previousTime is undefined
            
      if (difference < 0 || difference > 30) { // Extra check just in case
        difference = 0
      }

      // Calculating total time played so far
      totalTime = difference + totalTime;
      player.timingData.totalTimePlayed = totalTime //Adding the value to the player object for access in other contexts

      // Calculating percent played so far (it can go over 100% for videos that were rewatched within the same play session)
      percentTime = (totalTime / player.duration) * 100
      player.timingData.totalPercentPlayed = percentTime

      // Push a dataLayer.push event if within our list of events we want to push, but don't push if it's already been pushed
      let intPercent = Math.floor(percentTime)
      debug && console.log(intPercent);
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
        debug && console.log('Pushed to dataLayer: ', `video_view_${intPercent}`);
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