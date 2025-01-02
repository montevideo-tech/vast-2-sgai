const QUARTILE = "quartile";

class TrackingEvent {
  constructor(type, duration, urls, start) {
    this.type = type;
    this.duration = duration;
    this.urls = urls;
    this.start = start;
  }
}

class StartEvent extends TrackingEvent {
  constructor(type, duration, urls) {
    super(type, duration, urls, 0.0);
  }
}

class FirstQuartileEvent extends TrackingEvent {
  constructor(type, duration, urls) {
    super(type, duration, urls, duration * 0.25);
  }
}

class MidpointEvent extends TrackingEvent {
  constructor(type, duration, urls) {
    super(type, duration, urls, duration * 0.5);
  }
}

class ThirdQuartileEvent extends TrackingEvent {
  constructor(type, duration, urls) {
    super(type, duration, urls, duration * 0.75);
  }
}

class CompleteEvent extends TrackingEvent {
  constructor(type, duration, urls) {
    super(type, duration, urls, duration);
  }
}

class ProgressEvent extends TrackingEvent {
  constructor(type, duration, urls, startValue) {
    const start =
      typeof startValue === "string" && startValue.includes("%")
        ? duration * parseFloat(startValue.replace("%", "")) / 100
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
    };

    if (eventType in eventMap) {
      return new eventMap[eventType](QUARTILE, duration, urls);
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
  constructor(ad, trackingEvents) {
    this.ad = ad;
    this.trackingEvents = trackingEvents;
  }

  map() {
    return Object.entries(this.trackingEvents)
      .map(([eventType, urls]) => {
        try {
          const event = TrackingEventFactory.create(eventType, this.ad.duration, urls);
          return {
            type: event.type,
            start: event.start,
            urls: event.urls,
          };
        } catch (error) {
          console.warn(`Skipping invalid event: ${eventType}, Error: ${error.message}`);
          return null;
        }
      })
      .filter(Boolean);
  }
}

module.exports = {
  AdCreativeSignalingMapper,
  TrackingEvent,
  TrackingEventFactory,
};
