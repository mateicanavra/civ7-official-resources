import { a as DialogBoxManager } from '../../dialog-box/manager-dialog-box.chunk.js';
import { M as MainMenuReturnEvent } from '../../events/shell-events.chunk.js';
import { P as Panel, A as AnchorType } from '../../panel-support.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import '../../context-manager/display-queue-manager.js';
import '../../framework.chunk.js';

const styles = "fs://game/core/ui/shell/odr-download/odr-download.css";

class PanelDownloadAssets extends Panel {
  progressText;
  progressBarFill;
  progressData = 0;
  ODRDownloadProgressListener = this.onODRDownloadProgress.bind(this);
  ODRDownloadFinishedListener = this.onODRDownloadFinished.bind(this);
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.Fade;
  }
  onInitialize() {
    super.onInitialize();
    this.Root.innerHTML = this.render();
    this.progressText = MustGetElement(".odr-download_progress-text", this.Root);
    this.progressBarFill = MustGetElement(".odr-download_progress-bar-fill", this.Root);
  }
  onAttach() {
    super.onAttach();
    engine.on("ODRDownloadProgress", this.ODRDownloadProgressListener, this);
    engine.on("ODRDownloadFinished", this.ODRDownloadFinishedListener, this);
    this.updateProgressText();
    this.updateProgressBar();
  }
  onDetach() {
    super.onDetach();
    engine.off("ODRDownloadProgress", this.ODRDownloadProgressListener, this);
    engine.off("ODRDownloadFinished", this.ODRDownloadFinishedListener, this);
  }
  render() {
    return `
			<div class="img-bg-panel-chola fullscreen"></div>
			<div class="bg-primary-5 fullscreen opacity-50"></div>
			<div class="fullscreen flow-column">
				<div class="relative odr-download_banner-top w-full flow-column items-center">
					<div class="absolute fullscreen-outside-safezone-x fullscreen-outside-safezone-top bottom-0">
						<div class="size-full bg-primary-4"></div>
					</div>
					<div class="absolute fullscreen-outside-safezone-x fullscreen-outside-safezone-top bottom-0">
						<div class="size-full border-b-secondary-2 border-b-4 opacity-50"></div>
					</div>
					<div class="absolute fullscreen-outside-safezone-x fullscreen-outside-safezone-top bottom-0 flow-row justify-center items-start">
						<div class="img-report_port_glow"></div>
					</div>
				</div>
				<div class="relative flex-auto w-full odr-download_banner-middle">
					<div class="absolute img-lsl_loading w-full h-full"></div>
					<div class="absolute w-full bottom-8 flow-row justify-center">
						<div class="text-lg font-body text-accent-2 text-shadow" data-l10n-id="LOC_UI_ODR_DOWNLOAD_DESCRIPTION"></div>
					</div>
				</div>
				<div class="relative odr-download_banner-bot w-full flow-column items-center">
					<div class="absolute fullscreen-outside-safezone-x fullscreen-outside-safezone-bot top-0">
						<div class="size-full bg-primary-5 opacity-90"></div>
					</div>
					<div class="absolute fullscreen-outside-safezone-x fullscreen-outside-safezone-bot top-0 flow-row justify-center items-end">
						<div class="img-rel_glow_larger"></div>
					</div>
					<div class="absolute fullscreen-outside-safezone-x fullscreen-outside-safezone-bot top-0 flow-row justify-center">
						<div class="absolute w-full odr-download_progress-bar-bg"></div>
						<div class="absolute odr-download_progress-bar-fill top-1 left-0 -right-1 transition-transform transition-width"></div>
						<div class="absolute odr-download_progress-bar-filigree top-0"></div>
					</div>
					<div class="relative odr-download_banner-bot_text">
						<fxs-header filigree-style="h4" class="odr-download_progress-text text-accent-2 text-xl"></fxs-header>
					</div>
				</div>
			</div>
		`;
  }
  close() {
    window.dispatchEvent(new MainMenuReturnEvent());
    super.close();
  }
  onODRDownloadProgress({ data }) {
    this.progressData = data;
    this.updateProgressText();
    this.updateProgressBar();
  }
  onODRDownloadFinished({ data }) {
    switch (data) {
      case ODRErrorCode.NetworkErrorRetry:
      case ODRErrorCode.UnknownErrorRetry:
        break;
      case ODRErrorCode.CriticalServerAssetCorrupted:
      case ODRErrorCode.UnknownErrorCritical:
        DialogBoxManager.createDialog_MultiOption({
          body: "LOC_UI_ODR_DOWNLOAD_ERROR_UNKNOWN",
          title: "LOC_UI_ODR_DOWNLOAD_ERROR_TITLE",
          canClose: false,
          options: [
            {
              actions: ["accept"],
              label: "LOC_GENERIC_RETRY",
              callback: () => UI.startHighEndAssetsDownload()
            },
            {
              actions: ["cancel", "keyboard-escape"],
              label: "LOC_GENERIC_ABORT",
              callback: () => this.close()
            }
          ]
        });
        break;
      case ODRErrorCode.NoDiskSpaceRetry:
        DialogBoxManager.createDialog_MultiOption({
          body: "LOC_UI_ODR_DOWNLOAD_ERROR_NOSPACE",
          title: "LOC_UI_ODR_DOWNLOAD_ERROR_TITLE",
          canClose: false,
          options: [
            {
              actions: ["accept"],
              label: "LOC_GENERIC_RETRY",
              callback: () => UI.startHighEndAssetsDownload()
            },
            {
              actions: ["cancel", "keyboard-escape"],
              label: "LOC_GENERIC_ABORT",
              callback: () => this.close()
            }
          ]
        });
        break;
      case ODRErrorCode.None:
        this.close();
        break;
    }
  }
  updateProgressText() {
    this.progressText.setAttribute("title", `${(this.progressData * 100).toFixed(2)}%`);
  }
  updateProgressBar() {
    this.progressBarFill.style.setProperty("width", `${this.progressData * 100}%`);
  }
}
Controls.define("odr-download", {
  createInstance: PanelDownloadAssets,
  description: "download screen for ODR",
  classNames: [
    "odr-download",
    "fullscreen",
    "flow-row",
    "justify-center",
    "items-center",
    "flex-1",
    "pointer-events-auto"
  ],
  styles: [styles],
  images: ["blp:meter_well.png", "blp:meter_fill.png"],
  tabIndex: -1
});
//# sourceMappingURL=odr-download.js.map
