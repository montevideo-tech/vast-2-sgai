class VideoClicksPlugin {
  constructor(hls, options) {
    console.log("Initializing VideoClicksPlugin");
    if (!hls || typeof hls.on !== "function") {
      throw new Error("Invalid HLS.js instance passed to the plugin.");
    }

    this.hls = hls;
    this.options = options || {};
    this.container = options.container || document.body;
    this.apiUrl = options.apiUrl || null;
    this.clickEventUrl = options.clickEventUrl  || null
    this.assetList = { ASSETS: [] };
    this.currentAdIndex = 0;

    this.container.style.position = "relative";

    this.init();
  }

  init() {
    if (!this.apiUrl) {
      hls.logger.error("API URL for fetching ads is not provided.");
      return;
    }

    this.fetchAdAssets().then((assetList) => {
      if (assetList && assetList.ASSETS.length > 0) {
        this.assetList = assetList;

        // Attach event listeners to handle interstitials
        this.hls.on(Hls.Events.INTERSTITIAL_STARTED, () => {
          hls.logger.log("Interstitial started. Loading ad assets...");
          this.loadAdAssets();
        });

        this.hls.on(Hls.Events.INTERSTITIAL_ENDED, () => {
          hls.logger.log("Interstitial ended. Cleaning up ad assets...");
          this.cleanupAd();
        });
      } else {
        hls.logger.warn("No ad assets available from API.");
      }
    }).catch((error) => {
      hls.logger.error("Error fetching ad assets:", error);
    });
  }

  async fetchAdAssets() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ad assets: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      hls.logger.error("Error during API call:", error);
      return null;
    }
  }

  loadAdAssets() {
    if (this.assetList.ASSETS.length === 0) {
      hls.logger.warn("No ad assets to display.");
      return;
    }

    this.showAd(this.assetList.ASSETS[this.currentAdIndex]);
  }

  showAd(ad) {
    const { URI, DURATION, "X-VAST2SGAI-VIDEOCLICKS": videoClicks } = ad;

    if (!videoClicks || !videoClicks.clickThrough || !videoClicks.clickThrough.url) {
      hls.logger.warn("Invalid ad configuration. Skipping this ad.");
      this.loadNextAd();
      return;
    }

    const clickthroughUrl = videoClicks.clickThrough.url;
    hls.logger.log("Displaying clickable ad:", ad);

    const adVignette = this.createAdOverlay(this.container, clickthroughUrl);
    this.container.appendChild(adVignette);

    setTimeout(() => {
      hls.logger.log("Ad duration ended. Removing vignette.");
      if (this.container.contains(adVignette)) {
        this.container.removeChild(adVignette);
      }
      this.loadNextAd();
    }, DURATION * 1000);
  }

  createAdOverlay(videoContainer, clickthroughUrl) {
    const adVignette = document.createElement("div");

    const videoRect = videoContainer.querySelector('video').getBoundingClientRect(); 
    const adVignetteWidth = adVignette.offsetWidth; 
    const adVignetteHeight = adVignette.offsetHeight;
    const leftOffset = videoRect.left + videoRect.width - adVignetteWidth - 200; 
    const topOffset = videoRect.top + 10; 
  
    adVignette.style.position = "fixed"; 
    adVignette.style.top = `${topOffset}px`;
    adVignette.style.left = `${leftOffset}px`;
    adVignette.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    adVignette.style.color = "#fff";
    adVignette.style.borderRadius = "12px";
    adVignette.style.padding = "8px 12px";
    adVignette.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.4)";
    adVignette.style.fontFamily = "Arial, sans-serif";
    adVignette.style.fontSize = "12px";
    adVignette.style.zIndex = "10000";
    adVignette.style.cursor = "pointer";
    adVignette.style.pointerEvents = "auto";

    adVignette.onclick = () => {
      hls.logger.log("Ad vignette clicked. Redirecting to:", clickthroughUrl);
      this.sendAdClickEvent(clickthroughUrl);
      window.open(clickthroughUrl, "_blank");
    };

    const adText = document.createElement("span");
    adText.textContent = "Learn more about this Ad!";
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
    };

    adVignette.appendChild(adText);
    adVignette.appendChild(closeButton);

    if (videoContainer) {
      videoContainer.style.position = "relative";
      videoContainer.appendChild(adVignette);
    } else {
      console.error("Video container not found!");
    }

    return adVignette;
  }

  cleanupAd() {
    const overlays = this.container.querySelectorAll("div");

    overlays.forEach((overlay) => {
      if (overlay.onclick) {
        hls.logger.log("Removing ad vignette.");
        this.container.removeChild(overlay);
      }
    });
  }

  loadNextAd() {
    this.currentAdIndex++;
    if (this.currentAdIndex < this.assetList.ASSETS.length) {
      this.showAd(this.assetList.ASSETS[this.currentAdIndex]);
    } else {
      hls.logger.log("All ads finished.");
    }
  }

  sendAdClickEvent(clickthroughUrl) {

    const payload = {
      event: "ad_click",
      ad_url: clickthroughUrl,
      timestamp: new Date().toISOString(),
    };
  
    fetch(this.clickEventUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          hls.logger.log("Ad click event sent successfully.");
        } else {
          hls.logger.error("Failed to send ad click event.");
        }
      })
      .catch((error) => {
        hls.logger.error("Error sending ad click event:", error);
      });
  }
}
