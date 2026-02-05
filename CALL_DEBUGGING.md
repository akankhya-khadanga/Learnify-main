# Call System Debugging Guide

## Quick Test Steps

### Step 1: Check Browser Console (MOST IMPORTANT!)

1. Open the app in your browser
2. Press `F12` to open DevTools
3. Go to the **Console** tab
4. Look for errors related to:
   - `callSignalingService`
   - `Supabase`
   - `Channel`
   - `WebRTC`

### Step 2: Test Call Flow

#### User A (Caller):
1. Go to Friends page
2. Find an online friend
3. Click the phone/video icon
4. **CHECK CONSOLE** - You should see:
   ```
   [Friends] Local ICE candidate: ...
   [CallSignaling] Call offer sent: <call-id>
   ```

#### User B (Recipient):
1. Stay on any page (Friends, Dashboard, etc.)
2. **CHECK CONSOLE** - You should see:
   ```
   [CallSignaling] Received message: call-offer
   [useCallNotifications] Incoming call: ...
   [IncomingCallModal] Ringtone file not found, using beep
   ```
3. **YOU SHOULD SEE**: Popup with "Incoming Call" and ringtone/beep

### Step 3: Common Issues

#### Issue 1: No console logs at all
**Problem**: Code not loaded or import error
**Fix**: Check browser console for import errors

#### Issue 2: "Cannot read property 'channel' of undefined"
**Problem**: Supabase client not initialized
**Fix**: Check if Supabase env vars are set

#### Issue 3: Channel subscription failed
**Problem**: Supabase Realtime not enabled
**Fix**: Need to enable Realtime in Supabase dashboard

#### Issue 4: Logs show but no popup
**Problem**: React state not updating
**Fix**: Check if IncomingCallModal is rendered in App.tsx

## Debug Logs to Look For

### When Initiating Call:
```
[Friends] Local ICE candidate: RTCIceCandidate {...}
[CallSignaling] Signal sent to <user-id> : call-offer
```

### When Receiving Call:
```
[CallSignaling] Channel status: SUBSCRIBED
[CallSignaling] Received message: call-offer Object {...}
[useCallNotifications] Incoming call: Object {...}
```

### When Accepting Call:
```
[IncomingCallModal] Local ICE candidate: ...
[CallSignaling] Call answer sent: <call-id>
```

## What to Share with Me

If it's still not working, please share:

1. **Screenshot of browser console** when you click the call button
2. **Screenshot of the other user's console** (if you can open two windows)
3. **Any red error messages**
4. **Network tab** in DevTools - filter by "realtime" to see WebSocket connections

## Quick Fix: Enable Supabase Realtime

The most common issue is Supabase Realtime not being enabled:

1. Go to Supabase Dashboard
2. Click on your project
3. Go to **Database** → **Replication**
4. Enable replication for Realtime
5. Or go to **Settings** → **API** and check if Realtime is enabled

## Manual Test Without Second User

You can test signaling by opening two browser windows:
1. Window 1: Sign in as User A
2. Window 2: Sign in as User B (different account)
3. Window 1: Call User B
4. Window 2: Should see popup!

Make sure both windows have console open (F12) to see logs.
