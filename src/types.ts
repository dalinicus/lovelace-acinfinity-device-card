export class ACInfinityControllerDevice {
    device_id: string;
    device_name: string;
  
    constructor(device_id:string, device_name:string) {
      this.device_id = device_id;
      this.device_name = device_name;
    }
  }
  
export class ACInfinityChildDevice {
    port_id: string;
    port_name: string;
  
    constructor(device_id:string, device_name:string) {
      this.port_id = device_id;
      this.port_name = device_name;
    }
  }