/* eslint-disable */
import { setupTweakUI, refreshTweakUI } from "./tweak-ui.mjs";
import { createSocket } from "./net.mjs";
import { CAR_LIBRARY, DEFAULT_CAR_ID, LEVEL_ROTATION, createLevelRotation, findCarById } from "./game-config.mjs";
    var fps            = 60;                      // how many 'update' frames per second
    var step           = 1/fps;                   // how long is each frame (in seconds)
    var width          = 1024;                    // logical canvas width
    var height         = 768;                     // logical canvas height
    var centrifugal    = 0.3;                     // centrifugal force multiplier when going around curves
    var skySpeed       = 0.001;                   // background sky layer scroll speed when going around curve (or up hill)
    var hillSpeed      = 0.002;                   // background hill layer scroll speed when going around curve (or up hill)
    var treeSpeed      = 0.003;                   // background tree layer scroll speed when going around curve (or up hill)
    var skyOffset      = 0;                       // current sky scroll offset
    var hillOffset     = 0;                       // current hill scroll offset
    var treeOffset     = 0;                       // current tree scroll offset
    var segments       = [];                      // array of road segments
    var cars           = [];                      // array of cars on the road
    var stats          = Game.stats('fps');       // mr.doobs FPS counter
    var canvas         = Dom.get('canvas');       // our canvas...
    var ctx            = canvas.getContext('2d'); // ...and its drawing context
    var background     = null;                    // our background image (loaded below)
    var sprites        = null;                    // our spritesheet (loaded below)
    var resolution     = null;                    // scaling factor to provide resolution independence (computed)
    var roadWidth      = 2000;                    // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
    var segmentLength  = 200;                     // length of a single segment
    var rumbleLength   = 3;                       // number of segments per red/white rumble strip
    var trackLength    = null;                    // z length of entire track (computed)
    var lanes          = 3;                       // number of lanes
    var fieldOfView    = 100;                     // angle (degrees) for field of view
    var cameraHeight   = 1000;                    // z height of camera
    var cameraDepth    = null;                    // z distance camera is from screen (computed)
    var drawDistance   = 300;                     // number of segments to draw
    var playerX        = 0;                       // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
    var playerZ        = null;                    // player relative z distance from camera (computed)
    var fogDensity     = 5;                       // exponential fog density
    var position       = 0;                       // current camera Z position (add playerZ to get player's absolute Z position)
    var speed          = 0;                       // current speed
    var maxSpeed       = segmentLength/step;      // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
    var accel          =  maxSpeed/5;             // acceleration rate - tuned until it 'felt' right
    var breaking       = -maxSpeed;               // deceleration rate when braking
    var decel          = -maxSpeed/5;             // 'natural' deceleration rate when neither accelerating, nor braking
    var offRoadDecel   = -maxSpeed/2;             // off road deceleration is somewhere in between
    var offRoadLimit   =  maxSpeed/4;             // limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road)
    var totalCars      = 200;                     // total number of cars on the road
    var currentLapTime = 0;                       // current lap time
    var lastLapTime    = null;                    // last lap time
    var baseCentrifugal = centrifugal;
    var baseStats      = {};
    var selectedTrack  = 'rotation';
    var rotationState  = createLevelRotation();
    var activeTrackId  = null;
    var currentCar     = findCarById(DEFAULT_CAR_ID);

    var keyLeft        = false;
    var keyRight       = false;
    var keyFaster      = false;
    var keySlower      = false;

    var hud = {
      speed:            { value: null, dom: Dom.get('speed_value')            },
      current_lap_time: { value: null, dom: Dom.get('current_lap_time_value') },
      last_lap_time:    { value: null, dom: Dom.get('last_lap_time_value')    },
      fast_lap_time:    { value: null, dom: Dom.get('fast_lap_time_value')    }
    }

const net = createSocket("ws://localhost:8080", data => { console.log("net", data); });

    //=========================================================================
    // UPDATE THE GAME WORLD
    //=========================================================================

    function update(dt) {

      var n, car, carW, sprite, spriteW;
      var playerSegment = findSegment(position+playerZ);
      var playerSprites = (globalThis.PlayerSpriteController && globalThis.PlayerSpriteController.get && globalThis.PlayerSpriteController.get()) || { straight: SPRITES.PLAYER_STRAIGHT };
      var playerW       = playerSprites.straight.w * SPRITES.SCALE;
      var speedPercent  = speed/maxSpeed;
      var dx            = dt * 2 * speedPercent; // at top speed, should be able to cross from left to right (-1 to 1) in 1 second
      var startPosition = position;

      updateCars(dt, playerSegment, playerW);

      position = Util.increase(position, dt * speed, trackLength);

      if (keyLeft)
        playerX = playerX - dx;
      else if (keyRight)
        playerX = playerX + dx;

      playerX = playerX - (dx * speedPercent * playerSegment.curve * centrifugal);

      if (keyFaster)
        speed = Util.accelerate(speed, accel, dt);
      else if (keySlower)
        speed = Util.accelerate(speed, breaking, dt);
      else
        speed = Util.accelerate(speed, decel, dt);


      if ((playerX < -1) || (playerX > 1)) {

        if (speed > offRoadLimit)
          speed = Util.accelerate(speed, offRoadDecel, dt);

        for(n = 0 ; n < playerSegment.sprites.length ; n++) {
          sprite  = playerSegment.sprites[n];
          spriteW = sprite.source.w * SPRITES.SCALE;
          if (Util.overlap(playerX, playerW, sprite.offset + spriteW/2 * (sprite.offset > 0 ? 1 : -1), spriteW)) {
            speed = maxSpeed/5;
            position = Util.increase(playerSegment.p1.world.z, -playerZ, trackLength); // stop in front of sprite (at front of segment)
            break;
          }
        }
      }

      for(n = 0 ; n < playerSegment.cars.length ; n++) {
        car  = playerSegment.cars[n];
        carW = car.sprite.w * SPRITES.SCALE;
        if (speed > car.speed) {
          if (Util.overlap(playerX, playerW, car.offset, carW, 0.8)) {
            speed    = car.speed * (car.speed/speed);
            position = Util.increase(car.z, -playerZ, trackLength);
            break;
          }
        }
      }

      playerX = Util.limit(playerX, -3, 3);     // dont ever let it go too far out of bounds
      speed   = Util.limit(speed, 0, maxSpeed); // or exceed maxSpeed

      skyOffset  = Util.increase(skyOffset,  skySpeed  * playerSegment.curve * (position-startPosition)/segmentLength, 1);
      hillOffset = Util.increase(hillOffset, hillSpeed * playerSegment.curve * (position-startPosition)/segmentLength, 1);
      treeOffset = Util.increase(treeOffset, treeSpeed * playerSegment.curve * (position-startPosition)/segmentLength, 1);

      if (position > playerZ) {
        if (currentLapTime && (startPosition < playerZ)) {
          lastLapTime    = currentLapTime;
          currentLapTime = 0;
          if (lastLapTime <= Util.toFloat(Dom.storage.fast_lap_time)) {
            Dom.storage.fast_lap_time = lastLapTime;
            updateHud('fast_lap_time', formatTime(lastLapTime));
            Dom.addClassName('fast_lap_time', 'fastest');
            Dom.addClassName('last_lap_time', 'fastest');
          }
          else {
            Dom.removeClassName('fast_lap_time', 'fastest');
            Dom.removeClassName('last_lap_time', 'fastest');
          }
          updateHud('last_lap_time', formatTime(lastLapTime));
          Dom.show('last_lap_time');
        }
        else {
          currentLapTime += dt;
        }
      }

      updateHud('speed',            5 * Math.round(speed/500));
      updateHud('current_lap_time', formatTime(currentLapTime));
      net.send({ type: 'state', carId: currentCar.id, trackId: activeTrackId, x: playerX, z: position, speed: speed, lapTime: currentLapTime });
    }

    //-------------------------------------------------------------------------

    function updateCars(dt, playerSegment, playerW) {
      var n, car, oldSegment, newSegment;
      for(n = 0 ; n < cars.length ; n++) {
        car         = cars[n];
        oldSegment  = findSegment(car.z);
        car.offset  = car.offset + updateCarOffset(car, oldSegment, playerSegment, playerW);
        car.z       = Util.increase(car.z, dt * car.speed, trackLength);
        car.percent = Util.percentRemaining(car.z, segmentLength); // useful for interpolation during rendering phase
        newSegment  = findSegment(car.z);
        if (oldSegment != newSegment) {
          index = oldSegment.cars.indexOf(car);
          oldSegment.cars.splice(index, 1);
          newSegment.cars.push(car);
        }
      }
    }

    function updateCarOffset(car, carSegment, playerSegment, playerW) {

      var i, j, dir, segment, otherCar, otherCarW, lookahead = 20, carW = car.sprite.w * SPRITES.SCALE;

      // optimization, dont bother steering around other cars when 'out of sight' of the player
      if ((carSegment.index - playerSegment.index) > drawDistance)
        return 0;

      for(i = 1 ; i < lookahead ; i++) {
        segment = segments[(carSegment.index+i)%segments.length];

        if ((segment === playerSegment) && (car.speed > speed) && (Util.overlap(playerX, playerW, car.offset, carW, 1.2))) {
          if (playerX > 0.5)
            dir = -1;
          else if (playerX < -0.5)
            dir = 1;
          else
            dir = (car.offset > playerX) ? 1 : -1;
          return dir * 1/i * (car.speed-speed)/maxSpeed; // the closer the cars (smaller i) and the greated the speed ratio, the larger the offset
        }

        for(j = 0 ; j < segment.cars.length ; j++) {
          otherCar  = segment.cars[j];
          otherCarW = otherCar.sprite.w * SPRITES.SCALE;
          if ((car.speed > otherCar.speed) && Util.overlap(car.offset, carW, otherCar.offset, otherCarW, 1.2)) {
            if (otherCar.offset > 0.5)
              dir = -1;
            else if (otherCar.offset < -0.5)
              dir = 1;
            else
              dir = (car.offset > otherCar.offset) ? 1 : -1;
            return dir * 1/i * (car.speed-otherCar.speed)/maxSpeed;
          }
        }
      }

      // if no cars ahead, but I have somehow ended up off road, then steer back on
      if (car.offset < -0.9)
        return 0.1;
      else if (car.offset > 0.9)
        return -0.1;
      else
        return 0;
    }

    //-------------------------------------------------------------------------

    function updateHud(key, value) { // accessing DOM can be slow, so only do it if value has changed
      if (hud[key].value !== value) {
        hud[key].value = value;
        Dom.set(hud[key].dom, value);
      }
    }

    function formatTime(dt) {
      var minutes = Math.floor(dt/60);
      var seconds = Math.floor(dt - (minutes * 60));
      var tenths  = Math.floor(10 * (dt - Math.floor(dt)));
      if (minutes > 0)
        return minutes + "." + (seconds < 10 ? "0" : "") + seconds + "." + tenths;
      else
        return seconds + "." + tenths;
    }

    function resolveSpriteSet(spriteKeys) {
      var fallback = {
        left: SPRITES.PLAYER_LEFT,
        right: SPRITES.PLAYER_RIGHT,
        straight: SPRITES.PLAYER_STRAIGHT,
        uphillLeft: SPRITES.PLAYER_UPHILL_LEFT,
        uphillRight: SPRITES.PLAYER_UPHILL_RIGHT,
        uphillStraight: SPRITES.PLAYER_UPHILL_STRAIGHT
      };
      if (!spriteKeys)
        return fallback;
      return {
        left: SPRITES[spriteKeys.left] || fallback.left,
        right: SPRITES[spriteKeys.right] || fallback.right,
        straight: SPRITES[spriteKeys.straight] || fallback.straight,
        uphillLeft: SPRITES[spriteKeys.uphillLeft] || fallback.uphillLeft,
        uphillRight: SPRITES[spriteKeys.uphillRight] || fallback.uphillRight,
        uphillStraight: SPRITES[spriteKeys.uphillStraight] || fallback.uphillStraight
      };
    }

    function applyCarSprites(spriteKeys) {
      var spriteSet = resolveSpriteSet(spriteKeys);
      if (globalThis.PlayerSpriteController && globalThis.PlayerSpriteController.set)
        globalThis.PlayerSpriteController.set(spriteSet);
    }

    function applyCarStats(carDef) {
      var stats = (carDef && carDef.stats) || { accel: 1, topSpeed: 1, grip: 1 };
      var gripScale = stats.grip || 1;
      currentCar = carDef || currentCar;
      applyCarSprites(carDef && carDef.spriteKeys);
      maxSpeed     = baseStats.maxSpeed * stats.topSpeed;
      accel        = baseStats.accel * stats.accel;
      breaking     = baseStats.breaking * gripScale;
      decel        = baseStats.decel;
      offRoadDecel = baseStats.offRoadDecel * gripScale;
      offRoadLimit = maxSpeed/4;
      centrifugal  = baseCentrifugal / gripScale;
      updateSelectionStatus();
    }

    //=========================================================================
    // RENDER THE GAME WORLD
    //=========================================================================

    function render() {

      var baseSegment   = findSegment(position);
      var basePercent   = Util.percentRemaining(position, segmentLength);
      var playerSegment = findSegment(position+playerZ);
      var playerPercent = Util.percentRemaining(position+playerZ, segmentLength);
      var playerY       = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
      var maxy          = height;

      var x  = 0;
      var dx = - (baseSegment.curve * basePercent);

      ctx.clearRect(0, 0, width, height);

      Render.background(ctx, background, width, height, BACKGROUND.SKY,   skyOffset,  resolution * skySpeed  * playerY);
      Render.background(ctx, background, width, height, BACKGROUND.HILLS, hillOffset, resolution * hillSpeed * playerY);
      Render.background(ctx, background, width, height, BACKGROUND.TREES, treeOffset, resolution * treeSpeed * playerY);

      var n, i, segment, car, sprite, spriteScale, spriteX, spriteY;

      for(n = 0 ; n < drawDistance ; n++) {

        segment        = segments[(baseSegment.index + n) % segments.length];
        segment.looped = segment.index < baseSegment.index;
        segment.fog    = Util.exponentialFog(n/drawDistance, fogDensity);
        segment.clip   = maxy;

        Util.project(segment.p1, (playerX * roadWidth) - x,      playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
        Util.project(segment.p2, (playerX * roadWidth) - x - dx, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

        x  = x + dx;
        dx = dx + segment.curve;

        if ((segment.p1.camera.z <= cameraDepth)         || // behind us
            (segment.p2.screen.y >= segment.p1.screen.y) || // back face cull
            (segment.p2.screen.y >= maxy))                  // clip by (already rendered) hill
          continue;

        Render.segment(ctx, width, lanes,
                       segment.p1.screen.x,
                       segment.p1.screen.y,
                       segment.p1.screen.w,
                       segment.p2.screen.x,
                       segment.p2.screen.y,
                       segment.p2.screen.w,
                       segment.fog,
                       segment.color);

        maxy = segment.p1.screen.y;
      }

      for(n = (drawDistance-1) ; n > 0 ; n--) {
        segment = segments[(baseSegment.index + n) % segments.length];

        for(i = 0 ; i < segment.cars.length ; i++) {
          car         = segment.cars[i];
          sprite      = car.sprite;
          spriteScale = Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
          spriteX     = Util.interpolate(segment.p1.screen.x,     segment.p2.screen.x,     car.percent) + (spriteScale * car.offset * roadWidth * width/2);
          spriteY     = Util.interpolate(segment.p1.screen.y,     segment.p2.screen.y,     car.percent);
          Render.sprite(ctx, width, height, resolution, roadWidth, sprites, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
        }

        for(i = 0 ; i < segment.sprites.length ; i++) {
          sprite      = segment.sprites[i];
          spriteScale = segment.p1.screen.scale;
          spriteX     = segment.p1.screen.x + (spriteScale * sprite.offset * roadWidth * width/2);
          spriteY     = segment.p1.screen.y;
          Render.sprite(ctx, width, height, resolution, roadWidth, sprites, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip);
        }

        if (segment == playerSegment) {
          Render.player(ctx, width, height, resolution, roadWidth, sprites, speed/maxSpeed,
                        cameraDepth/playerZ,
                        width/2,
                        (height/2) - (cameraDepth/playerZ * Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * height/2),
                        speed * (keyLeft ? -1 : keyRight ? 1 : 0),
                        playerSegment.p2.world.y - playerSegment.p1.world.y);
        }
      }
    }

    function findSegment(z) {
      return segments[Math.floor(z/segmentLength) % segments.length]; 
    }

    //=========================================================================
    // BUILD ROAD GEOMETRY
    //=========================================================================

    function lastY() { return (segments.length == 0) ? 0 : segments[segments.length-1].p2.world.y; }

    function addSegment(curve, y) {
      var n = segments.length;
      segments.push({
          index: n,
             p1: { world: { y: lastY(), z:  n   *segmentLength }, camera: {}, screen: {} },
             p2: { world: { y: y,       z: (n+1)*segmentLength }, camera: {}, screen: {} },
          curve: curve,
        sprites: [],
           cars: [],
          color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT
      });
    }

    function addSprite(n, sprite, offset) {
      segments[n].sprites.push({ source: sprite, offset: offset });
    }

    function addRoad(enter, hold, leave, curve, y) {
      var startY   = lastY();
      var endY     = startY + (Util.toInt(y, 0) * segmentLength);
      var n, total = enter + hold + leave;
      for(n = 0 ; n < enter ; n++)
        addSegment(Util.easeIn(0, curve, n/enter), Util.easeInOut(startY, endY, n/total));
      for(n = 0 ; n < hold  ; n++)
        addSegment(curve, Util.easeInOut(startY, endY, (enter+n)/total));
      for(n = 0 ; n < leave ; n++)
        addSegment(Util.easeInOut(curve, 0, n/leave), Util.easeInOut(startY, endY, (enter+hold+n)/total));
    }

    var ROAD = {
      LENGTH: { NONE: 0, SHORT:  25, MEDIUM:   50, LONG:  100 },
      HILL:   { NONE: 0, LOW:    20, MEDIUM:   40, HIGH:   60 },
      CURVE:  { NONE: 0, EASY:    2, MEDIUM:    4, HARD:    6 }
    };


    function addStraight(num) {
      num = num || ROAD.LENGTH.MEDIUM;
      addRoad(num, num, num, 0, 0);
    }

    function addHill(num, height) {
      num    = num    || ROAD.LENGTH.MEDIUM;
      height = height || ROAD.HILL.MEDIUM;
      addRoad(num, num, num, 0, height);
    }

    function addCurve(num, curve, height) {
      num    = num    || ROAD.LENGTH.MEDIUM;
      curve  = curve  || ROAD.CURVE.MEDIUM;
      height = height || ROAD.HILL.NONE;
      addRoad(num, num, num, curve, height);
    }
        
    function addLowRollingHills(num, height) {
      num    = num    || ROAD.LENGTH.SHORT;
      height = height || ROAD.HILL.LOW;
      addRoad(num, num, num,  0,                height/2);
      addRoad(num, num, num,  0,               -height);
      addRoad(num, num, num,  ROAD.CURVE.EASY,  height);
      addRoad(num, num, num,  0,                0);
      addRoad(num, num, num, -ROAD.CURVE.EASY,  height/2);
      addRoad(num, num, num,  0,                0);
    }

    function addSCurves() {
      addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.NONE);
      addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.MEDIUM,  ROAD.HILL.MEDIUM);
      addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,   ROAD.CURVE.EASY,   -ROAD.HILL.LOW);
      addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.EASY,    ROAD.HILL.MEDIUM);
      addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM,  -ROAD.CURVE.MEDIUM, -ROAD.HILL.MEDIUM);
    }

    function addBumps() {
      addRoad(10, 10, 10, 0,  5);
      addRoad(10, 10, 10, 0, -2);
      addRoad(10, 10, 10, 0, -5);
      addRoad(10, 10, 10, 0,  8);
      addRoad(10, 10, 10, 0,  5);
      addRoad(10, 10, 10, 0, -7);
      addRoad(10, 10, 10, 0,  5);
      addRoad(10, 10, 10, 0, -2);
    }

    function addDownhillToEnd(num) {
      num = num || 200;
      addRoad(num, num, num, -ROAD.CURVE.EASY, -lastY()/segmentLength);
    }

    function buildCoastalRun() {
      addStraight(ROAD.LENGTH.SHORT);
      addLowRollingHills();
      addSCurves();
      addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
      addBumps();
      addLowRollingHills();
      addCurve(ROAD.LENGTH.LONG*2, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
      addStraight();
      addHill(ROAD.LENGTH.MEDIUM, ROAD.HILL.HIGH);
      addSCurves();
      addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);
      addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
      addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW);
      addBumps();
      addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM);
      addStraight();
      addSCurves();
      addDownhillToEnd();
    }

    function buildRidgeRally() {
      addHill(ROAD.LENGTH.MEDIUM, ROAD.HILL.HIGH);
      addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.HARD, ROAD.HILL.MEDIUM);
      addSCurves();
      addLowRollingHills(ROAD.LENGTH.MEDIUM, ROAD.HILL.HIGH);
      addCurve(ROAD.LENGTH.MEDIUM, -ROAD.CURVE.HARD, ROAD.HILL.MEDIUM);
      addBumps();
      addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
      addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
      addSCurves();
      addDownhillToEnd();
    }

    function buildSunsetSprint() {
      addStraight(ROAD.LENGTH.MEDIUM);
      addStraight(ROAD.LENGTH.LONG);
      addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.EASY, ROAD.HILL.LOW);
      addStraight(ROAD.LENGTH.MEDIUM);
      addLowRollingHills(ROAD.LENGTH.SHORT, ROAD.HILL.LOW);
      addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
      addStraight(ROAD.LENGTH.LONG);
      addBumps();
      addDownhillToEnd();
    }

    var trackBuilders = {
      'coastal-run': buildCoastalRun,
      'ridge-rally': buildRidgeRally,
      'sunset-sprint': buildSunsetSprint
    };

    function chooseTrackId(options) {
      var opts = options || {};
      if (selectedTrack === 'rotation') {
        if (!activeTrackId || opts.cycleTrack)
          activeTrackId = rotationState.nextId();
      }
      else {
        activeTrackId = selectedTrack;
      }
      return activeTrackId;
    }

    function applyStartFinishLanes() {
      segments[findSegment(playerZ).index + 2].color = COLORS.START;
      segments[findSegment(playerZ).index + 3].color = COLORS.START;
      for(var n = 0 ; n < rumbleLength ; n++)
        segments[segments.length-1-n].color = COLORS.FINISH;
    }

    function resetRoad(options) {
      segments = [];

      var trackId = chooseTrackId(options);
      var builder = trackBuilders[trackId] || trackBuilders[LEVEL_ROTATION[0].id];
      builder();

      resetSprites();
      resetCars();
      applyStartFinishLanes();

      trackLength = segments.length * segmentLength;
      updateSelectionStatus();
    }

    function resetSprites() {
      var n, i;

      addSprite(20,  SPRITES.BILLBOARD07, -1);
      addSprite(40,  SPRITES.BILLBOARD06, -1);
      addSprite(60,  SPRITES.BILLBOARD08, -1);
      addSprite(80,  SPRITES.BILLBOARD09, -1);
      addSprite(100, SPRITES.BILLBOARD01, -1);
      addSprite(120, SPRITES.BILLBOARD02, -1);
      addSprite(140, SPRITES.BILLBOARD03, -1);
      addSprite(160, SPRITES.BILLBOARD04, -1);
      addSprite(180, SPRITES.BILLBOARD05, -1);

      addSprite(240,                  SPRITES.BILLBOARD07, -1.2);
      addSprite(240,                  SPRITES.BILLBOARD06,  1.2);
      addSprite(segments.length - 25, SPRITES.BILLBOARD07, -1.2);
      addSprite(segments.length - 25, SPRITES.BILLBOARD06,  1.2);

      for(n = 10 ; n < 200 ; n += 4 + Math.floor(n/100)) {
        addSprite(n, SPRITES.PALM_TREE, 0.5 + Math.random()*0.5);
        addSprite(n, SPRITES.PALM_TREE,   1 + Math.random()*2);
      }

      for(n = 250 ; n < 1000 ; n += 5) {
        addSprite(n,     SPRITES.COLUMN, 1.1);
        addSprite(n + Util.randomInt(0,5), SPRITES.TREE1, -1 - (Math.random() * 2));
        addSprite(n + Util.randomInt(0,5), SPRITES.TREE2, -1 - (Math.random() * 2));
      }

      for(n = 200 ; n < segments.length ; n += 3) {
        addSprite(n, Util.randomChoice(SPRITES.PLANTS), Util.randomChoice([1,-1]) * (2 + Math.random() * 5));
      }

      var side, sprite, offset;
      for(n = 1000 ; n < (segments.length-50) ; n += 100) {
        side      = Util.randomChoice([1, -1]);
        addSprite(n + Util.randomInt(0, 50), Util.randomChoice(SPRITES.BILLBOARDS), -side);
        for(i = 0 ; i < 20 ; i++) {
          sprite = Util.randomChoice(SPRITES.PLANTS);
          offset = side * (1.5 + Math.random());
          addSprite(n + Util.randomInt(0, 50), sprite, offset);
        }
          
      }

    }

    function resetCars() {
      cars = [];
      var n, car, segment, offset, z, sprite, carSpeed, carDef;
      for (var n = 0 ; n < totalCars ; n++) {
        carDef = CAR_LIBRARY[n % CAR_LIBRARY.length];
        offset = Math.random() * Util.randomChoice([-0.8, 0.8]);
        z      = Math.floor(Math.random() * segments.length) * segmentLength;
        sprite = SPRITES[carDef.trafficSpriteKey] || Util.randomChoice(SPRITES.CARS);
        carSpeed  = maxSpeed/4 * carDef.stats.topSpeed + Math.random() * maxSpeed/(carDef.stats.accel > 1 ? 1.8 : 2.2);
        car = { offset: offset, z: z, sprite: sprite, speed: carSpeed, id: carDef.id, stats: carDef.stats };
        segment = findSegment(car.z);
        segment.cars.push(car);
        cars.push(car);
      }
    }

    function getTrackLabel(trackId) {
      var found = LEVEL_ROTATION.find(function(level) { return level.id === trackId; });
      return found ? found.label : trackId;
    }

    function updateSelectionStatus() {
      var statusDom = Dom.get('selectionStatus');
      var trackSelect = Dom.get('trackSelect');
      var carSelect = Dom.get('carSelect');
      var activeLabel = getTrackLabel(activeTrackId || rotationState.peek());
      if (statusDom && currentCar) {
        Dom.set(statusDom, "Car: " + currentCar.name + " (A " + currentCar.stats.accel.toFixed(2) + " / S " + currentCar.stats.topSpeed.toFixed(2) + " / G " + currentCar.stats.grip.toFixed(2) + ") \u00b7 Track: " + activeLabel);
      }
      if (trackSelect)
        trackSelect.value = selectedTrack;
      if (carSelect)
        carSelect.value = currentCar.id;
    }

    function selectCar(carId) {
      currentCar = findCarById(carId);
      speed = 0;
      applyCarStats(currentCar);
    }

    function initCarSelection() {
      var select = Dom.get('carSelect');
      if (!select)
        return;
      select.innerHTML = '';
      CAR_LIBRARY.forEach(function(car) {
        var option = document.createElement('option');
        option.value = car.id;
        option.text = car.name;
        select.appendChild(option);
      });
      select.value = currentCar.id;
      Dom.on(select, 'change', function(ev) {
        selectCar(ev.target.value);
        Dom.blur(ev);
      });
    }

    function selectTrack(trackId) {
      selectedTrack = trackId;
      if (selectedTrack === 'rotation') {
        rotationState = createLevelRotation(activeTrackId || LEVEL_ROTATION[0].id);
        activeTrackId = null;
        reset({ forceTrackReset: true, cycleTrack: true });
      }
      else {
        rotationState = createLevelRotation(trackId);
        activeTrackId = trackId;
        reset({ forceTrackReset: true });
      }
      updateSelectionStatus();
    }

    function initTrackSelection() {
      var select = Dom.get('trackSelect');
      var nextButton = Dom.get('nextTrack');
      if (!select)
        return;
      select.innerHTML = '';
      var rotationOption = document.createElement('option');
      rotationOption.value = 'rotation';
      rotationOption.text = 'Demo Rotation';
      select.appendChild(rotationOption);
      LEVEL_ROTATION.forEach(function(level) {
        var option = document.createElement('option');
        option.value = level.id;
        option.text = level.label;
        select.appendChild(option);
      });
      select.value = selectedTrack;
      Dom.on(select, 'change', function(ev) {
        Dom.blur(ev);
        selectTrack(ev.target.value);
      });
      if (nextButton) {
        Dom.on(nextButton, 'click', function(ev) {
          Dom.blur(ev);
          reset({ forceTrackReset: true, cycleTrack: true });
        });
      }
    }

    //=========================================================================
    // THE GAME LOOP
    //=========================================================================

    Game.run({
      canvas: canvas, render: render, update: update, stats: stats, step: step,
      images: ["background", "sprites"],
      keys: [
        { keys: [KEY.LEFT,  KEY.A], mode: 'down', action: function() { keyLeft   = true;  } },
        { keys: [KEY.RIGHT, KEY.D], mode: 'down', action: function() { keyRight  = true;  } },
        { keys: [KEY.UP,    KEY.W], mode: 'down', action: function() { keyFaster = true;  } },
        { keys: [KEY.DOWN,  KEY.S], mode: 'down', action: function() { keySlower = true;  } },
        { keys: [KEY.LEFT,  KEY.A], mode: 'up',   action: function() { keyLeft   = false; } },
        { keys: [KEY.RIGHT, KEY.D], mode: 'up',   action: function() { keyRight  = false; } },
        { keys: [KEY.UP,    KEY.W], mode: 'up',   action: function() { keyFaster = false; } },
        { keys: [KEY.DOWN,  KEY.S], mode: 'up',   action: function() { keySlower = false; } }
      ],
      ready: function(images) {
        background = images[0];
        sprites    = images[1];
        initCarSelection();
        initTrackSelection();
        reset({ forceTrackReset: true, cycleTrack: true });
        Dom.storage.fast_lap_time = Dom.storage.fast_lap_time || 180;
        updateHud('fast_lap_time', formatTime(Util.toFloat(Dom.storage.fast_lap_time)));
      }
    });

    function reset(options) {
      options       = options || {};
      canvas.width  = width  = Util.toInt(options.width,          width);
      canvas.height = height = Util.toInt(options.height,         height);
      lanes                  = Util.toInt(options.lanes,          lanes);
      roadWidth              = Util.toInt(options.roadWidth,      roadWidth);
      cameraHeight           = Util.toInt(options.cameraHeight,   cameraHeight);
      drawDistance           = Util.toInt(options.drawDistance,   drawDistance);
      fogDensity             = Util.toInt(options.fogDensity,     fogDensity);
      fieldOfView            = Util.toInt(options.fieldOfView,    fieldOfView);
      segmentLength          = Util.toInt(options.segmentLength,  segmentLength);
      rumbleLength           = Util.toInt(options.rumbleLength,   rumbleLength);
      cameraDepth            = 1 / Math.tan((fieldOfView/2) * Math.PI/180);
      playerZ                = (cameraHeight * cameraDepth);
      resolution             = height/480;
      baseStats.maxSpeed     = segmentLength/step;
      baseStats.accel        = baseStats.maxSpeed/5;
      baseStats.breaking     = -baseStats.maxSpeed;
      baseStats.decel        = -baseStats.maxSpeed/5;
      baseStats.offRoadDecel = -baseStats.maxSpeed/2;
      baseStats.offRoadLimit = baseStats.maxSpeed/4;
      applyCarStats(currentCar);
      refreshTweakUI();

      if ((segments.length==0) || options.forceTrackReset || (options.segmentLength) || (options.rumbleLength))
        resetRoad(options); // only rebuild road when necessary
    }

    //=========================================================================

setupTweakUI();
