var _a = Object.defineProperty;
var xa = (t, e, n) => e in t ? _a(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var P = (t, e, n) => (xa(t, typeof e != "symbol" ? e + "" : e, n), n);
import $ from "node:path";
import Da, { app as E, BrowserWindow as ir, shell as Qn, dialog as Oo, ipcMain as K } from "electron";
import Xe from "node:fs/promises";
import _ from "path";
import Oa, { exec as Ut, spawn as ko } from "child_process";
import Wt from "os";
import S from "fs";
import sr, { promisify as Bt } from "util";
import Co from "events";
import ka from "http";
import Ca from "https";
import { fileURLToPath as Aa } from "url";
import Ta, { NsisUpdater as La } from "electron-updater";
import Na from "crypto";
import Ia from "constants";
import Ra from "stream";
import Ao from "assert";
import zt, { chmod as To, access as Lo, constants as No } from "fs/promises";
import Un from "node:process";
import { unusedFilenameSync as ja } from "unused-filename";
import Ma from "pupa";
import Ua from "ext-name";
import Wa from "js-yaml";
import Io from "ollama";
import { createClient as Ba } from "@supabase/supabase-js";
var Ye = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function za(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
const Ro = S, Dt = _;
var Ja = {
  findAndReadPackageJson: qa,
  tryReadJsonAt: ft
};
function qa() {
  return ft(Ga()) || ft(Ha()) || ft(process.resourcesPath, "app.asar") || ft(process.resourcesPath, "app") || ft(process.cwd()) || { name: void 0, version: void 0 };
}
function ft(...t) {
  if (t[0])
    try {
      const e = Dt.join(...t), n = Va("package.json", e);
      if (!n)
        return;
      const r = JSON.parse(Ro.readFileSync(n, "utf8")), o = (r == null ? void 0 : r.productName) || (r == null ? void 0 : r.name);
      return !o || o.toLowerCase() === "electron" ? void 0 : o ? { name: o, version: r == null ? void 0 : r.version } : void 0;
    } catch {
      return;
    }
}
function Va(t, e) {
  let n = e;
  for (; ; ) {
    const r = Dt.parse(n), o = r.root, i = r.dir;
    if (Ro.existsSync(Dt.join(n, t)))
      return Dt.resolve(Dt.join(n, t));
    if (n === o)
      return null;
    n = i;
  }
}
function Ha() {
  const t = process.argv.filter((n) => n.indexOf("--user-data-dir=") === 0);
  return t.length === 0 || typeof t[0] != "string" ? null : t[0].replace("--user-data-dir=", "");
}
function Ga() {
  var t;
  try {
    return (t = require.main) == null ? void 0 : t.filename;
  } catch {
    return;
  }
}
const Ka = Oa, Ve = Wt, st = _, Ya = Ja;
let Qa = class {
  constructor() {
    P(this, "appName");
    P(this, "appPackageJson");
    P(this, "platform", process.platform);
  }
  getAppLogPath(e = this.getAppName()) {
    return this.platform === "darwin" ? st.join(this.getSystemPathHome(), "Library/Logs", e) : st.join(this.getAppUserDataPath(e), "logs");
  }
  getAppName() {
    var n;
    const e = this.appName || ((n = this.getAppPackageJson()) == null ? void 0 : n.name);
    if (!e)
      throw new Error(
        "electron-log can't determine the app name. It tried these methods:\n1. Use `electron.app.name`\n2. Use productName or name from the nearest package.json`\nYou can also set it through log.transports.file.setAppName()"
      );
    return e;
  }
  /**
   * @private
   * @returns {undefined}
   */
  getAppPackageJson() {
    return typeof this.appPackageJson != "object" && (this.appPackageJson = Ya.findAndReadPackageJson()), this.appPackageJson;
  }
  getAppUserDataPath(e = this.getAppName()) {
    return e ? st.join(this.getSystemPathAppData(), e) : void 0;
  }
  getAppVersion() {
    var e;
    return (e = this.getAppPackageJson()) == null ? void 0 : e.version;
  }
  getElectronLogPath() {
    return this.getAppLogPath();
  }
  getMacOsVersion() {
    const e = Number(Ve.release().split(".")[0]);
    return e <= 19 ? `10.${e - 4}` : e - 9;
  }
  /**
   * @protected
   * @returns {string}
   */
  getOsVersion() {
    let e = Ve.type().replace("_", " "), n = Ve.release();
    return e === "Darwin" && (e = "macOS", n = this.getMacOsVersion()), `${e} ${n}`;
  }
  /**
   * @return {PathVariables}
   */
  getPathVariables() {
    const e = this.getAppName(), n = this.getAppVersion(), r = this;
    return {
      appData: this.getSystemPathAppData(),
      appName: e,
      appVersion: n,
      get electronDefaultDir() {
        return r.getElectronLogPath();
      },
      home: this.getSystemPathHome(),
      libraryDefaultDir: this.getAppLogPath(e),
      libraryTemplate: this.getAppLogPath("{appName}"),
      temp: this.getSystemPathTemp(),
      userData: this.getAppUserDataPath(e)
    };
  }
  getSystemPathAppData() {
    const e = this.getSystemPathHome();
    switch (this.platform) {
      case "darwin":
        return st.join(e, "Library/Application Support");
      case "win32":
        return process.env.APPDATA || st.join(e, "AppData/Roaming");
      default:
        return process.env.XDG_CONFIG_HOME || st.join(e, ".config");
    }
  }
  getSystemPathHome() {
    var e;
    return ((e = Ve.homedir) == null ? void 0 : e.call(Ve)) || process.env.HOME;
  }
  getSystemPathTemp() {
    return Ve.tmpdir();
  }
  getVersions() {
    return {
      app: `${this.getAppName()} ${this.getAppVersion()}`,
      electron: void 0,
      os: this.getOsVersion()
    };
  }
  isDev() {
    return process.env.NODE_ENV === "development" || process.env.ELECTRON_IS_DEV === "1";
  }
  isElectron() {
    return !!process.versions.electron;
  }
  onAppEvent(e, n) {
  }
  onAppReady(e) {
    e();
  }
  onEveryWebContentsEvent(e, n) {
  }
  /**
   * Listen to async messages sent from opposite process
   * @param {string} channel
   * @param {function} listener
   */
  onIpc(e, n) {
  }
  onIpcInvoke(e, n) {
  }
  /**
   * @param {string} url
   * @param {Function} [logFunction]
   */
  openUrl(e, n = console.error) {
    const o = { darwin: "open", win32: "start", linux: "xdg-open" }[process.platform] || "xdg-open";
    Ka.exec(`${o} ${e}`, {}, (i) => {
      i && n(i);
    });
  }
  setAppName(e) {
    this.appName = e;
  }
  setPlatform(e) {
    this.platform = e;
  }
  setPreloadFileForSessions({
    filePath: e,
    // eslint-disable-line no-unused-vars
    includeFutureSession: n = !0,
    // eslint-disable-line no-unused-vars
    getSessions: r = () => []
    // eslint-disable-line no-unused-vars
  }) {
  }
  /**
   * Sent a message to opposite process
   * @param {string} channel
   * @param {any} message
   */
  sendIpc(e, n) {
  }
  showErrorBox(e, n) {
  }
};
var Xa = Qa;
const Za = _, ec = Xa;
let tc = class extends ec {
  /**
   * @param {object} options
   * @param {typeof Electron} [options.electron]
   */
  constructor({ electron: n } = {}) {
    super();
    /**
     * @type {typeof Electron}
     */
    P(this, "electron");
    this.electron = n;
  }
  getAppName() {
    var r, o;
    let n;
    try {
      n = this.appName || ((r = this.electron.app) == null ? void 0 : r.name) || ((o = this.electron.app) == null ? void 0 : o.getName());
    } catch {
    }
    return n || super.getAppName();
  }
  getAppUserDataPath(n) {
    return this.getPath("userData") || super.getAppUserDataPath(n);
  }
  getAppVersion() {
    var r;
    let n;
    try {
      n = (r = this.electron.app) == null ? void 0 : r.getVersion();
    } catch {
    }
    return n || super.getAppVersion();
  }
  getElectronLogPath() {
    return this.getPath("logs") || super.getElectronLogPath();
  }
  /**
   * @private
   * @param {any} name
   * @returns {string|undefined}
   */
  getPath(n) {
    var r;
    try {
      return (r = this.electron.app) == null ? void 0 : r.getPath(n);
    } catch {
      return;
    }
  }
  getVersions() {
    return {
      app: `${this.getAppName()} ${this.getAppVersion()}`,
      electron: `Electron ${process.versions.electron}`,
      os: this.getOsVersion()
    };
  }
  getSystemPathAppData() {
    return this.getPath("appData") || super.getSystemPathAppData();
  }
  isDev() {
    var n;
    return ((n = this.electron.app) == null ? void 0 : n.isPackaged) !== void 0 ? !this.electron.app.isPackaged : typeof process.execPath == "string" ? Za.basename(process.execPath).toLowerCase().startsWith("electron") : super.isDev();
  }
  onAppEvent(n, r) {
    var o;
    return (o = this.electron.app) == null || o.on(n, r), () => {
      var i;
      (i = this.electron.app) == null || i.off(n, r);
    };
  }
  onAppReady(n) {
    var r, o, i;
    (r = this.electron.app) != null && r.isReady() ? n() : (o = this.electron.app) != null && o.once ? (i = this.electron.app) == null || i.once("ready", n) : n();
  }
  onEveryWebContentsEvent(n, r) {
    var i, a, c;
    return (a = (i = this.electron.webContents) == null ? void 0 : i.getAllWebContents()) == null || a.forEach((f) => {
      f.on(n, r);
    }), (c = this.electron.app) == null || c.on("web-contents-created", o), () => {
      var f, h;
      (f = this.electron.webContents) == null || f.getAllWebContents().forEach((u) => {
        u.off(n, r);
      }), (h = this.electron.app) == null || h.off("web-contents-created", o);
    };
    function o(f, h) {
      h.on(n, r);
    }
  }
  /**
   * Listen to async messages sent from opposite process
   * @param {string} channel
   * @param {function} listener
   */
  onIpc(n, r) {
    var o;
    (o = this.electron.ipcMain) == null || o.on(n, r);
  }
  onIpcInvoke(n, r) {
    var o, i;
    (i = (o = this.electron.ipcMain) == null ? void 0 : o.handle) == null || i.call(o, n, r);
  }
  /**
   * @param {string} url
   * @param {Function} [logFunction]
   */
  openUrl(n, r = console.error) {
    var o;
    (o = this.electron.shell) == null || o.openExternal(n).catch(r);
  }
  setPreloadFileForSessions({
    filePath: n,
    includeFutureSession: r = !0,
    getSessions: o = () => {
      var i;
      return [(i = this.electron.session) == null ? void 0 : i.defaultSession];
    }
  }) {
    for (const a of o().filter(Boolean))
      i(a);
    r && this.onAppEvent("session-created", (a) => {
      i(a);
    });
    function i(a) {
      a.setPreloads([...a.getPreloads(), n]);
    }
  }
  /**
   * Sent a message to opposite process
   * @param {string} channel
   * @param {any} message
   */
  sendIpc(n, r) {
    var o, i;
    (i = (o = this.electron.BrowserWindow) == null ? void 0 : o.getAllWindows()) == null || i.forEach((a) => {
      var c;
      ((c = a.webContents) == null ? void 0 : c.isDestroyed()) === !1 && a.webContents.send(n, r);
    });
  }
  showErrorBox(n, r) {
    var o;
    (o = this.electron.dialog) == null || o.showErrorBox(n, r);
  }
};
var nc = tc, jo = { exports: {} };
(function(t) {
  let e = {};
  try {
    e = require("electron");
  } catch {
  }
  e.ipcRenderer && n(e), t.exports = n;
  function n({ contextBridge: r, ipcRenderer: o }) {
    if (!o)
      return;
    o.on("__ELECTRON_LOG_IPC__", (a, c) => {
      window.postMessage({ cmd: "message", ...c });
    }), o.invoke("__ELECTRON_LOG__", { cmd: "getOptions" }).catch((a) => console.error(new Error(
      `electron-log isn't initialized in the main process. Please call log.initialize() before. ${a.message}`
    )));
    const i = {
      sendToMain(a) {
        try {
          o.send("__ELECTRON_LOG__", a);
        } catch (c) {
          console.error("electronLog.sendToMain ", c, "data:", a), o.send("__ELECTRON_LOG__", {
            cmd: "errorHandler",
            error: { message: c == null ? void 0 : c.message, stack: c == null ? void 0 : c.stack },
            errorName: "sendToMain"
          });
        }
      },
      log(...a) {
        i.sendToMain({ data: a, level: "info" });
      }
    };
    for (const a of ["error", "warn", "info", "verbose", "debug", "silly"])
      i[a] = (...c) => i.sendToMain({
        data: c,
        level: a
      });
    if (r && process.contextIsolated)
      try {
        r.exposeInMainWorld("__electronLog", i);
      } catch {
      }
    typeof window == "object" ? window.__electronLog = i : __electronLog = i;
  }
})(jo);
var rc = jo.exports;
const qr = S, oc = Wt, Vr = _, ic = rc;
var sc = {
  initialize({
    externalApi: t,
    getSessions: e,
    includeFutureSession: n,
    logger: r,
    preload: o = !0,
    spyRendererConsole: i = !1
  }) {
    t.onAppReady(() => {
      try {
        o && ac({
          externalApi: t,
          getSessions: e,
          includeFutureSession: n,
          preloadOption: o
        }), i && cc({ externalApi: t, logger: r });
      } catch (a) {
        r.warn(a);
      }
    });
  }
};
function ac({
  externalApi: t,
  getSessions: e,
  includeFutureSession: n,
  preloadOption: r
}) {
  let o = typeof r == "string" ? r : void 0;
  try {
    o = Vr.resolve(
      __dirname,
      "../renderer/electron-log-preload.js"
    );
  } catch {
  }
  if (!o || !qr.existsSync(o)) {
    o = Vr.join(
      t.getAppUserDataPath() || oc.tmpdir(),
      "electron-log-preload.js"
    );
    const i = `
      try {
        (${ic.toString()})(require('electron'));
      } catch(e) {
        console.error(e);
      }
    `;
    qr.writeFileSync(o, i, "utf8");
  }
  t.setPreloadFileForSessions({
    filePath: o,
    includeFutureSession: n,
    getSessions: e
  });
}
function cc({ externalApi: t, logger: e }) {
  const n = ["verbose", "info", "warning", "error"];
  t.onEveryWebContentsEvent(
    "console-message",
    (r, o, i) => {
      e.processMessage({
        data: [i],
        level: n[o],
        variables: { processType: "renderer" }
      });
    }
  );
}
var lc = uc;
function uc(t) {
  return Object.defineProperties(e, {
    defaultLabel: { value: "", writable: !0 },
    labelPadding: { value: !0, writable: !0 },
    maxLabelLength: { value: 0, writable: !0 },
    labelLength: {
      get() {
        switch (typeof e.labelPadding) {
          case "boolean":
            return e.labelPadding ? e.maxLabelLength : 0;
          case "number":
            return e.labelPadding;
          default:
            return 0;
        }
      }
    }
  });
  function e(n) {
    e.maxLabelLength = Math.max(e.maxLabelLength, n.length);
    const r = {};
    for (const o of [...t.levels, "log"])
      r[o] = (...i) => t.logData(i, { level: o, scope: n });
    return r;
  }
}
const fc = lc;
var tt;
let dc = (tt = class {
  constructor({
    allowUnknownLevel: e = !1,
    dependencies: n = {},
    errorHandler: r,
    eventLogger: o,
    initializeFn: i,
    isDev: a = !1,
    levels: c = ["error", "warn", "info", "verbose", "debug", "silly"],
    logId: f,
    transportFactories: h = {},
    variables: u
  } = {}) {
    P(this, "dependencies", {});
    P(this, "errorHandler", null);
    P(this, "eventLogger", null);
    P(this, "functions", {});
    P(this, "hooks", []);
    P(this, "isDev", !1);
    P(this, "levels", null);
    P(this, "logId", null);
    P(this, "scope", null);
    P(this, "transports", {});
    P(this, "variables", {});
    this.addLevel = this.addLevel.bind(this), this.create = this.create.bind(this), this.initialize = this.initialize.bind(this), this.logData = this.logData.bind(this), this.processMessage = this.processMessage.bind(this), this.allowUnknownLevel = e, this.dependencies = n, this.initializeFn = i, this.isDev = a, this.levels = c, this.logId = f, this.transportFactories = h, this.variables = u || {}, this.scope = fc(this);
    for (const d of this.levels)
      this.addLevel(d, !1);
    this.log = this.info, this.functions.log = this.log, this.errorHandler = r, r == null || r.setOptions({ ...n, logFn: this.error }), this.eventLogger = o, o == null || o.setOptions({ ...n, logger: this });
    for (const [d, y] of Object.entries(h))
      this.transports[d] = y(this, n);
    tt.instances[f] = this;
  }
  static getInstance({ logId: e }) {
    return this.instances[e] || this.instances.default;
  }
  addLevel(e, n = this.levels.length) {
    n !== !1 && this.levels.splice(n, 0, e), this[e] = (...r) => this.logData(r, { level: e }), this.functions[e] = this[e];
  }
  catchErrors(e) {
    return this.processMessage(
      {
        data: ["log.catchErrors is deprecated. Use log.errorHandler instead"],
        level: "warn"
      },
      { transports: ["console"] }
    ), this.errorHandler.startCatching(e);
  }
  create(e) {
    return typeof e == "string" && (e = { logId: e }), new tt({
      dependencies: this.dependencies,
      errorHandler: this.errorHandler,
      initializeFn: this.initializeFn,
      isDev: this.isDev,
      transportFactories: this.transportFactories,
      variables: { ...this.variables },
      ...e
    });
  }
  compareLevels(e, n, r = this.levels) {
    const o = r.indexOf(e), i = r.indexOf(n);
    return i === -1 || o === -1 ? !0 : i <= o;
  }
  initialize(e = {}) {
    this.initializeFn({ logger: this, ...this.dependencies, ...e });
  }
  logData(e, n = {}) {
    this.processMessage({ data: e, ...n });
  }
  processMessage(e, { transports: n = this.transports } = {}) {
    if (e.cmd === "errorHandler") {
      this.errorHandler.handle(e.error, {
        errorName: e.errorName,
        processType: "renderer",
        showDialog: !!e.showDialog
      });
      return;
    }
    let r = e.level;
    this.allowUnknownLevel || (r = this.levels.includes(e.level) ? e.level : "info");
    const o = {
      date: /* @__PURE__ */ new Date(),
      ...e,
      level: r,
      variables: {
        ...this.variables,
        ...e.variables
      }
    };
    for (const [i, a] of this.transportEntries(n))
      if (!(typeof a != "function" || a.level === !1) && this.compareLevels(a.level, e.level))
        try {
          const c = this.hooks.reduce((f, h) => f && h(f, a, i), o);
          c && a({ ...c, data: [...c.data] });
        } catch (c) {
          this.processInternalErrorFn(c);
        }
  }
  processInternalErrorFn(e) {
  }
  transportEntries(e = this.transports) {
    return (Array.isArray(e) ? e : Object.entries(e)).map((r) => {
      switch (typeof r) {
        case "string":
          return this.transports[r] ? [r, this.transports[r]] : null;
        case "function":
          return [r.name, r];
        default:
          return Array.isArray(r) ? r : null;
      }
    }).filter(Boolean);
  }
}, P(tt, "instances", {}), tt);
var pc = dc;
let hc = class {
  constructor({
    externalApi: e,
    logFn: n = void 0,
    onError: r = void 0,
    showDialog: o = void 0
  } = {}) {
    P(this, "externalApi");
    P(this, "isActive", !1);
    P(this, "logFn");
    P(this, "onError");
    P(this, "showDialog", !0);
    this.createIssue = this.createIssue.bind(this), this.handleError = this.handleError.bind(this), this.handleRejection = this.handleRejection.bind(this), this.setOptions({ externalApi: e, logFn: n, onError: r, showDialog: o }), this.startCatching = this.startCatching.bind(this), this.stopCatching = this.stopCatching.bind(this);
  }
  handle(e, {
    logFn: n = this.logFn,
    onError: r = this.onError,
    processType: o = "browser",
    showDialog: i = this.showDialog,
    errorName: a = ""
  } = {}) {
    var c;
    e = mc(e);
    try {
      if (typeof r == "function") {
        const f = ((c = this.externalApi) == null ? void 0 : c.getVersions()) || {}, h = this.createIssue;
        if (r({
          createIssue: h,
          error: e,
          errorName: a,
          processType: o,
          versions: f
        }) === !1)
          return;
      }
      a ? n(a, e) : n(e), i && !a.includes("rejection") && this.externalApi && this.externalApi.showErrorBox(
        `A JavaScript error occurred in the ${o} process`,
        e.stack
      );
    } catch {
      console.error(e);
    }
  }
  setOptions({ externalApi: e, logFn: n, onError: r, showDialog: o }) {
    typeof e == "object" && (this.externalApi = e), typeof n == "function" && (this.logFn = n), typeof r == "function" && (this.onError = r), typeof o == "boolean" && (this.showDialog = o);
  }
  startCatching({ onError: e, showDialog: n } = {}) {
    this.isActive || (this.isActive = !0, this.setOptions({ onError: e, showDialog: n }), process.on("uncaughtException", this.handleError), process.on("unhandledRejection", this.handleRejection));
  }
  stopCatching() {
    this.isActive = !1, process.removeListener("uncaughtException", this.handleError), process.removeListener("unhandledRejection", this.handleRejection);
  }
  createIssue(e, n) {
    var r;
    (r = this.externalApi) == null || r.openUrl(
      `${e}?${new URLSearchParams(n).toString()}`
    );
  }
  handleError(e) {
    this.handle(e, { errorName: "Unhandled" });
  }
  handleRejection(e) {
    const n = e instanceof Error ? e : new Error(JSON.stringify(e));
    this.handle(n, { errorName: "Unhandled rejection" });
  }
};
function mc(t) {
  if (t instanceof Error)
    return t;
  if (t && typeof t == "object") {
    if (t.message)
      return Object.assign(new Error(t.message), t);
    try {
      return new Error(JSON.stringify(t));
    } catch (e) {
      return new Error(`Couldn't normalize error ${String(t)}: ${e}`);
    }
  }
  return new Error(`Can't normalize error ${String(t)}`);
}
var yc = hc;
let gc = class {
  constructor(e = {}) {
    P(this, "disposers", []);
    P(this, "format", "{eventSource}#{eventName}:");
    P(this, "formatters", {
      app: {
        "certificate-error": ({ args: e }) => this.arrayToObject(e.slice(1, 4), [
          "url",
          "error",
          "certificate"
        ]),
        "child-process-gone": ({ args: e }) => e.length === 1 ? e[0] : e,
        "render-process-gone": ({ args: [e, n] }) => n && typeof n == "object" ? { ...n, ...this.getWebContentsDetails(e) } : []
      },
      webContents: {
        "console-message": ({ args: [e, n, r, o] }) => {
          if (!(e < 3))
            return { message: n, source: `${o}:${r}` };
        },
        "did-fail-load": ({ args: e }) => this.arrayToObject(e, [
          "errorCode",
          "errorDescription",
          "validatedURL",
          "isMainFrame",
          "frameProcessId",
          "frameRoutingId"
        ]),
        "did-fail-provisional-load": ({ args: e }) => this.arrayToObject(e, [
          "errorCode",
          "errorDescription",
          "validatedURL",
          "isMainFrame",
          "frameProcessId",
          "frameRoutingId"
        ]),
        "plugin-crashed": ({ args: e }) => this.arrayToObject(e, ["name", "version"]),
        "preload-error": ({ args: e }) => this.arrayToObject(e, ["preloadPath", "error"])
      }
    });
    P(this, "events", {
      app: {
        "certificate-error": !0,
        "child-process-gone": !0,
        "render-process-gone": !0
      },
      webContents: {
        // 'console-message': true,
        "did-fail-load": !0,
        "did-fail-provisional-load": !0,
        "plugin-crashed": !0,
        "preload-error": !0,
        unresponsive: !0
      }
    });
    P(this, "externalApi");
    P(this, "level", "error");
    P(this, "scope", "");
    this.setOptions(e);
  }
  setOptions({
    events: e,
    externalApi: n,
    level: r,
    logger: o,
    format: i,
    formatters: a,
    scope: c
  }) {
    typeof e == "object" && (this.events = e), typeof n == "object" && (this.externalApi = n), typeof r == "string" && (this.level = r), typeof o == "object" && (this.logger = o), (typeof i == "string" || typeof i == "function") && (this.format = i), typeof a == "object" && (this.formatters = a), typeof c == "string" && (this.scope = c);
  }
  startLogging(e = {}) {
    this.setOptions(e), this.disposeListeners();
    for (const n of this.getEventNames(this.events.app))
      this.disposers.push(
        this.externalApi.onAppEvent(n, (...r) => {
          this.handleEvent({ eventSource: "app", eventName: n, handlerArgs: r });
        })
      );
    for (const n of this.getEventNames(this.events.webContents))
      this.disposers.push(
        this.externalApi.onEveryWebContentsEvent(
          n,
          (...r) => {
            this.handleEvent(
              { eventSource: "webContents", eventName: n, handlerArgs: r }
            );
          }
        )
      );
  }
  stopLogging() {
    this.disposeListeners();
  }
  arrayToObject(e, n) {
    const r = {};
    return n.forEach((o, i) => {
      r[o] = e[i];
    }), e.length > n.length && (r.unknownArgs = e.slice(n.length)), r;
  }
  disposeListeners() {
    this.disposers.forEach((e) => e()), this.disposers = [];
  }
  formatEventLog({ eventName: e, eventSource: n, handlerArgs: r }) {
    var u;
    const [o, ...i] = r;
    if (typeof this.format == "function")
      return this.format({ args: i, event: o, eventName: e, eventSource: n });
    const a = (u = this.formatters[n]) == null ? void 0 : u[e];
    let c = i;
    if (typeof a == "function" && (c = a({ args: i, event: o, eventName: e, eventSource: n })), !c)
      return;
    const f = {};
    return Array.isArray(c) ? f.args = c : typeof c == "object" && Object.assign(f, c), n === "webContents" && Object.assign(f, this.getWebContentsDetails(o == null ? void 0 : o.sender)), [this.format.replace("{eventSource}", n === "app" ? "App" : "WebContents").replace("{eventName}", e), f];
  }
  getEventNames(e) {
    return !e || typeof e != "object" ? [] : Object.entries(e).filter(([n, r]) => r).map(([n]) => n);
  }
  getWebContentsDetails(e) {
    if (!(e != null && e.loadURL))
      return {};
    try {
      return {
        webContents: {
          id: e.id,
          url: e.getURL()
        }
      };
    } catch {
      return {};
    }
  }
  handleEvent({ eventName: e, eventSource: n, handlerArgs: r }) {
    var i;
    const o = this.formatEventLog({ eventName: e, eventSource: n, handlerArgs: r });
    if (o) {
      const a = this.scope ? this.logger.scope(this.scope) : this.logger;
      (i = a == null ? void 0 : a[this.level]) == null || i.call(a, ...o);
    }
  }
};
var wc = gc, Jt = { transform: vc };
function vc({
  logger: t,
  message: e,
  transport: n,
  initialData: r = (e == null ? void 0 : e.data) || [],
  transforms: o = n == null ? void 0 : n.transforms
}) {
  return o.reduce((i, a) => typeof a == "function" ? a({ data: i, logger: t, message: e, transport: n }) : i, r);
}
const { transform: Sc } = Jt;
var Mo = {
  concatFirstStringElements: Ec,
  formatScope: Hr,
  formatText: Kr,
  formatVariables: Gr,
  timeZoneFromOffset: Uo,
  format({ message: t, logger: e, transport: n, data: r = t == null ? void 0 : t.data }) {
    switch (typeof n.format) {
      case "string":
        return Sc({
          message: t,
          logger: e,
          transforms: [Gr, Hr, Kr],
          transport: n,
          initialData: [n.format, ...r]
        });
      case "function":
        return n.format({
          data: r,
          level: (t == null ? void 0 : t.level) || "info",
          logger: e,
          message: t,
          transport: n
        });
      default:
        return r;
    }
  }
};
function Ec({ data: t }) {
  return typeof t[0] != "string" || typeof t[1] != "string" || t[0].match(/%[1cdfiOos]/) ? t : [`${t[0]} ${t[1]}`, ...t.slice(2)];
}
function Uo(t) {
  const e = Math.abs(t), n = t >= 0 ? "-" : "+", r = Math.floor(e / 60).toString().padStart(2, "0"), o = (e % 60).toString().padStart(2, "0");
  return `${n}${r}:${o}`;
}
function Hr({ data: t, logger: e, message: n }) {
  const { defaultLabel: r, labelLength: o } = (e == null ? void 0 : e.scope) || {}, i = t[0];
  let a = n.scope;
  a || (a = r);
  let c;
  return a === "" ? c = o > 0 ? "".padEnd(o + 3) : "" : typeof a == "string" ? c = ` (${a})`.padEnd(o + 3) : c = "", t[0] = i.replace("{scope}", c), t;
}
function Gr({ data: t, message: e }) {
  let n = t[0];
  if (typeof n != "string")
    return t;
  n = n.replace("{level}]", `${e.level}]`.padEnd(6, " "));
  const r = e.date || /* @__PURE__ */ new Date();
  return t[0] = n.replace(/\{(\w+)}/g, (o, i) => {
    var a;
    switch (i) {
      case "level":
        return e.level || "info";
      case "logId":
        return e.logId;
      case "y":
        return r.getFullYear().toString(10);
      case "m":
        return (r.getMonth() + 1).toString(10).padStart(2, "0");
      case "d":
        return r.getDate().toString(10).padStart(2, "0");
      case "h":
        return r.getHours().toString(10).padStart(2, "0");
      case "i":
        return r.getMinutes().toString(10).padStart(2, "0");
      case "s":
        return r.getSeconds().toString(10).padStart(2, "0");
      case "ms":
        return r.getMilliseconds().toString(10).padStart(3, "0");
      case "z":
        return Uo(r.getTimezoneOffset());
      case "iso":
        return r.toISOString();
      default:
        return ((a = e.variables) == null ? void 0 : a[i]) || o;
    }
  }).trim(), t;
}
function Kr({ data: t }) {
  const e = t[0];
  if (typeof e != "string")
    return t;
  if (e.lastIndexOf("{text}") === e.length - 6)
    return t[0] = e.replace(/\s?{text}/, ""), t[0] === "" && t.shift(), t;
  const r = e.split("{text}");
  let o = [];
  return r[0] !== "" && o.push(r[0]), o = o.concat(t.slice(1)), r[1] !== "" && o.push(r[1]), o;
}
var Wo = { exports: {} };
(function(t) {
  const e = sr;
  t.exports = {
    serialize: r,
    maxDepth({ data: o, transport: i, depth: a = (i == null ? void 0 : i.depth) ?? 6 }) {
      if (!o)
        return o;
      if (a < 1)
        return Array.isArray(o) ? "[array]" : typeof o == "object" && o ? "[object]" : o;
      if (Array.isArray(o))
        return o.map((f) => t.exports.maxDepth({
          data: f,
          depth: a - 1
        }));
      if (typeof o != "object" || o && typeof o.toISOString == "function")
        return o;
      if (o === null)
        return null;
      if (o instanceof Error)
        return o;
      const c = {};
      for (const f in o)
        Object.prototype.hasOwnProperty.call(o, f) && (c[f] = t.exports.maxDepth({
          data: o[f],
          depth: a - 1
        }));
      return c;
    },
    toJSON({ data: o }) {
      return JSON.parse(JSON.stringify(o, n()));
    },
    toString({ data: o, transport: i }) {
      const a = (i == null ? void 0 : i.inspectOptions) || {}, c = o.map((f) => {
        if (f !== void 0)
          try {
            const h = JSON.stringify(f, n(), "  ");
            return h === void 0 ? void 0 : JSON.parse(h);
          } catch {
            return f;
          }
      });
      return e.formatWithOptions(a, ...c);
    }
  };
  function n(o = {}) {
    const i = /* @__PURE__ */ new WeakSet();
    return function(a, c) {
      if (typeof c == "object" && c !== null) {
        if (i.has(c))
          return;
        i.add(c);
      }
      return r(a, c, o);
    };
  }
  function r(o, i, a = {}) {
    const c = (a == null ? void 0 : a.serializeMapAndSet) !== !1;
    return i instanceof Error ? i.stack : i && (typeof i == "function" ? `[function] ${i.toString()}` : i instanceof Date ? i.toISOString() : c && i instanceof Map && Object.fromEntries ? Object.fromEntries(i) : c && i instanceof Set && Array.from ? Array.from(i) : i);
  }
})(Wo);
var Fn = Wo.exports, ar = {
  transformStyles: Wn,
  applyAnsiStyles({ data: t }) {
    return Wn(t, $c, bc);
  },
  removeStyles({ data: t }) {
    return Wn(t, () => "");
  }
};
const Bo = {
  unset: "\x1B[0m",
  black: "\x1B[30m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m"
};
function $c(t) {
  const e = t.replace(/color:\s*(\w+).*/, "$1").toLowerCase();
  return Bo[e] || "";
}
function bc(t) {
  return t + Bo.unset;
}
function Wn(t, e, n) {
  const r = {};
  return t.reduce((o, i, a, c) => {
    if (r[a])
      return o;
    if (typeof i == "string") {
      let f = a, h = !1;
      i = i.replace(/%[1cdfiOos]/g, (u) => {
        if (f += 1, u !== "%c")
          return u;
        const d = c[f];
        return typeof d == "string" ? (r[f] = !0, h = !0, e(d, i)) : u;
      }), h && n && (i = n(i));
    }
    return o.push(i), o;
  }, []);
}
const { concatFirstStringElements: Fc, format: Pc } = Mo, { maxDepth: _c, toJSON: xc } = Fn, { applyAnsiStyles: Dc, removeStyles: Oc } = ar, { transform: kc } = Jt, Yr = {
  error: console.error,
  warn: console.warn,
  info: console.info,
  verbose: console.info,
  debug: console.debug,
  silly: console.debug,
  log: console.log
};
var Cc = zo;
const Ac = process.platform === "win32" ? ">" : "›", cr = `%c{h}:{i}:{s}.{ms}{scope}%c ${Ac} {text}`;
Object.assign(zo, {
  DEFAULT_FORMAT: cr
});
function zo(t) {
  return Object.assign(e, {
    format: cr,
    level: "silly",
    transforms: [
      Tc,
      Pc,
      Nc,
      Fc,
      _c,
      xc
    ],
    useStyles: process.env.FORCE_STYLES,
    writeFn({ message: n }) {
      (Yr[n.level] || Yr.info)(...n.data);
    }
  });
  function e(n) {
    const r = kc({ logger: t, message: n, transport: e });
    e.writeFn({
      message: { ...n, data: r }
    });
  }
}
function Tc({ data: t, message: e, transport: n }) {
  return n.format !== cr ? t : [`color:${Ic(e.level)}`, "color:unset", ...t];
}
function Lc(t, e) {
  if (typeof t == "boolean")
    return t;
  const r = e === "error" || e === "warn" ? process.stderr : process.stdout;
  return r && r.isTTY;
}
function Nc(t) {
  const { message: e, transport: n } = t;
  return (Lc(n.useStyles, e.level) ? Dc : Oc)(t);
}
function Ic(t) {
  const e = { error: "red", warn: "yellow", info: "cyan", default: "unset" };
  return e[t] || e.default;
}
const Rc = Co, Ie = S, Qr = Wt;
let jc = class extends Rc {
  constructor({
    path: n,
    writeOptions: r = { encoding: "utf8", flag: "a", mode: 438 },
    writeAsync: o = !1
  }) {
    super();
    P(this, "asyncWriteQueue", []);
    P(this, "bytesWritten", 0);
    P(this, "hasActiveAsyncWriting", !1);
    P(this, "path", null);
    P(this, "initialSize");
    P(this, "writeOptions", null);
    P(this, "writeAsync", !1);
    this.path = n, this.writeOptions = r, this.writeAsync = o;
  }
  get size() {
    return this.getSize();
  }
  clear() {
    try {
      return Ie.writeFileSync(this.path, "", {
        mode: this.writeOptions.mode,
        flag: "w"
      }), this.reset(), !0;
    } catch (n) {
      return n.code === "ENOENT" ? !0 : (this.emit("error", n, this), !1);
    }
  }
  crop(n) {
    try {
      const r = Mc(this.path, n || 4096);
      this.clear(), this.writeLine(`[log cropped]${Qr.EOL}${r}`);
    } catch (r) {
      this.emit(
        "error",
        new Error(`Couldn't crop file ${this.path}. ${r.message}`),
        this
      );
    }
  }
  getSize() {
    if (this.initialSize === void 0)
      try {
        const n = Ie.statSync(this.path);
        this.initialSize = n.size;
      } catch {
        this.initialSize = 0;
      }
    return this.initialSize + this.bytesWritten;
  }
  increaseBytesWrittenCounter(n) {
    this.bytesWritten += Buffer.byteLength(n, this.writeOptions.encoding);
  }
  isNull() {
    return !1;
  }
  nextAsyncWrite() {
    const n = this;
    if (this.hasActiveAsyncWriting || this.asyncWriteQueue.length === 0)
      return;
    const r = this.asyncWriteQueue.join("");
    this.asyncWriteQueue = [], this.hasActiveAsyncWriting = !0, Ie.writeFile(this.path, r, this.writeOptions, (o) => {
      n.hasActiveAsyncWriting = !1, o ? n.emit(
        "error",
        new Error(`Couldn't write to ${n.path}. ${o.message}`),
        this
      ) : n.increaseBytesWrittenCounter(r), n.nextAsyncWrite();
    });
  }
  reset() {
    this.initialSize = void 0, this.bytesWritten = 0;
  }
  toString() {
    return this.path;
  }
  writeLine(n) {
    if (n += Qr.EOL, this.writeAsync) {
      this.asyncWriteQueue.push(n), this.nextAsyncWrite();
      return;
    }
    try {
      Ie.writeFileSync(this.path, n, this.writeOptions), this.increaseBytesWrittenCounter(n);
    } catch (r) {
      this.emit(
        "error",
        new Error(`Couldn't write to ${this.path}. ${r.message}`),
        this
      );
    }
  }
};
var Jo = jc;
function Mc(t, e) {
  const n = Buffer.alloc(e), r = Ie.statSync(t), o = Math.min(r.size, e), i = Math.max(0, r.size - e), a = Ie.openSync(t, "r"), c = Ie.readSync(a, n, 0, o, i);
  return Ie.closeSync(a), n.toString("utf8", 0, c);
}
const Uc = Jo;
let Wc = class extends Uc {
  clear() {
  }
  crop() {
  }
  getSize() {
    return 0;
  }
  isNull() {
    return !0;
  }
  writeLine() {
  }
};
var Bc = Wc;
const zc = Co, Xr = S, Zr = _, Jc = Jo, qc = Bc;
let Vc = class extends zc {
  constructor() {
    super();
    P(this, "store", {});
    this.emitError = this.emitError.bind(this);
  }
  /**
   * Provide a File object corresponding to the filePath
   * @param {string} filePath
   * @param {WriteOptions} [writeOptions]
   * @param {boolean} [writeAsync]
   * @return {File}
   */
  provide({ filePath: n, writeOptions: r = {}, writeAsync: o = !1 }) {
    let i;
    try {
      if (n = Zr.resolve(n), this.store[n])
        return this.store[n];
      i = this.createFile({ filePath: n, writeOptions: r, writeAsync: o });
    } catch (a) {
      i = new qc({ path: n }), this.emitError(a, i);
    }
    return i.on("error", this.emitError), this.store[n] = i, i;
  }
  /**
   * @param {string} filePath
   * @param {WriteOptions} writeOptions
   * @param {boolean} async
   * @return {File}
   * @private
   */
  createFile({ filePath: n, writeOptions: r, writeAsync: o }) {
    return this.testFileWriting({ filePath: n, writeOptions: r }), new Jc({ path: n, writeOptions: r, writeAsync: o });
  }
  /**
   * @param {Error} error
   * @param {File} file
   * @private
   */
  emitError(n, r) {
    this.emit("error", n, r);
  }
  /**
   * @param {string} filePath
   * @param {WriteOptions} writeOptions
   * @private
   */
  testFileWriting({ filePath: n, writeOptions: r }) {
    Xr.mkdirSync(Zr.dirname(n), { recursive: !0 }), Xr.writeFileSync(n, "", { flag: "a", mode: r.mode });
  }
};
var Hc = Vc;
const rn = S, Gc = Wt, Ft = _, Kc = Hc, { transform: Yc } = Jt, { removeStyles: Qc } = ar, {
  format: Xc,
  concatFirstStringElements: Zc
} = Mo, { toString: el } = Fn;
var tl = rl;
const nl = new Kc();
function rl(t, { registry: e = nl, externalApi: n } = {}) {
  let r;
  return e.listenerCount("error") < 1 && e.on("error", (h, u) => {
    a(`Can't write to ${u}`, h);
  }), Object.assign(o, {
    fileName: ol(t.variables.processType),
    format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}",
    getFile: c,
    inspectOptions: { depth: 5 },
    level: "silly",
    maxSize: 1024 ** 2,
    readAllLogs: f,
    sync: !0,
    transforms: [Qc, Xc, Zc, el],
    writeOptions: { flag: "a", mode: 438, encoding: "utf8" },
    archiveLogFn(h) {
      const u = h.toString(), d = Ft.parse(u);
      try {
        rn.renameSync(u, Ft.join(d.dir, `${d.name}.old${d.ext}`));
      } catch (y) {
        a("Could not rotate log", y);
        const m = Math.round(o.maxSize / 4);
        h.crop(Math.min(m, 256 * 1024));
      }
    },
    resolvePathFn(h) {
      return Ft.join(h.libraryDefaultDir, h.fileName);
    },
    setAppName(h) {
      t.dependencies.externalApi.setAppName(h);
    }
  });
  function o(h) {
    const u = c(h);
    o.maxSize > 0 && u.size > o.maxSize && (o.archiveLogFn(u), u.reset());
    const y = Yc({ logger: t, message: h, transport: o });
    u.writeLine(y);
  }
  function i() {
    r || (r = Object.create(
      Object.prototype,
      {
        ...Object.getOwnPropertyDescriptors(
          n.getPathVariables()
        ),
        fileName: {
          get() {
            return o.fileName;
          },
          enumerable: !0
        }
      }
    ), typeof o.archiveLog == "function" && (o.archiveLogFn = o.archiveLog, a("archiveLog is deprecated. Use archiveLogFn instead")), typeof o.resolvePath == "function" && (o.resolvePathFn = o.resolvePath, a("resolvePath is deprecated. Use resolvePathFn instead")));
  }
  function a(h, u = null, d = "error") {
    const y = [`electron-log.transports.file: ${h}`];
    u && y.push(u), t.transports.console({ data: y, date: /* @__PURE__ */ new Date(), level: d });
  }
  function c(h) {
    i();
    const u = o.resolvePathFn(r, h);
    return e.provide({
      filePath: u,
      writeAsync: !o.sync,
      writeOptions: o.writeOptions
    });
  }
  function f({ fileFilter: h = (u) => u.endsWith(".log") } = {}) {
    i();
    const u = Ft.dirname(o.resolvePathFn(r));
    return rn.existsSync(u) ? rn.readdirSync(u).map((d) => Ft.join(u, d)).filter(h).map((d) => {
      try {
        return {
          path: d,
          lines: rn.readFileSync(d, "utf8").split(Gc.EOL)
        };
      } catch {
        return null;
      }
    }).filter(Boolean) : [];
  }
}
function ol(t = process.type) {
  switch (t) {
    case "renderer":
      return "renderer.log";
    case "worker":
      return "worker.log";
    default:
      return "main.log";
  }
}
const { maxDepth: il, toJSON: sl } = Fn, { transform: al } = Jt;
var cl = ll;
function ll(t, { externalApi: e }) {
  return Object.assign(n, {
    depth: 3,
    eventId: "__ELECTRON_LOG_IPC__",
    level: t.isDev ? "silly" : !1,
    transforms: [sl, il]
  }), e != null && e.isElectron() ? n : void 0;
  function n(r) {
    var o;
    ((o = r == null ? void 0 : r.variables) == null ? void 0 : o.processType) !== "renderer" && (e == null || e.sendIpc(n.eventId, {
      ...r,
      data: al({ logger: t, message: r, transport: n })
    }));
  }
}
const ul = ka, fl = Ca, { transform: dl } = Jt, { removeStyles: pl } = ar, { toJSON: hl, maxDepth: ml } = Fn;
var yl = gl;
function gl(t) {
  return Object.assign(e, {
    client: { name: "electron-application" },
    depth: 6,
    level: !1,
    requestOptions: {},
    transforms: [pl, hl, ml],
    makeBodyFn({ message: n }) {
      return JSON.stringify({
        client: e.client,
        data: n.data,
        date: n.date.getTime(),
        level: n.level,
        scope: n.scope,
        variables: n.variables
      });
    },
    processErrorFn({ error: n }) {
      t.processMessage(
        {
          data: [`electron-log: can't POST ${e.url}`, n],
          level: "warn"
        },
        { transports: ["console", "file"] }
      );
    },
    sendRequestFn({ serverUrl: n, requestOptions: r, body: o }) {
      const a = (n.startsWith("https:") ? fl : ul).request(n, {
        method: "POST",
        ...r,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": o.length,
          ...r.headers
        }
      });
      return a.write(o), a.end(), a;
    }
  });
  function e(n) {
    if (!e.url)
      return;
    const r = e.makeBodyFn({
      logger: t,
      message: { ...n, data: dl({ logger: t, message: n, transport: e }) },
      transport: e
    }), o = e.sendRequestFn({
      serverUrl: e.url,
      requestOptions: e.requestOptions,
      body: Buffer.from(r, "utf8")
    });
    o.on("error", (i) => e.processErrorFn({
      error: i,
      logger: t,
      message: n,
      request: o,
      transport: e
    }));
  }
}
const eo = pc, wl = yc, vl = wc, Sl = Cc, El = tl, $l = cl, bl = yl;
var Fl = Pl;
function Pl({ dependencies: t, initializeFn: e }) {
  var r;
  const n = new eo({
    dependencies: t,
    errorHandler: new wl(),
    eventLogger: new vl(),
    initializeFn: e,
    isDev: (r = t.externalApi) == null ? void 0 : r.isDev(),
    logId: "default",
    transportFactories: {
      console: Sl,
      file: El,
      ipc: $l,
      remote: bl
    },
    variables: {
      processType: "main"
    }
  });
  return n.default = n, n.Logger = eo, n.processInternalErrorFn = (o) => {
    n.transports.console.writeFn({
      message: {
        data: ["Unhandled electron-log error", o],
        level: "error"
      }
    });
  }, n;
}
const _l = Da, xl = nc, { initialize: Dl } = sc, Ol = Fl, lr = new xl({ electron: _l }), Pn = Ol({
  dependencies: { externalApi: lr },
  initializeFn: Dl
});
var kl = Pn;
lr.onIpc("__ELECTRON_LOG__", (t, e) => {
  e.scope && Pn.Logger.getInstance(e).scope(e.scope);
  const n = new Date(e.date);
  qo({
    ...e,
    date: n.getTime() ? n : /* @__PURE__ */ new Date()
  });
});
lr.onIpcInvoke("__ELECTRON_LOG__", (t, { cmd: e = "", logId: n }) => {
  switch (e) {
    case "getOptions":
      return {
        levels: Pn.Logger.getInstance({ logId: n }).levels,
        logId: n
      };
    default:
      return qo({ data: [`Unknown cmd '${e}'`], level: "error" }), {};
  }
});
function qo(t) {
  var e;
  (e = Pn.Logger.getInstance(t)) == null || e.processMessage(t);
}
const Cl = kl;
var Al = Cl;
const T = /* @__PURE__ */ za(Al), I = T.scope("[main] appPath");
if (process.platform === "darwin") {
  const t = E.getPath("userData");
  E.setPath("userData", $.join(t, "..", "com.signerlabs.klee"));
}
const Vo = $.dirname(Aa(import.meta.url)), qt = $.join(Vo, "../..");
$.join(qt, "dist-electron");
const Ho = $.join(qt, "dist"), Qe = process.env.VITE_DEV_SERVER_URL, Tl = Qe ? $.join(qt, "public") : Ho, Go = $.join(Vo, "../preload/index.mjs"), Ko = $.join(Ho, "index.html"), Ot = he("");
I.info("appFolder:", Ot);
const ln = Ll();
I.info("executablePath:", ln);
const Xn = Nl();
I.info("ollamaSavedPath:", Xn);
const gn = Il();
I.info("ollamaExtractDestinationPath:", gn);
const un = Rl();
I.info("ollamaExecutablePath:", un);
const Yo = Ml();
I.info("loggerFilePath:", Yo);
const Qo = Ul();
I.info("downloadMainServiceDestinationPath:", Qo);
const fn = Wl();
I.info("serviceExtractDestinationPath:", fn);
const dn = Bl();
I.info("serviceFolderPath:", dn);
const _n = he("llm");
I.info("llmFolderPath:", _n);
const Xo = zl();
I.info("iconPath:", Xo);
const Zo = jl();
I.info("versionFilePath:", Zo);
const Re = ti();
I.info("embedModelFolderPath:", Re);
const ei = Vl();
I.info("downloadEmbedModelDestinationPath:", ei);
const dt = Hl();
I.info("ollamaVersionFilePath:", dt);
function he(t) {
  return process.platform === "win32" ? $.join(E.getPath("userData"), "../..", "/Local/com/signer_labs/klee", t) : $.join(E.getPath("userData"), t);
}
function Ll() {
  return process.platform === "darwin" ? $.join(he(""), "main/main") : (I.info("Windows startup path: ", $.join(E.getAppPath(), "../../", "main.exe")), $.join(E.getAppPath(), "../../../", "klee-kernel/main/main.exe"));
}
function Nl() {
  return process.platform === "darwin" ? $.join(he(""), "ollama-latest/ollama-darwin.tgz") : $.join(E.getAppPath(), "../../../", "klee-ollama/ollama-windows-amd64.zip");
}
function Il() {
  return process.platform === "darwin" ? $.join(he(""), "ollama-latest/ollama-darwin") : $.join(E.getAppPath(), "../../../", "klee-ollama/ollama-windows-amd64");
}
function Rl() {
  return process.platform === "darwin" ? $.join(he(""), "ollama-latest/ollama-darwin/ollama") : $.join(E.getAppPath(), "../../../", "klee-ollama/ollama-windows-amd64/ollama.exe");
}
function jl() {
  return process.platform === "darwin" ? $.join(he(""), "main/version") : $.join(E.getAppPath(), "../../../", "klee-kernel/main/version");
}
function Ml() {
  return process.platform === "darwin" ? $.join(he(""), "logs", "main.log") : $.join(E.getAppPath(), "../../../", "klee-kernel/logs/main.log");
}
function Ul() {
  return process.platform === "darwin" ? $.join(he(""), "temp") : $.join(E.getAppPath(), "../../../", "klee-kernel/version");
}
function Wl() {
  return process.platform === "darwin" ? he("") : $.join(E.getAppPath(), "../../../", "klee-kernel/main");
}
function Bl() {
  return process.platform === "darwin" ? $.join(he(""), "main") : $.join(E.getAppPath(), "../../../", "klee-kernel/main");
}
function zl() {
  return process.env.NODE_ENV === "development" ? $.join(E.getAppPath(), "./build/icons/512x512.png") : process.platform === "darwin" ? $.join(E.getAppPath(), "./Resources/icon.icns") : $.join(E.getAppPath(), "./Resources/icon.png");
}
async function Jl() {
  const t = ti();
  try {
    await Xe.access(t), I.info("[embed model folder check] => exists:", t);
  } catch {
    try {
      await Xe.mkdir(t, { recursive: !0, mode: 493 }), I.info("[embed model folder check] => created embed model folder:", t);
    } catch (e) {
      throw I.error("[embed model folder check] => failed to create embed model folder:", e), e;
    }
  }
}
async function ql() {
  const t = $.join(he(""), "tiktoken_encode");
  try {
    await Xe.access(t), I.info("[tik token folder check] => exists:", t);
  } catch {
    try {
      const e = process.env.NODE_ENV === "development" ? $.join(qt, "additionalResources/tiktoken_encode") : $.join(E.getAppPath(), "../additionalResources/tiktoken_encode");
      I.info("[tik token folder check] => sourcePath:", e), await Xe.mkdir($.dirname(t), { recursive: !0 }), await Xe.cp(e, t, {
        recursive: !0,
        force: !0,
        preserveTimestamps: !0
      }), I.info("[tik token folder check] => copied from:", e), I.info("[tik token folder check] => copied to:", t);
    } catch (e) {
      throw I.error("[tik token folder check] => failed to copy folder:", e), e;
    }
  }
}
function ti() {
  return process.platform === "darwin" ? $.join(he(""), "embed_model") : $.join(E.getAppPath(), "../../../", "klee-kernel/embed_model");
}
function Vl() {
  return process.platform === "darwin" ? $.join(he(""), "temp") : $.join(E.getAppPath(), "../../../", "klee-kernel/version");
}
function Hl() {
  return process.platform === "darwin" ? $.join(he(""), "ollama-latest/version.json") : $.join(E.getAppPath(), "../../../", "klee-ollama/version.json");
}
async function Gl() {
  I.info("======== registerAppFolder START ========"), process.env.APP_ROOT = qt, process.env.VITE_PUBLIC = Tl;
  try {
    await Xe.access(Ot), I.info("access success: ", Ot);
  } catch {
    try {
      await Xe.mkdir(Ot, { recursive: !0, mode: 493 }), I.info("mkdir success: ", Ot);
    } catch (t) {
      I.error("mkdir failed: ", t);
    }
  }
  await Jl(), process.platform === "darwin" && await ql(), I.info("======== registerAppFolder END ========");
}
function Kl() {
  const { autoUpdater: t } = Ta;
  return t;
}
const Yl = process.env.NODE_ENV, Vt = Yl === "development", Ql = "latest", { platform: Xl } = process, ni = Xl === "win32", Zn = T.scope("[main] window");
let fe = null;
const b = () => fe, Zl = () => fe && !fe.isDestroyed() ? fe : er(), eu = () => {
  Zn.info("try to destroy main window"), fe && (fe.destroy(), fe = null, Zn.info("main window destroyed"));
}, er = () => (fe = new ir({
  width: 1280,
  height: 800,
  minWidth: 1280,
  minHeight: 800,
  titleBarStyle: "hidden",
  // Windows titleBarOverlay configuration
  titleBarOverlay: {
    height: 44,
    color: "#00000000",
    symbolColor: "#737373"
  },
  frame: !1,
  webPreferences: {
    preload: Go,
    webSecurity: !1
  },
  trafficLightPosition: {
    x: 8,
    y: 14
  },
  icon: Xo
}), Qe ? (fe.loadURL(Qe), fe.webContents.openDevTools()) : fe.loadFile(Ko), fe.webContents.setWindowOpenHandler(({ url: t }) => (Qn.openExternal(t), { action: "deny" })), fe.webContents.on("will-navigate", (t) => {
  Qe && t.url.startsWith(Qe) || (t.preventDefault(), Qn.openExternal(t.url));
}), fe.webContents.on("did-fail-load", (t, e, n) => {
  Zn.info("load page failed:", e, n);
}), fe);
var xn = {}, wn = { exports: {} };
wn.exports;
(function(t, e) {
  var n = 200, r = "__lodash_hash_undefined__", o = 1, i = 2, a = 9007199254740991, c = "[object Arguments]", f = "[object Array]", h = "[object AsyncFunction]", u = "[object Boolean]", d = "[object Date]", y = "[object Error]", m = "[object Function]", w = "[object GeneratorFunction]", x = "[object Map]", v = "[object Number]", C = "[object Null]", O = "[object Object]", L = "[object Promise]", ge = "[object Proxy]", wt = "[object RegExp]", Ue = "[object Set]", Gt = "[object String]", vt = "[object Symbol]", F = "[object Undefined]", N = "[object WeakMap]", A = "[object ArrayBuffer]", H = "[object DataView]", Q = "[object Float32Array]", Y = "[object Float64Array]", U = "[object Int8Array]", J = "[object Int16Array]", R = "[object Int32Array]", X = "[object Uint8Array]", M = "[object Uint8ClampedArray]", Sr = "[object Uint16Array]", fs = "[object Uint32Array]", ds = /[\\^$.*+?()[\]{}|]/g, ps = /^\[object .+?Constructor\]$/, hs = /^(?:0|[1-9]\d*)$/, W = {};
  W[Q] = W[Y] = W[U] = W[J] = W[R] = W[X] = W[M] = W[Sr] = W[fs] = !0, W[c] = W[f] = W[A] = W[u] = W[H] = W[d] = W[y] = W[m] = W[x] = W[v] = W[O] = W[wt] = W[Ue] = W[Gt] = W[N] = !1;
  var Er = typeof Ye == "object" && Ye && Ye.Object === Object && Ye, ms = typeof self == "object" && self && self.Object === Object && self, De = Er || ms || Function("return this")(), $r = e && !e.nodeType && e, br = $r && !0 && t && !t.nodeType && t, Fr = br && br.exports === $r, An = Fr && Er.process, Pr = function() {
    try {
      return An && An.binding && An.binding("util");
    } catch {
    }
  }(), _r = Pr && Pr.isTypedArray;
  function ys(s, l) {
    for (var p = -1, g = s == null ? 0 : s.length, B = 0, D = []; ++p < g; ) {
      var G = s[p];
      l(G, p, s) && (D[B++] = G);
    }
    return D;
  }
  function gs(s, l) {
    for (var p = -1, g = l.length, B = s.length; ++p < g; )
      s[B + p] = l[p];
    return s;
  }
  function ws(s, l) {
    for (var p = -1, g = s == null ? 0 : s.length; ++p < g; )
      if (l(s[p], p, s))
        return !0;
    return !1;
  }
  function vs(s, l) {
    for (var p = -1, g = Array(s); ++p < s; )
      g[p] = l(p);
    return g;
  }
  function Ss(s) {
    return function(l) {
      return s(l);
    };
  }
  function Es(s, l) {
    return s.has(l);
  }
  function $s(s, l) {
    return s == null ? void 0 : s[l];
  }
  function bs(s) {
    var l = -1, p = Array(s.size);
    return s.forEach(function(g, B) {
      p[++l] = [B, g];
    }), p;
  }
  function Fs(s, l) {
    return function(p) {
      return s(l(p));
    };
  }
  function Ps(s) {
    var l = -1, p = Array(s.size);
    return s.forEach(function(g) {
      p[++l] = g;
    }), p;
  }
  var _s = Array.prototype, xs = Function.prototype, Kt = Object.prototype, Tn = De["__core-js_shared__"], xr = xs.toString, _e = Kt.hasOwnProperty, Dr = function() {
    var s = /[^.]+$/.exec(Tn && Tn.keys && Tn.keys.IE_PROTO || "");
    return s ? "Symbol(src)_1." + s : "";
  }(), Or = Kt.toString, Ds = RegExp(
    "^" + xr.call(_e).replace(ds, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  ), kr = Fr ? De.Buffer : void 0, Yt = De.Symbol, Cr = De.Uint8Array, Ar = Kt.propertyIsEnumerable, Os = _s.splice, We = Yt ? Yt.toStringTag : void 0, Tr = Object.getOwnPropertySymbols, ks = kr ? kr.isBuffer : void 0, Cs = Fs(Object.keys, Object), Ln = it(De, "DataView"), St = it(De, "Map"), Nn = it(De, "Promise"), In = it(De, "Set"), Rn = it(De, "WeakMap"), Et = it(Object, "create"), As = Je(Ln), Ts = Je(St), Ls = Je(Nn), Ns = Je(In), Is = Je(Rn), Lr = Yt ? Yt.prototype : void 0, jn = Lr ? Lr.valueOf : void 0;
  function Be(s) {
    var l = -1, p = s == null ? 0 : s.length;
    for (this.clear(); ++l < p; ) {
      var g = s[l];
      this.set(g[0], g[1]);
    }
  }
  function Rs() {
    this.__data__ = Et ? Et(null) : {}, this.size = 0;
  }
  function js(s) {
    var l = this.has(s) && delete this.__data__[s];
    return this.size -= l ? 1 : 0, l;
  }
  function Ms(s) {
    var l = this.__data__;
    if (Et) {
      var p = l[s];
      return p === r ? void 0 : p;
    }
    return _e.call(l, s) ? l[s] : void 0;
  }
  function Us(s) {
    var l = this.__data__;
    return Et ? l[s] !== void 0 : _e.call(l, s);
  }
  function Ws(s, l) {
    var p = this.__data__;
    return this.size += this.has(s) ? 0 : 1, p[s] = Et && l === void 0 ? r : l, this;
  }
  Be.prototype.clear = Rs, Be.prototype.delete = js, Be.prototype.get = Ms, Be.prototype.has = Us, Be.prototype.set = Ws;
  function Oe(s) {
    var l = -1, p = s == null ? 0 : s.length;
    for (this.clear(); ++l < p; ) {
      var g = s[l];
      this.set(g[0], g[1]);
    }
  }
  function Bs() {
    this.__data__ = [], this.size = 0;
  }
  function zs(s) {
    var l = this.__data__, p = Xt(l, s);
    if (p < 0)
      return !1;
    var g = l.length - 1;
    return p == g ? l.pop() : Os.call(l, p, 1), --this.size, !0;
  }
  function Js(s) {
    var l = this.__data__, p = Xt(l, s);
    return p < 0 ? void 0 : l[p][1];
  }
  function qs(s) {
    return Xt(this.__data__, s) > -1;
  }
  function Vs(s, l) {
    var p = this.__data__, g = Xt(p, s);
    return g < 0 ? (++this.size, p.push([s, l])) : p[g][1] = l, this;
  }
  Oe.prototype.clear = Bs, Oe.prototype.delete = zs, Oe.prototype.get = Js, Oe.prototype.has = qs, Oe.prototype.set = Vs;
  function ze(s) {
    var l = -1, p = s == null ? 0 : s.length;
    for (this.clear(); ++l < p; ) {
      var g = s[l];
      this.set(g[0], g[1]);
    }
  }
  function Hs() {
    this.size = 0, this.__data__ = {
      hash: new Be(),
      map: new (St || Oe)(),
      string: new Be()
    };
  }
  function Gs(s) {
    var l = Zt(this, s).delete(s);
    return this.size -= l ? 1 : 0, l;
  }
  function Ks(s) {
    return Zt(this, s).get(s);
  }
  function Ys(s) {
    return Zt(this, s).has(s);
  }
  function Qs(s, l) {
    var p = Zt(this, s), g = p.size;
    return p.set(s, l), this.size += p.size == g ? 0 : 1, this;
  }
  ze.prototype.clear = Hs, ze.prototype.delete = Gs, ze.prototype.get = Ks, ze.prototype.has = Ys, ze.prototype.set = Qs;
  function Qt(s) {
    var l = -1, p = s == null ? 0 : s.length;
    for (this.__data__ = new ze(); ++l < p; )
      this.add(s[l]);
  }
  function Xs(s) {
    return this.__data__.set(s, r), this;
  }
  function Zs(s) {
    return this.__data__.has(s);
  }
  Qt.prototype.add = Qt.prototype.push = Xs, Qt.prototype.has = Zs;
  function Ce(s) {
    var l = this.__data__ = new Oe(s);
    this.size = l.size;
  }
  function ea() {
    this.__data__ = new Oe(), this.size = 0;
  }
  function ta(s) {
    var l = this.__data__, p = l.delete(s);
    return this.size = l.size, p;
  }
  function na(s) {
    return this.__data__.get(s);
  }
  function ra(s) {
    return this.__data__.has(s);
  }
  function oa(s, l) {
    var p = this.__data__;
    if (p instanceof Oe) {
      var g = p.__data__;
      if (!St || g.length < n - 1)
        return g.push([s, l]), this.size = ++p.size, this;
      p = this.__data__ = new ze(g);
    }
    return p.set(s, l), this.size = p.size, this;
  }
  Ce.prototype.clear = ea, Ce.prototype.delete = ta, Ce.prototype.get = na, Ce.prototype.has = ra, Ce.prototype.set = oa;
  function ia(s, l) {
    var p = en(s), g = !p && Sa(s), B = !p && !g && Mn(s), D = !p && !g && !B && zr(s), G = p || g || B || D, ee = G ? vs(s.length, String) : [], re = ee.length;
    for (var q in s)
      (l || _e.call(s, q)) && !(G && // Safari 9 has enumerable `arguments.length` in strict mode.
      (q == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      B && (q == "offset" || q == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      D && (q == "buffer" || q == "byteLength" || q == "byteOffset") || // Skip index properties.
      ma(q, re))) && ee.push(q);
    return ee;
  }
  function Xt(s, l) {
    for (var p = s.length; p--; )
      if (Mr(s[p][0], l))
        return p;
    return -1;
  }
  function sa(s, l, p) {
    var g = l(s);
    return en(s) ? g : gs(g, p(s));
  }
  function $t(s) {
    return s == null ? s === void 0 ? F : C : We && We in Object(s) ? pa(s) : va(s);
  }
  function Nr(s) {
    return bt(s) && $t(s) == c;
  }
  function Ir(s, l, p, g, B) {
    return s === l ? !0 : s == null || l == null || !bt(s) && !bt(l) ? s !== s && l !== l : aa(s, l, p, g, Ir, B);
  }
  function aa(s, l, p, g, B, D) {
    var G = en(s), ee = en(l), re = G ? f : Ae(s), q = ee ? f : Ae(l);
    re = re == c ? O : re, q = q == c ? O : q;
    var Se = re == O, Fe = q == O, ce = re == q;
    if (ce && Mn(s)) {
      if (!Mn(l))
        return !1;
      G = !0, Se = !1;
    }
    if (ce && !Se)
      return D || (D = new Ce()), G || zr(s) ? Rr(s, l, p, g, B, D) : fa(s, l, re, p, g, B, D);
    if (!(p & o)) {
      var Ee = Se && _e.call(s, "__wrapped__"), $e = Fe && _e.call(l, "__wrapped__");
      if (Ee || $e) {
        var Te = Ee ? s.value() : s, ke = $e ? l.value() : l;
        return D || (D = new Ce()), B(Te, ke, p, g, D);
      }
    }
    return ce ? (D || (D = new Ce()), da(s, l, p, g, B, D)) : !1;
  }
  function ca(s) {
    if (!Br(s) || ga(s))
      return !1;
    var l = Ur(s) ? Ds : ps;
    return l.test(Je(s));
  }
  function la(s) {
    return bt(s) && Wr(s.length) && !!W[$t(s)];
  }
  function ua(s) {
    if (!wa(s))
      return Cs(s);
    var l = [];
    for (var p in Object(s))
      _e.call(s, p) && p != "constructor" && l.push(p);
    return l;
  }
  function Rr(s, l, p, g, B, D) {
    var G = p & o, ee = s.length, re = l.length;
    if (ee != re && !(G && re > ee))
      return !1;
    var q = D.get(s);
    if (q && D.get(l))
      return q == l;
    var Se = -1, Fe = !0, ce = p & i ? new Qt() : void 0;
    for (D.set(s, l), D.set(l, s); ++Se < ee; ) {
      var Ee = s[Se], $e = l[Se];
      if (g)
        var Te = G ? g($e, Ee, Se, l, s, D) : g(Ee, $e, Se, s, l, D);
      if (Te !== void 0) {
        if (Te)
          continue;
        Fe = !1;
        break;
      }
      if (ce) {
        if (!ws(l, function(ke, qe) {
          if (!Es(ce, qe) && (Ee === ke || B(Ee, ke, p, g, D)))
            return ce.push(qe);
        })) {
          Fe = !1;
          break;
        }
      } else if (!(Ee === $e || B(Ee, $e, p, g, D))) {
        Fe = !1;
        break;
      }
    }
    return D.delete(s), D.delete(l), Fe;
  }
  function fa(s, l, p, g, B, D, G) {
    switch (p) {
      case H:
        if (s.byteLength != l.byteLength || s.byteOffset != l.byteOffset)
          return !1;
        s = s.buffer, l = l.buffer;
      case A:
        return !(s.byteLength != l.byteLength || !D(new Cr(s), new Cr(l)));
      case u:
      case d:
      case v:
        return Mr(+s, +l);
      case y:
        return s.name == l.name && s.message == l.message;
      case wt:
      case Gt:
        return s == l + "";
      case x:
        var ee = bs;
      case Ue:
        var re = g & o;
        if (ee || (ee = Ps), s.size != l.size && !re)
          return !1;
        var q = G.get(s);
        if (q)
          return q == l;
        g |= i, G.set(s, l);
        var Se = Rr(ee(s), ee(l), g, B, D, G);
        return G.delete(s), Se;
      case vt:
        if (jn)
          return jn.call(s) == jn.call(l);
    }
    return !1;
  }
  function da(s, l, p, g, B, D) {
    var G = p & o, ee = jr(s), re = ee.length, q = jr(l), Se = q.length;
    if (re != Se && !G)
      return !1;
    for (var Fe = re; Fe--; ) {
      var ce = ee[Fe];
      if (!(G ? ce in l : _e.call(l, ce)))
        return !1;
    }
    var Ee = D.get(s);
    if (Ee && D.get(l))
      return Ee == l;
    var $e = !0;
    D.set(s, l), D.set(l, s);
    for (var Te = G; ++Fe < re; ) {
      ce = ee[Fe];
      var ke = s[ce], qe = l[ce];
      if (g)
        var Jr = G ? g(qe, ke, ce, l, s, D) : g(ke, qe, ce, s, l, D);
      if (!(Jr === void 0 ? ke === qe || B(ke, qe, p, g, D) : Jr)) {
        $e = !1;
        break;
      }
      Te || (Te = ce == "constructor");
    }
    if ($e && !Te) {
      var tn = s.constructor, nn = l.constructor;
      tn != nn && "constructor" in s && "constructor" in l && !(typeof tn == "function" && tn instanceof tn && typeof nn == "function" && nn instanceof nn) && ($e = !1);
    }
    return D.delete(s), D.delete(l), $e;
  }
  function jr(s) {
    return sa(s, ba, ha);
  }
  function Zt(s, l) {
    var p = s.__data__;
    return ya(l) ? p[typeof l == "string" ? "string" : "hash"] : p.map;
  }
  function it(s, l) {
    var p = $s(s, l);
    return ca(p) ? p : void 0;
  }
  function pa(s) {
    var l = _e.call(s, We), p = s[We];
    try {
      s[We] = void 0;
      var g = !0;
    } catch {
    }
    var B = Or.call(s);
    return g && (l ? s[We] = p : delete s[We]), B;
  }
  var ha = Tr ? function(s) {
    return s == null ? [] : (s = Object(s), ys(Tr(s), function(l) {
      return Ar.call(s, l);
    }));
  } : Fa, Ae = $t;
  (Ln && Ae(new Ln(new ArrayBuffer(1))) != H || St && Ae(new St()) != x || Nn && Ae(Nn.resolve()) != L || In && Ae(new In()) != Ue || Rn && Ae(new Rn()) != N) && (Ae = function(s) {
    var l = $t(s), p = l == O ? s.constructor : void 0, g = p ? Je(p) : "";
    if (g)
      switch (g) {
        case As:
          return H;
        case Ts:
          return x;
        case Ls:
          return L;
        case Ns:
          return Ue;
        case Is:
          return N;
      }
    return l;
  });
  function ma(s, l) {
    return l = l ?? a, !!l && (typeof s == "number" || hs.test(s)) && s > -1 && s % 1 == 0 && s < l;
  }
  function ya(s) {
    var l = typeof s;
    return l == "string" || l == "number" || l == "symbol" || l == "boolean" ? s !== "__proto__" : s === null;
  }
  function ga(s) {
    return !!Dr && Dr in s;
  }
  function wa(s) {
    var l = s && s.constructor, p = typeof l == "function" && l.prototype || Kt;
    return s === p;
  }
  function va(s) {
    return Or.call(s);
  }
  function Je(s) {
    if (s != null) {
      try {
        return xr.call(s);
      } catch {
      }
      try {
        return s + "";
      } catch {
      }
    }
    return "";
  }
  function Mr(s, l) {
    return s === l || s !== s && l !== l;
  }
  var Sa = Nr(function() {
    return arguments;
  }()) ? Nr : function(s) {
    return bt(s) && _e.call(s, "callee") && !Ar.call(s, "callee");
  }, en = Array.isArray;
  function Ea(s) {
    return s != null && Wr(s.length) && !Ur(s);
  }
  var Mn = ks || Pa;
  function $a(s, l) {
    return Ir(s, l);
  }
  function Ur(s) {
    if (!Br(s))
      return !1;
    var l = $t(s);
    return l == m || l == w || l == h || l == ge;
  }
  function Wr(s) {
    return typeof s == "number" && s > -1 && s % 1 == 0 && s <= a;
  }
  function Br(s) {
    var l = typeof s;
    return s != null && (l == "object" || l == "function");
  }
  function bt(s) {
    return s != null && typeof s == "object";
  }
  var zr = _r ? Ss(_r) : la;
  function ba(s) {
    return Ea(s) ? ia(s) : ua(s);
  }
  function Fa() {
    return [];
  }
  function Pa() {
    return !1;
  }
  t.exports = $a;
})(wn, wn.exports);
var tu = wn.exports, rt = {}, me = {};
me.fromCallback = function(t) {
  return Object.defineProperty(function(...e) {
    if (typeof e[e.length - 1] == "function")
      t.apply(this, e);
    else
      return new Promise((n, r) => {
        e.push((o, i) => o != null ? r(o) : n(i)), t.apply(this, e);
      });
  }, "name", { value: t.name });
};
me.fromPromise = function(t) {
  return Object.defineProperty(function(...e) {
    const n = e[e.length - 1];
    if (typeof n != "function")
      return t.apply(this, e);
    e.pop(), t.apply(this, e).then((r) => n(null, r), n);
  }, "name", { value: t.name });
};
var Le = Ia, nu = process.cwd, pn = null, ru = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  return pn || (pn = nu.call(process)), pn;
};
try {
  process.cwd();
} catch {
}
if (typeof process.chdir == "function") {
  var to = process.chdir;
  process.chdir = function(t) {
    pn = null, to.call(process, t);
  }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, to);
}
var ou = iu;
function iu(t) {
  Le.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && e(t), t.lutimes || n(t), t.chown = i(t.chown), t.fchown = i(t.fchown), t.lchown = i(t.lchown), t.chmod = r(t.chmod), t.fchmod = r(t.fchmod), t.lchmod = r(t.lchmod), t.chownSync = a(t.chownSync), t.fchownSync = a(t.fchownSync), t.lchownSync = a(t.lchownSync), t.chmodSync = o(t.chmodSync), t.fchmodSync = o(t.fchmodSync), t.lchmodSync = o(t.lchmodSync), t.stat = c(t.stat), t.fstat = c(t.fstat), t.lstat = c(t.lstat), t.statSync = f(t.statSync), t.fstatSync = f(t.fstatSync), t.lstatSync = f(t.lstatSync), t.chmod && !t.lchmod && (t.lchmod = function(u, d, y) {
    y && process.nextTick(y);
  }, t.lchmodSync = function() {
  }), t.chown && !t.lchown && (t.lchown = function(u, d, y, m) {
    m && process.nextTick(m);
  }, t.lchownSync = function() {
  }), ru === "win32" && (t.rename = typeof t.rename != "function" ? t.rename : function(u) {
    function d(y, m, w) {
      var x = Date.now(), v = 0;
      u(y, m, function C(O) {
        if (O && (O.code === "EACCES" || O.code === "EPERM" || O.code === "EBUSY") && Date.now() - x < 6e4) {
          setTimeout(function() {
            t.stat(m, function(L, ge) {
              L && L.code === "ENOENT" ? u(y, m, C) : w(O);
            });
          }, v), v < 100 && (v += 10);
          return;
        }
        w && w(O);
      });
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(d, u), d;
  }(t.rename)), t.read = typeof t.read != "function" ? t.read : function(u) {
    function d(y, m, w, x, v, C) {
      var O;
      if (C && typeof C == "function") {
        var L = 0;
        O = function(ge, wt, Ue) {
          if (ge && ge.code === "EAGAIN" && L < 10)
            return L++, u.call(t, y, m, w, x, v, O);
          C.apply(this, arguments);
        };
      }
      return u.call(t, y, m, w, x, v, O);
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(d, u), d;
  }(t.read), t.readSync = typeof t.readSync != "function" ? t.readSync : function(u) {
    return function(d, y, m, w, x) {
      for (var v = 0; ; )
        try {
          return u.call(t, d, y, m, w, x);
        } catch (C) {
          if (C.code === "EAGAIN" && v < 10) {
            v++;
            continue;
          }
          throw C;
        }
    };
  }(t.readSync);
  function e(u) {
    u.lchmod = function(d, y, m) {
      u.open(
        d,
        Le.O_WRONLY | Le.O_SYMLINK,
        y,
        function(w, x) {
          if (w) {
            m && m(w);
            return;
          }
          u.fchmod(x, y, function(v) {
            u.close(x, function(C) {
              m && m(v || C);
            });
          });
        }
      );
    }, u.lchmodSync = function(d, y) {
      var m = u.openSync(d, Le.O_WRONLY | Le.O_SYMLINK, y), w = !0, x;
      try {
        x = u.fchmodSync(m, y), w = !1;
      } finally {
        if (w)
          try {
            u.closeSync(m);
          } catch {
          }
        else
          u.closeSync(m);
      }
      return x;
    };
  }
  function n(u) {
    Le.hasOwnProperty("O_SYMLINK") && u.futimes ? (u.lutimes = function(d, y, m, w) {
      u.open(d, Le.O_SYMLINK, function(x, v) {
        if (x) {
          w && w(x);
          return;
        }
        u.futimes(v, y, m, function(C) {
          u.close(v, function(O) {
            w && w(C || O);
          });
        });
      });
    }, u.lutimesSync = function(d, y, m) {
      var w = u.openSync(d, Le.O_SYMLINK), x, v = !0;
      try {
        x = u.futimesSync(w, y, m), v = !1;
      } finally {
        if (v)
          try {
            u.closeSync(w);
          } catch {
          }
        else
          u.closeSync(w);
      }
      return x;
    }) : u.futimes && (u.lutimes = function(d, y, m, w) {
      w && process.nextTick(w);
    }, u.lutimesSync = function() {
    });
  }
  function r(u) {
    return u && function(d, y, m) {
      return u.call(t, d, y, function(w) {
        h(w) && (w = null), m && m.apply(this, arguments);
      });
    };
  }
  function o(u) {
    return u && function(d, y) {
      try {
        return u.call(t, d, y);
      } catch (m) {
        if (!h(m))
          throw m;
      }
    };
  }
  function i(u) {
    return u && function(d, y, m, w) {
      return u.call(t, d, y, m, function(x) {
        h(x) && (x = null), w && w.apply(this, arguments);
      });
    };
  }
  function a(u) {
    return u && function(d, y, m) {
      try {
        return u.call(t, d, y, m);
      } catch (w) {
        if (!h(w))
          throw w;
      }
    };
  }
  function c(u) {
    return u && function(d, y, m) {
      typeof y == "function" && (m = y, y = null);
      function w(x, v) {
        v && (v.uid < 0 && (v.uid += 4294967296), v.gid < 0 && (v.gid += 4294967296)), m && m.apply(this, arguments);
      }
      return y ? u.call(t, d, y, w) : u.call(t, d, w);
    };
  }
  function f(u) {
    return u && function(d, y) {
      var m = y ? u.call(t, d, y) : u.call(t, d);
      return m && (m.uid < 0 && (m.uid += 4294967296), m.gid < 0 && (m.gid += 4294967296)), m;
    };
  }
  function h(u) {
    if (!u || u.code === "ENOSYS")
      return !0;
    var d = !process.getuid || process.getuid() !== 0;
    return !!(d && (u.code === "EINVAL" || u.code === "EPERM"));
  }
}
var no = Ra.Stream, su = au;
function au(t) {
  return {
    ReadStream: e,
    WriteStream: n
  };
  function e(r, o) {
    if (!(this instanceof e))
      return new e(r, o);
    no.call(this);
    var i = this;
    this.path = r, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, o = o || {};
    for (var a = Object.keys(o), c = 0, f = a.length; c < f; c++) {
      var h = a[c];
      this[h] = o[h];
    }
    if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.end === void 0)
        this.end = 1 / 0;
      else if (typeof this.end != "number")
        throw TypeError("end must be a Number");
      if (this.start > this.end)
        throw new Error("start must be <= end");
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        i._read();
      });
      return;
    }
    t.open(this.path, this.flags, this.mode, function(u, d) {
      if (u) {
        i.emit("error", u), i.readable = !1;
        return;
      }
      i.fd = d, i.emit("open", d), i._read();
    });
  }
  function n(r, o) {
    if (!(this instanceof n))
      return new n(r, o);
    no.call(this), this.path = r, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, o = o || {};
    for (var i = Object.keys(o), a = 0, c = i.length; a < c; a++) {
      var f = i[a];
      this[f] = o[f];
    }
    if (this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.start < 0)
        throw new Error("start must be >= zero");
      this.pos = this.start;
    }
    this.busy = !1, this._queue = [], this.fd === null && (this._open = t.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
  }
}
var cu = uu, lu = Object.getPrototypeOf || function(t) {
  return t.__proto__;
};
function uu(t) {
  if (t === null || typeof t != "object")
    return t;
  if (t instanceof Object)
    var e = { __proto__: lu(t) };
  else
    var e = /* @__PURE__ */ Object.create(null);
  return Object.getOwnPropertyNames(t).forEach(function(n) {
    Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
  }), e;
}
var V = S, fu = ou, du = su, pu = cu, on = sr, ae, vn;
typeof Symbol == "function" && typeof Symbol.for == "function" ? (ae = Symbol.for("graceful-fs.queue"), vn = Symbol.for("graceful-fs.previous")) : (ae = "___graceful-fs.queue", vn = "___graceful-fs.previous");
function hu() {
}
function ri(t, e) {
  Object.defineProperty(t, ae, {
    get: function() {
      return e;
    }
  });
}
var Ze = hu;
on.debuglog ? Ze = on.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (Ze = function() {
  var t = on.format.apply(on, arguments);
  t = "GFS4: " + t.split(/\n/).join(`
GFS4: `), console.error(t);
});
if (!V[ae]) {
  var mu = Ye[ae] || [];
  ri(V, mu), V.close = function(t) {
    function e(n, r) {
      return t.call(V, n, function(o) {
        o || ro(), typeof r == "function" && r.apply(this, arguments);
      });
    }
    return Object.defineProperty(e, vn, {
      value: t
    }), e;
  }(V.close), V.closeSync = function(t) {
    function e(n) {
      t.apply(V, arguments), ro();
    }
    return Object.defineProperty(e, vn, {
      value: t
    }), e;
  }(V.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
    Ze(V[ae]), Ao.equal(V[ae].length, 0);
  });
}
Ye[ae] || ri(Ye, V[ae]);
var ye = ur(pu(V));
process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !V.__patched && (ye = ur(V), V.__patched = !0);
function ur(t) {
  fu(t), t.gracefulify = ur, t.createReadStream = wt, t.createWriteStream = Ue;
  var e = t.readFile;
  t.readFile = n;
  function n(F, N, A) {
    return typeof N == "function" && (A = N, N = null), H(F, N, A);
    function H(Q, Y, U, J) {
      return e(Q, Y, function(R) {
        R && (R.code === "EMFILE" || R.code === "ENFILE") ? at([H, [Q, Y, U], R, J || Date.now(), Date.now()]) : typeof U == "function" && U.apply(this, arguments);
      });
    }
  }
  var r = t.writeFile;
  t.writeFile = o;
  function o(F, N, A, H) {
    return typeof A == "function" && (H = A, A = null), Q(F, N, A, H);
    function Q(Y, U, J, R, X) {
      return r(Y, U, J, function(M) {
        M && (M.code === "EMFILE" || M.code === "ENFILE") ? at([Q, [Y, U, J, R], M, X || Date.now(), Date.now()]) : typeof R == "function" && R.apply(this, arguments);
      });
    }
  }
  var i = t.appendFile;
  i && (t.appendFile = a);
  function a(F, N, A, H) {
    return typeof A == "function" && (H = A, A = null), Q(F, N, A, H);
    function Q(Y, U, J, R, X) {
      return i(Y, U, J, function(M) {
        M && (M.code === "EMFILE" || M.code === "ENFILE") ? at([Q, [Y, U, J, R], M, X || Date.now(), Date.now()]) : typeof R == "function" && R.apply(this, arguments);
      });
    }
  }
  var c = t.copyFile;
  c && (t.copyFile = f);
  function f(F, N, A, H) {
    return typeof A == "function" && (H = A, A = 0), Q(F, N, A, H);
    function Q(Y, U, J, R, X) {
      return c(Y, U, J, function(M) {
        M && (M.code === "EMFILE" || M.code === "ENFILE") ? at([Q, [Y, U, J, R], M, X || Date.now(), Date.now()]) : typeof R == "function" && R.apply(this, arguments);
      });
    }
  }
  var h = t.readdir;
  t.readdir = d;
  var u = /^v[0-5]\./;
  function d(F, N, A) {
    typeof N == "function" && (A = N, N = null);
    var H = u.test(process.version) ? function(U, J, R, X) {
      return h(U, Q(
        U,
        J,
        R,
        X
      ));
    } : function(U, J, R, X) {
      return h(U, J, Q(
        U,
        J,
        R,
        X
      ));
    };
    return H(F, N, A);
    function Q(Y, U, J, R) {
      return function(X, M) {
        X && (X.code === "EMFILE" || X.code === "ENFILE") ? at([
          H,
          [Y, U, J],
          X,
          R || Date.now(),
          Date.now()
        ]) : (M && M.sort && M.sort(), typeof J == "function" && J.call(this, X, M));
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var y = du(t);
    C = y.ReadStream, L = y.WriteStream;
  }
  var m = t.ReadStream;
  m && (C.prototype = Object.create(m.prototype), C.prototype.open = O);
  var w = t.WriteStream;
  w && (L.prototype = Object.create(w.prototype), L.prototype.open = ge), Object.defineProperty(t, "ReadStream", {
    get: function() {
      return C;
    },
    set: function(F) {
      C = F;
    },
    enumerable: !0,
    configurable: !0
  }), Object.defineProperty(t, "WriteStream", {
    get: function() {
      return L;
    },
    set: function(F) {
      L = F;
    },
    enumerable: !0,
    configurable: !0
  });
  var x = C;
  Object.defineProperty(t, "FileReadStream", {
    get: function() {
      return x;
    },
    set: function(F) {
      x = F;
    },
    enumerable: !0,
    configurable: !0
  });
  var v = L;
  Object.defineProperty(t, "FileWriteStream", {
    get: function() {
      return v;
    },
    set: function(F) {
      v = F;
    },
    enumerable: !0,
    configurable: !0
  });
  function C(F, N) {
    return this instanceof C ? (m.apply(this, arguments), this) : C.apply(Object.create(C.prototype), arguments);
  }
  function O() {
    var F = this;
    vt(F.path, F.flags, F.mode, function(N, A) {
      N ? (F.autoClose && F.destroy(), F.emit("error", N)) : (F.fd = A, F.emit("open", A), F.read());
    });
  }
  function L(F, N) {
    return this instanceof L ? (w.apply(this, arguments), this) : L.apply(Object.create(L.prototype), arguments);
  }
  function ge() {
    var F = this;
    vt(F.path, F.flags, F.mode, function(N, A) {
      N ? (F.destroy(), F.emit("error", N)) : (F.fd = A, F.emit("open", A));
    });
  }
  function wt(F, N) {
    return new t.ReadStream(F, N);
  }
  function Ue(F, N) {
    return new t.WriteStream(F, N);
  }
  var Gt = t.open;
  t.open = vt;
  function vt(F, N, A, H) {
    return typeof A == "function" && (H = A, A = null), Q(F, N, A, H);
    function Q(Y, U, J, R, X) {
      return Gt(Y, U, J, function(M, Sr) {
        M && (M.code === "EMFILE" || M.code === "ENFILE") ? at([Q, [Y, U, J, R], M, X || Date.now(), Date.now()]) : typeof R == "function" && R.apply(this, arguments);
      });
    }
  }
  return t;
}
function at(t) {
  Ze("ENQUEUE", t[0].name, t[1]), V[ae].push(t), fr();
}
var sn;
function ro() {
  for (var t = Date.now(), e = 0; e < V[ae].length; ++e)
    V[ae][e].length > 2 && (V[ae][e][3] = t, V[ae][e][4] = t);
  fr();
}
function fr() {
  if (clearTimeout(sn), sn = void 0, V[ae].length !== 0) {
    var t = V[ae].shift(), e = t[0], n = t[1], r = t[2], o = t[3], i = t[4];
    if (o === void 0)
      Ze("RETRY", e.name, n), e.apply(null, n);
    else if (Date.now() - o >= 6e4) {
      Ze("TIMEOUT", e.name, n);
      var a = n.pop();
      typeof a == "function" && a.call(null, r);
    } else {
      var c = Date.now() - i, f = Math.max(i - o, 1), h = Math.min(f * 1.2, 100);
      c >= h ? (Ze("RETRY", e.name, n), e.apply(null, n.concat([o]))) : V[ae].push(t);
    }
    sn === void 0 && (sn = setTimeout(fr, 0));
  }
}
(function(t) {
  const e = me.fromCallback, n = ye, r = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "close",
    "copyFile",
    "fchmod",
    "fchown",
    "fdatasync",
    "fstat",
    "fsync",
    "ftruncate",
    "futimes",
    "lchmod",
    "lchown",
    "link",
    "lstat",
    "mkdir",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readFile",
    "readlink",
    "realpath",
    "rename",
    "rm",
    "rmdir",
    "stat",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
  ].filter((o) => typeof n[o] == "function");
  Object.assign(t, n), r.forEach((o) => {
    t[o] = e(n[o]);
  }), t.exists = function(o, i) {
    return typeof i == "function" ? n.exists(o, i) : new Promise((a) => n.exists(o, a));
  }, t.read = function(o, i, a, c, f, h) {
    return typeof h == "function" ? n.read(o, i, a, c, f, h) : new Promise((u, d) => {
      n.read(o, i, a, c, f, (y, m, w) => {
        if (y)
          return d(y);
        u({ bytesRead: m, buffer: w });
      });
    });
  }, t.write = function(o, i, ...a) {
    return typeof a[a.length - 1] == "function" ? n.write(o, i, ...a) : new Promise((c, f) => {
      n.write(o, i, ...a, (h, u, d) => {
        if (h)
          return f(h);
        c({ bytesWritten: u, buffer: d });
      });
    });
  }, typeof n.writev == "function" && (t.writev = function(o, i, ...a) {
    return typeof a[a.length - 1] == "function" ? n.writev(o, i, ...a) : new Promise((c, f) => {
      n.writev(o, i, ...a, (h, u, d) => {
        if (h)
          return f(h);
        c({ bytesWritten: u, buffers: d });
      });
    });
  }), typeof n.realpath.native == "function" ? t.realpath.native = e(n.realpath.native) : process.emitWarning(
    "fs.realpath.native is not a function. Is fs being monkey-patched?",
    "Warning",
    "fs-extra-WARN0003"
  );
})(rt);
var dr = {}, oi = {};
const yu = _;
oi.checkPath = function(e) {
  if (process.platform === "win32" && /[<>:"|?*]/.test(e.replace(yu.parse(e).root, ""))) {
    const r = new Error(`Path contains invalid characters: ${e}`);
    throw r.code = "EINVAL", r;
  }
};
const ii = rt, { checkPath: si } = oi, ai = (t) => {
  const e = { mode: 511 };
  return typeof t == "number" ? t : { ...e, ...t }.mode;
};
dr.makeDir = async (t, e) => (si(t), ii.mkdir(t, {
  mode: ai(e),
  recursive: !0
}));
dr.makeDirSync = (t, e) => (si(t), ii.mkdirSync(t, {
  mode: ai(e),
  recursive: !0
}));
const gu = me.fromPromise, { makeDir: wu, makeDirSync: Bn } = dr, zn = gu(wu);
var xe = {
  mkdirs: zn,
  mkdirsSync: Bn,
  // alias
  mkdirp: zn,
  mkdirpSync: Bn,
  ensureDir: zn,
  ensureDirSync: Bn
};
const vu = me.fromPromise, ci = rt;
function Su(t) {
  return ci.access(t).then(() => !0).catch(() => !1);
}
var ot = {
  pathExists: vu(Su),
  pathExistsSync: ci.existsSync
};
const pt = ye;
function Eu(t, e, n, r) {
  pt.open(t, "r+", (o, i) => {
    if (o)
      return r(o);
    pt.futimes(i, e, n, (a) => {
      pt.close(i, (c) => {
        r && r(a || c);
      });
    });
  });
}
function $u(t, e, n) {
  const r = pt.openSync(t, "r+");
  return pt.futimesSync(r, e, n), pt.closeSync(r);
}
var li = {
  utimesMillis: Eu,
  utimesMillisSync: $u
};
const mt = rt, te = _, bu = sr;
function Fu(t, e, n) {
  const r = n.dereference ? (o) => mt.stat(o, { bigint: !0 }) : (o) => mt.lstat(o, { bigint: !0 });
  return Promise.all([
    r(t),
    r(e).catch((o) => {
      if (o.code === "ENOENT")
        return null;
      throw o;
    })
  ]).then(([o, i]) => ({ srcStat: o, destStat: i }));
}
function Pu(t, e, n) {
  let r;
  const o = n.dereference ? (a) => mt.statSync(a, { bigint: !0 }) : (a) => mt.lstatSync(a, { bigint: !0 }), i = o(t);
  try {
    r = o(e);
  } catch (a) {
    if (a.code === "ENOENT")
      return { srcStat: i, destStat: null };
    throw a;
  }
  return { srcStat: i, destStat: r };
}
function _u(t, e, n, r, o) {
  bu.callbackify(Fu)(t, e, r, (i, a) => {
    if (i)
      return o(i);
    const { srcStat: c, destStat: f } = a;
    if (f) {
      if (Ht(c, f)) {
        const h = te.basename(t), u = te.basename(e);
        return n === "move" && h !== u && h.toLowerCase() === u.toLowerCase() ? o(null, { srcStat: c, destStat: f, isChangingCase: !0 }) : o(new Error("Source and destination must not be the same."));
      }
      if (c.isDirectory() && !f.isDirectory())
        return o(new Error(`Cannot overwrite non-directory '${e}' with directory '${t}'.`));
      if (!c.isDirectory() && f.isDirectory())
        return o(new Error(`Cannot overwrite directory '${e}' with non-directory '${t}'.`));
    }
    return c.isDirectory() && pr(t, e) ? o(new Error(Dn(t, e, n))) : o(null, { srcStat: c, destStat: f });
  });
}
function xu(t, e, n, r) {
  const { srcStat: o, destStat: i } = Pu(t, e, r);
  if (i) {
    if (Ht(o, i)) {
      const a = te.basename(t), c = te.basename(e);
      if (n === "move" && a !== c && a.toLowerCase() === c.toLowerCase())
        return { srcStat: o, destStat: i, isChangingCase: !0 };
      throw new Error("Source and destination must not be the same.");
    }
    if (o.isDirectory() && !i.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${e}' with directory '${t}'.`);
    if (!o.isDirectory() && i.isDirectory())
      throw new Error(`Cannot overwrite directory '${e}' with non-directory '${t}'.`);
  }
  if (o.isDirectory() && pr(t, e))
    throw new Error(Dn(t, e, n));
  return { srcStat: o, destStat: i };
}
function ui(t, e, n, r, o) {
  const i = te.resolve(te.dirname(t)), a = te.resolve(te.dirname(n));
  if (a === i || a === te.parse(a).root)
    return o();
  mt.stat(a, { bigint: !0 }, (c, f) => c ? c.code === "ENOENT" ? o() : o(c) : Ht(e, f) ? o(new Error(Dn(t, n, r))) : ui(t, e, a, r, o));
}
function fi(t, e, n, r) {
  const o = te.resolve(te.dirname(t)), i = te.resolve(te.dirname(n));
  if (i === o || i === te.parse(i).root)
    return;
  let a;
  try {
    a = mt.statSync(i, { bigint: !0 });
  } catch (c) {
    if (c.code === "ENOENT")
      return;
    throw c;
  }
  if (Ht(e, a))
    throw new Error(Dn(t, n, r));
  return fi(t, e, i, r);
}
function Ht(t, e) {
  return e.ino && e.dev && e.ino === t.ino && e.dev === t.dev;
}
function pr(t, e) {
  const n = te.resolve(t).split(te.sep).filter((o) => o), r = te.resolve(e).split(te.sep).filter((o) => o);
  return n.reduce((o, i, a) => o && r[a] === i, !0);
}
function Dn(t, e, n) {
  return `Cannot ${n} '${t}' to a subdirectory of itself, '${e}'.`;
}
var gt = {
  checkPaths: _u,
  checkPathsSync: xu,
  checkParentPaths: ui,
  checkParentPathsSync: fi,
  isSrcSubdir: pr,
  areIdentical: Ht
};
const ve = ye, Nt = _, Du = xe.mkdirs, Ou = ot.pathExists, ku = li.utimesMillis, It = gt;
function Cu(t, e, n, r) {
  typeof n == "function" && !r ? (r = n, n = {}) : typeof n == "function" && (n = { filter: n }), r = r || function() {
  }, n = n || {}, n.clobber = "clobber" in n ? !!n.clobber : !0, n.overwrite = "overwrite" in n ? !!n.overwrite : n.clobber, n.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0001"
  ), It.checkPaths(t, e, "copy", n, (o, i) => {
    if (o)
      return r(o);
    const { srcStat: a, destStat: c } = i;
    It.checkParentPaths(t, a, e, "copy", (f) => f ? r(f) : n.filter ? di(oo, c, t, e, n, r) : oo(c, t, e, n, r));
  });
}
function oo(t, e, n, r, o) {
  const i = Nt.dirname(n);
  Ou(i, (a, c) => {
    if (a)
      return o(a);
    if (c)
      return Sn(t, e, n, r, o);
    Du(i, (f) => f ? o(f) : Sn(t, e, n, r, o));
  });
}
function di(t, e, n, r, o, i) {
  Promise.resolve(o.filter(n, r)).then((a) => a ? t(e, n, r, o, i) : i(), (a) => i(a));
}
function Au(t, e, n, r, o) {
  return r.filter ? di(Sn, t, e, n, r, o) : Sn(t, e, n, r, o);
}
function Sn(t, e, n, r, o) {
  (r.dereference ? ve.stat : ve.lstat)(e, (a, c) => a ? o(a) : c.isDirectory() ? Mu(c, t, e, n, r, o) : c.isFile() || c.isCharacterDevice() || c.isBlockDevice() ? Tu(c, t, e, n, r, o) : c.isSymbolicLink() ? Bu(t, e, n, r, o) : c.isSocket() ? o(new Error(`Cannot copy a socket file: ${e}`)) : c.isFIFO() ? o(new Error(`Cannot copy a FIFO pipe: ${e}`)) : o(new Error(`Unknown file: ${e}`)));
}
function Tu(t, e, n, r, o, i) {
  return e ? Lu(t, n, r, o, i) : pi(t, n, r, o, i);
}
function Lu(t, e, n, r, o) {
  if (r.overwrite)
    ve.unlink(n, (i) => i ? o(i) : pi(t, e, n, r, o));
  else
    return r.errorOnExist ? o(new Error(`'${n}' already exists`)) : o();
}
function pi(t, e, n, r, o) {
  ve.copyFile(e, n, (i) => i ? o(i) : r.preserveTimestamps ? Nu(t.mode, e, n, o) : On(n, t.mode, o));
}
function Nu(t, e, n, r) {
  return Iu(t) ? Ru(n, t, (o) => o ? r(o) : io(t, e, n, r)) : io(t, e, n, r);
}
function Iu(t) {
  return (t & 128) === 0;
}
function Ru(t, e, n) {
  return On(t, e | 128, n);
}
function io(t, e, n, r) {
  ju(e, n, (o) => o ? r(o) : On(n, t, r));
}
function On(t, e, n) {
  return ve.chmod(t, e, n);
}
function ju(t, e, n) {
  ve.stat(t, (r, o) => r ? n(r) : ku(e, o.atime, o.mtime, n));
}
function Mu(t, e, n, r, o, i) {
  return e ? hi(n, r, o, i) : Uu(t.mode, n, r, o, i);
}
function Uu(t, e, n, r, o) {
  ve.mkdir(n, (i) => {
    if (i)
      return o(i);
    hi(e, n, r, (a) => a ? o(a) : On(n, t, o));
  });
}
function hi(t, e, n, r) {
  ve.readdir(t, (o, i) => o ? r(o) : mi(i, t, e, n, r));
}
function mi(t, e, n, r, o) {
  const i = t.pop();
  return i ? Wu(t, i, e, n, r, o) : o();
}
function Wu(t, e, n, r, o, i) {
  const a = Nt.join(n, e), c = Nt.join(r, e);
  It.checkPaths(a, c, "copy", o, (f, h) => {
    if (f)
      return i(f);
    const { destStat: u } = h;
    Au(u, a, c, o, (d) => d ? i(d) : mi(t, n, r, o, i));
  });
}
function Bu(t, e, n, r, o) {
  ve.readlink(e, (i, a) => {
    if (i)
      return o(i);
    if (r.dereference && (a = Nt.resolve(process.cwd(), a)), t)
      ve.readlink(n, (c, f) => c ? c.code === "EINVAL" || c.code === "UNKNOWN" ? ve.symlink(a, n, o) : o(c) : (r.dereference && (f = Nt.resolve(process.cwd(), f)), It.isSrcSubdir(a, f) ? o(new Error(`Cannot copy '${a}' to a subdirectory of itself, '${f}'.`)) : t.isDirectory() && It.isSrcSubdir(f, a) ? o(new Error(`Cannot overwrite '${f}' with '${a}'.`)) : zu(a, n, o)));
    else
      return ve.symlink(a, n, o);
  });
}
function zu(t, e, n) {
  ve.unlink(e, (r) => r ? n(r) : ve.symlink(t, e, n));
}
var Ju = Cu;
const ue = ye, Rt = _, qu = xe.mkdirsSync, Vu = li.utimesMillisSync, jt = gt;
function Hu(t, e, n) {
  typeof n == "function" && (n = { filter: n }), n = n || {}, n.clobber = "clobber" in n ? !!n.clobber : !0, n.overwrite = "overwrite" in n ? !!n.overwrite : n.clobber, n.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0002"
  );
  const { srcStat: r, destStat: o } = jt.checkPathsSync(t, e, "copy", n);
  return jt.checkParentPathsSync(t, r, e, "copy"), Gu(o, t, e, n);
}
function Gu(t, e, n, r) {
  if (r.filter && !r.filter(e, n))
    return;
  const o = Rt.dirname(n);
  return ue.existsSync(o) || qu(o), yi(t, e, n, r);
}
function Ku(t, e, n, r) {
  if (!(r.filter && !r.filter(e, n)))
    return yi(t, e, n, r);
}
function yi(t, e, n, r) {
  const i = (r.dereference ? ue.statSync : ue.lstatSync)(e);
  if (i.isDirectory())
    return nf(i, t, e, n, r);
  if (i.isFile() || i.isCharacterDevice() || i.isBlockDevice())
    return Yu(i, t, e, n, r);
  if (i.isSymbolicLink())
    return sf(t, e, n, r);
  throw i.isSocket() ? new Error(`Cannot copy a socket file: ${e}`) : i.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${e}`) : new Error(`Unknown file: ${e}`);
}
function Yu(t, e, n, r, o) {
  return e ? Qu(t, n, r, o) : gi(t, n, r, o);
}
function Qu(t, e, n, r) {
  if (r.overwrite)
    return ue.unlinkSync(n), gi(t, e, n, r);
  if (r.errorOnExist)
    throw new Error(`'${n}' already exists`);
}
function gi(t, e, n, r) {
  return ue.copyFileSync(e, n), r.preserveTimestamps && Xu(t.mode, e, n), hr(n, t.mode);
}
function Xu(t, e, n) {
  return Zu(t) && ef(n, t), tf(e, n);
}
function Zu(t) {
  return (t & 128) === 0;
}
function ef(t, e) {
  return hr(t, e | 128);
}
function hr(t, e) {
  return ue.chmodSync(t, e);
}
function tf(t, e) {
  const n = ue.statSync(t);
  return Vu(e, n.atime, n.mtime);
}
function nf(t, e, n, r, o) {
  return e ? wi(n, r, o) : rf(t.mode, n, r, o);
}
function rf(t, e, n, r) {
  return ue.mkdirSync(n), wi(e, n, r), hr(n, t);
}
function wi(t, e, n) {
  ue.readdirSync(t).forEach((r) => of(r, t, e, n));
}
function of(t, e, n, r) {
  const o = Rt.join(e, t), i = Rt.join(n, t), { destStat: a } = jt.checkPathsSync(o, i, "copy", r);
  return Ku(a, o, i, r);
}
function sf(t, e, n, r) {
  let o = ue.readlinkSync(e);
  if (r.dereference && (o = Rt.resolve(process.cwd(), o)), t) {
    let i;
    try {
      i = ue.readlinkSync(n);
    } catch (a) {
      if (a.code === "EINVAL" || a.code === "UNKNOWN")
        return ue.symlinkSync(o, n);
      throw a;
    }
    if (r.dereference && (i = Rt.resolve(process.cwd(), i)), jt.isSrcSubdir(o, i))
      throw new Error(`Cannot copy '${o}' to a subdirectory of itself, '${i}'.`);
    if (ue.statSync(n).isDirectory() && jt.isSrcSubdir(i, o))
      throw new Error(`Cannot overwrite '${i}' with '${o}'.`);
    return af(o, n);
  } else
    return ue.symlinkSync(o, n);
}
function af(t, e) {
  return ue.unlinkSync(e), ue.symlinkSync(t, e);
}
var cf = Hu;
const lf = me.fromCallback;
var mr = {
  copy: lf(Ju),
  copySync: cf
};
const so = ye, vi = _, j = Ao, Mt = process.platform === "win32";
function Si(t) {
  [
    "unlink",
    "chmod",
    "stat",
    "lstat",
    "rmdir",
    "readdir"
  ].forEach((n) => {
    t[n] = t[n] || so[n], n = n + "Sync", t[n] = t[n] || so[n];
  }), t.maxBusyTries = t.maxBusyTries || 3;
}
function yr(t, e, n) {
  let r = 0;
  typeof e == "function" && (n = e, e = {}), j(t, "rimraf: missing path"), j.strictEqual(typeof t, "string", "rimraf: path should be a string"), j.strictEqual(typeof n, "function", "rimraf: callback function required"), j(e, "rimraf: invalid options argument provided"), j.strictEqual(typeof e, "object", "rimraf: options should be object"), Si(e), ao(t, e, function o(i) {
    if (i) {
      if ((i.code === "EBUSY" || i.code === "ENOTEMPTY" || i.code === "EPERM") && r < e.maxBusyTries) {
        r++;
        const a = r * 100;
        return setTimeout(() => ao(t, e, o), a);
      }
      i.code === "ENOENT" && (i = null);
    }
    n(i);
  });
}
function ao(t, e, n) {
  j(t), j(e), j(typeof n == "function"), e.lstat(t, (r, o) => {
    if (r && r.code === "ENOENT")
      return n(null);
    if (r && r.code === "EPERM" && Mt)
      return co(t, e, r, n);
    if (o && o.isDirectory())
      return hn(t, e, r, n);
    e.unlink(t, (i) => {
      if (i) {
        if (i.code === "ENOENT")
          return n(null);
        if (i.code === "EPERM")
          return Mt ? co(t, e, i, n) : hn(t, e, i, n);
        if (i.code === "EISDIR")
          return hn(t, e, i, n);
      }
      return n(i);
    });
  });
}
function co(t, e, n, r) {
  j(t), j(e), j(typeof r == "function"), e.chmod(t, 438, (o) => {
    o ? r(o.code === "ENOENT" ? null : n) : e.stat(t, (i, a) => {
      i ? r(i.code === "ENOENT" ? null : n) : a.isDirectory() ? hn(t, e, n, r) : e.unlink(t, r);
    });
  });
}
function lo(t, e, n) {
  let r;
  j(t), j(e);
  try {
    e.chmodSync(t, 438);
  } catch (o) {
    if (o.code === "ENOENT")
      return;
    throw n;
  }
  try {
    r = e.statSync(t);
  } catch (o) {
    if (o.code === "ENOENT")
      return;
    throw n;
  }
  r.isDirectory() ? mn(t, e, n) : e.unlinkSync(t);
}
function hn(t, e, n, r) {
  j(t), j(e), j(typeof r == "function"), e.rmdir(t, (o) => {
    o && (o.code === "ENOTEMPTY" || o.code === "EEXIST" || o.code === "EPERM") ? uf(t, e, r) : o && o.code === "ENOTDIR" ? r(n) : r(o);
  });
}
function uf(t, e, n) {
  j(t), j(e), j(typeof n == "function"), e.readdir(t, (r, o) => {
    if (r)
      return n(r);
    let i = o.length, a;
    if (i === 0)
      return e.rmdir(t, n);
    o.forEach((c) => {
      yr(vi.join(t, c), e, (f) => {
        if (!a) {
          if (f)
            return n(a = f);
          --i === 0 && e.rmdir(t, n);
        }
      });
    });
  });
}
function Ei(t, e) {
  let n;
  e = e || {}, Si(e), j(t, "rimraf: missing path"), j.strictEqual(typeof t, "string", "rimraf: path should be a string"), j(e, "rimraf: missing options"), j.strictEqual(typeof e, "object", "rimraf: options should be object");
  try {
    n = e.lstatSync(t);
  } catch (r) {
    if (r.code === "ENOENT")
      return;
    r.code === "EPERM" && Mt && lo(t, e, r);
  }
  try {
    n && n.isDirectory() ? mn(t, e, null) : e.unlinkSync(t);
  } catch (r) {
    if (r.code === "ENOENT")
      return;
    if (r.code === "EPERM")
      return Mt ? lo(t, e, r) : mn(t, e, r);
    if (r.code !== "EISDIR")
      throw r;
    mn(t, e, r);
  }
}
function mn(t, e, n) {
  j(t), j(e);
  try {
    e.rmdirSync(t);
  } catch (r) {
    if (r.code === "ENOTDIR")
      throw n;
    if (r.code === "ENOTEMPTY" || r.code === "EEXIST" || r.code === "EPERM")
      ff(t, e);
    else if (r.code !== "ENOENT")
      throw r;
  }
}
function ff(t, e) {
  if (j(t), j(e), e.readdirSync(t).forEach((n) => Ei(vi.join(t, n), e)), Mt) {
    const n = Date.now();
    do
      try {
        return e.rmdirSync(t, e);
      } catch {
      }
    while (Date.now() - n < 500);
  } else
    return e.rmdirSync(t, e);
}
var df = yr;
yr.sync = Ei;
const En = ye, pf = me.fromCallback, $i = df;
function hf(t, e) {
  if (En.rm)
    return En.rm(t, { recursive: !0, force: !0 }, e);
  $i(t, e);
}
function mf(t) {
  if (En.rmSync)
    return En.rmSync(t, { recursive: !0, force: !0 });
  $i.sync(t);
}
var kn = {
  remove: pf(hf),
  removeSync: mf
};
const yf = me.fromPromise, bi = rt, Fi = _, Pi = xe, _i = kn, uo = yf(async function(e) {
  let n;
  try {
    n = await bi.readdir(e);
  } catch {
    return Pi.mkdirs(e);
  }
  return Promise.all(n.map((r) => _i.remove(Fi.join(e, r))));
});
function fo(t) {
  let e;
  try {
    e = bi.readdirSync(t);
  } catch {
    return Pi.mkdirsSync(t);
  }
  e.forEach((n) => {
    n = Fi.join(t, n), _i.removeSync(n);
  });
}
var gf = {
  emptyDirSync: fo,
  emptydirSync: fo,
  emptyDir: uo,
  emptydir: uo
};
const wf = me.fromCallback, xi = _, je = ye, Di = xe;
function vf(t, e) {
  function n() {
    je.writeFile(t, "", (r) => {
      if (r)
        return e(r);
      e();
    });
  }
  je.stat(t, (r, o) => {
    if (!r && o.isFile())
      return e();
    const i = xi.dirname(t);
    je.stat(i, (a, c) => {
      if (a)
        return a.code === "ENOENT" ? Di.mkdirs(i, (f) => {
          if (f)
            return e(f);
          n();
        }) : e(a);
      c.isDirectory() ? n() : je.readdir(i, (f) => {
        if (f)
          return e(f);
      });
    });
  });
}
function Sf(t) {
  let e;
  try {
    e = je.statSync(t);
  } catch {
  }
  if (e && e.isFile())
    return;
  const n = xi.dirname(t);
  try {
    je.statSync(n).isDirectory() || je.readdirSync(n);
  } catch (r) {
    if (r && r.code === "ENOENT")
      Di.mkdirsSync(n);
    else
      throw r;
  }
  je.writeFileSync(t, "");
}
var Ef = {
  createFile: wf(vf),
  createFileSync: Sf
};
const $f = me.fromCallback, Oi = _, Ne = ye, ki = xe, bf = ot.pathExists, { areIdentical: Ci } = gt;
function Ff(t, e, n) {
  function r(o, i) {
    Ne.link(o, i, (a) => {
      if (a)
        return n(a);
      n(null);
    });
  }
  Ne.lstat(e, (o, i) => {
    Ne.lstat(t, (a, c) => {
      if (a)
        return a.message = a.message.replace("lstat", "ensureLink"), n(a);
      if (i && Ci(c, i))
        return n(null);
      const f = Oi.dirname(e);
      bf(f, (h, u) => {
        if (h)
          return n(h);
        if (u)
          return r(t, e);
        ki.mkdirs(f, (d) => {
          if (d)
            return n(d);
          r(t, e);
        });
      });
    });
  });
}
function Pf(t, e) {
  let n;
  try {
    n = Ne.lstatSync(e);
  } catch {
  }
  try {
    const i = Ne.lstatSync(t);
    if (n && Ci(i, n))
      return;
  } catch (i) {
    throw i.message = i.message.replace("lstat", "ensureLink"), i;
  }
  const r = Oi.dirname(e);
  return Ne.existsSync(r) || ki.mkdirsSync(r), Ne.linkSync(t, e);
}
var _f = {
  createLink: $f(Ff),
  createLinkSync: Pf
};
const Me = _, Ct = ye, xf = ot.pathExists;
function Df(t, e, n) {
  if (Me.isAbsolute(t))
    return Ct.lstat(t, (r) => r ? (r.message = r.message.replace("lstat", "ensureSymlink"), n(r)) : n(null, {
      toCwd: t,
      toDst: t
    }));
  {
    const r = Me.dirname(e), o = Me.join(r, t);
    return xf(o, (i, a) => i ? n(i) : a ? n(null, {
      toCwd: o,
      toDst: t
    }) : Ct.lstat(t, (c) => c ? (c.message = c.message.replace("lstat", "ensureSymlink"), n(c)) : n(null, {
      toCwd: t,
      toDst: Me.relative(r, t)
    })));
  }
}
function Of(t, e) {
  let n;
  if (Me.isAbsolute(t)) {
    if (n = Ct.existsSync(t), !n)
      throw new Error("absolute srcpath does not exist");
    return {
      toCwd: t,
      toDst: t
    };
  } else {
    const r = Me.dirname(e), o = Me.join(r, t);
    if (n = Ct.existsSync(o), n)
      return {
        toCwd: o,
        toDst: t
      };
    if (n = Ct.existsSync(t), !n)
      throw new Error("relative srcpath does not exist");
    return {
      toCwd: t,
      toDst: Me.relative(r, t)
    };
  }
}
var kf = {
  symlinkPaths: Df,
  symlinkPathsSync: Of
};
const Ai = ye;
function Cf(t, e, n) {
  if (n = typeof e == "function" ? e : n, e = typeof e == "function" ? !1 : e, e)
    return n(null, e);
  Ai.lstat(t, (r, o) => {
    if (r)
      return n(null, "file");
    e = o && o.isDirectory() ? "dir" : "file", n(null, e);
  });
}
function Af(t, e) {
  let n;
  if (e)
    return e;
  try {
    n = Ai.lstatSync(t);
  } catch {
    return "file";
  }
  return n && n.isDirectory() ? "dir" : "file";
}
var Tf = {
  symlinkType: Cf,
  symlinkTypeSync: Af
};
const Lf = me.fromCallback, Ti = _, Pe = rt, Li = xe, Nf = Li.mkdirs, If = Li.mkdirsSync, Ni = kf, Rf = Ni.symlinkPaths, jf = Ni.symlinkPathsSync, Ii = Tf, Mf = Ii.symlinkType, Uf = Ii.symlinkTypeSync, Wf = ot.pathExists, { areIdentical: Ri } = gt;
function Bf(t, e, n, r) {
  r = typeof n == "function" ? n : r, n = typeof n == "function" ? !1 : n, Pe.lstat(e, (o, i) => {
    !o && i.isSymbolicLink() ? Promise.all([
      Pe.stat(t),
      Pe.stat(e)
    ]).then(([a, c]) => {
      if (Ri(a, c))
        return r(null);
      po(t, e, n, r);
    }) : po(t, e, n, r);
  });
}
function po(t, e, n, r) {
  Rf(t, e, (o, i) => {
    if (o)
      return r(o);
    t = i.toDst, Mf(i.toCwd, n, (a, c) => {
      if (a)
        return r(a);
      const f = Ti.dirname(e);
      Wf(f, (h, u) => {
        if (h)
          return r(h);
        if (u)
          return Pe.symlink(t, e, c, r);
        Nf(f, (d) => {
          if (d)
            return r(d);
          Pe.symlink(t, e, c, r);
        });
      });
    });
  });
}
function zf(t, e, n) {
  let r;
  try {
    r = Pe.lstatSync(e);
  } catch {
  }
  if (r && r.isSymbolicLink()) {
    const c = Pe.statSync(t), f = Pe.statSync(e);
    if (Ri(c, f))
      return;
  }
  const o = jf(t, e);
  t = o.toDst, n = Uf(o.toCwd, n);
  const i = Ti.dirname(e);
  return Pe.existsSync(i) || If(i), Pe.symlinkSync(t, e, n);
}
var Jf = {
  createSymlink: Lf(Bf),
  createSymlinkSync: zf
};
const { createFile: ho, createFileSync: mo } = Ef, { createLink: yo, createLinkSync: go } = _f, { createSymlink: wo, createSymlinkSync: vo } = Jf;
var qf = {
  // file
  createFile: ho,
  createFileSync: mo,
  ensureFile: ho,
  ensureFileSync: mo,
  // link
  createLink: yo,
  createLinkSync: go,
  ensureLink: yo,
  ensureLinkSync: go,
  // symlink
  createSymlink: wo,
  createSymlinkSync: vo,
  ensureSymlink: wo,
  ensureSymlinkSync: vo
};
function Vf(t, { EOL: e = `
`, finalEOL: n = !0, replacer: r = null, spaces: o } = {}) {
  const i = n ? e : "";
  return JSON.stringify(t, r, o).replace(/\n/g, e) + i;
}
function Hf(t) {
  return Buffer.isBuffer(t) && (t = t.toString("utf8")), t.replace(/^\uFEFF/, "");
}
var gr = { stringify: Vf, stripBom: Hf };
let yt;
try {
  yt = ye;
} catch {
  yt = S;
}
const Cn = me, { stringify: ji, stripBom: Mi } = gr;
async function Gf(t, e = {}) {
  typeof e == "string" && (e = { encoding: e });
  const n = e.fs || yt, r = "throws" in e ? e.throws : !0;
  let o = await Cn.fromCallback(n.readFile)(t, e);
  o = Mi(o);
  let i;
  try {
    i = JSON.parse(o, e ? e.reviver : null);
  } catch (a) {
    if (r)
      throw a.message = `${t}: ${a.message}`, a;
    return null;
  }
  return i;
}
const Kf = Cn.fromPromise(Gf);
function Yf(t, e = {}) {
  typeof e == "string" && (e = { encoding: e });
  const n = e.fs || yt, r = "throws" in e ? e.throws : !0;
  try {
    let o = n.readFileSync(t, e);
    return o = Mi(o), JSON.parse(o, e.reviver);
  } catch (o) {
    if (r)
      throw o.message = `${t}: ${o.message}`, o;
    return null;
  }
}
async function Qf(t, e, n = {}) {
  const r = n.fs || yt, o = ji(e, n);
  await Cn.fromCallback(r.writeFile)(t, o, n);
}
const Xf = Cn.fromPromise(Qf);
function Zf(t, e, n = {}) {
  const r = n.fs || yt, o = ji(e, n);
  return r.writeFileSync(t, o, n);
}
const ed = {
  readFile: Kf,
  readFileSync: Yf,
  writeFile: Xf,
  writeFileSync: Zf
};
var td = ed;
const an = td;
var nd = {
  // jsonfile exports
  readJson: an.readFile,
  readJsonSync: an.readFileSync,
  writeJson: an.writeFile,
  writeJsonSync: an.writeFileSync
};
const rd = me.fromCallback, At = ye, Ui = _, Wi = xe, od = ot.pathExists;
function id(t, e, n, r) {
  typeof n == "function" && (r = n, n = "utf8");
  const o = Ui.dirname(t);
  od(o, (i, a) => {
    if (i)
      return r(i);
    if (a)
      return At.writeFile(t, e, n, r);
    Wi.mkdirs(o, (c) => {
      if (c)
        return r(c);
      At.writeFile(t, e, n, r);
    });
  });
}
function sd(t, ...e) {
  const n = Ui.dirname(t);
  if (At.existsSync(n))
    return At.writeFileSync(t, ...e);
  Wi.mkdirsSync(n), At.writeFileSync(t, ...e);
}
var wr = {
  outputFile: rd(id),
  outputFileSync: sd
};
const { stringify: ad } = gr, { outputFile: cd } = wr;
async function ld(t, e, n = {}) {
  const r = ad(e, n);
  await cd(t, r, n);
}
var ud = ld;
const { stringify: fd } = gr, { outputFileSync: dd } = wr;
function pd(t, e, n) {
  const r = fd(e, n);
  dd(t, r, n);
}
var hd = pd;
const md = me.fromPromise, pe = nd;
pe.outputJson = md(ud);
pe.outputJsonSync = hd;
pe.outputJSON = pe.outputJson;
pe.outputJSONSync = pe.outputJsonSync;
pe.writeJSON = pe.writeJson;
pe.writeJSONSync = pe.writeJsonSync;
pe.readJSON = pe.readJson;
pe.readJSONSync = pe.readJsonSync;
var yd = pe;
const gd = ye, tr = _, wd = mr.copy, Bi = kn.remove, vd = xe.mkdirp, Sd = ot.pathExists, So = gt;
function Ed(t, e, n, r) {
  typeof n == "function" && (r = n, n = {}), n = n || {};
  const o = n.overwrite || n.clobber || !1;
  So.checkPaths(t, e, "move", n, (i, a) => {
    if (i)
      return r(i);
    const { srcStat: c, isChangingCase: f = !1 } = a;
    So.checkParentPaths(t, c, e, "move", (h) => {
      if (h)
        return r(h);
      if ($d(e))
        return Eo(t, e, o, f, r);
      vd(tr.dirname(e), (u) => u ? r(u) : Eo(t, e, o, f, r));
    });
  });
}
function $d(t) {
  const e = tr.dirname(t);
  return tr.parse(e).root === e;
}
function Eo(t, e, n, r, o) {
  if (r)
    return Jn(t, e, n, o);
  if (n)
    return Bi(e, (i) => i ? o(i) : Jn(t, e, n, o));
  Sd(e, (i, a) => i ? o(i) : a ? o(new Error("dest already exists.")) : Jn(t, e, n, o));
}
function Jn(t, e, n, r) {
  gd.rename(t, e, (o) => o ? o.code !== "EXDEV" ? r(o) : bd(t, e, n, r) : r());
}
function bd(t, e, n, r) {
  wd(t, e, {
    overwrite: n,
    errorOnExist: !0
  }, (i) => i ? r(i) : Bi(t, r));
}
var Fd = Ed;
const zi = ye, nr = _, Pd = mr.copySync, Ji = kn.removeSync, _d = xe.mkdirpSync, $o = gt;
function xd(t, e, n) {
  n = n || {};
  const r = n.overwrite || n.clobber || !1, { srcStat: o, isChangingCase: i = !1 } = $o.checkPathsSync(t, e, "move", n);
  return $o.checkParentPathsSync(t, o, e, "move"), Dd(e) || _d(nr.dirname(e)), Od(t, e, r, i);
}
function Dd(t) {
  const e = nr.dirname(t);
  return nr.parse(e).root === e;
}
function Od(t, e, n, r) {
  if (r)
    return qn(t, e, n);
  if (n)
    return Ji(e), qn(t, e, n);
  if (zi.existsSync(e))
    throw new Error("dest already exists.");
  return qn(t, e, n);
}
function qn(t, e, n) {
  try {
    zi.renameSync(t, e);
  } catch (r) {
    if (r.code !== "EXDEV")
      throw r;
    return kd(t, e, n);
  }
}
function kd(t, e, n) {
  return Pd(t, e, {
    overwrite: n,
    errorOnExist: !0
  }), Ji(t);
}
var Cd = xd;
const Ad = me.fromCallback;
var Td = {
  move: Ad(Fd),
  moveSync: Cd
}, Ld = {
  // Export promiseified graceful-fs:
  ...rt,
  // Export extra methods:
  ...mr,
  ...gf,
  ...qf,
  ...yd,
  ...xe,
  ...Td,
  ...wr,
  ...ot,
  ...kn
};
Object.defineProperty(xn, "__esModule", { value: !0 });
var qi = xn.DownloadedUpdateHelper = void 0;
xn.createTempUpdateFile = Md;
const Nd = Na, Id = S, bo = tu, Ge = Ld, Tt = _;
class Rd {
  constructor(e) {
    this.cacheDir = e, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
  }
  get downloadedFileInfo() {
    return this._downloadedFileInfo;
  }
  get file() {
    return this._file;
  }
  get packageFile() {
    return this._packageFile;
  }
  get cacheDirForPendingUpdate() {
    return Tt.join(this.cacheDir, "pending");
  }
  async validateDownloadedPath(e, n, r, o) {
    if (this.versionInfo != null && this.file === e && this.fileInfo != null)
      return bo(this.versionInfo, n) && bo(this.fileInfo.info, r.info) && await (0, Ge.pathExists)(e) ? e : null;
    const i = await this.getValidCachedUpdateFile(r, o);
    return i === null ? null : (o.info(`Update has already been downloaded to ${e}).`), this._file = i, i);
  }
  async setDownloadedFile(e, n, r, o, i, a) {
    this._file = e, this._packageFile = n, this.versionInfo = r, this.fileInfo = o, this._downloadedFileInfo = {
      fileName: i,
      sha512: o.info.sha512,
      isAdminRightsRequired: o.info.isAdminRightsRequired === !0
    }, a && await (0, Ge.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
  }
  async clear() {
    this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
  }
  async cleanCacheDirForPendingUpdate() {
    try {
      await (0, Ge.emptyDir)(this.cacheDirForPendingUpdate);
    } catch {
    }
  }
  /**
   * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
   * @param fileInfo
   * @param logger
   */
  async getValidCachedUpdateFile(e, n) {
    const r = this.getUpdateInfoFile();
    if (!await (0, Ge.pathExists)(r))
      return null;
    let i;
    try {
      i = await (0, Ge.readJson)(r);
    } catch (h) {
      let u = "No cached update info available";
      return h.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), u += ` (error on read: ${h.message})`), n.info(u), null;
    }
    if (!((i == null ? void 0 : i.fileName) !== null))
      return n.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
    if (e.info.sha512 !== i.sha512)
      return n.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${i.sha512}, expected: ${e.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
    const c = Tt.join(this.cacheDirForPendingUpdate, i.fileName);
    if (!await (0, Ge.pathExists)(c))
      return n.info("Cached update file doesn't exist"), null;
    const f = await jd(c);
    return e.info.sha512 !== f ? (n.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${f}, expected: ${e.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = i, c);
  }
  getUpdateInfoFile() {
    return Tt.join(this.cacheDirForPendingUpdate, "update-info.json");
  }
}
qi = xn.DownloadedUpdateHelper = Rd;
function jd(t, e = "sha512", n = "base64", r) {
  return new Promise((o, i) => {
    const a = (0, Nd.createHash)(e);
    a.on("error", i).setEncoding(n), (0, Id.createReadStream)(t, {
      ...r,
      highWaterMark: 1024 * 1024
      /* better to use more memory but hash faster */
    }).on("error", i).on("end", () => {
      a.end(), o(a.read());
    }).pipe(a, { end: !1 });
  });
}
async function Md(t, e, n) {
  let r = 0, o = Tt.join(e, t);
  for (let i = 0; i < 3; i++)
    try {
      return await (0, Ge.unlink)(o), o;
    } catch (a) {
      if (a.code === "ENOENT")
        return o;
      n.warn(`Error on remove temp update file: ${a}`), o = Tt.join(e, `${r++}-${t}`);
    }
  return o;
}
class Ud extends La {
  constructor() {
    super(...arguments);
    P(this, "downloadedUpdateHelper", new qi(
      E.getPath("sessionData")
    ));
  }
}
const be = T.scope("[main] kernel processManager"), ct = Bt(Ut), Pt = 6190, Ke = class Ke {
  constructor() {
  }
  /**
   * Get ProcessManager singleton
   */
  static getInstance() {
    return Ke.instance || (Ke.instance = new Ke()), Ke.instance;
  }
  /**
   * Find process using specified port
   */
  async findProcessByPort() {
    return process.platform === "darwin" ? this.findProcessOnMac() : process.platform === "win32" ? this.findProcessOnWindows() : null;
  }
  /**
   * Find process on macOS
   */
  async findProcessOnMac() {
    try {
      const { stdout: e } = await ct(`lsof -i :${Pt} -t`), n = e.trim();
      return be.log("findProcessOnMac", n), n ? {
        pid: n,
        isRunning: !0
      } : null;
    } catch (e) {
      return be.error("Failed to find Mac process:", e), null;
    }
  }
  /**
   * Find process on Windows
   */
  async findProcessOnWindows() {
    try {
      const { stdout: e } = await ct(`netstat -ano | findstr :${Pt} | findstr LISTENING`);
      if (!e)
        return null;
      const n = e.trim().split(/\s+/).pop();
      return n ? {
        pid: n,
        isRunning: !0
      } : null;
    } catch (e) {
      return be.error("Failed to find Windows process:", e), null;
    }
  }
  /**
   * Check if process is running
   */
  async isProcessRunning(e) {
    try {
      return process.platform === "darwin" ? await ct(`ps -p ${e}`) : process.platform === "win32" && await ct(`tasklist /FI "PID eq ${e}"`), !0;
    } catch {
      return !1;
    }
  }
  /**
   * Terminate process
   */
  async killProcess(e, n = !1) {
    try {
      process.platform === "darwin" ? await ct(`kill ${n ? "-9" : "-15"} ${e}`) : process.platform === "win32" && await ct(`taskkill ${n ? "/F" : ""} /PID ${e} /T`), be.info(`${n ? "Force" : "Normal"} terminated process ${e}`);
    } catch (r) {
      throw be.error(`Failed to terminate process ${e}:`, r), r;
    }
  }
  /**
   * Clean up process using specified port
   */
  async cleanup() {
    try {
      be.info(`Attempting to terminate process using port ${Pt}`);
      const e = await this.findProcessByPort();
      if (!e) {
        be.info(`No process found using port ${Pt}`);
        return;
      }
      be.info(`Found process using port ${Pt}: ${e.pid}`), await this.killProcess(e.pid, !1), be.info("Termination signal sent"), await new Promise((r) => setTimeout(r, 5e3)), await this.isProcessRunning(e.pid) ? (await this.killProcess(e.pid, !0), be.info("Process forcefully terminated")) : be.info("Process terminated normally");
    } catch (e) {
      throw be.error("Error occurred while cleaning up process:", e), e;
    }
  }
};
P(Ke, "instance", null);
let rr = Ke;
const Wd = rr.getInstance(), Z = T.scope("[main] kernel executor");
let ie = null;
const Bd = Vt;
async function zd() {
  var t, e;
  try {
    if (ie) {
      Z.info("child process already exists, skip");
      return;
    }
    Z.info("Preparing to start program"), Z.info("Current environment:", Vt ? "development" : "production");
    const n = process.platform;
    if (Z.info(`current platform: ${n}`), Bd)
      Z.info("!!!Development environment, starting directly");
    else {
      Z.info("!!!Production environment, starting program"), await vr(), Z.info("start program"), Z.info(`child process path: ${ln}`);
      const r = await zt.stat(ln);
      Z.info(`File permissions: ${r.mode}`), ie = ko(ln), Z.info(`Child process PID: ${ie.pid}`), (t = ie.stdout) == null || t.on("data", (o) => {
        Z.info(`Child process output => stdout: ${o.toString().trim()}`);
      }), (e = ie.stderr) == null || e.on("data", (o) => {
        Z.info(`Child process output => stderr: ${o.toString().trim()}`);
      }), ie.on("error", (o) => {
        Z.info("Child process output => Failed to start child process:", {
          message: o.message,
          code: o.name,
          stack: o.stack
        });
      }), ie.on("close", (o, i) => {
        Z.info(`child process output => child process exit, exit code ${o}, signal ${i}`);
      });
    }
    return ie;
  } catch (n) {
    throw Z.error("Program execution error:", n), n;
  }
}
async function Jd() {
  ie == null || ie.kill("SIGTERM"), setTimeout(() => {
    ie && (ie == null || ie.kill("SIGKILL"), Z.info("force terminate child process"));
  }, 5e3);
}
async function vr() {
  try {
    Z.info("Process cleanup started"), ie ? (Z.info("Using childProcess to exit normally"), await Jd()) : (Z.info("Using processManager for cleanup"), await Wd.cleanup());
  } catch (t) {
    T.error("Process cleanup failed:", t);
  } finally {
    T.info("Process cleanup completed"), ie = null;
  }
}
const de = T.scope("[main] updater"), le = ni ? new Ud() : Kl(), qd = () => {
  const t = b();
  eu(), vr(), de.info("Quit and install update, close main window, ", t == null ? void 0 : t.id), setTimeout(() => {
    de.info("Window is closed, quit and install update"), le.quitAndInstall();
  }, 1e3);
};
let kt = !1, Vi = !1, Vn = !1;
const Vd = async () => {
  if (Vn) {
    de.info("already checking for updates");
    return;
  }
  Vn = !0;
  try {
    return await le.checkForUpdates();
  } finally {
    Vn = !1;
  }
}, Hd = async () => {
  var t;
  if (Vi) {
    kt = !1, (t = b()) == null || t.webContents.send("update-downloaded"), de.info("update already downloaded, skip download");
    return;
  }
  if (kt) {
    de.info("updater disabled or already downloading");
    return;
  }
  kt = !0, de.info("Update available, downloading..."), le.downloadUpdate().catch((e) => {
    kt = !1, de.error("Failed to download update", e);
  });
}, Gd = () => {
  de.info("======== registerUpdater START ========"), le.logger = de, le.autoDownload = !1, le.allowPrerelease = Ql !== "stable", le.autoInstallOnAppQuit = !0, le.autoRunAppAfterInstall = !0;
  const t = {
    provider: "generic",
    url: "https://olivedownlod.s3.ap-northeast-2.amazonaws.com",
    channel: ni ? "windows" : "mac"
  };
  le.setFeedURL(t), le.on("checking-for-update", () => {
    de.info("Checking for update...");
  }), le.on("update-available", (e) => {
    var n;
    de.info("Update available:", e), (n = b()) == null || n.webContents.send("update-available", e);
  }), le.on("update-not-available", (e) => {
    var n;
    de.info("Update not available:", e), (n = b()) == null || n.webContents.send("update-not-available", e);
  }), le.on("error", (e) => {
    var n;
    de.error("Error in auto-updater:", e), (n = b()) == null || n.webContents.send("update-error", e);
  }), le.on("download-progress", (e) => {
    var n;
    de.info("Download progress:", e), (n = b()) == null || n.webContents.send("download-progress", e);
  }), le.on("update-downloaded", (e) => {
    var n;
    de.info("Update downloaded:", e), Vi = !0, kt = !1, (n = b()) == null || n.webContents.send("update-downloaded", e);
  }), le.checkForUpdates();
}, lt = T.scope("[main] kernel downloader");
let Kd = class {
  constructor() {
    P(this, "abortController", null);
    P(this, "downloadedBytes", 0);
    P(this, "startTime", 0);
  }
  async getFileSize(e) {
    try {
      lt.log("get file size", e);
      const n = await fetch(e, { method: "HEAD" });
      return parseInt(n.headers.get("content-length") || "0");
    } catch (n) {
      throw lt.error("get file size failed:", n), n;
    }
  }
  calculateSpeed(e) {
    const r = (Date.now() - this.startTime) / 1e3;
    return r > 0 ? e / r : 0;
  }
  notifyProgress(e) {
    var n;
    (n = b()) == null || n.webContents.send("kernel-updater-status-change", e);
  }
  async download(e, n) {
    var r;
    try {
      this.abortController = new AbortController(), this.startTime = Date.now(), S.mkdirSync(_.dirname(n), { recursive: !0 });
      const o = await this.getFileSize(e);
      lt.info(`file total size: ${o} bytes`);
      let i = !1;
      try {
        const d = await S.promises.stat(n);
        i = d.size > 0, this.downloadedBytes = d.size;
      } catch {
        this.downloadedBytes = 0;
      }
      if (i && this.downloadedBytes >= o)
        return lt.info("file is fully downloaded"), n;
      const a = S.createWriteStream(n, {
        flags: i ? "r+" : "w",
        start: this.downloadedBytes
      }), c = await fetch(e, {
        headers: this.downloadedBytes > 0 ? {
          Range: `bytes=${this.downloadedBytes}-${o - 1}`
        } : {},
        signal: this.abortController.signal
      });
      if (!c.ok && c.status !== 206)
        throw new Error(`HTTP error! status: ${c.status}`);
      const f = (r = c.body) == null ? void 0 : r.getReader();
      if (!f)
        throw new Error("cannot get response stream");
      try {
        for (; ; ) {
          const { done: d, value: y } = await f.read();
          if (d)
            break;
          await new Promise((w, x) => {
            a.write(y, (v) => {
              v ? x(v) : w();
            });
          }), this.downloadedBytes += y.length;
          const m = {
            status: "downloading",
            downloadProgress: {
              transferred: this.downloadedBytes,
              total: o,
              percent: this.downloadedBytes / o * 100,
              bytesPerSecond: this.calculateSpeed(this.downloadedBytes)
            }
          };
          this.notifyProgress(m);
        }
      } finally {
        f.releaseLock();
      }
      await new Promise((d, y) => {
        a.end((m) => {
          m ? y(m) : d();
        });
      });
      const h = await S.promises.stat(n);
      if (h.size !== o)
        throw new Error(`download file size mismatch: expect ${o} bytes, actual ${h.size} bytes`);
      const u = b();
      return u && u.webContents.send("backend-download-completed", n), n;
    } catch (o) {
      throw o instanceof Error && o.name === "AbortError" ? lt.info("download canceled") : lt.error("download failed:", o), o;
    }
  }
  cancel() {
    this.abortController && (this.abortController.abort(), this.abortController = null);
  }
};
const ut = T.scope("[main] kernel extractor"), Fo = Bt(Ut);
let Hi = class {
  async cleanDestination(e) {
    S.existsSync(e) && await S.promises.rm(e, { recursive: !0, force: !0 });
  }
  async setExecutablePermission(e) {
    try {
      if (process.platform === "win32")
        return;
      const n = _.basename(e), r = _.dirname(e);
      (n === "main" || r.includes("_internal") || n.endsWith(".dylib") || n.endsWith(".so") || n.endsWith(".node") || !_.extname(n)) && (await To(e, 493), ut.info(`Set executable permission: ${e}`));
    } catch (n) {
      ut.warn(`Failed to set file permission: ${e}`, n);
    }
  }
  async extract(e, n, r) {
    try {
      if (S.mkdirSync(n, { recursive: !0 }), process.platform === "darwin")
        await Fo(`ditto -x -k "${e}" "${n}"`), ut.info("ditto command completed");
      else if (process.platform === "win32") {
        const o = `powershell.exe -Command "Expand-Archive -Path '${e.replace(
          /'/g,
          "''"
        )}' -DestinationPath '${n.replace(/'/g, "''")}' -Force"`;
        await Fo(o), ut.info("Expand-Archive command completed");
      } else
        throw new Error("Unsupported operating system platform");
      if (process.platform === "darwin") {
        const o = async (i) => {
          const a = await S.promises.readdir(i, { withFileTypes: !0 });
          for (const c of a) {
            const f = _.join(i, c.name);
            c.isDirectory() ? await o(f) : await this.setExecutablePermission(f);
          }
        };
        await o(n);
      }
      return r == null || r({
        status: "extracting",
        extractionProgress: {
          percent: 100,
          extractedFiles: 1,
          totalFiles: 1,
          currentFile: ""
        }
      }), ut.info("Extraction completed"), !0;
    } catch (o) {
      throw ut.error("Extraction error:", o), o;
    }
  }
};
const z = T.scope("[main] kernel updater"), Hn = Bt(Ut), Yd = "1.0.1", Qd = "https://olivedownlod.s3.ap-northeast-2.amazonaws.com/main(1.0.1).zip", Xd = "https://olivedownlod.s3.ap-northeast-2.amazonaws.com/main-darwin(1.0.1).zip";
async function Gi(t) {
  try {
    await Lo(t, No.W_OK);
  } catch {
    if (z.info(`try to fix directory permission: ${t}`), process.platform === "darwin" || process.platform === "linux")
      try {
        const n = process.env.USER || process.env.USERNAME;
        await Hn(`chmod -R 755 "${t}"`), await Hn(`chown -R ${n} "${t}"`), z.info(`fix directory permission: ${t}`);
      } catch (n) {
        z.error("execute command failed", n);
        try {
          await S.promises.rm(t, { recursive: !0, force: !0 }), z.info(`force remove success: ${t}`);
        } catch (r) {
          throw z.error(`force remove failed: ${t}`, r), new Error(`cannot access or delete file/directory: ${t}`);
        }
      }
    else if (process.platform === "win32")
      try {
        await Hn(`icacls "${t}" /grant Everyone:F /T`);
      } catch {
        try {
          await S.promises.rm(t, { recursive: !0, force: !0 });
        } catch {
          throw new Error(`cannot access or delete file/directory: ${t}`);
        }
      }
  }
}
async function Ki(t) {
  try {
    try {
      await S.promises.rm(t, { recursive: !0, force: !0 }), z.info(`success delete directory: ${t}`);
      return;
    } catch {
      z.warn(`direct remove failed, try to delete item by item: ${t}`);
    }
    const e = await S.promises.readdir(t, { withFileTypes: !0 });
    for (const n of e) {
      const r = _.join(t, n.name);
      try {
        await Gi(r), n.isDirectory() ? await Ki(r) : await S.promises.unlink(r);
      } catch (o) {
        z.warn(`handle path failed: ${r}`, o);
      }
    }
    try {
      await S.promises.rmdir(t);
    } catch (n) {
      z.warn(`delete directory failed: ${t}`, n);
    }
  } catch (e) {
    throw z.error(`recursive cleanup failed: ${t}`, e), e;
  }
}
function Zd(t, e) {
  const n = t.split("."), r = e.split(".");
  for (let o = 0; o < n.length; o++) {
    const i = parseInt(n[o], 10), a = parseInt(r[o], 10);
    if (i < a)
      return !0;
    if (i > a)
      return !1;
  }
  return !1;
}
const ep = new Hi();
function tp() {
  try {
    const t = S.readFileSync(Zo, "utf-8");
    return t === "" ? "0.0.0" : t;
  } catch (t) {
    return z.error("read local version failed", t), "0.0.0";
  }
}
async function Yi() {
  return {
    version: Yd,
    download_url: process.platform === "darwin" ? Xd : Qd
  };
}
const np = new Kd();
async function rp(t, e) {
  try {
    const n = `main(${e}).zip`, r = _.join(Qo, n);
    z.info(`start download file: ${t}`), z.info(`download target path: ${r}`);
    const o = await np.download(t, r);
    return z.info(`download completed: ${o}`), o;
  } catch (n) {
    throw z.error("download service failed", n), n;
  }
}
async function op(t) {
  const e = fn;
  z.info(`extract target path: ${e}`);
  try {
    if (S.existsSync(dn))
      try {
        await Gi(dn), await Ki(dn);
      } catch (r) {
        throw z.error("clean target directory failed", r), new Error(
          `cannot clean target directory: ${r instanceof Error ? r.message : String(r)}`
        );
      }
    z.info(`start extract file: ${t} -> ${fn}`);
    const n = await ep.extract(t, fn, (r) => {
      var o;
      (o = b()) == null || o.webContents.send("kernel-updater-status-change", r);
    });
    try {
      await S.promises.unlink(t), z.info(`delete zip file: ${t}`);
    } catch (r) {
      z.warn(`delete zip file failed: ${t}`, r);
    }
    return n;
  } catch (n) {
    throw z.error("extract service failed", n), n;
  }
}
async function ip() {
  try {
    z.info("start check update service");
    const t = tp(), e = await Yi();
    if (!e)
      return !1;
    z.info(`local version: ${t}, cloud version: ${e.version}`);
    const n = e.version;
    return Zd(t, n);
  } catch (t) {
    return z.error("check update service failed", t), !1;
  }
}
async function sp() {
  const t = await Yi();
  if (!t)
    return null;
  const e = t.download_url;
  return await rp(e, t.version);
}
const ap = Vt;
async function cp() {
  var t, e, n, r;
  try {
    if ((t = b()) == null || t.webContents.send("kernel-updater-status-change", {
      status: "checking"
    }), !ap) {
      if (await ip()) {
        const i = await sp();
        if (!i)
          return;
        (e = b()) == null || e.webContents.send("kernel-updater-status-change", {
          status: "extracting"
        }), await op(i);
      }
      await zd();
    }
    (n = b()) == null || n.webContents.send("kernel-updater-status-change", {
      status: "completed"
    });
  } catch (o) {
    z.error("check update service failed", o), (r = b()) == null || r.webContents.send("kernel-updater-status-change", {
      status: "error",
      error: o
    });
  }
}
const Qi = T.scope("[main] files");
async function lp(t, e) {
  try {
    return (await zt.readdir(e, { withFileTypes: !0 })).map((o) => ({
      id: o.name,
      name: o.name,
      isDirectory: o.isDirectory(),
      path: _.join(e, o.name)
    }));
  } catch (n) {
    return Qi.error("read directory failed", n), [];
  }
}
async function up(t, e = "Documents", n = !0, r = !1) {
  const { canceled: o, filePaths: i } = await Oo.showOpenDialog({
    properties: [
      // Allow selecting files
      "openFile",
      // Allow selecting folders
      ...r ? ["openDirectory"] : [],
      // Allow multiple selection
      ...n ? ["multiSelections"] : []
    ],
    filters: [
      /**
       * https://docs.llamaindex.ai/en/stable/module_guides/loading/simpledirectoryreader/
       * .csv - comma-separated values
       * .docx - Microsoft Word
       * .epub - EPUB ebook format
       * .hwp - Hangul Word Processor
       * .ipynb - Jupyter Notebook
       * .jpeg, .jpg - JPEG image
       * .mbox - MBOX email archive
       * .md - Markdown
       * .mp3, .mp4 - audio and video
       * .pdf - Portable Document Format
       * .png - Portable Network Graphics
       * .ppt, .pptm, .pptx - Microsoft PowerPoint
       *
       * Other formats:
       *  .txt - Plain Text
       */
      {
        name: "Documents",
        extensions: [
          "csv",
          "docx",
          "epub",
          "hwp",
          "ipynb",
          "jpeg",
          "jpg",
          "mbox",
          "md",
          "mp3",
          "mp4",
          "pdf",
          "png",
          "ppt",
          "pptm",
          "pptx",
          "txt"
        ]
      },
      { name: "All", extensions: ["*"] }
    ].filter((a) => a.name === e)
  });
  return o ? [] : i;
}
async function fp(t, e) {
  const { canceled: n, filePaths: r } = await Oo.showOpenDialog({
    properties: ["openDirectory"],
    defaultPath: e
  });
  return n ? [] : r;
}
async function dp(t) {
  try {
    const e = _.join(_n, t);
    return {
      status: "completed",
      message: "completed",
      data: {
        stats: await zt.stat(e),
        path: e
      }
    };
  } catch {
    return {
      status: "waiting",
      message: "file not found",
      data: null
    };
  }
}
async function Gn(t) {
  const e = b();
  e && (e.webContents.send("open-url", t), Qi.log("[main]: open url", t));
}
class pp extends Error {
}
const hp = (t, e) => {
  const n = Ua.mime(e);
  return n.length !== 1 ? t : `${t}.${n[0].ext}`;
};
function mp(t, e, n = () => {
}) {
  const r = /* @__PURE__ */ new Set();
  let o = 0, i = 0, a = 0;
  const c = () => r.size, f = () => o / a;
  e = {
    showBadge: !0,
    showProgressBar: !0,
    ...e
  };
  const h = (u, d, y) => {
    r.add(d), a += d.getTotalBytes();
    const m = ir.fromWebContents(y);
    if (!m)
      throw new Error("Failed to get window from web contents.");
    const w = typeof e.directory == "function" ? e.directory() : e.directory;
    if (w && !$.isAbsolute(w))
      throw new Error("The `directory` option must be an absolute path");
    const x = w ?? E.getPath("downloads");
    let v;
    if (e.filename)
      v = $.join(x, e.filename);
    else {
      const O = d.getFilename(), L = $.extname(O) ? O : hp(O, d.getMimeType());
      v = e.overwrite ? $.join(x, L) : ja($.join(x, L));
    }
    const C = e.errorMessage ?? "The download of {filename} was interrupted";
    e.saveAs ? d.setSaveDialogOptions({ defaultPath: v, ...e.dialogOptions }) : d.setSavePath(v), d.on("updated", () => {
      o = i;
      for (const O of r)
        o += O.getReceivedBytes();
      if (e.showBadge && ["darwin", "linux"].includes(Un.platform) && (E.badgeCount = c()), !m.isDestroyed() && e.showProgressBar && m.setProgressBar(f()), typeof e.onProgress == "function") {
        const O = d.getReceivedBytes(), L = d.getTotalBytes();
        e.onProgress(d, {
          percent: L ? O / L : 0,
          transferredBytes: O,
          totalBytes: L
        });
      }
      typeof e.onTotalProgress == "function" && e.onTotalProgress({
        percent: f(),
        transferredBytes: o,
        totalBytes: a
      });
    }), d.on("done", (O, L) => {
      if (i += d.getTotalBytes(), r.delete(d), e.showBadge && ["darwin", "linux"].includes(Un.platform) && (E.badgeCount = c()), !m.isDestroyed() && !c() && (m.setProgressBar(-1), o = 0, i = 0, a = 0), e.unregisterWhenDone && t.removeListener("will-download", h), L === "cancelled")
        typeof e.onCancel == "function" && e.onCancel(d), n(new pp());
      else if (L === "interrupted") {
        const ge = Ma(C, { filename: $.basename(v) });
        n(new Error(ge));
      } else if (L === "completed") {
        const ge = d.getSavePath();
        Un.platform === "darwin" && E.dock.downloadFinished(ge), e.openFolderWhenDone && Qn.showItemInFolder(ge), typeof e.onCompleted == "function" && e.onCompleted(d), n(null, d);
      }
    }), typeof e.onStarted == "function" && e.onStarted(d);
  };
  t.on("will-download", h);
}
async function Xi(t, e, n) {
  return new Promise((r, o) => {
    n = {
      ...n,
      unregisterWhenDone: !0
    }, mp(t.webContents.session, n, (i, a) => {
      i ? o(i) : r(a);
    }), t.webContents.downloadURL(e);
  });
}
const or = T.scope("[main] electron-downloader"), et = /* @__PURE__ */ new Map(), nt = /* @__PURE__ */ new Map(), Zi = {
  overwrite: !0,
  directory: _n,
  onStarted: async (t) => {
    or.log("download started", t.getURL(), t.getSavePath());
    const e = et.has(t.getURL()) ? et.get(t.getURL()) : t;
    et.set(e.getURL(), e);
    const n = {
      name: e.getFilename(),
      received: e.getReceivedBytes(),
      total: e.getTotalBytes(),
      savePath: e.getSavePath(),
      url: e.getURL(),
      state: "progressing"
    }, r = b();
    r == null || r.webContents.send("downloader::event::progress", n);
  },
  onProgress: (t) => {
    const e = {
      name: t.getFilename(),
      received: t.getReceivedBytes(),
      total: t.getTotalBytes(),
      savePath: t.getSavePath(),
      url: t.getURL(),
      state: "progressing"
    }, n = b();
    n == null || n.webContents.send("downloader::event::progress", e);
  },
  onCompleted: (t) => {
    const e = {
      name: t.getFilename(),
      received: t.getReceivedBytes(),
      total: t.getTotalBytes(),
      savePath: t.getSavePath(),
      url: t.getURL(),
      state: "completed"
    }, n = b();
    n == null || n.webContents.send("downloader::event::progress", e), nt.delete(t.getURL());
  }
}, yp = async (t, { url: e }) => {
  nt.set(e, !1);
  const n = et.get(e);
  if (console.log("[main] pauseDownload", e, n), n) {
    n.pause();
    const r = {
      name: n.getFilename(),
      received: n.getReceivedBytes(),
      total: n.getTotalBytes(),
      savePath: n.getSavePath(),
      url: n.getURL(),
      state: "paused"
    }, o = b();
    o == null || o.webContents.send("downloader::event::progress", r);
  }
}, gp = async (t, { url: e }) => {
  const n = nt.get(e);
  if (or.log("downloader:resume", e, n), n)
    return;
  nt.set(e, !0);
  const r = et.has(e) ? et.get(e) : null;
  if (or.log("downloader:resume", e, r), r) {
    r.resume();
    const o = {
      name: r.getFilename(),
      received: r.getReceivedBytes(),
      total: r.getTotalBytes(),
      savePath: r.getSavePath(),
      url: r.getURL(),
      state: "progressing"
    }, i = b();
    i == null || i.webContents.send("downloader::event::progress", o);
  } else {
    const o = b();
    if (!o)
      return;
    const i = e.split("/").pop() || "";
    await es(i), Xi(o, e, Zi);
  }
}, wp = async (t, { url: e }) => {
  if (nt.get(e))
    return;
  nt.set(e, !0);
  const r = b();
  r && Xi(r, e, Zi);
};
async function es(t) {
  try {
    const e = _.join(_n, t);
    await zt.rm(e), et.delete(t), nt.delete(t);
  } catch {
  }
}
const _t = T.scope("[main] Commons downloader");
class ts {
  constructor() {
    P(this, "abortController", null);
    P(this, "downloadedBytes", 0);
    P(this, "startTime", 0);
  }
  async getFileSize(e) {
    try {
      const n = await fetch(e, { method: "HEAD" });
      return parseInt(n.headers.get("content-length") || "0");
    } catch (n) {
      throw _t.error("get file size failed:", n), n;
    }
  }
  calculateSpeed(e) {
    const r = (Date.now() - this.startTime) / 1e3;
    return r > 0 ? e / r : 0;
  }
  async download(e, n, r) {
    var o;
    try {
      this.abortController = new AbortController(), this.startTime = Date.now(), S.mkdirSync(_.dirname(n), { recursive: !0 });
      const i = await this.getFileSize(e);
      _t.info(`file total size: ${i} bytes`);
      let a = !1;
      try {
        const y = await S.promises.stat(n);
        a = y.size > 0, this.downloadedBytes = y.size;
      } catch {
        this.downloadedBytes = 0;
      }
      if (a && this.downloadedBytes >= i)
        return _t.info("file is fully downloaded"), n;
      const c = S.createWriteStream(n, {
        flags: a ? "r+" : "w",
        start: this.downloadedBytes
      }), f = await fetch(e, {
        headers: this.downloadedBytes > 0 ? {
          Range: `bytes=${this.downloadedBytes}-${i - 1}`
        } : {},
        signal: this.abortController.signal
      });
      if (!f.ok && f.status !== 206)
        throw new Error(`HTTP error! status: ${f.status}`);
      const h = (o = f.body) == null ? void 0 : o.getReader();
      if (!h)
        throw new Error("cannot get response stream");
      try {
        for (; ; ) {
          const { done: y, value: m } = await h.read();
          if (y)
            break;
          await new Promise((x, v) => {
            c.write(m, (C) => {
              C ? v(C) : x();
            });
          }), this.downloadedBytes += m.length;
          const w = {
            status: "downloading",
            downloadProgress: {
              transferred: this.downloadedBytes,
              total: i,
              percent: this.downloadedBytes / i * 100,
              bytesPerSecond: this.calculateSpeed(this.downloadedBytes)
            }
          };
          r && r(w);
        }
      } finally {
        h.releaseLock();
      }
      await new Promise((y, m) => {
        c.end((w) => {
          w ? m(w) : y();
        });
      });
      const u = await S.promises.stat(n);
      if (u.size !== i)
        throw new Error(`download file size mismatch: expect ${i} bytes, actual ${u.size} bytes`);
      const d = b();
      return d && d.webContents.send("backend-download-completed", n), n;
    } catch (i) {
      throw i instanceof Error && i.name === "AbortError" ? _t.info("download canceled") : _t.error("download failed:", i), i;
    }
  }
  cancel() {
    this.abortController && (this.abortController.abort(), this.abortController = null);
  }
}
const oe = T.scope("[main] ollama executor");
let se = null;
const vp = !1;
async function cn(t) {
  var e, n;
  try {
    if (se) {
      oe.info("child process already exists, skip");
      return;
    }
    oe.info("Preparing to start program"), oe.info("Current environment:", Vt ? "development" : "production");
    const r = process.platform;
    if (oe.info(`current platform: ${r}`), !vp) {
      await ns(), oe.info("start program"), oe.info(`child process path: ${t}`);
      const o = await zt.stat(t);
      oe.info(`File permissions: ${o.mode}`), se = ko(t, ["serve"], {
        stdio: "pipe",
        env: process.env
      }), oe.info(`Child process PID: ${se.pid}`), (e = se.stdout) == null || e.on("data", (i) => {
        oe.info(`Child process output => stdout: ${i.toString().trim()}`);
      }), (n = se.stderr) == null || n.on("data", (i) => {
        oe.info(`Child process output => stderr: ${i.toString().trim()}`);
      }), se.on("error", (i) => {
        oe.info("Child process output => Failed to start child process:", {
          message: i.message,
          code: i.name,
          stack: i.stack
        });
      }), se.on("close", (i, a) => {
        oe.info(`child process output => child process exit, exit code ${i}, signal ${a}`);
      });
    }
    return se;
  } catch (r) {
    throw oe.error("Program execution error:", r), r;
  }
}
async function Sp() {
  se == null || se.kill("SIGTERM"), setTimeout(() => {
    se && (se == null || se.kill("SIGKILL"), oe.info("force terminate child process"));
  }, 5e3);
}
async function ns() {
  try {
    oe.info("Process cleanup started"), se ? (oe.info("Using childProcess to exit normally"), await Sp()) : oe.info("user use self-host ollama, don't need to cleanup");
  } catch (t) {
    T.error("Process cleanup failed:", t);
  } finally {
    T.info("Process cleanup completed"), se = null;
  }
}
const He = T.scope("[main] ollama extractor"), Kn = Bt(Ut);
class Ep {
  async cleanDestination(e) {
    S.existsSync(e) && await S.promises.rm(e, { recursive: !0, force: !0 });
  }
  async setExecutablePermission(e) {
    try {
      if (process.platform === "win32")
        return;
      const n = _.basename(e), r = _.dirname(e);
      (n === "main" || r.includes("_internal") || n.endsWith(".dylib") || n.endsWith(".so") || n.endsWith(".node") || !_.extname(n)) && (await To(e, 493), He.info(`Set executable permission: ${e}`));
    } catch (n) {
      He.warn(`Failed to set file permissions: ${e}`, n);
    }
  }
  async extract(e, n, r) {
    try {
      if (S.mkdirSync(n, { recursive: !0 }), process.platform === "darwin") {
        const o = _.extname(e).toLowerCase();
        o === ".tgz" || o === ".gz" ? (await Kn(`tar -xzf "${e}" -C "${n}"`), He.info("tar command executed")) : (await Kn(`ditto -x -k "${e}" "${n}"`), He.info("ditto command executed"));
      } else if (process.platform === "win32") {
        const o = `powershell.exe -Command "Expand-Archive -Path '${e.replace(
          /'/g,
          "''"
        )}' -DestinationPath '${n.replace(/'/g, "''")}' -Force"`;
        await Kn(o), He.info("Expand-Archive command executed");
      } else
        throw new Error("Unsupported operating system platform");
      if (process.platform === "darwin") {
        const o = async (i) => {
          const a = await S.promises.readdir(i, { withFileTypes: !0 });
          for (const c of a) {
            const f = _.join(i, c.name);
            c.isDirectory() ? await o(f) : await this.setExecutablePermission(f);
          }
        };
        await o(n);
      }
      return r == null || r({
        status: "extracting",
        extractionProgress: {
          percent: 100,
          extractedFiles: 1,
          totalFiles: 1,
          currentFile: ""
        }
      }), He.info("Extraction completed"), !0;
    } catch (o) {
      throw He.error("Extraction error:", o), o;
    }
  }
}
const k = T.scope("[main] ollama"), Yn = Bt(Ut), $p = new Ep(), bp = new ts(), rs = "https://dvnr1hi9fanyr.cloudfront.net/ollama/ollama-darwin.tgz", os = "https://dvnr1hi9fanyr.cloudfront.net/ollama/ollama-windows-amd64.zip", Po = "https://dvnr1hi9fanyr.cloudfront.net/ollama/version.yml", Fp = process.platform === "darwin" ? rs : os;
async function Pp() {
  try {
    k.info(`Checking remote version from: ${Po}`);
    const t = await fetch(Po);
    if (!t.ok)
      return k.error(`Failed to fetch version info: ${t.status} ${t.statusText}`), null;
    const e = await t.text(), n = Wa.load(e);
    return k.info(`Remote version info: ${JSON.stringify(n)}`), n;
  } catch (t) {
    return k.error("Failed to get remote version info", t), null;
  }
}
async function _p() {
  try {
    if (!S.existsSync(dt))
      return k.info(`Local version file not found: ${dt}`), null;
    const t = await S.promises.readFile(dt, "utf-8"), e = JSON.parse(t);
    return k.info(`Local version info: ${JSON.stringify(e)}`), e;
  } catch (t) {
    return k.error("Failed to get local version info", t), null;
  }
}
async function xp(t) {
  try {
    const e = _.dirname(dt);
    S.existsSync(e) || await S.promises.mkdir(e, { recursive: !0 }), await S.promises.writeFile(dt, JSON.stringify(t, null, 2), "utf-8"), k.info(`Saved local version info: ${JSON.stringify(t)}`);
  } catch (e) {
    throw k.error("Failed to save local version info", e), e;
  }
}
async function Dp() {
  const t = await Pp(), e = await _p();
  if (!t)
    return k.info("No remote version info available, skipping update check"), { needUpdate: !1, remoteVersion: null };
  if (!e)
    return k.info("No local version info available, update required"), { needUpdate: !0, remoteVersion: t };
  const n = t.version !== e.version;
  return k.info(`Update check: local=${e.version}, remote=${t.version}, needUpdate=${n}`), { needUpdate: n, remoteVersion: t };
}
async function Op(t) {
  return process.platform === "darwin" && t.darwin_url ? t.darwin_url : process.platform === "win32" && t.windows_url ? t.windows_url : process.platform === "darwin" ? rs : os;
}
async function _o(t) {
  try {
    k.info(`start download file: ${t}`), k.info(`download target path: ${Xn}`);
    const e = await bp.download(t, Xn, (n) => {
      var r;
      (r = b()) == null || r.webContents.send("ollama-updater-status-change", n);
    });
    return k.info(`download completed: ${e}`), e;
  } catch (e) {
    throw k.error("download service failed", e), e;
  }
}
async function is(t) {
  try {
    await Lo(t, No.W_OK);
  } catch {
    if (k.info(`try to fix directory permission: ${t}`), process.platform === "darwin" || process.platform === "linux")
      try {
        const n = process.env.USER || process.env.USERNAME;
        await Yn(`chmod -R 755 "${t}"`), await Yn(`chown -R ${n} "${t}"`), k.info(`fix directory permission: ${t}`);
      } catch (n) {
        k.error("execute command failed", n);
        try {
          await S.promises.rm(t, { recursive: !0, force: !0 }), k.info(`force remove success: ${t}`);
        } catch (r) {
          throw k.error(`force remove failed: ${t}`, r), new Error(`cannot access or delete file/directory: ${t}`);
        }
      }
    else if (process.platform === "win32")
      try {
        await Yn(`icacls "${t}" /grant Everyone:F /T`);
      } catch {
        try {
          await S.promises.rm(t, { recursive: !0, force: !0 });
        } catch {
          throw new Error(`cannot access or delete file/directory: ${t}`);
        }
      }
  }
}
async function ss(t) {
  try {
    try {
      await S.promises.rm(t, { recursive: !0, force: !0 }), k.info(`success delete directory: ${t}`);
      return;
    } catch {
      k.warn(`direct remove failed, try to delete item by item: ${t}`);
    }
    const e = await S.promises.readdir(t, { withFileTypes: !0 });
    for (const n of e) {
      const r = _.join(t, n.name);
      try {
        await is(r), n.isDirectory() ? await ss(r) : await S.promises.unlink(r);
      } catch (o) {
        k.warn(`handle path failed: ${r}`, o);
      }
    }
    try {
      await S.promises.rmdir(t);
    } catch (n) {
      k.warn(`delete directory failed: ${t}`, n);
    }
  } catch (e) {
    throw k.error(`recursive cleanup failed: ${t}`, e), e;
  }
}
async function xo(t) {
  const e = gn;
  k.info(`extract target path: ${e}`);
  try {
    if (S.existsSync(e))
      try {
        await is(e), await ss(e);
      } catch (r) {
        throw k.error("clean target directory failed", r), new Error(
          `cannot clean target directory: ${r instanceof Error ? r.message : String(r)}`
        );
      }
    k.info(`start extract file: ${t} -> ${e}`);
    const n = await $p.extract(t, e, (r) => {
      var o;
      (o = b()) == null || o.webContents.send("ollama-updater-status-change", r);
    });
    try {
      await S.promises.unlink(t), k.info(`delete zip file: ${t}`);
    } catch (r) {
      k.warn(`delete zip file failed: ${t}`, r);
    }
    return n;
  } catch (n) {
    throw k.error("extract service failed", n), n;
  }
}
let yn = null;
function as() {
  if (yn)
    return yn;
  const e = (process.env.PATH || "").split(_.delimiter);
  for (const n of e) {
    const r = _.join(n, process.platform === "win32" ? "ollama.exe" : "ollama");
    if (S.existsSync(r))
      return yn = r, r;
  }
}
const kp = "http://localhost:11434";
async function cs() {
  try {
    return await fetch(`${kp}/api/tags`), k.info("use ollama service directly"), 3;
  } catch {
  }
  if (S.existsSync(gn))
    return k.info("use local ollama service", gn), 1;
  const t = as();
  return t ? (k.info("use global ollama service", t), 2) : (k.info("need to update ollama"), 0);
}
async function Cp() {
  var t, e, n, r, o, i, a, c, f, h, u, d, y, m, w, x;
  try {
    (t = b()) == null || t.webContents.send("ollama-updater-status-change", {
      status: "checking",
      message: "Checking Ollama installation and version..."
    });
    const v = await cs();
    if (k.info("ollama updater available", v), v === 0 || v === 1) {
      (e = b()) == null || e.webContents.send("ollama-updater-status-change", {
        status: "checking",
        message: "Checking for Ollama updates..."
      });
      const { needUpdate: C, remoteVersion: O } = await Dp();
      if (O && ((n = b()) == null || n.webContents.send("ollama-updater-status-change", {
        status: "checking",
        message: `Found remote version: ${O.version}${C ? " (update available)" : " (up to date)"}`
      })), v === 1 && !C)
        (r = b()) == null || r.webContents.send("ollama-updater-status-change", {
          status: "running",
          message: "Running local Ollama"
        }), await cn(un);
      else if (C || v === 0)
        if (O) {
          (o = b()) == null || o.webContents.send("ollama-updater-status-change", {
            status: "downloading",
            message: `Downloading Ollama version ${O.version}`
          });
          const L = await Op(O), ge = await _o(L);
          (i = b()) == null || i.webContents.send("ollama-updater-status-change", {
            status: "extracting",
            message: `Extracting Ollama version ${O.version}`
          }), await xo(ge), await xp(O), (a = b()) == null || a.webContents.send("ollama-updater-status-change", {
            status: "running",
            message: `Running Ollama version ${O.version}`
          }), await cn(un);
        } else {
          (c = b()) == null || c.webContents.send("ollama-updater-status-change", {
            status: "downloading",
            message: "Downloading Ollama (no version info available)"
          });
          const L = await _o(Fp);
          (f = b()) == null || f.webContents.send("ollama-updater-status-change", {
            status: "extracting",
            message: "Extracting Ollama"
          }), await xo(L), (h = b()) == null || h.webContents.send("ollama-updater-status-change", {
            status: "running",
            message: "Running Ollama"
          }), await cn(un);
        }
    } else if (v === 2) {
      (u = b()) == null || u.webContents.send("ollama-updater-status-change", {
        status: "checking",
        message: "Found global Ollama installation"
      }), (d = b()) == null || d.webContents.send("ollama-updater-status-change", {
        status: "running",
        message: "Running global Ollama"
      });
      const C = as();
      if (k.info("use global ollama service and try to run", C, v, yn), C)
        await cn(C);
      else
        throw new Error("global ollama path not found");
    } else if (v === 3) {
      (y = b()) == null || y.webContents.send("ollama-updater-status-change", {
        status: "checking",
        message: "Ollama service is already running"
      }), (m = b()) == null || m.webContents.send("ollama-updater-status-change", {
        status: "completed",
        message: "Using existing Ollama service"
      });
      return;
    }
    (w = b()) == null || w.webContents.send("ollama-updater-status-change", {
      status: "completed",
      message: "Ollama setup completed"
    });
  } catch (v) {
    k.error("check update service failed", v), (x = b()) == null || x.webContents.send("ollama-updater-status-change", {
      status: "error",
      error: v,
      message: `Ollama setup failed: ${v instanceof Error ? v.message : String(v)}`
    });
  }
}
const ls = /* @__PURE__ */ new Map();
async function Ap(t) {
  const e = (r) => {
    const o = b();
    o && o.webContents.send("ollama:pull-progress", r);
  }, n = await Io.pull({
    model: t,
    stream: !0
  });
  ls.set(t, n);
  try {
    for await (const r of n)
      console.log("Download progress:", r), e({
        name: t,
        progress: r
      });
  } catch (r) {
    console.error("Download model error:", r), e({
      name: t,
      error: r.message
    });
  }
}
async function Tp(t) {
  const e = ls.get(t);
  e && e.abort();
}
async function Lp(t) {
  await Io.delete({
    model: t
  });
}
const Np = "https://xltwffswqvowersvchkj.supabase.co", Ip = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdHdmZnN3cXZvd2Vyc3ZjaGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxMzQ0MzEsImV4cCI6MjA0NDcxMDQzMX0.FNG_uZzjK_uSC1j8ur5dgtkIyU7O8qLvhzVQAGgHsT0";
function Rp(t, e) {
  return Ba(t, e, {
    auth: {
      flowType: "implicit"
    }
  });
}
const $n = Rp(Np, Ip), jp = "all-MiniLM-L6-v2", ne = T.scope("[main] embedModel"), Mp = new Hi(), Lt = {
  id: "1d1fad3b-55b1-4702-947c-6197de8d9c0c",
  name: "all-MiniLM-L6-v2",
  description: "all-MiniLM-L6-v2",
  weight: 9,
  download_url: "https://olivedownlod.s3.ap-northeast-2.amazonaws.com/all-MiniLM-L6-v2.zip",
  created_at: "2024-11-25T07:50:44.438412+00:00",
  updated_at: "2024-11-25T07:50:44.438412+00:00"
};
function ht(t, e) {
  t && t.webContents.send("embed-model-updater-status-change", e);
}
async function Up(t) {
  try {
    if (!S.existsSync(Re))
      return ne.info(`Model directory does not exist: ${Re}`), !1;
    if (!t || t.length === 0)
      return !1;
    const n = (await S.promises.readdir(Re, { withFileTypes: !0 })).filter((o) => o.isDirectory()).map((o) => o.name), r = t.some((o) => n.includes(o.name));
    return ne.info(`Check if model exists: ${r ? "exists" : "does not exist"}`), r;
  } catch (e) {
    return ne.error("Error checking if model exists:", e), !1;
  }
}
async function Wp() {
  if (!$n)
    return [Lt];
  const { data: t, error: e } = await $n.from("embed_models").select("*");
  return e ? (ne.error("[EmbedModel] => fetch embed model list failed", e), [Lt]) : t || [Lt];
}
async function Bp(t) {
  if (!$n)
    return Lt;
  const { data: e, error: n } = await $n.from("embed_models").select("*").eq("name", t).order("weight", { ascending: !1 });
  return n && ne.error("[EmbedModel] => fetch model info failed", n), !e || e.length === 0 ? (ne.error("[EmbedModel] => model info not found", t), Lt) : e[0];
}
async function zp(t, e) {
  try {
    ne.info("[EmbedModel] => start download embed model:", t.name);
    const n = _.join(ei, `${t.name}.zip`);
    return await new ts().download(t.download_url, n, (o) => {
      if (o.status === "downloading" && o.downloadProgress) {
        const i = {
          state: o.status === "downloading" ? "progressing" : "completed",
          received: o.downloadProgress.transferred,
          total: o.downloadProgress.total,
          url: t.download_url,
          name: t.name,
          savePath: n
        };
        ht(e, {
          status: "downloading",
          message: "Downloading embed model...",
          downloadProgress: i
        });
      }
    }), ht(e, {
      status: "completed",
      message: "Embed model downloaded"
    }), ne.info("[EmbedModel] => download completed:", t.name), n;
  } catch (n) {
    const r = n instanceof Error ? n : new Error("Unknown error occurred");
    throw ne.error("[EmbedModel] => download failed:", r), ht(e, {
      status: "error",
      message: "Download failed",
      error: r
    }), r;
  }
}
async function Jp(t) {
  S.existsSync(Re) || (await S.promises.mkdir(Re, { recursive: !0 }), ne.info("[EmbedModel] => create embed model folder:", Re)), await Mp.extract(t, Re, (e) => {
    ne.info("[EmbedModel] => unzip progress:", e);
  });
  try {
    await S.promises.unlink(t), ne.info("[EmbedModel] => delete zip file:", t);
  } catch (e) {
    ne.error("[EmbedModel] => delete zip file failed:", e);
  }
}
async function qp() {
  const t = b();
  try {
    ht(t, {
      status: "checking",
      message: "Checking embed model..."
    }), ne.info("[EmbedModel] => start fetch embed model list");
    const e = await Wp();
    ne.info("[EmbedModel] => fetch embed model list completed", e), ne.info("[EmbedModel] => start check if model exists");
    const n = await Up(e);
    if (ne.info("[EmbedModel] => check if model exists completed", n), n) {
      ht(t, {
        status: "completed",
        message: "Embed model already exists"
      });
      return;
    }
    const r = await Bp(jp);
    if (!r)
      throw new Error("Default embed model not found");
    const o = await zp(r, t);
    await Jp(o);
  } catch (e) {
    const n = e instanceof Error ? e : new Error("Unknown error occurred");
    ne.error("[EmbedModel] => update failed:", n), ht(t, {
      status: "error",
      message: "Update failed",
      error: n
    });
  }
}
const Do = T.scope("[main] ipc"), Vp = () => {
  Do.info("======== registerIpcMain START ========"), K.handle("check-for-updates", async () => {
    const t = b();
    return t == null || t.show(), Vd();
  }), K.handle("download-update", async () => Hd()), K.handle("quit-and-install", async () => qd()), K.handle("get-app-version", () => E.getVersion()), K.handle("fetch-kernel-updater-status", async () => cp()), K.handle("fetch-embed-model-updater-status", async () => qp()), K.handle("fetch-ollama-update-status", async () => Cp()), K.handle("ollama:pull", async (t, e) => Ap(e)), K.handle("ollama:pause", async (t, e) => Tp(e)), K.handle("ollama:delete", async (t, e) => Lp(e)), K.handle("ollama:get-status", async () => cs()), K.handle("fs:readDirectory", lp), K.handle("dialog:openFile", up), K.handle("dialog:openDirectory", fp), K.handle("stat:file:llm", (t, e) => dp(e)), K.handle("delete:file:llm", (t, e) => es(e)), K.handle("get-platform", () => process.platform), K.handle("open-win", (t, e) => {
    const n = new ir({
      titleBarStyle: "hidden",
      webPreferences: {
        preload: Go
      }
    });
    Qe ? n.loadURL(`${Qe}/#${e}`) : n.loadFile(Ko, { hash: e });
  }), K.handle("downloader:start", wp), K.handle("downloader:pause", yp), K.handle("downloader:resume", gp), Do.info("======== registerIpcMain END ========");
}, we = T.scope("[main] lifecycle"), bn = [];
async function us(t) {
  bn.includes(t) || bn.push(t);
}
us(vr);
us(ns);
async function xt() {
  for (; bn.length > 0; ) {
    const t = bn.shift();
    t && await t();
  }
}
const Hp = () => {
  we.info("======== registerLifecycle START ========"), E.on("will-quit", () => {
    we.info("Application will quit"), xt();
  }), E.on("before-quit", () => {
    we.info("Application before quit"), xt();
  }), process.on("SIGINT", () => {
    we.info("Received SIGINT signal"), xt(), E.quit();
  }), process.on("SIGTERM", () => {
    we.info("Received SIGTERM signal"), xt(), E.quit();
  }), process.on("uncaughtException", (t) => {
    we.info("uncaught exception:", t), xt(), E.quit();
  }), E.on("open-url", (t, e) => {
    Gn(e);
  }), E.on("second-instance", (t, e) => {
    const n = b();
    n && (n.isMinimized() && n.restore(), n.focus());
    const r = e.pop();
    r && Gn(r);
  }), E.on("window-all-closed", () => {
    we.info("window-all-closed"), process.platform !== "darwin" && E.quit();
  }), E.on("activate", () => {
    we.info("activate");
    const t = Zl();
    t ? (we.info("mainWindow focus"), t.focus()) : (we.info("createWindow"), er());
  }), E.whenReady().then(er), E.disableHardwareAcceleration(), Wt.release().startsWith("6.1") && E.disableHardwareAcceleration(), process.defaultApp ? process.argv.length >= 2 && E.setAsDefaultProtocolClient("klee", process.execPath, [_.resolve(process.argv[1])]) : E.setAsDefaultProtocolClient("klee"), process.env.NODE_ENV === "development" && process.platform === "darwin" && E.dock.setIcon(_.join(E.getAppPath(), "./build/icons/512x512.png")), process.platform === "win32" && E.setAppUserModelId(E.getName()), process.platform === "win32" && (we.info("start to requestSingleInstanceLock"), E.requestSingleInstanceLock() || (E.quit(), process.exit(0)), we.info("requestSingleInstanceLock completed")), process.platform === "win32" && E.requestSingleInstanceLock() && E.on("second-instance", (e, n) => {
    for (const o of n)
      we.info(`second-instance opening app -> :${o}`), o.includes("klee://") && Gn(o);
    const r = b();
    r && (r.isMinimized() && r.restore(), r.focus());
  }), we.info("======== registerLifecycle END ========");
};
function Gp() {
  T.info("======== registerLogger START ========"), T.initialize(), T.transports.file.resolvePathFn = () => Yo, T.transports.file.level = "info", T.transports.console.level = "info", T.transports.ipc.level = "info", T.transports.file.setAppName("com.signerlabs.klee"), T.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}", T.transports.file.maxSize = 10 * 1024 * 1024, T.transports.file.sync = !0, T.info("[main] Logger initialized, path is:", T.transports.file.getFile().path), T.info("======== registerLogger END ========");
}
const Kp = async () => {
  Gp(), Gl(), Gd(), Vp(), Hp();
};
Kp();
