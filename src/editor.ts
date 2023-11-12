import { HomeAssistant } from "custom-card-helpers";
import { css, html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators"
import { ACInfinityChildDevice, ACInfinityControllerDevice } from "./types";
export class ToggleCardTypeScriptEditor extends LitElement {
  
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() _config;
  
  setConfig(config) {
    this._config = config;
  }

  static styles = css`
    .table {
      display: table;
    }
    .row {
      display: table-row;
    }
    .cell {
      display: table-cell;
      padding: 0.5em;
    }
    mwc-select,
    mwc-textfield {
      margin-bottom: 16px;
      display: block;
    }
    mwc-formfield {
      padding-bottom: 8px;
    }
    mwc-switch {
      --mdc-theme-secondary: var(--switch-checked-color);
    }
  `;

  get _device_id(): string {
    return this._config?.device_id || '';
  }

  get _port_id(): number {
    return this._config?.port_id || 0;
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    const entities = Object.values(this.hass.states).filter(x => "acinfinity_device_id" in x.attributes);
    
    const controllers: Array<ACInfinityControllerDevice> = [];
    for(const entity of entities) {
      const device_id = entity.attributes["acinfinity_device_id"];
      if(!controllers.some(d => d.device_id == device_id)) {
        controllers.push(new ACInfinityControllerDevice(
          device_id, entity.attributes["acinfinity_device_name"]
        ))
      }
    }

    const child_devices: Array<ACInfinityChildDevice> = [];
    if(this._device_id) {
      for(const entity of entities) {
        const port_id = entity.attributes["acinfinity_port_id"];
        if(!child_devices.some(d => d.port_id == port_id)) {
          child_devices.push(new ACInfinityChildDevice(
            port_id, entity.attributes["acinfinity_port_name"]
          ))
        }
      }
    }
    return html`
      <mwc-select
        naturalMenuWidth
        fixedMenuPosition
        label="UIS Controller (Required)"
        .configValue=${'device_id'}
        .value=${this._device_id}
        @selected=${this.handleChangedEvent}
        @closed=${(ev) => ev.stopPropagation()}
      >
        ${controllers.map((controller) => {
          return html`<mwc-list-item .value=${controller.device_id}>${controller.device_name}</mwc-list-item>`;
        })}
      </mwc-select>
      ${child_devices.length > 0 ?
          html`<mwc-select
          naturalMenuWidth
          fixedMenuPosition
          label="UIS Device (Required)"
          .configValue=${'port_id'}
          .value=${this._port_id}
          @selected=${this.handleChangedEvent}
          @closed=${(ev) => ev.stopPropagation()}
        >
          ${child_devices.map((device) => {
            return html`<mwc-list-item .value=${device.port_id}>${device.port_name}</mwc-list-item>`;
          })}
        </mwc-select>`
      : nothing}
    `;
  }

  handleChangedEvent(changedEvent: Event) {
    const target = changedEvent.target as HTMLInputElement;
    // this._config is readonly, copy needed
    const newConfig = Object.assign({}, this._config);
    if (target.id == "header") {
      newConfig.header = target.value;
    } else if (target.id == "entity") {
      newConfig.entity = target.value;
    }
    const messageEvent = new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(messageEvent);
  }
}