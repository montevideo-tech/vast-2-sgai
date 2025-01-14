const { logger } = require("../utils/logger.js");
const QUARTILE = "quartile";
const IMPRESSION = "impression";

class TrackingEvent {
  constructor(type, duration, urls, start) {
    this.type = type;
    this.duration = duration;
    this.urls = urls;
    this.start = start;
  }
}

class StartEvent extends TrackingEvent {
  constructor(duration, urls) {
    super(QUARTILE, duration, urls, 0.0);
  }
}

class FirstQuartileEvent extends TrackingEvent {
  constructor(duration, urls) {
    super(QUARTILE, duration, urls, duration * 0.25);
  }
}

class MidpointEvent extends TrackingEvent {
  constructor(duration, urls) {
    super(QUARTILE, duration, urls, duration * 0.5);
  }
}

class ThirdQuartileEvent extends TrackingEvent {
  constructor(duration, urls) {
    super(QUARTILE, duration, urls, duration * 0.75);
  }
}

class CompleteEvent extends TrackingEvent {
  constructor(duration, urls) {
    super(QUARTILE, duration, urls, duration);
  }
}

class ImpressionEvent extends TrackingEvent {
  constructor(duration, urls) {
    super(IMPRESSION, duration, urls);
  }
}

class ProgressEvent extends TrackingEvent {
  constructor(type, duration, urls, startValue) {
    const start =
      typeof startValue === "string" && startValue.includes("%")
        ? (duration * parseFloat(startValue.replace("%", ""))) / 100
        : parseFloat(startValue);

    if (isNaN(start) || start < 0 || start > duration) {
      throw new Error(`Invalid start value: ${startValue}`);
    }

    super(type, duration, urls, start);
  }
}

class TrackingEventFactory {
  static create(eventType, duration, urls) {
    const eventMap = {
      start: StartEvent,
      firstQuartile: FirstQuartileEvent,
      midpoint: MidpointEvent,
      thirdQuartile: ThirdQuartileEvent,
      complete: CompleteEvent,
      impression: ImpressionEvent,
    };

    if (eventType in eventMap) {
      return new eventMap[eventType](duration, urls);
    }

    if (eventType.startsWith("progress")) {
      const progressValue = eventType.split("-")[1];
      if (progressValue !== null) {
        return new ProgressEvent(QUARTILE, duration, urls, progressValue);
      }
    }

    throw new Error(`Invalid event type: ${eventType}`);
  }
}

class AdCreativeSignalingMapper {
  constructor(ad) {
    this.ad = ad;
  }

  map() {
    const newTrackingEvents = this.ad.trackingEvents;
    
    if(this.ad?.impressions.length > 0)
      newTrackingEvents[IMPRESSION] = this.ad.impressions.map((impression) => impression.url);

    const trackingEvents = Object.entries(this.ad.trackingEvents)
      .map(([eventType, urls]) => {
        try {
          const event = TrackingEventFactory.create(
            eventType,
            this.ad.duration,
            urls
          );
          return {
            type: event.type,
            start: event.start,
            urls: event.urls,
          };
        } catch (error) {
          logger.warn(
            `Skipping invalid event: ${eventType}, Error: ${error.message}`
          );
          return null;
        }
      })
      .filter(Boolean);

    return trackingEvents;
  }
}

module.exports = {
  AdCreativeSignalingMapper,
  TrackingEvent,
  TrackingEventFactory,
};
