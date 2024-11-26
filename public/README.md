# Introduction

This demo shows how to use interstitials with HLS.js.

# Setup

Serve 'interstitials-demo' directory in a local server.


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

## Use #EXT-X-DEFINE:QUERYPARAM
Added #EXT-X-DEFINE:QUERYPARAM to the Multivariant Playlist and the Playlists, and it worked as expected. Using this approach, we can send any query parameter we want to the VAST-2-SGAI


Result: ✅ Worked as expected.

``` main.m3u8
#EXTM3U
#EXT-X-DEFINE:QUERYPARAM="user"
#EXT-X-DEFINE:QUERYPARAM="content"

#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="stereo",LANGUAGE="en",NAME="English",DEFAULT=YES,AUTOSELECT=YES,URI="audio/stereo/en/128kbit.m3u8"
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="stereo",LANGUAGE="dubbing",NAME="Dubbing",DEFAULT=NO,AUTOSELECT=YES,URI="audio/stereo/none/128kbit.m3u8"
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="surround",LANGUAGE="dubbing",NAME="Dubbing",DEFAULT=NO,AUTOSELECT=YES,URI="audio/stereo/none/128kbit.m3u8"

#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=831270,CODECS="avc1.4d4015,mp4a.40.2",AUDIO="stereo",RESOLUTION=638x272
video/800kbit.m3u8?user={$user}&content={$content}

#EXT-X-ENDLIST
```

``` 800kbit.m3u8
#EXTM3U
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-TARGETDURATION:2
#EXT-X-DEFINE:QUERYPARAM="user"
#EXT-X-DEFINE:QUERYPARAM="content"

#EXT-X-DATERANGE:ID="ad1",CLASS="com.apple.hls.interstitial",START-DATE="2024-11-13T13:55:05.000Z",DURATION=45.000,X-ASSET-LIST="/assets/ads/ads.json?user={$user}&content={$content}",X-RESUME-OFFSET=0,X-RESTRICT="SKIP,JUMP"

#EXT-X-PROGRAM-DATE-TIME:2024-11-13T13:55:00.000Z
...

```