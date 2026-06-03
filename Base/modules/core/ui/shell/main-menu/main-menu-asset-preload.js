import { GetCivilizationData } from '../create-panels/age-civ-select-model.js';
import { getLeaderData } from '../create-panels/leader-select-model.js';

class MainMenuAssetPreload {
  preloadedTextureNames = /* @__PURE__ */ new Set();
  loadedImages = [];
  preload() {
    const listOfTexturesToPreload = [];
    const leaderData = getLeaderData().filter((l) => l.isOwned);
    for (const leader of leaderData) {
      if (leader.leaderID === "RANDOM") {
        continue;
      }
      const leaderCircleIcon = `lp_circ_${leader.leaderID.replace("LEADER_", "").toLowerCase()}_256`;
      const leaderHexIcon = `lp_hex_${leader.leaderID.replace("LEADER_", "").toLowerCase()}_256`;
      const leaderPortrait = `lsl_${leader.leaderID.replace("LEADER_", "").toLowerCase()}`;
      listOfTexturesToPreload.push(leaderCircleIcon, leaderHexIcon, leaderPortrait);
    }
    const civData = GetCivilizationData().filter((l) => l.isOwned);
    for (const civ of civData) {
      if (civ.civID === "RANDOM") {
        continue;
      }
      const backgroundName = `bg-panel-${civ.civID.replace("CIVILIZATION_", "").toLowerCase()}`;
      const civSymbolName = `civ_sym_${civ.civID.replace("CIVILIZATION_", "").toLowerCase()}`;
      const civVertIcon = UI.getIconBLP(civ.civID, "BACKGROUND_VERT");
      listOfTexturesToPreload.push(backgroundName, civSymbolName, civVertIcon);
    }
    const listOfAges = ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"];
    for (const age of listOfAges) {
      const ageVertIcon = UI.getIconBLP(age, "BACKGROUND_VERT");
      const ageHorizIcon = UI.getIconBLP(age, "BACKGROUND_HORIZ");
      listOfTexturesToPreload.push(ageVertIcon, ageHorizIcon);
    }
    const mainMenuBackgrounds = [
      "Hex_64px",
      "HourGlass",
      "ba_default",
      "base_bigframe-bg",
      "base_brightframe-bg",
      "base_button-bg",
      "base_button-bg-dis",
      "base_button-bg-focus",
      "base_button-bg-press",
      "base_checkbox-off",
      "base_checkbox-off-highlight",
      "base_checkbox-off-pressed",
      "base_checkbox-on",
      "base_checkbox-on-highlight",
      "base_component-arrow",
      "base_component-arrow_highRes",
      "base_component-arrow-flipped",
      "base_component-arrow_dis",
      "base_component-arrow_dis-flipped",
      "base_dropdown-box",
      "base_dropdown-focus",
      "base_dropdown-option-focus",
      "base_frame-bg",
      "base_frame-filigree",
      "base_number-bg",
      "base_radio-ball",
      "base_radio-bg",
      "base_radio-bg-focus",
      "base_radio-bg-on-focus",
      "base_scrollbar-handle",
      "base_scrollbar-handle-focus",
      "base_scrollbar-handle-focus_h",
      "base_scrollbar-handle_h",
      "base_scrollbar-track",
      "base_scrollbar-track_h",
      "base_slider-thumb",
      "base_tabbar-bg",
      "base_tabbar-endcap",
      "base_tabbar-selector",
      "base_ticket-bg",
      "base_tooltip-bg",
      "base_top-filigree_center",
      "base_top-filigree_left",
      "base_top-filigree_right",
      "city_antiquity",
      "city_antiquity_256x256",
      "city_exploration",
      "city_exploration_256x256",
      "city_modern",
      "city_modern_256x256",
      "civ_apex_100x100",
      "civ_timetested_100x100",
      "coherent-gt-white",
      "create_game_gradient1",
      "create_game_gradient2",
      "create_game_gradient3",
      "decro_filigree",
      "filigree_corner",
      "header_filigree",
      "hud_civics-icon_frame",
      "hud_closebutton",
      "hud_closebutton_hover",
      "hud_closebutton_pressed",
      "hud_diplo_hex-frame",
      "hud_diplo_hex-shadow",
      "hud_divider-h2",
      "hud_fleur",
      "hud_herobutton2_sideframe",
      "hud_herobutton2_sideframe-dis",
      "hud_herobutton_centerpiece",
      "hud_herobutton_centerpiece-dis",
      "hud_herobutton_centerpiece2",
      "hud_herobutton_centerpiece2-dis",
      "hud_herobutton_sideframe",
      "hud_herobutton_sideframe-dis",
      "hud_list-focus_frame",
      "hud_quest_close",
      "hud_quest_close_hov",
      "hud_quest_open",
      "hud_quest_open_hov",
      "hud_section-line_gold",
      "hud_sidepanel_bg",
      "hud_sidepanel_divider",
      "hud_sidepanel_list-bg",
      "hud_squarepanel-bg",
      "hud_turn-timer",
      "hud_unit-panel_box-bg",
      "hud_unit-panel_drawer-arrow",
      "icon_download",
      "icon_pencil",
      "icon_pencil_check",
      "icon_pencil_check_hover",
      "icon_pencil_hover",
      "leader_box",
      "leader_box_selectedrays",
      "leaderselect_xp_fill",
      "leaderselect_xp_well",
      "lp_circ_random_128",
      "memento_slot-base",
      "meter_fill",
      "meter_well",
      "min_scrollbar-handle",
      "min_scrollbar-handle-focus",
      "mm_allgradient",
      "mm_allmask",
      "mm_highlight_glow",
      "mm_highlight_rays",
      "mm_image_generic",
      "mm_leather",
      "mm_liveops_reward",
      "mm_notification",
      "modal_bg",
      "mp_connected",
      "mp_player_detail",
      "my2k_connecting_anim",
      "my2k_notloggedin",
      "nar_quest_indicator",
      "nar_reg_bg_overlay",
      "nar_reg_negative",
      "nar_rew_promotion",
      "nar_small_frame",
      "ntf_advisor_cultural_blk",
      "ntf_advisor_economic_blk",
      "ntf_advisor_expansionist_blk",
      "ntf_advisor_militaristic_blk",
      "ntf_advisor_scientific_blk",
      "ntf_diplomatic_action_blk",
      "ntf_select_capital_blk",
      "oodle_logo",
      "overlay_hex-icon",
      "pedia_circle_frame",
      "pedia_top_header",
      "popup_icon_glow",
      "popup_icon_glow_mm",
      "popup_paneltop_wide",
      "popup_silver_laurels",
      "powered_by_wwise",
      "prof_btn_bk",
      "prof_lvl_bk",
      "rollover_highlight",
      "rounded_scrollbar-track",
      "sett_age_desat",
      "sett_difficulty_desat",
      "sett_size_desat",
      "sett_speed_desat",
      "sett_type_desat",
      "settings_adv_option_100x100",
      "shell_antiquity-select",
      "shell_back-button",
      "shell_back-button-focus",
      "shell_exploration-select",
      "shell_leader-silhouette",
      "shell_line-divider",
      "shell_logo-full",
      "shell_modern-select",
      "shell_number-circle",
      "shell_random-icon_512",
      "shell_small-filigree",
      "shell_top-filigree",
      "soc_search",
      "soc_social",
      "subsystem_panel_header_icon_backing",
      "tag_equipped",
      "ticket_solid_shadow"
    ];
    listOfTexturesToPreload.push(...mainMenuBackgrounds);
    for (let i = 0; i < listOfTexturesToPreload.length; i++) {
      const textureName = listOfTexturesToPreload[i];
      listOfTexturesToPreload[i] = `blp:${textureName}`;
    }
    this.preloadTextures(listOfTexturesToPreload);
  }
  preloadTextures(images) {
    const promises = [];
    this.loadedImages = [];
    images.forEach((img) => {
      const image = new Image();
      image.src = img;
      image.style.display = "none";
      image.style.position = "absolute";
      this.loadedImages.push(image);
      const promise = new Promise((resolve, _reject) => {
        image.addEventListener("load", () => {
          resolve();
        });
        image.addEventListener("error", () => {
          resolve();
        });
      });
      promises.push(promise);
    });
    return Promise.all(promises);
  }
}
const mainMenuAssetPreload = new MainMenuAssetPreload();

export { mainMenuAssetPreload };
//# sourceMappingURL=main-menu-asset-preload.js.map
