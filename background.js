
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    
    chrome.runtime.onInstalled.addListener(() => {
      console.log("Gemini Agent Installed");
    });
  