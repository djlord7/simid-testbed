(function () {
  const widgetBtn = document.createElement('button');
  widgetBtn.innerText = 'Try Now';
  widgetBtn.style.position = 'absolute';
  widgetBtn.style.bottom = '20px';
  widgetBtn.style.right = '20px';
  widgetBtn.style.zIndex = '9999';
  widgetBtn.style.padding = '10px 18px';
  widgetBtn.style.background = '#00aaff';
  widgetBtn.style.color = 'white';
  widgetBtn.style.border = 'none';
  widgetBtn.style.borderRadius = '6px';
  document.body.appendChild(widgetBtn);

  const iframe = document.createElement('iframe');
  iframe.src = 'https://tech-iion.github.io/advertiser-creatives/allKinds/';
  iframe.style.position = 'absolute';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.display = 'none';
  iframe.style.zIndex = '9998';
  document.body.appendChild(iframe);

  widgetBtn.addEventListener('click', function () {
    iframe.style.display = 'block';
    if (window.parent) {
      window.parent.postMessage(JSON.stringify({
        type: 'requestPauseVideo'
      }), '*');
    }
  });

  window.parent.postMessage(JSON.stringify({
    type: 'creativeReady'
  }), '*');
})();
