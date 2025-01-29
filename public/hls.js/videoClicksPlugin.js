class VideoClicksPlugin {
  constructor(hls, options) {
    if (!hls || typeof hls.on !== "function") {
      throw new Error("Invalid HLS.js instance passed to the plugin.");
    }

    this.hls = hls;
    this.options = options || {};
    this.container = options.container || document.body;
    this.clickEventUrl = options.clickEventUrl || null;
    this.assetList = { ASSETS: [] };
    this.currentAdIndex = 0;
    this.isAdPlaying = false;
    this.adVignette = null;

    this.container.style.position = "relative";

    this.init();
  }

  init() {
    this.hls.on(Hls.Events.INTERSTITIAL_ASSET_STARTED, (_, data) => {
      const { assetListIndex } = data;
      const assetListResponse = data.event?.assetListResponse;
      if (!assetListResponse || !assetListResponse.ASSETS?.length) {
        return;
      }

      this.assetList = assetListResponse;
      this.currentAdIndex = assetListIndex;

      this.loadAdAssets();
    });

    this.hls.on(Hls.Events.INTERSTITIAL_ASSET_ENDED, () => {
      if (this.adVignette && this.container.contains(this.adVignette)) {
        this.container.removeChild(this.adVignette);
      }
      this.isAdPlaying = false;
    });

    this.hls.on(Hls.Events.INTERSTITIAL_ENDED, () => {
      this.cleanupAd();
    });
  }

  loadAdAssets() {
    if (this.assetList.ASSETS.length === 0) {
      return;
    }

    this.showAd(this.assetList.ASSETS[this.currentAdIndex]);
  }

  showAd(ad) {
    if (this.isAdPlaying) return;

    const { DURATION, "X-VAST2SGAI-VIDEOCLICKS": videoClicks } = ad;

    if (!videoClicks || !videoClicks.clickThrough?.url) {
      this.loadNextAd();
      return;
    }

    this.isAdPlaying = true;
    this.adVignette = this.createAdOverlay(this.container, videoClicks);
    this.container.appendChild(this.adVignette);

    setTimeout(() => {
      if (this.container.contains(this.adVignette)) {
        this.container.removeChild(this.adVignette);
      }
      this.loadNextAd();
    }, DURATION * 1000);
  }

  createAdOverlay(videoContainer, videoClicks) {
    const clickThroughUrl = videoClicks.clickThrough.url;
    const clickTracking = videoClicks.clickTracking || [];
    const videoElement = videoContainer.querySelector("video");
    if (!videoElement) {
      return;
    }

    videoContainer.style.position = "relative";

    const adVignette = document.createElement("div");
    adVignette.style.position = "absolute"; 
    adVignette.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    adVignette.style.color = "#fff";
    adVignette.style.borderRadius = "12px";
    adVignette.style.padding = "8px 12px";
    adVignette.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.4)";
    adVignette.style.fontFamily = "Arial, sans-serif";
    adVignette.style.fontSize = "12px";
    adVignette.style.zIndex = "10"; 
    adVignette.style.cursor = "pointer";
    adVignette.style.pointerEvents = "auto";
    adVignette.style.display = "inline-flex";
    adVignette.style.alignItems = "center";
    adVignette.style.minWidth = "150px";
    adVignette.style.justifyContent = "space-between";

    const updateVignettePosition = () => {
      const videoRect = videoElement.getBoundingClientRect();
      adVignette.style.top = "10px"; 
      adVignette.style.left = `${videoRect.width - 200}px`; 
    };

    updateVignettePosition();
    window.addEventListener("resize", updateVignettePosition);

    adVignette.onclick = () => {
      this.sendAdClickEvent(clickTracking);
      window.open(clickThroughUrl, "_blank");
    };

    const adText = document.createElement("span");
    adText.textContent = new URL(clickThroughUrl).hostname + "...";
    adText.style.marginRight = "8px";

    const closeButton = document.createElement("button");
    closeButton.textContent = "✖";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.color = "#fff";
    closeButton.style.fontSize = "12px";
    closeButton.style.cursor = "pointer";
    closeButton.style.marginLeft = "5px";
    closeButton.onclick = (event) => {
      event.stopPropagation();
      adVignette.style.opacity = "0";
      setTimeout(() => adVignette.remove(), 300);
      window.removeEventListener("resize", updateVignettePosition);
    };

    adVignette.appendChild(adText);
    adVignette.appendChild(closeButton);
    videoContainer.appendChild(adVignette);

    return adVignette;
  }

  cleanupAd() {
    const overlays = this.container.querySelectorAll("div");
    overlays.forEach((overlay) => {
      if (overlay.onclick) {
        this.container.removeChild(overlay);
      }
    });
  }

  loadNextAd() {
    this.currentAdIndex++;
    if (this.currentAdIndex < this.assetList.ASSETS.length) {
      this.showAd(this.assetList.ASSETS[this.currentAdIndex]);
    } else {
      this.isAdPlaying = false;
    }
  }

  sendAdClickEvent(clickTracking) {
    clickTracking.forEach((tracking) => {
      fetch(tracking.url, { method: "GET" }).catch(() => {});
    });
  }
}
