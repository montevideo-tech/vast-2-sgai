class AdSignalingManager {
  constructor(hls) {
    console.log("Initializing AdSignalingManager");
    this.hls = hls;
    this.mediaAttached = hls.interstitialsController.media;
    this.firedEvents = new Set();
    this.trackingEvents = [];

    hls.on(Hls.Events.INTERSTITIAL_ASSET_PLAYER_CREATED, (_, event) => {
      event.player.hls.on(Hls.Events.MEDIA_ATTACHED, (_, { media }) => {
        this.removeMediaListeners();
        this.mediaAttached = media;
        this.mediaAttached.addEventListener('timeupdate', this.checkAdCreativeSignaling);
      });
    });

    hls.on(Hls.Events.INTERSTITIAL_ASSET_STARTED, (_, data) => {
      const { assetListIndex } = data;
      const assetListResponse = data.event.assetListResponse;
      const asset = assetListResponse.ASSETS?.[assetListIndex];
      const creativeSignaling = asset?.["X-AD-CREATIVE-SIGNALING"];
      const trackingEvents = creativeSignaling?.payload?.[0]?.tracking ?? [];
      this.trackingEvents = trackingEvents;
    });
  }

  removeMediaListeners = () => {
    if (!this.mediaAttached) return;
    this.firedEvents = new Set();
    this.mediaAttached.removeEventListener('timeupdate', this.checkAdCreativeSignaling);
  }

  checkAdCreativeSignaling = () => {
    if (!this.trackingEvents) return;
  
    const media = this.mediaAttached;
    if (!media) return;
  
    const currentTime = media.currentTime;
  
    this.trackingEvents.forEach((event) => {
      const eventKey = `${event.type}-${event.start}`;
  
      if (currentTime >= event.start && !this.firedEvents.has(eventKey)) {
        this.firedEvents.add(eventKey);
  
        Promise.all(event.urls.map((url) => this.sendTrackingEvent(url)));
      }
    });
  };

  sendTrackingEvent = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        this.hls?.logger.error(
          `Error on Ad Creative Signaling event tracking request ${url}: ${response.status}`,
        );
      }
    } catch (error) {
      this.hls?.logger.error(
        `Error on Ad Creative Signaling event tracking request ${url}:`,
        error,
      );
    }
  };
}