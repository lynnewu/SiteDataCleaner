document.getElementById('clearAll').addEventListener('click', () => {
  console.log('Clear all button clicked');
  getActiveTab((tab) => {
    if (!tab || !tab.url) {
      console.error('Tab URL is undefined');
      return;
    }

    try {
      const url = new URL(tab.url);
      const domain = url.hostname;
      const reload = document.getElementById('reloadPage').checked;

      console.log('Current tab URL:', url.href);
      console.log('Domain:', domain);
      console.log('Reload after clearing:', reload);

      const cookiesCleared = clearCookies(domain);
      const localStorageCleared = clearLocalStorage(tab.id);
      const sessionStorageCleared = clearSessionStorage(tab.id);
      const serviceWorkersCleared = clearServiceWorkers(tab.id);

      alert(`Clearing results:\nCookies: ${cookiesCleared}\nLocal Storage: ${localStorageCleared}\nSession Storage: ${sessionStorageCleared}\nService Workers: ${serviceWorkersCleared}`);
      if (reload) {
        console.log('Reloading page');
        chrome.tabs.reload(tab.id);
      }
    } catch (error) {
      console.error('Invalid URL:', tab.url, error);
    }
  });
});

function getActiveTab(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) {
      console.error('Error querying tabs:', chrome.runtime.lastError);
      return;
    }

    if (tabs.length === 0) {
      console.error('No active tab found');
      return;
    }

    callback(tabs[0]);
  });
}

function clearCookies(domain) {
  try {
    chrome.cookies.getAll({ domain }, (cookies) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting cookies:', chrome.runtime.lastError);
        return false;
      }

      console.log('Cookies found:', cookies.length);
      for (let cookie of cookies) {
        let url = `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`;
        console.log('Removing cookie:', cookie.name, 'from', url);
        chrome.cookies.remove({ url, name: cookie.name }, (details) => {
          if (chrome.runtime.lastError) {
            console.error('Error removing cookie:', chrome.runtime.lastError);
          }
        });
      }
      console.log('Cookies cleared.');
    });
    return true;
  } catch (error) {
    console.error('Exception in clearCookies:', error);
    return false;
  }
}

function clearLocalStorage(tabId) {
  try {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: function() {
        localStorage.clear();
      }
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.error('Error clearing local storage:', chrome.runtime.lastError);
        return false;
      } else {
        console.log('Local storage cleared.');
        return true;
      }
    });
  } catch (error) {
    console.error('Exception in clearLocalStorage:', error);
    return false;
  }
}

function clearSessionStorage(tabId) {
  try {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: function() {
        sessionStorage.clear();
      }
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.error('Error clearing session storage:', chrome.runtime.lastError);
        return false;
      } else {
        console.log('Session storage cleared.');
        return true;
      }
    });
  } catch (error) {
    console.error('Exception in clearSessionStorage:', error);
    return false;
  }
}

function clearServiceWorkers(tabId) {
  try {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: function() {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((registration) => {
              registration.unregister().then((success) => {
                if (success) {
                  console.log('Service worker unregistered:', registration);
                } else {
                  console.error('Service worker unregistration failed:', registration);
                }
              });
            });
          });
        }
      }
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.error('Error clearing service workers:', chrome.runtime.lastError);
        return false;
      } else {
        console.log('Service workers cleared.');
        return true;
      }
    });
  } catch (error) {
    console.error('Exception in clearServiceWorkers:', error);
    return false;
  }
}
