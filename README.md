

# Theater Interactive Video Engine  
## an nwjs-based engine for making interactive full-motion video games


To run, put your module in the modules/ folder and call:
```javascript
loadModule('yourModuleName');
```

A 'module' consists of:
- a nested directory structure of video clips
- a Room Map or Graph, which describes the assets/film clips used in the 'rooms' and how they all relate to each other
- a Director, script which tells Theater how to process queries and switch among the clips within each 'room'
- a directory of images
- one or more ClientHandlers (a list of event handlers for user-input events)

  A 'room' is a grouping of film clips, sounds effects, on-screen assets, and scripted behaviors/interactions.
  In addition, a room has a set of film clips (called 'branches') that play when transferring to an adjacent room.
  A room usually corresponds to a single physical region (a 'room') in a game map, but could be any interactive montage that makes conceptual or aesthetic sense.  

  The main feature of a 'room' is usually going to be an algorithmically-generated cinematic montage. There are three basic types of such montages:
  - The first type is 'sequential'. This is the type normally seen in non-interactive movies, a set of clips except that the sequence of cuts aren't dynamically-generated.
  - The second type is an 'idle' montage, this is a sequence of clips that plays for an indeterminate length of time while awaiting a user input.
  - The third type is 'responsive', it plays in response to a user or scripted event.
