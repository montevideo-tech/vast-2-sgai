const QUARTILE = "quartile";

class TrackingEvent {
  constructor(type, duration, urls) {
    this.type = type;
    this.duration = duration;
    this.urls = urls;
  }

  calculate() {
    throw new Error("calculate method must be implemented in the subclass");
  }
}

class StartEvent extends TrackingEvent {
  calculate() {
    return { type: this.type, start: 0.0, urls: this.urls };
  }
}

class FirstQuartileEvent extends TrackingEvent {
  calculate() {
    return { type: this.type, start: this.duration * 0.25, urls: this.urls };
  }
}

class MidpointEvent extends TrackingEvent {
  calculate() {
    return { type: this.type, start: this.duration * 0.5, urls: this.urls };
  }
}

class ThirdQuartileEvent extends TrackingEvent {
  calculate() {
    return { type: this.type, start: this.duration * 0.75, urls: this.urls };
  }
}

class CompleteEvent extends TrackingEvent {
  calculate() {
    return { type: this.type, start: this.duration, urls: this.urls };
  }
}

class ProgressEvent extends TrackingEvent {
  calculate() {
    return { type: this.type, start: this.duration, urls: this.urls };
  }
}

class TrackingEventFactory {
  static create(eventType, duration, urls) {
    console.log("EVENT TYPE", eventType);
    switch (eventType) {
    case "start":
      return new StartEvent(QUARTILE, duration, urls);
    case "firstQuartile":
      return new FirstQuartileEvent(QUARTILE, duration, urls);
    case "midpoint":
      return new MidpointEvent(QUARTILE, duration, urls);
    case "thirdQuartile":
      return new ThirdQuartileEvent(QUARTILE, duration, urls);
    case "complete":
      return new CompleteEvent(QUARTILE, duration, urls);
    default:
      if (eventType.includes("progress")) {
        return new ProgressEvent(QUARTILE, duration, urls);
      }
      else {
        return null;
      }
    }
  }
}

class AdCreativeSignalingMapper {
  constructor(ad, trackingEvents) {
    this.ad = ad;
    this.trackingEvents = trackingEvents;
  }

  map() {
    const mappedTrackingEvents = [];

    for (const eventType in this.trackingEvents) {
      const urls = this.trackingEvents[eventType];
      const duration = this.ad.duration;
      const event = TrackingEventFactory.create(eventType, duration, urls);

      if (event) {
        mappedTrackingEvents.push(event.calculate());
      }
    }

    return mappedTrackingEvents;
  }
}

module.exports = { 
  AdCreativeSignalingMapper,
  TrackingEvent,
  TrackingEventFactory
};