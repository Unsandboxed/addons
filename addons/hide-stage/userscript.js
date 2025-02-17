export default async function ({ addon, console, msg }) {
  let stageHidden = false;
  let bodyWrapper;
  let smallStageButton;
  let largeStageButton;
  let fullStageButton;

  function hideStage() {
    stageHidden = true;
    if (!bodyWrapper) return;
    document.body.classList.add("sa-stage-hidden-outer");
    // Inner class is applied to body wrapper so that it won't affect the project page.
    bodyWrapper.classList.add("sa-stage-hidden");
    hideStageButton.setAttribute("aria-pressed", true);
    if (smallStageButton) smallStageButton.setAttribute("aria-pressed", false);
    if (largeStageButton) largeStageButton.setAttribute("aria-pressed", false);
    if (fullStageButton) fullStageButton.setAttribute("aria-pressed", false);
    window.dispatchEvent(new Event("resize")); // resizes the code area and paint editor canvas
  }

  function unhideStage(e) {
    stageHidden = false;
    if (!bodyWrapper) return;
    document.body.classList.remove("sa-stage-hidden-outer");
    bodyWrapper.classList.remove("sa-stage-hidden");
    hideStageButton.setAttribute("aria-pressed", false);
    if (e) {
      const clickedButton = e.target.closest("button");
      if (clickedButton) clickedButton.setAttribute("aria-pressed", true);
    } else if (addon.tab.redux.state) {
      const selectedStageSize = addon.tab.redux.state.scratchGui.stageSize.stageSize;
      if (smallStageButton) smallStageButton.setAttribute("aria-pressed", selectedStageSize === "small");
      if (largeStageButton) largeStageButton.setAttribute("aria-pressed", selectedStageSize === "large");
      if (fullStageButton) fullStageButton.setAttribute("aria-pressed", selectedStageSize === "full");
    }
    window.dispatchEvent(new Event("resize")); // resizes the code area and paint editor canvas
  }

  const hideStageButton = Object.assign(document.createElement("button"), {
    type: "button",
    className: addon.tab.scratchClass("toggle-buttons_button", { others: "sa-hide-stage-button" }),
    title: msg("hide-stage"),
  });
  hideStageButton.setAttribute("aria-label", msg("hide-stage"));
  hideStageButton.setAttribute("aria-pressed", false);
  const hideStageIcon = Object.assign(addon.tab.recolorable(), {
    className: addon.tab.scratchClass("stage-header_stage-button-icon"),
    src: addon.self.dir + "/icon.svg",
    draggable: false,
  });
  hideStageIcon.setAttribute("aria-hidden", true);
  hideStageButton.appendChild(hideStageIcon);
  hideStageButton.addEventListener("click", hideStage);

  addon.self.addEventListener("disabled", () => {
    unhideStage();
    hideStageButton.remove();
  });
  addon.self.addEventListener("reenabled", () => {
    const stageControls = document.querySelector(
      "[class*='stage-header_stage-size-toggle-group_'] > [class*='toggle-buttons_row_']"
    );
    if (stageControls) stageControls.insertBefore(hideStageButton, smallStageButton);
  });

  while (true) {
    const stageControls = await addon.tab.waitForElement(
      "[class*='stage-header_stage-size-toggle-group_'] > [class*='toggle-buttons_row_']",
      {
        markAsSeen: true,
        reduxCondition: (state) => !state.scratchGui.mode.isPlayerOnly,
      }
    );
    bodyWrapper = document.querySelector("[class*='gui_body-wrapper_']");

    const stageButtons = Array.from(stageControls.querySelectorAll("button"));
    smallStageButton = stageButtons[0];
    largeStageButton = stageButtons.length === 3 ? stageButtons[1] : null;
    fullStageButton = stageButtons[stageButtons.length - 1];

    if (!addon.self.disabled) stageControls.insertBefore(hideStageButton, smallStageButton);
    if (stageHidden) hideStage();
    else unhideStage();

    if (smallStageButton) smallStageButton.addEventListener("click", unhideStage);
    if (largeStageButton) largeStageButton.addEventListener("click", unhideStage);
    if (fullStageButton) fullStageButton.addEventListener("click", unhideStage);
  }
}
