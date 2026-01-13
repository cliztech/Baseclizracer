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

  var bindRange = function(id, prop) {
    var update = function(ev) {
      var val = Util.limit(Util.toInt(ev.target.value), Util.toInt(ev.target.getAttribute('min')), Util.toInt(ev.target.getAttribute('max')));
      var obj = {};
      obj[prop] = val;
      reset(obj);
    };
    Dom.on(id, 'input', update);
    Dom.on(id, 'change', function(ev) { update(ev); Dom.blur(ev); });
  };

  bindRange('roadWidth',    'roadWidth');
  bindRange('cameraHeight', 'cameraHeight');
  bindRange('drawDistance', 'drawDistance');
  bindRange('fieldOfView',  'fieldOfView');
  bindRange('fogDensity',   'fogDensity');

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
