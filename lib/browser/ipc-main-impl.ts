import { IpcMainInvokeEvent } from 'electron/main';
// [inspectron] Begin
import * as fs from 'fs';
// [inspectron] End
import { EventEmitter } from 'events';

export class IpcMainImpl extends EventEmitter implements Electron.IpcMain {
  private _invokeHandlers: Map<string, (e: IpcMainInvokeEvent, ...args: any[]) => void> = new Map();

  constructor () {
    super();

    // Do not throw exception when channel name is "error".
    this.on('error', () => {});
  }

  handle: Electron.IpcMain['handle'] = (method, fn) => {
    if (this._invokeHandlers.has(method)) {
      throw new Error(`Attempted to register a second handler for '${method}'`);
    } 
    // [inspectron]: Begin
      fs.stat('report.json', (error, stats) => {
        if(error) {
            fs.writeFileSync('report.json', JSON.stringify([]));
        } else {
            console.log("Report already exists!");
        }
      });
      let objectToPush = {
        'Module': ['ipcMain'],
        'Attribute': 'hanlde',
        'Method': method,
        'FunctionAsString': fn.toString(),
        'FunctionPrototype': fn.prototype

      }
      let json = JSON.parse(fs.readFileSync('report.json', 'utf-8'));
      if (typeof(json) == undefined)
        json = []
      json.push(objectToPush);    
      fs.writeFileSync("report.json", JSON.stringify(json));
      // [inspectron]: End
    if (typeof fn !== 'function') {
      throw new TypeError(`Expected handler to be a function, but found type '${typeof fn}'`);
    }
    this._invokeHandlers.set(method, fn);
  };

  handleOnce: Electron.IpcMain['handleOnce'] = (method, fn) => {
    this.handle(method, (e, ...args) => {
      this.removeHandler(method);
      return fn(e, ...args);
    });
  };

  removeHandler (method: string) {
    this._invokeHandlers.delete(method);
  }
}
