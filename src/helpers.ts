import { HomeAssistant } from "custom-card-helpers";
import { ACInfinityPortDevice, ACInfinityControllerDevice } from "./types";
import { ATTR_KEY_CONTROLLER_ID, ATTR_KEY_CONTROLLER_NAME, ATTR_KEY_PORT_ID, ATTR_KEY_PORT_NAME } from "./const";
import { HassEntity } from "home-assistant-js-websocket";

export class Helpers {


    public static getControllersFromEntities(hass:HomeAssistant): Array<ACInfinityControllerDevice> {
        const entities = Object.values(hass.states).filter(x => ATTR_KEY_CONTROLLER_ID in x.attributes);
        const controllers: Array<ACInfinityControllerDevice> = [];
        for(const entity of entities) {
          const device_id:string = entity.attributes[ATTR_KEY_CONTROLLER_ID];
          if(!controllers.some(d => d.controller_id == device_id)) {
            controllers.push(new ACInfinityControllerDevice(
              device_id, entity.attributes[ATTR_KEY_CONTROLLER_NAME]
            ))
          }
        }
        return controllers;
    }

    public static getPortsFromEntities(hass:HomeAssistant, controller_id:string): Array<ACInfinityPortDevice> {
        const entities = Object.values(hass.states).filter(x => ATTR_KEY_CONTROLLER_ID in x.attributes);
        const ports: Array<ACInfinityPortDevice> = [];
        for(const entity of entities.filter(x => x.attributes[ATTR_KEY_CONTROLLER_ID] == controller_id)) {
            const port_id:string = entity.attributes[ATTR_KEY_PORT_ID];
            if(!ports.some(d => d.port_id == port_id)) {
                ports.push(new ACInfinityPortDevice(
                    controller_id,
                    entity.attributes[ATTR_KEY_CONTROLLER_NAME],
                    port_id, 
                    entity.attributes[ATTR_KEY_PORT_NAME]
                ))
            }
        }
        return ports;
    }

    public static getACInfinityPortDevices(hass:HomeAssistant, controller_id:string, port_id:string): HassEntity[] {
        return Object.values(hass.states).filter(x =>
             x.attributes[ATTR_KEY_CONTROLLER_ID] == controller_id && 
             x.attributes[ATTR_KEY_PORT_ID] == port_id)
    }
}
