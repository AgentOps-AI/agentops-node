import * as os from 'os';
const osUtils = require('os-utils');
import { version } from '../package.json';

function getSDKDetails() {
  return {
    "AgentOps SDK Version": version,
    "Node.js Version": process.version,
  }
}

function getOSDetails() {
  return {
    "Hostname": os.hostname(),
    "OS Type": os.type(),
    "OS Platform":os.platform(),
    "OS Release": os.release()
  }
}

function getCPUDetails() {
  return {
    "Total cores": os.cpus().length,
    "CPU Usage": osUtils.cpuUsage()
  }
}

function getRAMDetails() {
  return {
    "Total": os.totalmem(),
    "Free": os.freemem()
  }
}

function getHostEnv(opt_out: boolean = false) {
  if (opt_out) {
    return {
      "SDK": getSDKDetails(),
      "OS": getOSDetails()
    }
  } else {
    return {
      "SDK": getSDKDetails(),
      "OS": getOSDetails(),
      "CPU": getCPUDetails(),
      "RAM": getRAMDetails(),
    }
  }
}