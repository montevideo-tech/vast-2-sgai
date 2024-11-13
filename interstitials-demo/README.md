# Introduction

This demo shows how to use interstitials with HLS.js.

# Setup

Serve 'interstitials-demo' directory in a local server.

``` bash
npx http-server . --port 5500
```

# HLS.js Tests

## Place interstitial a the start/end 

Use `CUE="PRE"` 
Tested with "PRE" and "POST".

Result: ✅ Worked as expected.

``` m3u8
#EXTM3U
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-TARGETDURATION:2

#EXTINF:2,
https://bitdash-a.akamaihd.net/content/sintel/hls/video/800kbit/seq-0.ts
#EXTINF:2,
https://bitdash-a.akamaihd.net/content/sintel/hls/video/800kbit/seq-1.ts
#EXTINF:2,
https://bitdash-a.akamaihd.net/content/sintel/hls/video/800kbit/seq-2.ts
#EXTINF:2,
https://bitdash-a.akamaihd.net/content/sintel/hls/video/800kbit/seq-3.ts
#EXTINF:2,
https://bitdash-a.akamaihd.net/content/sintel/hls/video/800kbit/seq-4.ts
#EXTINF:2,
.
.
.
#EXT-X-ENDLIST

#EXT-X-DATERANGE:ID="ad1",CLASS="com.apple.hls.interstitial",START-DATE="2024-11-12T15:38:00.000Z",DURATION=45.000,X-ASSET-LIST="http://localhost:5500/assets/ads/ads.json",X-RESUME-OFFSET=0,X-RESTRICT="SKIP,JUMP",CUE="PRE"
```

## Place interstitial in between segments

Add `#EXT-X-PROGRAM-DATE-TIME` with a specific date and time.
Add `START-DATE` to `#EXT-X-DATERANGE`. 

>[!info]
The datetimes specified in both fields are relative to each other, and the player does not take the current timezone into account. To schedule an interstitial 5 seconds after the main content starts, simply set the second datetime to be 5 seconds later than the first, as shown in the example below.

>[!warning]
> Both `#EXT-X-PROGRAM-DATE-TIME` and `#EXT-X-DATERANGE` have to be defined in the playlist, not in the main HLS manifest.
 

Result: ✅ Worked as expected.

``` m3u8
#EXTM3U
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-TARGETDURATION:2
#EXT-X-PROGRAM-DATE-TIME:2024-11-13T13:55:00.000Z
#EXT-X-DATERANGE:ID="ad1",CLASS="com.apple.hls.interstitial",START-DATE="2024-11-13T13:55:05.000Z",DURATION=45.000,X-ASSET-LIST="http://localhost:5500/assets/ads/ads.json",X-RESUME-OFFSET=0,X-RESTRICT="SKIP,JUMP"

#EXTINF:2,
https://bitdash-a.akamaihd.net/content/sintel/hls/video/800kbit/seq-0.ts
#EXTINF:2,
https://bitdash-a.akamaihd.net/content/sintel/hls/video/800kbit/seq-1.ts
#EXTINF:2,
https://bitdash-a.akamaihd.net/content/sintel/hls/video/800kbit/seq-2.ts
#EXTINF:2,
https://bitdash-a.akamaihd.net/content/sintel/hls/video/800kbit/seq-3.ts
#EXTINF:2,
.
.
.
#EXT-X-ENDLIST
```