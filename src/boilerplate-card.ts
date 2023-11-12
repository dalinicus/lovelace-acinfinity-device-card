/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers

import type { ACInfinityControllerDevice, BoilerplateCardConfig, EntitiesCardConfig, LovelaceRowConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { ATTR_KEY_CONTROLLER_NAME, ATTR_KEY_DATA_KEY, ATTR_KEY_PORT_NAME, CARD_VERSION, SENSOR_PORT_KEY_ONLINE, SENSOR_PORT_KEY_SPEAK, SENSOR_SETTING_KEY_SURPLUS, SETTING_KEY_AT_TYPE, SETTING_KEY_AUTO_HUMIDITY_HIGH_ENABLED, SETTING_KEY_AUTO_HUMIDITY_HIGH_TRIGGER, SETTING_KEY_AUTO_HUMIDITY_LOW_ENABLED, SETTING_KEY_AUTO_HUMIDITY_LOW_TRIGGER, SETTING_KEY_AUTO_TEMP_HIGH_ENABLED, SETTING_KEY_AUTO_TEMP_HIGH_TRIGGER, SETTING_KEY_AUTO_TEMP_LOW_ENABLED, SETTING_KEY_AUTO_TEMP_LOW_TRIGGER, SETTING_KEY_CYCLE_DURATION_OFF, SETTING_KEY_CYCLE_DURATION_ON, SETTING_KEY_OFF_SPEED, SETTING_KEY_ON_SPEED, SETTING_KEY_SCHEDULED_END_TIME, SETTING_KEY_SCHEDULED_START_TIME, SETTING_KEY_TIMER_DURATION_TO_OFF, SETTING_KEY_TIMER_DURATION_TO_ON, SETTING_KEY_VPD_HIGH_ENABLED, SETTING_KEY_VPD_HIGH_TRIGGER, SETTING_KEY_VPD_LOW_ENABLED, SETTING_KEY_VPD_LOW_TRIGGER } from './const';
import { localize } from './localize/localize';
import { Helpers } from './helpers';
import { HassEntity } from 'home-assistant-js-websocket';

/* eslint no-console: 0 */
console.info(
  `%c  BOILERPLATE-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'boilerplate-card',
  name: 'Boilerplate Card',
  description: 'A template custom card for you to create something awesome',
});

// TODO Name your custom element
@customElement('boilerplate-card')
export class BoilerplateCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor');
    return document.createElement('boilerplate-card-editor');
  }

  public static getStubConfig(): Record<string, unknown> {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  // https://lit.dev/docs/components/properties/
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: BoilerplateCardConfig;

  // https://lit.dev/docs/components/properties/#accessors-custom
  public setConfig(config: BoilerplateCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      name: 'Boilerplate',
      ...config,
    };
  }

  // https://lit.dev/docs/components/lifecycle/#reactive-update-cycle-performing
  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  // https://lit.dev/docs/components/rendering/
  protected render(): TemplateResult | void {
    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }
    
    if(this.config.controller_id && this.config.port_id) {
      const entities = Helpers.getACInfinityPortDevices(this.hass, this.config.controller_id, this.config.port_id);
      if(entities.length <= 0) {
        return this._showWarning("Configured device has no entities")
      }

      const controllerName = entities[0].attributes[ATTR_KEY_CONTROLLER_NAME];
      const portName = entities[0].attributes[ATTR_KEY_PORT_NAME];
      
      const baseEntities:HassEntity[] = this._getEntitiesIfExists(entities, [
        SENSOR_PORT_KEY_ONLINE,
        SENSOR_PORT_KEY_SPEAK,
        SETTING_KEY_AT_TYPE,
        SETTING_KEY_ON_SPEED,
        SETTING_KEY_OFF_SPEED,
      ])

      const mode = entities.find(x => x.attributes[ATTR_KEY_DATA_KEY] == SETTING_KEY_AT_TYPE)
      let modeEntities:HassEntity[] = []
      if(mode) {
        switch(mode?.state) {
          case "Off": { 
            // no additional fields
            break;
          }
          case "On": { 
            // no additional fields
            break;
          }
          case "Auto": { 
            modeEntities = this._getEntitiesIfExists(entities, [
              SETTING_KEY_AUTO_TEMP_HIGH_ENABLED,
              SETTING_KEY_AUTO_TEMP_HIGH_TRIGGER,
              SETTING_KEY_AUTO_TEMP_LOW_ENABLED,
              SETTING_KEY_AUTO_TEMP_LOW_TRIGGER,
              SETTING_KEY_AUTO_HUMIDITY_HIGH_ENABLED,
              SETTING_KEY_AUTO_HUMIDITY_HIGH_TRIGGER,
              SETTING_KEY_AUTO_HUMIDITY_LOW_ENABLED,
              SETTING_KEY_AUTO_HUMIDITY_LOW_TRIGGER
            ])
            break;
          }
          case "Timer to On": { 
            modeEntities.concat(this._getEntitiesIfExists(entities,[
              SENSOR_SETTING_KEY_SURPLUS,
              SETTING_KEY_TIMER_DURATION_TO_ON
            ]))
            break;
          }
          case "Timer to Off": { 
            modeEntities.concat(this._getEntitiesIfExists(entities,[
              SENSOR_SETTING_KEY_SURPLUS,
              SETTING_KEY_TIMER_DURATION_TO_OFF
            ]))
            break;
          }
          case "Cycle": { 
            modeEntities.concat(this._getEntitiesIfExists(entities,[
              SENSOR_SETTING_KEY_SURPLUS,
              SETTING_KEY_CYCLE_DURATION_ON,
              SETTING_KEY_CYCLE_DURATION_OFF
            ]))
            break;
          }
          case "Schedule": { 
            modeEntities.concat(this._getEntitiesIfExists(entities,[
              SENSOR_SETTING_KEY_SURPLUS,
              SETTING_KEY_SCHEDULED_START_TIME,
              SETTING_KEY_SCHEDULED_END_TIME
            ]))
            break;
          }
          case "VPD": { 
            modeEntities.concat(this._getEntitiesIfExists(entities,[
              SETTING_KEY_VPD_HIGH_ENABLED,
              SETTING_KEY_VPD_HIGH_TRIGGER,
              SETTING_KEY_VPD_LOW_ENABLED,
              SETTING_KEY_VPD_LOW_TRIGGER
            ]))  
            break;
          }
        }
      }

      const allEntities:HassEntity[] = baseEntities.concat(modeEntities);

      const entitiesCard:any = document.createElement('hui-entities-card');
      entitiesCard.hass = this.hass
      entitiesCard.setConfig({
        title: `${controllerName} ${portName}`,
        entities: allEntities.map(x => x.entity_id),
        show_header_toggle: false,
      })

      return html`${entitiesCard}`
    }

    return this._showWarning("No device Configured")
  }

  private _getEntitiesIfExists(entities:HassEntity[], data_keys:string[]): HassEntity[] {
    const foundEntities:HassEntity[] = []
    data_keys.forEach((data_key) => {
      const current =  entities.find(x => x.attributes[ATTR_KEY_DATA_KEY] == data_key)
      if(current) {
        foundEntities.push(current)
      }
    })

    return foundEntities
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private _showWarning(warning: string): TemplateResult {
    return html` <hui-warning>${warning}</hui-warning> `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html` ${errorCard} `;
  }

  // https://lit.dev/docs/components/styles/
  static get styles(): CSSResultGroup {
    return css``;
  }
}
