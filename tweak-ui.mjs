/* global Dom, Util */
export function setupTweakUI(callbacks) {
  var reset = callbacks.reset;
  Dom.on('resolution', 'change', function(ev) {
    var w, h;
    switch(ev.target.options[ev.target.selectedIndex].value) {
      case 'fine':   w = 1280; h = 960; break;
      case 'high':   w = 1024; h = 768; break;
      case 'medium': w = 640;  h = 480; break;
      case 'low':    w = 480;  h = 360; break;
    }
    reset({ width: w, height: h });
    Dom.blur(ev);
  });

  Dom.on('lanes',          'change', function(ev) { Dom.blur(ev); reset({ lanes:         ev.target.options[ev.target.selectedIndex].value }); });
  Dom.on('roadWidth',      'input',  function(ev) { reset({ roadWidth:     Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });
  Dom.on('roadWidth',      'change', function(ev) { Dom.blur(ev); });
  Dom.on('cameraHeight',   'input',  function(ev) { reset({ cameraHeight:  Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });
  Dom.on('cameraHeight',   'change', function(ev) { Dom.blur(ev); });
  Dom.on('drawDistance',   'input',  function(ev) { reset({ drawDistance:  Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });
  Dom.on('drawDistance',   'change', function(ev) { Dom.blur(ev); });
  Dom.on('fieldOfView',    'input',  function(ev) { reset({ fieldOfView:   Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });
  Dom.on('fieldOfView',    'change', function(ev) { Dom.blur(ev); });
  Dom.on('fogDensity',     'input',  function(ev) { reset({ fogDensity:    Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max'))) }); });
  Dom.on('fogDensity',     'change', function(ev) { Dom.blur(ev); });

  // Do not call refreshTweakUI here, let the caller handle it or pass state
  // Or better, if caller passes state, we can call it.
}

export function refreshTweakUI(state) {
  var lanes        = state.lanes;
  var roadWidth    = state.roadWidth;
  var cameraHeight = state.cameraHeight;
  var drawDistance = state.drawDistance;
  var fieldOfView  = state.fieldOfView;
  var fogDensity   = state.fogDensity;

  Dom.get('lanes').selectedIndex = lanes-1;
  Dom.get('currentRoadWidth').innerHTML      = Dom.get('roadWidth').value      = roadWidth;
  Dom.get('currentCameraHeight').innerHTML   = Dom.get('cameraHeight').value   = cameraHeight;
  Dom.get('currentDrawDistance').innerHTML   = Dom.get('drawDistance').value   = drawDistance;
  Dom.get('currentFieldOfView').innerHTML    = Dom.get('fieldOfView').value    = fieldOfView;
  Dom.get('currentFogDensity').innerHTML     = Dom.get('fogDensity').value     = fogDensity;
}
