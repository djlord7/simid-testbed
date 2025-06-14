const NO_REQUESTED_DURATION = 0;
const UNLIMITED_DURATION = -2;

const DISABLED = true;
const ENABLED = false;

let simidPlayer = null;

function initAd() {
  console.log("🚀 initAd() called");

  if (simidPlayer) {
    simidPlayer.stopAd();
  }

  const isLinearAd = document.getElementById("linear_ad").checked;

  simidPlayer = new SimidPlayer(() => {
    console.log("🛑 Ad complete callback called");
    simidPlayer = null;
  }, isLinearAd);

  simidPlayer.initializeAd();
}

function playAd() {
  console.log("▶️ playAd() called");

  if (!simidPlayer) {
    console.log("ℹ️ simidPlayer is null, calling initAd()");
    initAd();
  }

  simidPlayer.playAd();
  simidPlayer.setCreativeControlsState_(ENABLED);
}

function closeAd() {
  console.log("❌ closeAd() called");

  if (simidPlayer) {
    simidPlayer.stopAd();
    simidPlayer.setCreativeControlsState_(DISABLED);
  }
}

function skipAd() {
  console.log("⏩ skipAd() called");

  if (simidPlayer) {
    simidPlayer.skipAd();
    simidPlayer.setCreativeControlsState_(DISABLED);
  }
}

function fatalError() {
  console.log("🔥 fatalError() called");

  if (simidPlayer) {
    simidPlayer.stopAd();
    simidPlayer.setCreativeControlsState_(DISABLED);
  }
}

function pauseAd() {
  console.log("⏸️ pauseAd(
