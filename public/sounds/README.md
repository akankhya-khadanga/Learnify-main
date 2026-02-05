# Call Ringtone

The app uses a ringtone sound file for incoming calls. The system will automatically fall back to a generated beep sound if the MP3 file is not available.

## To add a custom ringtone:

1. Place an MP3 file named `ringtone.mp3` in this directory (`public/sounds/`)
2. The app will automatically use it for incoming calls
3. If the file is missing, a beep sound will be generated using Web Audio API

## Suggested ringtone sources:
- [Zedge](https://www.zedge.net/ringtones)
- [Free Ringtones](https://www.mobile9.com/ringtones/)
- Or use any short (~5-10 second) MP3 loop

Make sure the ringtone volume is appropriate and not too loud!
