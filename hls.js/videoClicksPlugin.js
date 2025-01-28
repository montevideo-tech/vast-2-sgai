class VideoClicksPlugin {
  constructor(hls, options) {
    console.log("Initializing VideoClicksPlugin");

    if (!hls || typeof hls.on !== "function") {
      throw new Error("Invalid HLS.js instance passed to the plugin.");
    }

    this.hls = hls;
    this.options = options || {};
    this.container = options.container || document.body;
    this.clickEventUrl = options.clickEventUrl || null;
    this.assetList = { ASSETS: [] };
    this.currentAdIndex = 0;

    this.container.style.position = "relative";

    this.init();
  }

  init() {
    this.hls.on(Hls.Events.INTERSTITIAL_ASSET_STARTED, (_, data) => {
      console.log("Received INTERSTITIAL_ASSET_STARTED event:", data);

      const { assetListIndex } = data;
      const assetListResponse = data.event?.assetListResponse;
      if (!assetListResponse || !assetListResponse.ASSETS?.length) {
        console.warn("No valid assets found in the response.");
        return;
      }

      this.assetList = assetListResponse;
      this.currentAdIndex = assetListIndex;
      this.hls.logger.log("Updated asset list:", this.assetList);

      this.loadAdAssets();
    });

    this.hls.on(Hls.Events.INTERSTITIAL_STARTED, () => {
      this.hls.logger.log("Interstitial started.");
    });

    this.hls.on(Hls.Events.INTERSTITIAL_ENDED, () => {
      this.hls.logger.log("Interstitial ended. Cleaning up.");
      this.cleanupAd();
    });
  }

  loadAdAssets() {
    if (this.assetList.ASSETS.length === 0) {
      this.hls.logger.warn("No ad assets to display.");
      return;
    }

    this.showAd(this.assetList.ASSETS[this.currentAdIndex]);
  }

  showAd(ad) {
    const { DURATION, "X-VAST2SGAI-VIDEOCLICKS": videoClicks } = ad;

    if (!videoClicks || !videoClicks.clickThrough?.url) {
      this.hls.logger.warn("Invalid ad configuration. Skipping this ad.");
      this.loadNextAd();
      return;
    }

    this.hls.logger.log("Displaying clickable ad:", ad);

    const adVignette = this.createAdOverlay(this.container, videoClicks);
    this.container.appendChild(adVignette);

    setTimeout(() => {
      this.hls.logger.log("Ad duration ended. Removing vignette.");
      if (this.container.contains(adVignette)) {
        this.container.removeChild(adVignette);
      }
      this.loadNextAd();
    }, DURATION * 1000);
  }

  createAdOverlay(videoContainer, videoClicks) {
    const clickThroughUrl = videoClicks.clickThrough.url;
    const clickTracking = videoClicks.clickTracking || [];

    const videoElement = videoContainer.querySelector("video");
    if (!videoElement) {
      console.error("Video element not found. Cannot position ad overlay.");
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
      this.hls.logger.log("Ad vignette clicked. Redirecting to:", clickThroughUrl);
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
      window.removeEventListener("resize", updateVignettePosition); // Clean up listener
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
        this.hls.logger.log("Removing ad vignette.");
        this.container.removeChild(overlay);
      }
    });
  }

  loadNextAd() {
    this.currentAdIndex++;
    if (this.currentAdIndex < this.assetList.ASSETS.length) {
      this.showAd(this.assetList.ASSETS[this.currentAdIndex]);
    } else {
      this.hls.logger.log("All ads finished.");
    }
  }

  sendAdClickEvent(clickTracking) {
    clickTracking.forEach((tracking) => {
      fetch(tracking.url, { method: "GET" })
        .then((response) => {
          if (response.ok) {
            this.hls.logger.log("Ad click event sent successfully.");
          } else {
            this.hls.logger.error("Failed to send ad click event.");
          }
        })
        .catch((error) => {
          this.hls.logger.error("Error sending ad click event:", error);
        });
    });
  }
}
