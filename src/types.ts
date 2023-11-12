import { ActionConfig, HomeAssistant, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
  interface HTMLElementTagNameMap {
    'boilerplate-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}

// TODO Add your configuration elements here for type-checking
export interface BoilerplateCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  controller_id: string;
  port_id: string;
}

export class ACInfinityControllerDevice {
  controller_id: string;
  controller_name: string;

  constructor(controller_id:string, controller_name:string) {
    this.controller_id = controller_id;
    this.controller_name = controller_name;
  }
}

export class ACInfinityPortDevice {
  controller_id: string;
  controller_name: string;
  port_id: string;
  port_name: string;

  constructor(controller_id:string, controller_name:string, port_id:string, port_name:string) {
    this.controller_id = controller_id;
    this.controller_name = controller_name;
    this.port_id = port_id;
    this.port_name = port_name;
  }
}

export interface EntitiesCardConfig extends LovelaceCardConfig {
  type: "entities";
  show_header_toggle?: boolean;
  title?: string;
  entities: Array<LovelaceRowConfig | string>;
  theme?: string;
  icon?: string;
  header?: LovelaceHeaderFooterConfig;
  footer?: LovelaceHeaderFooterConfig;
  state_color?: boolean;
}
export interface EntityConfig {
  entity: string;
  type?: string;
  name?: string;
  icon?: string;
  image?: string;
}
export interface ActionRowConfig extends EntityConfig {
  action_name?: string;
}
export interface EntityFilterEntityConfig extends EntityConfig {
  state_filter?: Array<{ key: string } | string>;
}
export interface DividerConfig {
  type: "divider";
  style?: Record<string, string>;
}
export interface SectionConfig {
  type: "section";
  label: string;
}
export interface WeblinkConfig {
  type: "weblink";
  name?: string;
  icon?: string;
  url: string;
  new_tab?: boolean;
  download?: boolean;
}
export interface TextConfig {
  type: "text";
  name: string;
  icon?: string;
  text: string;
}
export interface CallServiceConfig extends EntityConfig {
  type: "call-service";
  service: string;
  service_data?: Record<string, any>;
  action_name?: string;
}
export interface ButtonRowConfig extends EntityConfig {
  type: "button";
  action_name?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}
export interface CastConfig {
  type: "cast";
  icon?: string;
  name?: string;
  view?: string | number;
  dashboard?: string;
  // Hide the row if either unsupported browser or no API available.
  hide_if_unavailable?: boolean;
}
export interface ButtonsRowConfig {
  type: "buttons";
  entities: Array<string | EntityConfig>;
}
export type LovelaceRowConfig =
  | EntityConfig
  | DividerConfig
  | SectionConfig
  | WeblinkConfig
  | CallServiceConfig
  | CastConfig
  | ButtonRowConfig
  | ButtonsRowConfig
  | ConditionalRowConfig
  | AttributeRowConfig
  | TextConfig;

export interface LovelaceRow extends HTMLElement {
  hass?: HomeAssistant;
  editMode?: boolean;
  setConfig(config: LovelaceRowConfig);
}

export interface ConditionalRowConfig extends EntityConfig {
  row: EntityConfig;
  conditions: Condition[];
}

export interface AttributeRowConfig extends EntityConfig {
  attribute: string;
  prefix?: string;
  suffix?: string;
  format?: TimestampRenderingFormat;
}

export interface Condition {
  entity: string;
  state?: string;
  state_not?: string;
}

export const TIMESTAMP_RENDERING_FORMATS = [
  "relative",
  "total",
  "date",
  "time",
  "datetime",
] as const;

export type TimestampRenderingFormat =
  (typeof TIMESTAMP_RENDERING_FORMATS)[number];

  export interface LovelaceHeaderFooterConfig {
    type: "buttons" | "graph" | "picture";
  }
  