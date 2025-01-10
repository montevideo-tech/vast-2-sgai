# Ad Creative Signaling Plugin

The **Ad Creative Signaling Plugin** is designed to read and execute tracking events embedded in the `X-AD-CREATIVE-SIGNALING` tag, as specified in the `X-ASSET-LIST`.

## Features
- Automatically handles tracking events for creative signals.
- Seamlessly integrates with the `hls` global object.

## Getting Started

### Prerequisites
Ensure you have the `hls` object initialized in your project before using this plugin.

### Installation
Include the script for the Ad Creative Signaling Plugin in your project.

```html
<script src="https://cdn.jsdelivr.net/gh/montevideo-tech/vast-2-sgai/ad-creative-signaling/hls.js/adCreativeSignalingPlugin.js"></script>
```

### Usage
To initialize the plugin, simply pass the global hls object to the AdSignalingManager.

```html
<script>
  const adSignalingManager = new AdSignalingManager(hls);
</script>
```

### How It Works
Once initialized, the plugin automatically processes the requests defined for each creative signal, ensuring that tracking events are executed as specified in the X-AD-CREATIVE-SIGNALING tag.