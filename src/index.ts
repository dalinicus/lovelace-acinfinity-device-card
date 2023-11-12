import { ToggleCardTypeScript } from "./card";
import { ToggleCardTypeScriptEditor } from "./editor";

declare global {
  interface Window {
    customCards: Array<Object>;
  }
}

customElements.define("acinfinity-device-card", ToggleCardTypeScript);
customElements.define(
  "toggle-card-typescript-editor",
  ToggleCardTypeScriptEditor
);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "acinfinity-device-card",
  name: "AC Infinity Device Card",
  description: "Card for interacting with a AC Infinity device connected through a UIS Controller",
});