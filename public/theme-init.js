(function () {
  var theme = null;
  try {
    var stored = window.localStorage.getItem('lb-admin-theme');
    if (stored === 'light' || stored === 'dark') theme = stored;
  } catch (e) {
    theme = null;
  }
  if (!theme) {
    var dark = false;
    try {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      dark = false;
    }
    theme = dark ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;
})();
