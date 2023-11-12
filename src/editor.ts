/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, CSSResultGroup, nothing } from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';

import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { ACInfinityPortDevice, ACInfinityControllerDevice, BoilerplateCardConfig } from './types';
import { customElement, property, state } from 'lit/decorators';
import { formfieldDefinition } from '../elements/formfield';
import { selectDefinition } from '../elements/select';
import { switchDefinition } from '../elements/switch';
import { textfieldDefinition } from '../elements/textfield';
import { Helpers } from "./helpers"

@customElement('boilerplate-card-editor')
export class BoilerplateCardEditor extends ScopedRegistryHost(LitElement) implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: BoilerplateCardConfig;

  @state() private _helpers?: any;

  private _initialized = false;

  static elementDefinitions = {
    ...textfieldDefinition,
    ...selectDefinition,
    ...switchDefinition,
    ...formfieldDefinition,
  };

  public setConfig(config: BoilerplateCardConfig): void {
    this._config = config;

    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }

    return true;
  }

  get _controller_id(): string {
    return this._config?.controller_id || "";
  }

  get _port_id(): string {
    return this._config?.port_id || "";
  }

  get _show_warning(): boolean {
    return this._config?.show_warning || false;
  }

  get _show_error(): boolean {
    return this._config?.show_error || false;
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }

    const controller_devices: Array<ACInfinityControllerDevice> = Helpers.getControllersFromEntities(this.hass);
    
    let port_devices: Array<ACInfinityPortDevice> = []
    if(this._controller_id) {
      port_devices = Helpers.getPortsFromEntities(this.hass, this._controller_id);
    }

    return html`
      <mwc-select
        naturalMenuWidth
        fixedMenuPosition
        label="UIS Controller (Required)"
        .configValue=${'controller_id'}
        .value=${this._controller_id}
        @selected=${this._valueChanged}
        @closed=${(ev) => ev.stopPropagation()}
      >
        ${controller_devices.map((controller) => {
          return html`<mwc-list-item .value=${controller.controller_id}>${controller.controller_name}</mwc-list-item>`;
        })}
      </mwc-select>
      ${port_devices.length > 0 ?
          html`<mwc-select
          naturalMenuWidth
          fixedMenuPosition
          label="UIS Device (Required)"
          .configValue=${'port_id'}
          .value=${this._port_id}
          @selected=${this._valueChanged}
          @closed=${(ev) => ev.stopPropagation()}
        >
          ${port_devices.map((port) => {
            return html`<mwc-list-item .value=${""+port.port_id}>${port.port_name}</mwc-list-item>`;
          })}
        </mwc-select>`
      : nothing}
    `;
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === '') {
        const tmpConfig = { ...this._config };
        delete tmpConfig[target.configValue];
        this._config = tmpConfig;
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  static styles: CSSResultGroup = css`
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
}
