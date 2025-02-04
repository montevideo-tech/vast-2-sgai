class AdSignalingManager {
  constructor(hls) {
    console.log("Initializing AdSignalingManager");
    this.hls = hls;
    this.interstitialsController = hls.interstitialsController;
    this.trackingEventsQueue = [];

    hls.on(Hls.Events.INTERSTITIAL_ASSET_STARTED, async (_, data) => {
      this.assetPlayer = data.player;

      this.assetPlayer.hls.on(Hls.Events.MEDIA_ENDED, this.checkAdCreativeSignaling);
      this.signalInterval = self.setInterval(this.checkAdCreativeSignaling, 500);

      const { assetListIndex } = data;
      const assetListResponse = data.event.assetListResponse;
      const asset = assetListResponse.ASSETS?.[assetListIndex];
      const creativeSignaling = asset?.["X-AD-CREATIVE-SIGNALING"];
      const trackingEvents = creativeSignaling?.payload?.[0]?.tracking ?? [];
      this.trackingEventsQueue = trackingEvents;
    });

    hls.on(Hls.Events.INTERSTITIAL_ASSET_ENDED, async (_, data) => {
      this.cleanup();
    });
  }

  cleanup = () => {
    console.log(this.trackingEventsQueue)
    this.trackingEventsQueue = []
    this.assetPlayer = null;
    clearInterval(this.signalInterval);
  };

  checkAdCreativeSignaling = () => {
    if (!this.trackingEventsQueue) return;

    const currentTime = this.assetPlayer.currentTime;

    this.trackingEventsQueue.forEach((event, index) => {
      const tolerance = 0.75; // time difference tolerance in seconds
      if (
        ((Math.abs(currentTime - event.start) <= tolerance) || event?.start === undefined)
      ) {
        Promise.all(event.urls.map((url) => this.sendTrackingEvent(url)));
        this.trackingEventsQueue.splice(index, 1);
      }
    });
  };

  sendTrackingEvent = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        this.hls?.logger.error(
          `Error on Ad Creative Signaling event tracking request ${url}: ${response.status}`
        );
      }
    } catch (error) {
      this.hls?.logger.error(
        `Error on Ad Creative Signaling event tracking request ${url}:`,
        error
      );
    }
  };

  destroy() {
    this.cleanup();
    this.hls = this.interstitialsController = null;
  }
}
