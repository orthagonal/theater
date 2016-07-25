

# Theater Interactive Video Engine  
## an nwjs-based engine for making interactive full-motion video games

installation:
```
npm install theater
```

A 'module' consists of:
- a nested directory structure of video clips
- a Room Map or Graph, which describes the assets/film clips used in the 'rooms' and how they all relate to each other
- a Directory, script which tells Theater how to process queries and switch among the clips within each 'room'
- a directory of images
- one or more ClientHandlers (a list of event handlers for user-input events)

  A 'room' is a grouping of film clips, sounds, on-screen assets, behaviors, and sets of film clips (called 'branches') that play when transferring them to other rooms. A room usually corresponds to a single physical region (a 'room') in a game map, but could be any interactive montage that makes conceptual sense.  
