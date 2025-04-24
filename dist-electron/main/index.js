var xa = Object.defineProperty;
var Da = (t, e, n) => e in t ? xa(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var _ = (t, e, n) => (Da(t, typeof e != "symbol" ? e + "" : e, n), n);
import F from "path";
import Oa from "dotenv";
import $ from "node:path";
import ka, { app as E, BrowserWindow as ir, shell as Qn, dialog as Oo, ipcMain as K } from "electron";
import Xe from "node:fs/promises";
import Aa, { exec as Wt, spawn as ko } from "child_process";
import Bt from "os";
import S from "fs";
import sr, { promisify as zt } from "util";
import Ao from "events";
import Ca from "http";
import La from "https";
import { fileURLToPath as Ta } from "url";
import Na, { NsisUpdater as Ia } from "electron-updater";
import Ra from "crypto";
import ja from "constants";
import Ma from "stream";
import Co from "assert";
import Jt, { chmod as Lo, access as To, constants as No } from "fs/promises";
import Un from "node:process";
import { unusedFilenameSync as Ua } from "unused-filename";
import Wa from "pupa";
import Ba from "ext-name";
import za from "js-yaml";
import Io from "ollama";
import { createClient as Ja } from "@supabase/supabase-js";
var Ye = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function qa(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
const Ro = S, Ot = F;
var Va = {
  findAndReadPackageJson: Ha,
  tryReadJsonAt: ft
};
function Ha() {
  return ft(Ya()) || ft(Ka()) || ft(process.resourcesPath, "app.asar") || ft(process.resourcesPath, "app") || ft(process.cwd()) || { name: void 0, version: void 0 };
}
function ft(...t) {
  if (t[0])
    try {
      const e = Ot.join(...t), n = Ga("package.json", e);
      if (!n)
        return;
      const r = JSON.parse(Ro.readFileSync(n, "utf8")), o = (r == null ? void 0 : r.productName) || (r == null ? void 0 : r.name);
      return !o || o.toLowerCase() === "electron" ? void 0 : o ? { name: o, version: r == null ? void 0 : r.version } : void 0;
    } catch {
      return;
    }
}
function Ga(t, e) {
  let n = e;
  for (; ; ) {
    const r = Ot.parse(n), o = r.root, i = r.dir;
    if (Ro.existsSync(Ot.join(n, t)))
      return Ot.resolve(Ot.join(n, t));
    if (n === o)
      return null;
    n = i;
  }
}
function Ka() {
  const t = process.argv.filter((n) => n.indexOf("--user-data-dir=") === 0);
  return t.length === 0 || typeof t[0] != "string" ? null : t[0].replace("--user-data-dir=", "");
}
function Ya() {
  var t;
  try {
    return (t = require.main) == null ? void 0 : t.filename;
  } catch {
    return;
  }
}
const Qa = Aa, Ve = Bt, st = F, Xa = Va;
let Za = class {
  constructor() {
    _(this, "appName");
    _(this, "appPackageJson");
    _(this, "platform", process.platform);
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
    return typeof this.appPackageJson != "object" && (this.appPackageJson = Xa.findAndReadPackageJson()), this.appPackageJson;
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
    Qa.exec(`${o} ${e}`, {}, (i) => {
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
var ec = Za;
const tc = F, nc = ec;
let rc = class extends nc {
  /**
   * @param {object} options
   * @param {typeof Electron} [options.electron]
   */
  constructor({ electron: n } = {}) {
    super();
    /**
     * @type {typeof Electron}
     */
    _(this, "electron");
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
    return ((n = this.electron.app) == null ? void 0 : n.isPackaged) !== void 0 ? !this.electron.app.isPackaged : typeof process.execPath == "string" ? tc.basename(process.execPath).toLowerCase().startsWith("electron") : super.isDev();
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
var oc = rc, jo = { exports: {} };
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
var ic = jo.exports;
const qr = S, sc = Bt, Vr = F, ac = ic;
var cc = {
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
        o && lc({
          externalApi: t,
          getSessions: e,
          includeFutureSession: n,
          preloadOption: o
        }), i && uc({ externalApi: t, logger: r });
      } catch (a) {
        r.warn(a);
      }
    });
  }
};
function lc({
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
      t.getAppUserDataPath() || sc.tmpdir(),
      "electron-log-preload.js"
    );
    const i = `
      try {
        (${ac.toString()})(require('electron'));
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
function uc({ externalApi: t, logger: e }) {
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
var fc = dc;
function dc(t) {
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
const pc = fc;
var tt;
let hc = (tt = class {
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
    _(this, "dependencies", {});
    _(this, "errorHandler", null);
    _(this, "eventLogger", null);
    _(this, "functions", {});
    _(this, "hooks", []);
    _(this, "isDev", !1);
    _(this, "levels", null);
    _(this, "logId", null);
    _(this, "scope", null);
    _(this, "transports", {});
    _(this, "variables", {});
    this.addLevel = this.addLevel.bind(this), this.create = this.create.bind(this), this.initialize = this.initialize.bind(this), this.logData = this.logData.bind(this), this.processMessage = this.processMessage.bind(this), this.allowUnknownLevel = e, this.dependencies = n, this.initializeFn = i, this.isDev = a, this.levels = c, this.logId = f, this.transportFactories = h, this.variables = u || {}, this.scope = pc(this);
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
}, _(tt, "instances", {}), tt);
var mc = hc;
let yc = class {
  constructor({
    externalApi: e,
    logFn: n = void 0,
    onError: r = void 0,
    showDialog: o = void 0
  } = {}) {
    _(this, "externalApi");
    _(this, "isActive", !1);
    _(this, "logFn");
    _(this, "onError");
    _(this, "showDialog", !0);
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
    e = gc(e);
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
function gc(t) {
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
var wc = yc;
let vc = class {
  constructor(e = {}) {
    _(this, "disposers", []);
    _(this, "format", "{eventSource}#{eventName}:");
    _(this, "formatters", {
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
    _(this, "events", {
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
    _(this, "externalApi");
    _(this, "level", "error");
    _(this, "scope", "");
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
var Sc = vc, qt = { transform: Ec };
function Ec({
  logger: t,
  message: e,
  transport: n,
  initialData: r = (e == null ? void 0 : e.data) || [],
  transforms: o = n == null ? void 0 : n.transforms
}) {
  return o.reduce((i, a) => typeof a == "function" ? a({ data: i, logger: t, message: e, transport: n }) : i, r);
}
const { transform: $c } = qt;
var Mo = {
  concatFirstStringElements: bc,
  formatScope: Hr,
  formatText: Kr,
  formatVariables: Gr,
  timeZoneFromOffset: Uo,
  format({ message: t, logger: e, transport: n, data: r = t == null ? void 0 : t.data }) {
    switch (typeof n.format) {
      case "string":
        return $c({
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
function bc({ data: t }) {
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
var _n = Wo.exports, ar = {
  transformStyles: Wn,
  applyAnsiStyles({ data: t }) {
    return Wn(t, _c, Fc);
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
function _c(t) {
  const e = t.replace(/color:\s*(\w+).*/, "$1").toLowerCase();
  return Bo[e] || "";
}
function Fc(t) {
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
const { concatFirstStringElements: Pc, format: xc } = Mo, { maxDepth: Dc, toJSON: Oc } = _n, { applyAnsiStyles: kc, removeStyles: Ac } = ar, { transform: Cc } = qt, Yr = {
  error: console.error,
  warn: console.warn,
  info: console.info,
  verbose: console.info,
  debug: console.debug,
  silly: console.debug,
  log: console.log
};
var Lc = zo;
const Tc = process.platform === "win32" ? ">" : "›", cr = `%c{h}:{i}:{s}.{ms}{scope}%c ${Tc} {text}`;
Object.assign(zo, {
  DEFAULT_FORMAT: cr
});
function zo(t) {
  return Object.assign(e, {
    format: cr,
    level: "silly",
    transforms: [
      Nc,
      xc,
      Rc,
      Pc,
      Dc,
      Oc
    ],
    useStyles: process.env.FORCE_STYLES,
    writeFn({ message: n }) {
      (Yr[n.level] || Yr.info)(...n.data);
    }
  });
  function e(n) {
    const r = Cc({ logger: t, message: n, transport: e });
    e.writeFn({
      message: { ...n, data: r }
    });
  }
}
function Nc({ data: t, message: e, transport: n }) {
  return n.format !== cr ? t : [`color:${jc(e.level)}`, "color:unset", ...t];
}
function Ic(t, e) {
  if (typeof t == "boolean")
    return t;
  const r = e === "error" || e === "warn" ? process.stderr : process.stdout;
  return r && r.isTTY;
}
function Rc(t) {
  const { message: e, transport: n } = t;
  return (Ic(n.useStyles, e.level) ? kc : Ac)(t);
}
function jc(t) {
  const e = { error: "red", warn: "yellow", info: "cyan", default: "unset" };
  return e[t] || e.default;
}
const Mc = Ao, Ie = S, Qr = Bt;
let Uc = class extends Mc {
  constructor({
    path: n,
    writeOptions: r = { encoding: "utf8", flag: "a", mode: 438 },
    writeAsync: o = !1
  }) {
    super();
    _(this, "asyncWriteQueue", []);
    _(this, "bytesWritten", 0);
    _(this, "hasActiveAsyncWriting", !1);
    _(this, "path", null);
    _(this, "initialSize");
    _(this, "writeOptions", null);
    _(this, "writeAsync", !1);
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
      const r = Wc(this.path, n || 4096);
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
var Jo = Uc;
function Wc(t, e) {
  const n = Buffer.alloc(e), r = Ie.statSync(t), o = Math.min(r.size, e), i = Math.max(0, r.size - e), a = Ie.openSync(t, "r"), c = Ie.readSync(a, n, 0, o, i);
  return Ie.closeSync(a), n.toString("utf8", 0, c);
}
const Bc = Jo;
let zc = class extends Bc {
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
var Jc = zc;
const qc = Ao, Xr = S, Zr = F, Vc = Jo, Hc = Jc;
let Gc = class extends qc {
  constructor() {
    super();
    _(this, "store", {});
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
      i = new Hc({ path: n }), this.emitError(a, i);
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
    return this.testFileWriting({ filePath: n, writeOptions: r }), new Vc({ path: n, writeOptions: r, writeAsync: o });
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
var Kc = Gc;
const rn = S, Yc = Bt, Ft = F, Qc = Kc, { transform: Xc } = qt, { removeStyles: Zc } = ar, {
  format: el,
  concatFirstStringElements: tl
} = Mo, { toString: nl } = _n;
var rl = il;
const ol = new Qc();
function il(t, { registry: e = ol, externalApi: n } = {}) {
  let r;
  return e.listenerCount("error") < 1 && e.on("error", (h, u) => {
    a(`Can't write to ${u}`, h);
  }), Object.assign(o, {
    fileName: sl(t.variables.processType),
    format: "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}",
    getFile: c,
    inspectOptions: { depth: 5 },
    level: "silly",
    maxSize: 1024 ** 2,
    readAllLogs: f,
    sync: !0,
    transforms: [Zc, el, tl, nl],
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
    const y = Xc({ logger: t, message: h, transport: o });
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
          lines: rn.readFileSync(d, "utf8").split(Yc.EOL)
        };
      } catch {
        return null;
      }
    }).filter(Boolean) : [];
  }
}
function sl(t = process.type) {
  switch (t) {
    case "renderer":
      return "renderer.log";
    case "worker":
      return "worker.log";
    default:
      return "main.log";
  }
}
const { maxDepth: al, toJSON: cl } = _n, { transform: ll } = qt;
var ul = fl;
function fl(t, { externalApi: e }) {
  return Object.assign(n, {
    depth: 3,
    eventId: "__ELECTRON_LOG_IPC__",
    level: t.isDev ? "silly" : !1,
    transforms: [cl, al]
  }), e != null && e.isElectron() ? n : void 0;
  function n(r) {
    var o;
    ((o = r == null ? void 0 : r.variables) == null ? void 0 : o.processType) !== "renderer" && (e == null || e.sendIpc(n.eventId, {
      ...r,
      data: ll({ logger: t, message: r, transport: n })
    }));
  }
}
const dl = Ca, pl = La, { transform: hl } = qt, { removeStyles: ml } = ar, { toJSON: yl, maxDepth: gl } = _n;
var wl = vl;
function vl(t) {
  return Object.assign(e, {
    client: { name: "electron-application" },
    depth: 6,
    level: !1,
    requestOptions: {},
    transforms: [ml, yl, gl],
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
      const a = (n.startsWith("https:") ? pl : dl).request(n, {
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
      message: { ...n, data: hl({ logger: t, message: n, transport: e }) },
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
const eo = mc, Sl = wc, El = Sc, $l = Lc, bl = rl, _l = ul, Fl = wl;
var Pl = xl;
function xl({ dependencies: t, initializeFn: e }) {
  var r;
  const n = new eo({
    dependencies: t,
    errorHandler: new Sl(),
    eventLogger: new El(),
    initializeFn: e,
    isDev: (r = t.externalApi) == null ? void 0 : r.isDev(),
    logId: "default",
    transportFactories: {
      console: $l,
      file: bl,
      ipc: _l,
      remote: Fl
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
const Dl = ka, Ol = oc, { initialize: kl } = cc, Al = Pl, lr = new Ol({ electron: Dl }), Fn = Al({
  dependencies: { externalApi: lr },
  initializeFn: kl
});
var Cl = Fn;
lr.onIpc("__ELECTRON_LOG__", (t, e) => {
  e.scope && Fn.Logger.getInstance(e).scope(e.scope);
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
        levels: Fn.Logger.getInstance({ logId: n }).levels,
        logId: n
      };
    default:
      return qo({ data: [`Unknown cmd '${e}'`], level: "error" }), {};
  }
});
function qo(t) {
  var e;
  (e = Fn.Logger.getInstance(t)) == null || e.processMessage(t);
}
const Ll = Cl;
var Tl = Ll;
const L = /* @__PURE__ */ qa(Tl), I = L.scope("[main] appPath");
if (process.platform === "darwin") {
  const t = E.getPath("userData");
  E.setPath("userData", $.join(t, "..", "com.signerlabs.klee"));
}
const Vo = $.dirname(Ta(import.meta.url)), Vt = $.join(Vo, "../..");
$.join(Vt, "dist-electron");
const Ho = $.join(Vt, "dist"), Qe = process.env.VITE_DEV_SERVER_URL, Nl = Qe ? $.join(Vt, "public") : Ho, Go = $.join(Vo, "../preload/index.mjs"), Ko = $.join(Ho, "index.html"), kt = he("");
I.info("appFolder:", kt);
const ln = Il();
I.info("executablePath:", ln);
const Xn = Rl();
I.info("ollamaSavedPath:", Xn);
const gn = jl();
I.info("ollamaExtractDestinationPath:", gn);
const un = Ml();
I.info("ollamaExecutablePath:", un);
const Yo = Wl();
I.info("loggerFilePath:", Yo);
const Qo = Bl();
I.info("downloadMainServiceDestinationPath:", Qo);
const fn = zl();
I.info("serviceExtractDestinationPath:", fn);
const dn = Jl();
I.info("serviceFolderPath:", dn);
const Pn = he("llm");
I.info("llmFolderPath:", Pn);
const Xo = ql();
I.info("iconPath:", Xo);
const Zo = Ul();
I.info("versionFilePath:", Zo);
const Re = ti();
I.info("embedModelFolderPath:", Re);
const ei = Gl();
I.info("downloadEmbedModelDestinationPath:", ei);
const dt = Kl();
I.info("ollamaVersionFilePath:", dt);
function he(t) {
  return process.platform === "win32" ? $.join(E.getPath("userData"), "../..", "/Local/com/signer_labs/klee", t) : $.join(E.getPath("userData"), t);
}
function Il() {
  return process.platform === "darwin" ? $.join(he(""), "main/main") : (I.info("Windows startup path: ", $.join(E.getAppPath(), "../../", "main.exe")), $.join(E.getAppPath(), "../../../", "klee-kernel/main/main.exe"));
}
function Rl() {
  return process.platform === "darwin" ? $.join(he(""), "ollama-latest/ollama-darwin.tgz") : $.join(E.getAppPath(), "../../../", "klee-ollama/ollama-windows-amd64.zip");
}
function jl() {
  return process.platform === "darwin" ? $.join(he(""), "ollama-latest/ollama-darwin") : $.join(E.getAppPath(), "../../../", "klee-ollama/ollama-windows-amd64");
}
function Ml() {
  return process.platform === "darwin" ? $.join(he(""), "ollama-latest/ollama-darwin/ollama") : $.join(E.getAppPath(), "../../../", "klee-ollama/ollama-windows-amd64/ollama.exe");
}
function Ul() {
  return process.platform === "darwin" ? $.join(he(""), "main/version") : $.join(E.getAppPath(), "../../../", "klee-kernel/main/version");
}
function Wl() {
  return process.platform === "darwin" ? $.join(he(""), "logs", "main.log") : $.join(E.getAppPath(), "../../../", "klee-kernel/logs/main.log");
}
function Bl() {
  return process.platform === "darwin" ? $.join(he(""), "temp") : $.join(E.getAppPath(), "../../../", "klee-kernel/version");
}
function zl() {
  return process.platform === "darwin" ? he("") : $.join(E.getAppPath(), "../../../", "klee-kernel/main");
}
function Jl() {
  return process.platform === "darwin" ? $.join(he(""), "main") : $.join(E.getAppPath(), "../../../", "klee-kernel/main");
}
function ql() {
  return process.env.NODE_ENV === "development" ? $.join(E.getAppPath(), "./build/icons/512x512.png") : process.platform === "darwin" ? $.join(E.getAppPath(), "./Resources/icon.icns") : $.join(E.getAppPath(), "./Resources/icon.png");
}
async function Vl() {
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
async function Hl() {
  const t = $.join(he(""), "tiktoken_encode");
  try {
    await Xe.access(t), I.info("[tik token folder check] => exists:", t);
  } catch {
    try {
      const e = process.env.NODE_ENV === "development" ? $.join(Vt, "additionalResources/tiktoken_encode") : $.join(E.getAppPath(), "../additionalResources/tiktoken_encode");
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
function Gl() {
  return process.platform === "darwin" ? $.join(he(""), "temp") : $.join(E.getAppPath(), "../../../", "klee-kernel/version");
}
function Kl() {
  return process.platform === "darwin" ? $.join(he(""), "ollama-latest/version.json") : $.join(E.getAppPath(), "../../../", "klee-ollama/version.json");
}
async function Yl() {
  I.info("======== registerAppFolder START ========"), process.env.APP_ROOT = Vt, process.env.VITE_PUBLIC = Nl;
  try {
    await Xe.access(kt), I.info("access success: ", kt);
  } catch {
    try {
      await Xe.mkdir(kt, { recursive: !0, mode: 493 }), I.info("mkdir success: ", kt);
    } catch (t) {
      I.error("mkdir failed: ", t);
    }
  }
  await Vl(), process.platform === "darwin" && await Hl(), I.info("======== registerAppFolder END ========");
}
function Ql() {
  const { autoUpdater: t } = Na;
  return t;
}
const Xl = process.env.NODE_ENV, gt = Xl === "development", Zl = "latest", { platform: eu } = process, tu = eu === "win32", Zn = L.scope("[main] window");
let fe = null;
const P = () => fe, nu = () => fe && !fe.isDestroyed() ? fe : er(), ru = () => {
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
  var n = 200, r = "__lodash_hash_undefined__", o = 1, i = 2, a = 9007199254740991, c = "[object Arguments]", f = "[object Array]", h = "[object AsyncFunction]", u = "[object Boolean]", d = "[object Date]", y = "[object Error]", m = "[object Function]", w = "[object GeneratorFunction]", x = "[object Map]", v = "[object Number]", A = "[object Null]", O = "[object Object]", T = "[object Promise]", ge = "[object Proxy]", vt = "[object RegExp]", Ue = "[object Set]", Gt = "[object String]", St = "[object Symbol]", b = "[object Undefined]", N = "[object WeakMap]", C = "[object ArrayBuffer]", H = "[object DataView]", Q = "[object Float32Array]", Y = "[object Float64Array]", W = "[object Int8Array]", J = "[object Int16Array]", R = "[object Int32Array]", X = "[object Uint8Array]", M = "[object Uint8ClampedArray]", Sr = "[object Uint16Array]", ds = "[object Uint32Array]", ps = /[\\^$.*+?()[\]{}|]/g, hs = /^\[object .+?Constructor\]$/, ms = /^(?:0|[1-9]\d*)$/, B = {};
  B[Q] = B[Y] = B[W] = B[J] = B[R] = B[X] = B[M] = B[Sr] = B[ds] = !0, B[c] = B[f] = B[C] = B[u] = B[H] = B[d] = B[y] = B[m] = B[x] = B[v] = B[O] = B[vt] = B[Ue] = B[Gt] = B[N] = !1;
  var Er = typeof Ye == "object" && Ye && Ye.Object === Object && Ye, ys = typeof self == "object" && self && self.Object === Object && self, De = Er || ys || Function("return this")(), $r = e && !e.nodeType && e, br = $r && !0 && t && !t.nodeType && t, _r = br && br.exports === $r, Cn = _r && Er.process, Fr = function() {
    try {
      return Cn && Cn.binding && Cn.binding("util");
    } catch {
    }
  }(), Pr = Fr && Fr.isTypedArray;
  function gs(s, l) {
    for (var p = -1, g = s == null ? 0 : s.length, z = 0, D = []; ++p < g; ) {
      var G = s[p];
      l(G, p, s) && (D[z++] = G);
    }
    return D;
  }
  function ws(s, l) {
    for (var p = -1, g = l.length, z = s.length; ++p < g; )
      s[z + p] = l[p];
    return s;
  }
  function vs(s, l) {
    for (var p = -1, g = s == null ? 0 : s.length; ++p < g; )
      if (l(s[p], p, s))
        return !0;
    return !1;
  }
  function Ss(s, l) {
    for (var p = -1, g = Array(s); ++p < s; )
      g[p] = l(p);
    return g;
  }
  function Es(s) {
    return function(l) {
      return s(l);
    };
  }
  function $s(s, l) {
    return s.has(l);
  }
  function bs(s, l) {
    return s == null ? void 0 : s[l];
  }
  function _s(s) {
    var l = -1, p = Array(s.size);
    return s.forEach(function(g, z) {
      p[++l] = [z, g];
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
  var xs = Array.prototype, Ds = Function.prototype, Kt = Object.prototype, Ln = De["__core-js_shared__"], xr = Ds.toString, Pe = Kt.hasOwnProperty, Dr = function() {
    var s = /[^.]+$/.exec(Ln && Ln.keys && Ln.keys.IE_PROTO || "");
    return s ? "Symbol(src)_1." + s : "";
  }(), Or = Kt.toString, Os = RegExp(
    "^" + xr.call(Pe).replace(ps, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  ), kr = _r ? De.Buffer : void 0, Yt = De.Symbol, Ar = De.Uint8Array, Cr = Kt.propertyIsEnumerable, ks = xs.splice, We = Yt ? Yt.toStringTag : void 0, Lr = Object.getOwnPropertySymbols, As = kr ? kr.isBuffer : void 0, Cs = Fs(Object.keys, Object), Tn = it(De, "DataView"), Et = it(De, "Map"), Nn = it(De, "Promise"), In = it(De, "Set"), Rn = it(De, "WeakMap"), $t = it(Object, "create"), Ls = Je(Tn), Ts = Je(Et), Ns = Je(Nn), Is = Je(In), Rs = Je(Rn), Tr = Yt ? Yt.prototype : void 0, jn = Tr ? Tr.valueOf : void 0;
  function Be(s) {
    var l = -1, p = s == null ? 0 : s.length;
    for (this.clear(); ++l < p; ) {
      var g = s[l];
      this.set(g[0], g[1]);
    }
  }
  function js() {
    this.__data__ = $t ? $t(null) : {}, this.size = 0;
  }
  function Ms(s) {
    var l = this.has(s) && delete this.__data__[s];
    return this.size -= l ? 1 : 0, l;
  }
  function Us(s) {
    var l = this.__data__;
    if ($t) {
      var p = l[s];
      return p === r ? void 0 : p;
    }
    return Pe.call(l, s) ? l[s] : void 0;
  }
  function Ws(s) {
    var l = this.__data__;
    return $t ? l[s] !== void 0 : Pe.call(l, s);
  }
  function Bs(s, l) {
    var p = this.__data__;
    return this.size += this.has(s) ? 0 : 1, p[s] = $t && l === void 0 ? r : l, this;
  }
  Be.prototype.clear = js, Be.prototype.delete = Ms, Be.prototype.get = Us, Be.prototype.has = Ws, Be.prototype.set = Bs;
  function Oe(s) {
    var l = -1, p = s == null ? 0 : s.length;
    for (this.clear(); ++l < p; ) {
      var g = s[l];
      this.set(g[0], g[1]);
    }
  }
  function zs() {
    this.__data__ = [], this.size = 0;
  }
  function Js(s) {
    var l = this.__data__, p = Xt(l, s);
    if (p < 0)
      return !1;
    var g = l.length - 1;
    return p == g ? l.pop() : ks.call(l, p, 1), --this.size, !0;
  }
  function qs(s) {
    var l = this.__data__, p = Xt(l, s);
    return p < 0 ? void 0 : l[p][1];
  }
  function Vs(s) {
    return Xt(this.__data__, s) > -1;
  }
  function Hs(s, l) {
    var p = this.__data__, g = Xt(p, s);
    return g < 0 ? (++this.size, p.push([s, l])) : p[g][1] = l, this;
  }
  Oe.prototype.clear = zs, Oe.prototype.delete = Js, Oe.prototype.get = qs, Oe.prototype.has = Vs, Oe.prototype.set = Hs;
  function ze(s) {
    var l = -1, p = s == null ? 0 : s.length;
    for (this.clear(); ++l < p; ) {
      var g = s[l];
      this.set(g[0], g[1]);
    }
  }
  function Gs() {
    this.size = 0, this.__data__ = {
      hash: new Be(),
      map: new (Et || Oe)(),
      string: new Be()
    };
  }
  function Ks(s) {
    var l = Zt(this, s).delete(s);
    return this.size -= l ? 1 : 0, l;
  }
  function Ys(s) {
    return Zt(this, s).get(s);
  }
  function Qs(s) {
    return Zt(this, s).has(s);
  }
  function Xs(s, l) {
    var p = Zt(this, s), g = p.size;
    return p.set(s, l), this.size += p.size == g ? 0 : 1, this;
  }
  ze.prototype.clear = Gs, ze.prototype.delete = Ks, ze.prototype.get = Ys, ze.prototype.has = Qs, ze.prototype.set = Xs;
  function Qt(s) {
    var l = -1, p = s == null ? 0 : s.length;
    for (this.__data__ = new ze(); ++l < p; )
      this.add(s[l]);
  }
  function Zs(s) {
    return this.__data__.set(s, r), this;
  }
  function ea(s) {
    return this.__data__.has(s);
  }
  Qt.prototype.add = Qt.prototype.push = Zs, Qt.prototype.has = ea;
  function Ae(s) {
    var l = this.__data__ = new Oe(s);
    this.size = l.size;
  }
  function ta() {
    this.__data__ = new Oe(), this.size = 0;
  }
  function na(s) {
    var l = this.__data__, p = l.delete(s);
    return this.size = l.size, p;
  }
  function ra(s) {
    return this.__data__.get(s);
  }
  function oa(s) {
    return this.__data__.has(s);
  }
  function ia(s, l) {
    var p = this.__data__;
    if (p instanceof Oe) {
      var g = p.__data__;
      if (!Et || g.length < n - 1)
        return g.push([s, l]), this.size = ++p.size, this;
      p = this.__data__ = new ze(g);
    }
    return p.set(s, l), this.size = p.size, this;
  }
  Ae.prototype.clear = ta, Ae.prototype.delete = na, Ae.prototype.get = ra, Ae.prototype.has = oa, Ae.prototype.set = ia;
  function sa(s, l) {
    var p = en(s), g = !p && Ea(s), z = !p && !g && Mn(s), D = !p && !g && !z && zr(s), G = p || g || z || D, ee = G ? Ss(s.length, String) : [], re = ee.length;
    for (var q in s)
      (l || Pe.call(s, q)) && !(G && // Safari 9 has enumerable `arguments.length` in strict mode.
      (q == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      z && (q == "offset" || q == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      D && (q == "buffer" || q == "byteLength" || q == "byteOffset") || // Skip index properties.
      ya(q, re))) && ee.push(q);
    return ee;
  }
  function Xt(s, l) {
    for (var p = s.length; p--; )
      if (Mr(s[p][0], l))
        return p;
    return -1;
  }
  function aa(s, l, p) {
    var g = l(s);
    return en(s) ? g : ws(g, p(s));
  }
  function bt(s) {
    return s == null ? s === void 0 ? b : A : We && We in Object(s) ? ha(s) : Sa(s);
  }
  function Nr(s) {
    return _t(s) && bt(s) == c;
  }
  function Ir(s, l, p, g, z) {
    return s === l ? !0 : s == null || l == null || !_t(s) && !_t(l) ? s !== s && l !== l : ca(s, l, p, g, Ir, z);
  }
  function ca(s, l, p, g, z, D) {
    var G = en(s), ee = en(l), re = G ? f : Ce(s), q = ee ? f : Ce(l);
    re = re == c ? O : re, q = q == c ? O : q;
    var Se = re == O, _e = q == O, ce = re == q;
    if (ce && Mn(s)) {
      if (!Mn(l))
        return !1;
      G = !0, Se = !1;
    }
    if (ce && !Se)
      return D || (D = new Ae()), G || zr(s) ? Rr(s, l, p, g, z, D) : da(s, l, re, p, g, z, D);
    if (!(p & o)) {
      var Ee = Se && Pe.call(s, "__wrapped__"), $e = _e && Pe.call(l, "__wrapped__");
      if (Ee || $e) {
        var Le = Ee ? s.value() : s, ke = $e ? l.value() : l;
        return D || (D = new Ae()), z(Le, ke, p, g, D);
      }
    }
    return ce ? (D || (D = new Ae()), pa(s, l, p, g, z, D)) : !1;
  }
  function la(s) {
    if (!Br(s) || wa(s))
      return !1;
    var l = Ur(s) ? Os : hs;
    return l.test(Je(s));
  }
  function ua(s) {
    return _t(s) && Wr(s.length) && !!B[bt(s)];
  }
  function fa(s) {
    if (!va(s))
      return Cs(s);
    var l = [];
    for (var p in Object(s))
      Pe.call(s, p) && p != "constructor" && l.push(p);
    return l;
  }
  function Rr(s, l, p, g, z, D) {
    var G = p & o, ee = s.length, re = l.length;
    if (ee != re && !(G && re > ee))
      return !1;
    var q = D.get(s);
    if (q && D.get(l))
      return q == l;
    var Se = -1, _e = !0, ce = p & i ? new Qt() : void 0;
    for (D.set(s, l), D.set(l, s); ++Se < ee; ) {
      var Ee = s[Se], $e = l[Se];
      if (g)
        var Le = G ? g($e, Ee, Se, l, s, D) : g(Ee, $e, Se, s, l, D);
      if (Le !== void 0) {
        if (Le)
          continue;
        _e = !1;
        break;
      }
      if (ce) {
        if (!vs(l, function(ke, qe) {
          if (!$s(ce, qe) && (Ee === ke || z(Ee, ke, p, g, D)))
            return ce.push(qe);
        })) {
          _e = !1;
          break;
        }
      } else if (!(Ee === $e || z(Ee, $e, p, g, D))) {
        _e = !1;
        break;
      }
    }
    return D.delete(s), D.delete(l), _e;
  }
  function da(s, l, p, g, z, D, G) {
    switch (p) {
      case H:
        if (s.byteLength != l.byteLength || s.byteOffset != l.byteOffset)
          return !1;
        s = s.buffer, l = l.buffer;
      case C:
        return !(s.byteLength != l.byteLength || !D(new Ar(s), new Ar(l)));
      case u:
      case d:
      case v:
        return Mr(+s, +l);
      case y:
        return s.name == l.name && s.message == l.message;
      case vt:
      case Gt:
        return s == l + "";
      case x:
        var ee = _s;
      case Ue:
        var re = g & o;
        if (ee || (ee = Ps), s.size != l.size && !re)
          return !1;
        var q = G.get(s);
        if (q)
          return q == l;
        g |= i, G.set(s, l);
        var Se = Rr(ee(s), ee(l), g, z, D, G);
        return G.delete(s), Se;
      case St:
        if (jn)
          return jn.call(s) == jn.call(l);
    }
    return !1;
  }
  function pa(s, l, p, g, z, D) {
    var G = p & o, ee = jr(s), re = ee.length, q = jr(l), Se = q.length;
    if (re != Se && !G)
      return !1;
    for (var _e = re; _e--; ) {
      var ce = ee[_e];
      if (!(G ? ce in l : Pe.call(l, ce)))
        return !1;
    }
    var Ee = D.get(s);
    if (Ee && D.get(l))
      return Ee == l;
    var $e = !0;
    D.set(s, l), D.set(l, s);
    for (var Le = G; ++_e < re; ) {
      ce = ee[_e];
      var ke = s[ce], qe = l[ce];
      if (g)
        var Jr = G ? g(qe, ke, ce, l, s, D) : g(ke, qe, ce, s, l, D);
      if (!(Jr === void 0 ? ke === qe || z(ke, qe, p, g, D) : Jr)) {
        $e = !1;
        break;
      }
      Le || (Le = ce == "constructor");
    }
    if ($e && !Le) {
      var tn = s.constructor, nn = l.constructor;
      tn != nn && "constructor" in s && "constructor" in l && !(typeof tn == "function" && tn instanceof tn && typeof nn == "function" && nn instanceof nn) && ($e = !1);
    }
    return D.delete(s), D.delete(l), $e;
  }
  function jr(s) {
    return aa(s, _a, ma);
  }
  function Zt(s, l) {
    var p = s.__data__;
    return ga(l) ? p[typeof l == "string" ? "string" : "hash"] : p.map;
  }
  function it(s, l) {
    var p = bs(s, l);
    return la(p) ? p : void 0;
  }
  function ha(s) {
    var l = Pe.call(s, We), p = s[We];
    try {
      s[We] = void 0;
      var g = !0;
    } catch {
    }
    var z = Or.call(s);
    return g && (l ? s[We] = p : delete s[We]), z;
  }
  var ma = Lr ? function(s) {
    return s == null ? [] : (s = Object(s), gs(Lr(s), function(l) {
      return Cr.call(s, l);
    }));
  } : Fa, Ce = bt;
  (Tn && Ce(new Tn(new ArrayBuffer(1))) != H || Et && Ce(new Et()) != x || Nn && Ce(Nn.resolve()) != T || In && Ce(new In()) != Ue || Rn && Ce(new Rn()) != N) && (Ce = function(s) {
    var l = bt(s), p = l == O ? s.constructor : void 0, g = p ? Je(p) : "";
    if (g)
      switch (g) {
        case Ls:
          return H;
        case Ts:
          return x;
        case Ns:
          return T;
        case Is:
          return Ue;
        case Rs:
          return N;
      }
    return l;
  });
  function ya(s, l) {
    return l = l ?? a, !!l && (typeof s == "number" || ms.test(s)) && s > -1 && s % 1 == 0 && s < l;
  }
  function ga(s) {
    var l = typeof s;
    return l == "string" || l == "number" || l == "symbol" || l == "boolean" ? s !== "__proto__" : s === null;
  }
  function wa(s) {
    return !!Dr && Dr in s;
  }
  function va(s) {
    var l = s && s.constructor, p = typeof l == "function" && l.prototype || Kt;
    return s === p;
  }
  function Sa(s) {
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
  var Ea = Nr(function() {
    return arguments;
  }()) ? Nr : function(s) {
    return _t(s) && Pe.call(s, "callee") && !Cr.call(s, "callee");
  }, en = Array.isArray;
  function $a(s) {
    return s != null && Wr(s.length) && !Ur(s);
  }
  var Mn = As || Pa;
  function ba(s, l) {
    return Ir(s, l);
  }
  function Ur(s) {
    if (!Br(s))
      return !1;
    var l = bt(s);
    return l == m || l == w || l == h || l == ge;
  }
  function Wr(s) {
    return typeof s == "number" && s > -1 && s % 1 == 0 && s <= a;
  }
  function Br(s) {
    var l = typeof s;
    return s != null && (l == "object" || l == "function");
  }
  function _t(s) {
    return s != null && typeof s == "object";
  }
  var zr = Pr ? Es(Pr) : ua;
  function _a(s) {
    return $a(s) ? sa(s) : fa(s);
  }
  function Fa() {
    return [];
  }
  function Pa() {
    return !1;
  }
  t.exports = ba;
})(wn, wn.exports);
var ou = wn.exports, rt = {}, me = {};
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
var Te = ja, iu = process.cwd, pn = null, su = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  return pn || (pn = iu.call(process)), pn;
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
var au = cu;
function cu(t) {
  Te.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && e(t), t.lutimes || n(t), t.chown = i(t.chown), t.fchown = i(t.fchown), t.lchown = i(t.lchown), t.chmod = r(t.chmod), t.fchmod = r(t.fchmod), t.lchmod = r(t.lchmod), t.chownSync = a(t.chownSync), t.fchownSync = a(t.fchownSync), t.lchownSync = a(t.lchownSync), t.chmodSync = o(t.chmodSync), t.fchmodSync = o(t.fchmodSync), t.lchmodSync = o(t.lchmodSync), t.stat = c(t.stat), t.fstat = c(t.fstat), t.lstat = c(t.lstat), t.statSync = f(t.statSync), t.fstatSync = f(t.fstatSync), t.lstatSync = f(t.lstatSync), t.chmod && !t.lchmod && (t.lchmod = function(u, d, y) {
    y && process.nextTick(y);
  }, t.lchmodSync = function() {
  }), t.chown && !t.lchown && (t.lchown = function(u, d, y, m) {
    m && process.nextTick(m);
  }, t.lchownSync = function() {
  }), su === "win32" && (t.rename = typeof t.rename != "function" ? t.rename : function(u) {
    function d(y, m, w) {
      var x = Date.now(), v = 0;
      u(y, m, function A(O) {
        if (O && (O.code === "EACCES" || O.code === "EPERM" || O.code === "EBUSY") && Date.now() - x < 6e4) {
          setTimeout(function() {
            t.stat(m, function(T, ge) {
              T && T.code === "ENOENT" ? u(y, m, A) : w(O);
            });
          }, v), v < 100 && (v += 10);
          return;
        }
        w && w(O);
      });
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(d, u), d;
  }(t.rename)), t.read = typeof t.read != "function" ? t.read : function(u) {
    function d(y, m, w, x, v, A) {
      var O;
      if (A && typeof A == "function") {
        var T = 0;
        O = function(ge, vt, Ue) {
          if (ge && ge.code === "EAGAIN" && T < 10)
            return T++, u.call(t, y, m, w, x, v, O);
          A.apply(this, arguments);
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
        } catch (A) {
          if (A.code === "EAGAIN" && v < 10) {
            v++;
            continue;
          }
          throw A;
        }
    };
  }(t.readSync);
  function e(u) {
    u.lchmod = function(d, y, m) {
      u.open(
        d,
        Te.O_WRONLY | Te.O_SYMLINK,
        y,
        function(w, x) {
          if (w) {
            m && m(w);
            return;
          }
          u.fchmod(x, y, function(v) {
            u.close(x, function(A) {
              m && m(v || A);
            });
          });
        }
      );
    }, u.lchmodSync = function(d, y) {
      var m = u.openSync(d, Te.O_WRONLY | Te.O_SYMLINK, y), w = !0, x;
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
    Te.hasOwnProperty("O_SYMLINK") && u.futimes ? (u.lutimes = function(d, y, m, w) {
      u.open(d, Te.O_SYMLINK, function(x, v) {
        if (x) {
          w && w(x);
          return;
        }
        u.futimes(v, y, m, function(A) {
          u.close(v, function(O) {
            w && w(A || O);
          });
        });
      });
    }, u.lutimesSync = function(d, y, m) {
      var w = u.openSync(d, Te.O_SYMLINK), x, v = !0;
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
var no = Ma.Stream, lu = uu;
function uu(t) {
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
var fu = pu, du = Object.getPrototypeOf || function(t) {
  return t.__proto__;
};
function pu(t) {
  if (t === null || typeof t != "object")
    return t;
  if (t instanceof Object)
    var e = { __proto__: du(t) };
  else
    var e = /* @__PURE__ */ Object.create(null);
  return Object.getOwnPropertyNames(t).forEach(function(n) {
    Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
  }), e;
}
var V = S, hu = au, mu = lu, yu = fu, on = sr, ae, vn;
typeof Symbol == "function" && typeof Symbol.for == "function" ? (ae = Symbol.for("graceful-fs.queue"), vn = Symbol.for("graceful-fs.previous")) : (ae = "___graceful-fs.queue", vn = "___graceful-fs.previous");
function gu() {
}
function ni(t, e) {
  Object.defineProperty(t, ae, {
    get: function() {
      return e;
    }
  });
}
var Ze = gu;
on.debuglog ? Ze = on.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (Ze = function() {
  var t = on.format.apply(on, arguments);
  t = "GFS4: " + t.split(/\n/).join(`
GFS4: `), console.error(t);
});
if (!V[ae]) {
  var wu = Ye[ae] || [];
  ni(V, wu), V.close = function(t) {
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
    Ze(V[ae]), Co.equal(V[ae].length, 0);
  });
}
Ye[ae] || ni(Ye, V[ae]);
var ye = ur(yu(V));
process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !V.__patched && (ye = ur(V), V.__patched = !0);
function ur(t) {
  hu(t), t.gracefulify = ur, t.createReadStream = vt, t.createWriteStream = Ue;
  var e = t.readFile;
  t.readFile = n;
  function n(b, N, C) {
    return typeof N == "function" && (C = N, N = null), H(b, N, C);
    function H(Q, Y, W, J) {
      return e(Q, Y, function(R) {
        R && (R.code === "EMFILE" || R.code === "ENFILE") ? at([H, [Q, Y, W], R, J || Date.now(), Date.now()]) : typeof W == "function" && W.apply(this, arguments);
      });
    }
  }
  var r = t.writeFile;
  t.writeFile = o;
  function o(b, N, C, H) {
    return typeof C == "function" && (H = C, C = null), Q(b, N, C, H);
    function Q(Y, W, J, R, X) {
      return r(Y, W, J, function(M) {
        M && (M.code === "EMFILE" || M.code === "ENFILE") ? at([Q, [Y, W, J, R], M, X || Date.now(), Date.now()]) : typeof R == "function" && R.apply(this, arguments);
      });
    }
  }
  var i = t.appendFile;
  i && (t.appendFile = a);
  function a(b, N, C, H) {
    return typeof C == "function" && (H = C, C = null), Q(b, N, C, H);
    function Q(Y, W, J, R, X) {
      return i(Y, W, J, function(M) {
        M && (M.code === "EMFILE" || M.code === "ENFILE") ? at([Q, [Y, W, J, R], M, X || Date.now(), Date.now()]) : typeof R == "function" && R.apply(this, arguments);
      });
    }
  }
  var c = t.copyFile;
  c && (t.copyFile = f);
  function f(b, N, C, H) {
    return typeof C == "function" && (H = C, C = 0), Q(b, N, C, H);
    function Q(Y, W, J, R, X) {
      return c(Y, W, J, function(M) {
        M && (M.code === "EMFILE" || M.code === "ENFILE") ? at([Q, [Y, W, J, R], M, X || Date.now(), Date.now()]) : typeof R == "function" && R.apply(this, arguments);
      });
    }
  }
  var h = t.readdir;
  t.readdir = d;
  var u = /^v[0-5]\./;
  function d(b, N, C) {
    typeof N == "function" && (C = N, N = null);
    var H = u.test(process.version) ? function(W, J, R, X) {
      return h(W, Q(
        W,
        J,
        R,
        X
      ));
    } : function(W, J, R, X) {
      return h(W, J, Q(
        W,
        J,
        R,
        X
      ));
    };
    return H(b, N, C);
    function Q(Y, W, J, R) {
      return function(X, M) {
        X && (X.code === "EMFILE" || X.code === "ENFILE") ? at([
          H,
          [Y, W, J],
          X,
          R || Date.now(),
          Date.now()
        ]) : (M && M.sort && M.sort(), typeof J == "function" && J.call(this, X, M));
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var y = mu(t);
    A = y.ReadStream, T = y.WriteStream;
  }
  var m = t.ReadStream;
  m && (A.prototype = Object.create(m.prototype), A.prototype.open = O);
  var w = t.WriteStream;
  w && (T.prototype = Object.create(w.prototype), T.prototype.open = ge), Object.defineProperty(t, "ReadStream", {
    get: function() {
      return A;
    },
    set: function(b) {
      A = b;
    },
    enumerable: !0,
    configurable: !0
  }), Object.defineProperty(t, "WriteStream", {
    get: function() {
      return T;
    },
    set: function(b) {
      T = b;
    },
    enumerable: !0,
    configurable: !0
  });
  var x = A;
  Object.defineProperty(t, "FileReadStream", {
    get: function() {
      return x;
    },
    set: function(b) {
      x = b;
    },
    enumerable: !0,
    configurable: !0
  });
  var v = T;
  Object.defineProperty(t, "FileWriteStream", {
    get: function() {
      return v;
    },
    set: function(b) {
      v = b;
    },
    enumerable: !0,
    configurable: !0
  });
  function A(b, N) {
    return this instanceof A ? (m.apply(this, arguments), this) : A.apply(Object.create(A.prototype), arguments);
  }
  function O() {
    var b = this;
    St(b.path, b.flags, b.mode, function(N, C) {
      N ? (b.autoClose && b.destroy(), b.emit("error", N)) : (b.fd = C, b.emit("open", C), b.read());
    });
  }
  function T(b, N) {
    return this instanceof T ? (w.apply(this, arguments), this) : T.apply(Object.create(T.prototype), arguments);
  }
  function ge() {
    var b = this;
    St(b.path, b.flags, b.mode, function(N, C) {
      N ? (b.destroy(), b.emit("error", N)) : (b.fd = C, b.emit("open", C));
    });
  }
  function vt(b, N) {
    return new t.ReadStream(b, N);
  }
  function Ue(b, N) {
    return new t.WriteStream(b, N);
  }
  var Gt = t.open;
  t.open = St;
  function St(b, N, C, H) {
    return typeof C == "function" && (H = C, C = null), Q(b, N, C, H);
    function Q(Y, W, J, R, X) {
      return Gt(Y, W, J, function(M, Sr) {
        M && (M.code === "EMFILE" || M.code === "ENFILE") ? at([Q, [Y, W, J, R], M, X || Date.now(), Date.now()]) : typeof R == "function" && R.apply(this, arguments);
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
var dr = {}, ri = {};
const vu = F;
ri.checkPath = function(e) {
  if (process.platform === "win32" && /[<>:"|?*]/.test(e.replace(vu.parse(e).root, ""))) {
    const r = new Error(`Path contains invalid characters: ${e}`);
    throw r.code = "EINVAL", r;
  }
};
const oi = rt, { checkPath: ii } = ri, si = (t) => {
  const e = { mode: 511 };
  return typeof t == "number" ? t : { ...e, ...t }.mode;
};
dr.makeDir = async (t, e) => (ii(t), oi.mkdir(t, {
  mode: si(e),
  recursive: !0
}));
dr.makeDirSync = (t, e) => (ii(t), oi.mkdirSync(t, {
  mode: si(e),
  recursive: !0
}));
const Su = me.fromPromise, { makeDir: Eu, makeDirSync: Bn } = dr, zn = Su(Eu);
var xe = {
  mkdirs: zn,
  mkdirsSync: Bn,
  // alias
  mkdirp: zn,
  mkdirpSync: Bn,
  ensureDir: zn,
  ensureDirSync: Bn
};
const $u = me.fromPromise, ai = rt;
function bu(t) {
  return ai.access(t).then(() => !0).catch(() => !1);
}
var ot = {
  pathExists: $u(bu),
  pathExistsSync: ai.existsSync
};
const pt = ye;
function _u(t, e, n, r) {
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
function Fu(t, e, n) {
  const r = pt.openSync(t, "r+");
  return pt.futimesSync(r, e, n), pt.closeSync(r);
}
var ci = {
  utimesMillis: _u,
  utimesMillisSync: Fu
};
const mt = rt, te = F, Pu = sr;
function xu(t, e, n) {
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
function Du(t, e, n) {
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
function Ou(t, e, n, r, o) {
  Pu.callbackify(xu)(t, e, r, (i, a) => {
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
function ku(t, e, n, r) {
  const { srcStat: o, destStat: i } = Du(t, e, r);
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
function li(t, e, n, r, o) {
  const i = te.resolve(te.dirname(t)), a = te.resolve(te.dirname(n));
  if (a === i || a === te.parse(a).root)
    return o();
  mt.stat(a, { bigint: !0 }, (c, f) => c ? c.code === "ENOENT" ? o() : o(c) : Ht(e, f) ? o(new Error(Dn(t, n, r))) : li(t, e, a, r, o));
}
function ui(t, e, n, r) {
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
  return ui(t, e, i, r);
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
var wt = {
  checkPaths: Ou,
  checkPathsSync: ku,
  checkParentPaths: li,
  checkParentPathsSync: ui,
  isSrcSubdir: pr,
  areIdentical: Ht
};
const ve = ye, It = F, Au = xe.mkdirs, Cu = ot.pathExists, Lu = ci.utimesMillis, Rt = wt;
function Tu(t, e, n, r) {
  typeof n == "function" && !r ? (r = n, n = {}) : typeof n == "function" && (n = { filter: n }), r = r || function() {
  }, n = n || {}, n.clobber = "clobber" in n ? !!n.clobber : !0, n.overwrite = "overwrite" in n ? !!n.overwrite : n.clobber, n.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0001"
  ), Rt.checkPaths(t, e, "copy", n, (o, i) => {
    if (o)
      return r(o);
    const { srcStat: a, destStat: c } = i;
    Rt.checkParentPaths(t, a, e, "copy", (f) => f ? r(f) : n.filter ? fi(oo, c, t, e, n, r) : oo(c, t, e, n, r));
  });
}
function oo(t, e, n, r, o) {
  const i = It.dirname(n);
  Cu(i, (a, c) => {
    if (a)
      return o(a);
    if (c)
      return Sn(t, e, n, r, o);
    Au(i, (f) => f ? o(f) : Sn(t, e, n, r, o));
  });
}
function fi(t, e, n, r, o, i) {
  Promise.resolve(o.filter(n, r)).then((a) => a ? t(e, n, r, o, i) : i(), (a) => i(a));
}
function Nu(t, e, n, r, o) {
  return r.filter ? fi(Sn, t, e, n, r, o) : Sn(t, e, n, r, o);
}
function Sn(t, e, n, r, o) {
  (r.dereference ? ve.stat : ve.lstat)(e, (a, c) => a ? o(a) : c.isDirectory() ? Bu(c, t, e, n, r, o) : c.isFile() || c.isCharacterDevice() || c.isBlockDevice() ? Iu(c, t, e, n, r, o) : c.isSymbolicLink() ? qu(t, e, n, r, o) : c.isSocket() ? o(new Error(`Cannot copy a socket file: ${e}`)) : c.isFIFO() ? o(new Error(`Cannot copy a FIFO pipe: ${e}`)) : o(new Error(`Unknown file: ${e}`)));
}
function Iu(t, e, n, r, o, i) {
  return e ? Ru(t, n, r, o, i) : di(t, n, r, o, i);
}
function Ru(t, e, n, r, o) {
  if (r.overwrite)
    ve.unlink(n, (i) => i ? o(i) : di(t, e, n, r, o));
  else
    return r.errorOnExist ? o(new Error(`'${n}' already exists`)) : o();
}
function di(t, e, n, r, o) {
  ve.copyFile(e, n, (i) => i ? o(i) : r.preserveTimestamps ? ju(t.mode, e, n, o) : On(n, t.mode, o));
}
function ju(t, e, n, r) {
  return Mu(t) ? Uu(n, t, (o) => o ? r(o) : io(t, e, n, r)) : io(t, e, n, r);
}
function Mu(t) {
  return (t & 128) === 0;
}
function Uu(t, e, n) {
  return On(t, e | 128, n);
}
function io(t, e, n, r) {
  Wu(e, n, (o) => o ? r(o) : On(n, t, r));
}
function On(t, e, n) {
  return ve.chmod(t, e, n);
}
function Wu(t, e, n) {
  ve.stat(t, (r, o) => r ? n(r) : Lu(e, o.atime, o.mtime, n));
}
function Bu(t, e, n, r, o, i) {
  return e ? pi(n, r, o, i) : zu(t.mode, n, r, o, i);
}
function zu(t, e, n, r, o) {
  ve.mkdir(n, (i) => {
    if (i)
      return o(i);
    pi(e, n, r, (a) => a ? o(a) : On(n, t, o));
  });
}
function pi(t, e, n, r) {
  ve.readdir(t, (o, i) => o ? r(o) : hi(i, t, e, n, r));
}
function hi(t, e, n, r, o) {
  const i = t.pop();
  return i ? Ju(t, i, e, n, r, o) : o();
}
function Ju(t, e, n, r, o, i) {
  const a = It.join(n, e), c = It.join(r, e);
  Rt.checkPaths(a, c, "copy", o, (f, h) => {
    if (f)
      return i(f);
    const { destStat: u } = h;
    Nu(u, a, c, o, (d) => d ? i(d) : hi(t, n, r, o, i));
  });
}
function qu(t, e, n, r, o) {
  ve.readlink(e, (i, a) => {
    if (i)
      return o(i);
    if (r.dereference && (a = It.resolve(process.cwd(), a)), t)
      ve.readlink(n, (c, f) => c ? c.code === "EINVAL" || c.code === "UNKNOWN" ? ve.symlink(a, n, o) : o(c) : (r.dereference && (f = It.resolve(process.cwd(), f)), Rt.isSrcSubdir(a, f) ? o(new Error(`Cannot copy '${a}' to a subdirectory of itself, '${f}'.`)) : t.isDirectory() && Rt.isSrcSubdir(f, a) ? o(new Error(`Cannot overwrite '${f}' with '${a}'.`)) : Vu(a, n, o)));
    else
      return ve.symlink(a, n, o);
  });
}
function Vu(t, e, n) {
  ve.unlink(e, (r) => r ? n(r) : ve.symlink(t, e, n));
}
var Hu = Tu;
const le = ye, jt = F, Gu = xe.mkdirsSync, Ku = ci.utimesMillisSync, Mt = wt;
function Yu(t, e, n) {
  typeof n == "function" && (n = { filter: n }), n = n || {}, n.clobber = "clobber" in n ? !!n.clobber : !0, n.overwrite = "overwrite" in n ? !!n.overwrite : n.clobber, n.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0002"
  );
  const { srcStat: r, destStat: o } = Mt.checkPathsSync(t, e, "copy", n);
  return Mt.checkParentPathsSync(t, r, e, "copy"), Qu(o, t, e, n);
}
function Qu(t, e, n, r) {
  if (r.filter && !r.filter(e, n))
    return;
  const o = jt.dirname(n);
  return le.existsSync(o) || Gu(o), mi(t, e, n, r);
}
function Xu(t, e, n, r) {
  if (!(r.filter && !r.filter(e, n)))
    return mi(t, e, n, r);
}
function mi(t, e, n, r) {
  const i = (r.dereference ? le.statSync : le.lstatSync)(e);
  if (i.isDirectory())
    return sf(i, t, e, n, r);
  if (i.isFile() || i.isCharacterDevice() || i.isBlockDevice())
    return Zu(i, t, e, n, r);
  if (i.isSymbolicLink())
    return lf(t, e, n, r);
  throw i.isSocket() ? new Error(`Cannot copy a socket file: ${e}`) : i.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${e}`) : new Error(`Unknown file: ${e}`);
}
function Zu(t, e, n, r, o) {
  return e ? ef(t, n, r, o) : yi(t, n, r, o);
}
function ef(t, e, n, r) {
  if (r.overwrite)
    return le.unlinkSync(n), yi(t, e, n, r);
  if (r.errorOnExist)
    throw new Error(`'${n}' already exists`);
}
function yi(t, e, n, r) {
  return le.copyFileSync(e, n), r.preserveTimestamps && tf(t.mode, e, n), hr(n, t.mode);
}
function tf(t, e, n) {
  return nf(t) && rf(n, t), of(e, n);
}
function nf(t) {
  return (t & 128) === 0;
}
function rf(t, e) {
  return hr(t, e | 128);
}
function hr(t, e) {
  return le.chmodSync(t, e);
}
function of(t, e) {
  const n = le.statSync(t);
  return Ku(e, n.atime, n.mtime);
}
function sf(t, e, n, r, o) {
  return e ? gi(n, r, o) : af(t.mode, n, r, o);
}
function af(t, e, n, r) {
  return le.mkdirSync(n), gi(e, n, r), hr(n, t);
}
function gi(t, e, n) {
  le.readdirSync(t).forEach((r) => cf(r, t, e, n));
}
function cf(t, e, n, r) {
  const o = jt.join(e, t), i = jt.join(n, t), { destStat: a } = Mt.checkPathsSync(o, i, "copy", r);
  return Xu(a, o, i, r);
}
function lf(t, e, n, r) {
  let o = le.readlinkSync(e);
  if (r.dereference && (o = jt.resolve(process.cwd(), o)), t) {
    let i;
    try {
      i = le.readlinkSync(n);
    } catch (a) {
      if (a.code === "EINVAL" || a.code === "UNKNOWN")
        return le.symlinkSync(o, n);
      throw a;
    }
    if (r.dereference && (i = jt.resolve(process.cwd(), i)), Mt.isSrcSubdir(o, i))
      throw new Error(`Cannot copy '${o}' to a subdirectory of itself, '${i}'.`);
    if (le.statSync(n).isDirectory() && Mt.isSrcSubdir(i, o))
      throw new Error(`Cannot overwrite '${i}' with '${o}'.`);
    return uf(o, n);
  } else
    return le.symlinkSync(o, n);
}
function uf(t, e) {
  return le.unlinkSync(e), le.symlinkSync(t, e);
}
var ff = Yu;
const df = me.fromCallback;
var mr = {
  copy: df(Hu),
  copySync: ff
};
const so = ye, wi = F, j = Co, Ut = process.platform === "win32";
function vi(t) {
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
  typeof e == "function" && (n = e, e = {}), j(t, "rimraf: missing path"), j.strictEqual(typeof t, "string", "rimraf: path should be a string"), j.strictEqual(typeof n, "function", "rimraf: callback function required"), j(e, "rimraf: invalid options argument provided"), j.strictEqual(typeof e, "object", "rimraf: options should be object"), vi(e), ao(t, e, function o(i) {
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
    if (r && r.code === "EPERM" && Ut)
      return co(t, e, r, n);
    if (o && o.isDirectory())
      return hn(t, e, r, n);
    e.unlink(t, (i) => {
      if (i) {
        if (i.code === "ENOENT")
          return n(null);
        if (i.code === "EPERM")
          return Ut ? co(t, e, i, n) : hn(t, e, i, n);
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
    o && (o.code === "ENOTEMPTY" || o.code === "EEXIST" || o.code === "EPERM") ? pf(t, e, r) : o && o.code === "ENOTDIR" ? r(n) : r(o);
  });
}
function pf(t, e, n) {
  j(t), j(e), j(typeof n == "function"), e.readdir(t, (r, o) => {
    if (r)
      return n(r);
    let i = o.length, a;
    if (i === 0)
      return e.rmdir(t, n);
    o.forEach((c) => {
      yr(wi.join(t, c), e, (f) => {
        if (!a) {
          if (f)
            return n(a = f);
          --i === 0 && e.rmdir(t, n);
        }
      });
    });
  });
}
function Si(t, e) {
  let n;
  e = e || {}, vi(e), j(t, "rimraf: missing path"), j.strictEqual(typeof t, "string", "rimraf: path should be a string"), j(e, "rimraf: missing options"), j.strictEqual(typeof e, "object", "rimraf: options should be object");
  try {
    n = e.lstatSync(t);
  } catch (r) {
    if (r.code === "ENOENT")
      return;
    r.code === "EPERM" && Ut && lo(t, e, r);
  }
  try {
    n && n.isDirectory() ? mn(t, e, null) : e.unlinkSync(t);
  } catch (r) {
    if (r.code === "ENOENT")
      return;
    if (r.code === "EPERM")
      return Ut ? lo(t, e, r) : mn(t, e, r);
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
      hf(t, e);
    else if (r.code !== "ENOENT")
      throw r;
  }
}
function hf(t, e) {
  if (j(t), j(e), e.readdirSync(t).forEach((n) => Si(wi.join(t, n), e)), Ut) {
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
var mf = yr;
yr.sync = Si;
const En = ye, yf = me.fromCallback, Ei = mf;
function gf(t, e) {
  if (En.rm)
    return En.rm(t, { recursive: !0, force: !0 }, e);
  Ei(t, e);
}
function wf(t) {
  if (En.rmSync)
    return En.rmSync(t, { recursive: !0, force: !0 });
  Ei.sync(t);
}
var kn = {
  remove: yf(gf),
  removeSync: wf
};
const vf = me.fromPromise, $i = rt, bi = F, _i = xe, Fi = kn, uo = vf(async function(e) {
  let n;
  try {
    n = await $i.readdir(e);
  } catch {
    return _i.mkdirs(e);
  }
  return Promise.all(n.map((r) => Fi.remove(bi.join(e, r))));
});
function fo(t) {
  let e;
  try {
    e = $i.readdirSync(t);
  } catch {
    return _i.mkdirsSync(t);
  }
  e.forEach((n) => {
    n = bi.join(t, n), Fi.removeSync(n);
  });
}
var Sf = {
  emptyDirSync: fo,
  emptydirSync: fo,
  emptyDir: uo,
  emptydir: uo
};
const Ef = me.fromCallback, Pi = F, je = ye, xi = xe;
function $f(t, e) {
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
    const i = Pi.dirname(t);
    je.stat(i, (a, c) => {
      if (a)
        return a.code === "ENOENT" ? xi.mkdirs(i, (f) => {
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
function bf(t) {
  let e;
  try {
    e = je.statSync(t);
  } catch {
  }
  if (e && e.isFile())
    return;
  const n = Pi.dirname(t);
  try {
    je.statSync(n).isDirectory() || je.readdirSync(n);
  } catch (r) {
    if (r && r.code === "ENOENT")
      xi.mkdirsSync(n);
    else
      throw r;
  }
  je.writeFileSync(t, "");
}
var _f = {
  createFile: Ef($f),
  createFileSync: bf
};
const Ff = me.fromCallback, Di = F, Ne = ye, Oi = xe, Pf = ot.pathExists, { areIdentical: ki } = wt;
function xf(t, e, n) {
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
      if (i && ki(c, i))
        return n(null);
      const f = Di.dirname(e);
      Pf(f, (h, u) => {
        if (h)
          return n(h);
        if (u)
          return r(t, e);
        Oi.mkdirs(f, (d) => {
          if (d)
            return n(d);
          r(t, e);
        });
      });
    });
  });
}
function Df(t, e) {
  let n;
  try {
    n = Ne.lstatSync(e);
  } catch {
  }
  try {
    const i = Ne.lstatSync(t);
    if (n && ki(i, n))
      return;
  } catch (i) {
    throw i.message = i.message.replace("lstat", "ensureLink"), i;
  }
  const r = Di.dirname(e);
  return Ne.existsSync(r) || Oi.mkdirsSync(r), Ne.linkSync(t, e);
}
var Of = {
  createLink: Ff(xf),
  createLinkSync: Df
};
const Me = F, Ct = ye, kf = ot.pathExists;
function Af(t, e, n) {
  if (Me.isAbsolute(t))
    return Ct.lstat(t, (r) => r ? (r.message = r.message.replace("lstat", "ensureSymlink"), n(r)) : n(null, {
      toCwd: t,
      toDst: t
    }));
  {
    const r = Me.dirname(e), o = Me.join(r, t);
    return kf(o, (i, a) => i ? n(i) : a ? n(null, {
      toCwd: o,
      toDst: t
    }) : Ct.lstat(t, (c) => c ? (c.message = c.message.replace("lstat", "ensureSymlink"), n(c)) : n(null, {
      toCwd: t,
      toDst: Me.relative(r, t)
    })));
  }
}
function Cf(t, e) {
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
var Lf = {
  symlinkPaths: Af,
  symlinkPathsSync: Cf
};
const Ai = ye;
function Tf(t, e, n) {
  if (n = typeof e == "function" ? e : n, e = typeof e == "function" ? !1 : e, e)
    return n(null, e);
  Ai.lstat(t, (r, o) => {
    if (r)
      return n(null, "file");
    e = o && o.isDirectory() ? "dir" : "file", n(null, e);
  });
}
function Nf(t, e) {
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
var If = {
  symlinkType: Tf,
  symlinkTypeSync: Nf
};
const Rf = me.fromCallback, Ci = F, Fe = rt, Li = xe, jf = Li.mkdirs, Mf = Li.mkdirsSync, Ti = Lf, Uf = Ti.symlinkPaths, Wf = Ti.symlinkPathsSync, Ni = If, Bf = Ni.symlinkType, zf = Ni.symlinkTypeSync, Jf = ot.pathExists, { areIdentical: Ii } = wt;
function qf(t, e, n, r) {
  r = typeof n == "function" ? n : r, n = typeof n == "function" ? !1 : n, Fe.lstat(e, (o, i) => {
    !o && i.isSymbolicLink() ? Promise.all([
      Fe.stat(t),
      Fe.stat(e)
    ]).then(([a, c]) => {
      if (Ii(a, c))
        return r(null);
      po(t, e, n, r);
    }) : po(t, e, n, r);
  });
}
function po(t, e, n, r) {
  Uf(t, e, (o, i) => {
    if (o)
      return r(o);
    t = i.toDst, Bf(i.toCwd, n, (a, c) => {
      if (a)
        return r(a);
      const f = Ci.dirname(e);
      Jf(f, (h, u) => {
        if (h)
          return r(h);
        if (u)
          return Fe.symlink(t, e, c, r);
        jf(f, (d) => {
          if (d)
            return r(d);
          Fe.symlink(t, e, c, r);
        });
      });
    });
  });
}
function Vf(t, e, n) {
  let r;
  try {
    r = Fe.lstatSync(e);
  } catch {
  }
  if (r && r.isSymbolicLink()) {
    const c = Fe.statSync(t), f = Fe.statSync(e);
    if (Ii(c, f))
      return;
  }
  const o = Wf(t, e);
  t = o.toDst, n = zf(o.toCwd, n);
  const i = Ci.dirname(e);
  return Fe.existsSync(i) || Mf(i), Fe.symlinkSync(t, e, n);
}
var Hf = {
  createSymlink: Rf(qf),
  createSymlinkSync: Vf
};
const { createFile: ho, createFileSync: mo } = _f, { createLink: yo, createLinkSync: go } = Of, { createSymlink: wo, createSymlinkSync: vo } = Hf;
var Gf = {
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
function Kf(t, { EOL: e = `
`, finalEOL: n = !0, replacer: r = null, spaces: o } = {}) {
  const i = n ? e : "";
  return JSON.stringify(t, r, o).replace(/\n/g, e) + i;
}
function Yf(t) {
  return Buffer.isBuffer(t) && (t = t.toString("utf8")), t.replace(/^\uFEFF/, "");
}
var gr = { stringify: Kf, stripBom: Yf };
let yt;
try {
  yt = ye;
} catch {
  yt = S;
}
const An = me, { stringify: Ri, stripBom: ji } = gr;
async function Qf(t, e = {}) {
  typeof e == "string" && (e = { encoding: e });
  const n = e.fs || yt, r = "throws" in e ? e.throws : !0;
  let o = await An.fromCallback(n.readFile)(t, e);
  o = ji(o);
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
const Xf = An.fromPromise(Qf);
function Zf(t, e = {}) {
  typeof e == "string" && (e = { encoding: e });
  const n = e.fs || yt, r = "throws" in e ? e.throws : !0;
  try {
    let o = n.readFileSync(t, e);
    return o = ji(o), JSON.parse(o, e.reviver);
  } catch (o) {
    if (r)
      throw o.message = `${t}: ${o.message}`, o;
    return null;
  }
}
async function ed(t, e, n = {}) {
  const r = n.fs || yt, o = Ri(e, n);
  await An.fromCallback(r.writeFile)(t, o, n);
}
const td = An.fromPromise(ed);
function nd(t, e, n = {}) {
  const r = n.fs || yt, o = Ri(e, n);
  return r.writeFileSync(t, o, n);
}
const rd = {
  readFile: Xf,
  readFileSync: Zf,
  writeFile: td,
  writeFileSync: nd
};
var od = rd;
const an = od;
var id = {
  // jsonfile exports
  readJson: an.readFile,
  readJsonSync: an.readFileSync,
  writeJson: an.writeFile,
  writeJsonSync: an.writeFileSync
};
const sd = me.fromCallback, Lt = ye, Mi = F, Ui = xe, ad = ot.pathExists;
function cd(t, e, n, r) {
  typeof n == "function" && (r = n, n = "utf8");
  const o = Mi.dirname(t);
  ad(o, (i, a) => {
    if (i)
      return r(i);
    if (a)
      return Lt.writeFile(t, e, n, r);
    Ui.mkdirs(o, (c) => {
      if (c)
        return r(c);
      Lt.writeFile(t, e, n, r);
    });
  });
}
function ld(t, ...e) {
  const n = Mi.dirname(t);
  if (Lt.existsSync(n))
    return Lt.writeFileSync(t, ...e);
  Ui.mkdirsSync(n), Lt.writeFileSync(t, ...e);
}
var wr = {
  outputFile: sd(cd),
  outputFileSync: ld
};
const { stringify: ud } = gr, { outputFile: fd } = wr;
async function dd(t, e, n = {}) {
  const r = ud(e, n);
  await fd(t, r, n);
}
var pd = dd;
const { stringify: hd } = gr, { outputFileSync: md } = wr;
function yd(t, e, n) {
  const r = hd(e, n);
  md(t, r, n);
}
var gd = yd;
const wd = me.fromPromise, pe = id;
pe.outputJson = wd(pd);
pe.outputJsonSync = gd;
pe.outputJSON = pe.outputJson;
pe.outputJSONSync = pe.outputJsonSync;
pe.writeJSON = pe.writeJson;
pe.writeJSONSync = pe.writeJsonSync;
pe.readJSON = pe.readJson;
pe.readJSONSync = pe.readJsonSync;
var vd = pe;
const Sd = ye, tr = F, Ed = mr.copy, Wi = kn.remove, $d = xe.mkdirp, bd = ot.pathExists, So = wt;
function _d(t, e, n, r) {
  typeof n == "function" && (r = n, n = {}), n = n || {};
  const o = n.overwrite || n.clobber || !1;
  So.checkPaths(t, e, "move", n, (i, a) => {
    if (i)
      return r(i);
    const { srcStat: c, isChangingCase: f = !1 } = a;
    So.checkParentPaths(t, c, e, "move", (h) => {
      if (h)
        return r(h);
      if (Fd(e))
        return Eo(t, e, o, f, r);
      $d(tr.dirname(e), (u) => u ? r(u) : Eo(t, e, o, f, r));
    });
  });
}
function Fd(t) {
  const e = tr.dirname(t);
  return tr.parse(e).root === e;
}
function Eo(t, e, n, r, o) {
  if (r)
    return Jn(t, e, n, o);
  if (n)
    return Wi(e, (i) => i ? o(i) : Jn(t, e, n, o));
  bd(e, (i, a) => i ? o(i) : a ? o(new Error("dest already exists.")) : Jn(t, e, n, o));
}
function Jn(t, e, n, r) {
  Sd.rename(t, e, (o) => o ? o.code !== "EXDEV" ? r(o) : Pd(t, e, n, r) : r());
}
function Pd(t, e, n, r) {
  Ed(t, e, {
    overwrite: n,
    errorOnExist: !0
  }, (i) => i ? r(i) : Wi(t, r));
}
var xd = _d;
const Bi = ye, nr = F, Dd = mr.copySync, zi = kn.removeSync, Od = xe.mkdirpSync, $o = wt;
function kd(t, e, n) {
  n = n || {};
  const r = n.overwrite || n.clobber || !1, { srcStat: o, isChangingCase: i = !1 } = $o.checkPathsSync(t, e, "move", n);
  return $o.checkParentPathsSync(t, o, e, "move"), Ad(e) || Od(nr.dirname(e)), Cd(t, e, r, i);
}
function Ad(t) {
  const e = nr.dirname(t);
  return nr.parse(e).root === e;
}
function Cd(t, e, n, r) {
  if (r)
    return qn(t, e, n);
  if (n)
    return zi(e), qn(t, e, n);
  if (Bi.existsSync(e))
    throw new Error("dest already exists.");
  return qn(t, e, n);
}
function qn(t, e, n) {
  try {
    Bi.renameSync(t, e);
  } catch (r) {
    if (r.code !== "EXDEV")
      throw r;
    return Ld(t, e, n);
  }
}
function Ld(t, e, n) {
  return Dd(t, e, {
    overwrite: n,
    errorOnExist: !0
  }), zi(t);
}
var Td = kd;
const Nd = me.fromCallback;
var Id = {
  move: Nd(xd),
  moveSync: Td
}, Rd = {
  // Export promiseified graceful-fs:
  ...rt,
  // Export extra methods:
  ...mr,
  ...Sf,
  ...Gf,
  ...vd,
  ...xe,
  ...Id,
  ...wr,
  ...ot,
  ...kn
};
Object.defineProperty(xn, "__esModule", { value: !0 });
var Ji = xn.DownloadedUpdateHelper = void 0;
xn.createTempUpdateFile = Bd;
const jd = Ra, Md = S, bo = ou, Ge = Rd, Tt = F;
class Ud {
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
    const f = await Wd(c);
    return e.info.sha512 !== f ? (n.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${f}, expected: ${e.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = i, c);
  }
  getUpdateInfoFile() {
    return Tt.join(this.cacheDirForPendingUpdate, "update-info.json");
  }
}
Ji = xn.DownloadedUpdateHelper = Ud;
function Wd(t, e = "sha512", n = "base64", r) {
  return new Promise((o, i) => {
    const a = (0, jd.createHash)(e);
    a.on("error", i).setEncoding(n), (0, Md.createReadStream)(t, {
      ...r,
      highWaterMark: 1024 * 1024
      /* better to use more memory but hash faster */
    }).on("error", i).on("end", () => {
      a.end(), o(a.read());
    }).pipe(a, { end: !1 });
  });
}
async function Bd(t, e, n) {
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
class zd extends Ia {
  constructor() {
    super(...arguments);
    _(this, "downloadedUpdateHelper", new Ji(
      E.getPath("sessionData")
    ));
  }
}
const be = L.scope("[main] kernel processManager"), ct = zt(Wt), Pt = 6190, Ke = class Ke {
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
_(Ke, "instance", null);
let rr = Ke;
const Jd = rr.getInstance(), Z = L.scope("[main] kernel executor");
let ie = null;
const qd = gt;
async function Vd() {
  var t, e;
  try {
    if (ie) {
      Z.info("child process already exists, skip");
      return;
    }
    Z.info("Preparing to start program"), Z.info("Current environment:", gt ? "development" : "production");
    const n = process.platform;
    if (Z.info(`current platform: ${n}`), qd)
      Z.info("!!!Development environment, starting directly");
    else {
      Z.info("!!!Production environment, starting program"), await vr(), Z.info("start program"), Z.info(`child process path: ${ln}`);
      const r = await Jt.stat(ln);
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
async function Hd() {
  ie == null || ie.kill("SIGTERM"), setTimeout(() => {
    ie && (ie == null || ie.kill("SIGKILL"), Z.info("force terminate child process"));
  }, 5e3);
}
async function vr() {
  try {
    Z.info("Process cleanup started"), ie ? (Z.info("Using childProcess to exit normally"), await Hd()) : (Z.info("Using processManager for cleanup"), await Jd.cleanup());
  } catch (t) {
    L.error("Process cleanup failed:", t);
  } finally {
    L.info("Process cleanup completed"), ie = null;
  }
}
const de = L.scope("[main] updater"), ue = tu ? new zd() : Ql(), Gd = () => {
  const t = P();
  ru(), vr(), de.info("Quit and install update, close main window, ", t == null ? void 0 : t.id), setTimeout(() => {
    de.info("Window is closed, quit and install update"), ue.quitAndInstall();
  }, 1e3);
};
let At = !1, qi = !1, Vn = !1;
const Kd = {
  autoCheckUpdate: !1,
  autoDownloadUpdate: !1,
  checkUpdateInterval: 15 * 60 * 1e3
}, Yd = async () => {
  if (Vn) {
    de.info("already checking for updates");
    return;
  }
  Vn = !0;
  try {
    return await ue.checkForUpdates();
  } finally {
    Vn = !1;
  }
}, Qd = async () => {
  var t;
  if (qi) {
    At = !1, (t = P()) == null || t.webContents.send("update-downloaded"), de.info("update already downloaded, skip download");
    return;
  }
  if (At) {
    de.info("updater disabled or already downloading");
    return;
  }
  At = !0, de.info("Update available, downloading..."), ue.downloadUpdate().catch((e) => {
    At = !1, de.error("Failed to download update", e);
  });
}, Xd = () => {
  de.info("======== registerUpdater START ========"), ue.logger = de, ue.autoDownload = !1, ue.allowPrerelease = Zl !== "stable", ue.autoInstallOnAppQuit = !0, ue.autoRunAppAfterInstall = !0, ue.on("checking-for-update", () => {
    de.info("Checking for update");
  }), ue.on("update-available", (t) => {
    de.info("Update available", t);
  }), ue.on("update-not-available", (t) => {
    de.info("Update not available", t);
  }), ue.on("download-progress", (t) => {
    const e = P();
    e && e.webContents.send("download-progress", t);
  }), ue.on("update-downloaded", () => {
    var t;
    At = !1, qi = !0, de.info("Update downloaded, ready to install"), (t = P()) == null || t.webContents.send("update-downloaded");
  }), ue.on("error", (t) => {
    de.error("Error while updating client", t);
  }), ue.forceDevUpdateConfig = gt, setInterval(() => {
  }, Kd.checkUpdateInterval), de.info("======== registerUpdater END ========");
}, lt = L.scope("[main] kernel downloader");
let Zd = class {
  constructor() {
    _(this, "abortController", null);
    _(this, "downloadedBytes", 0);
    _(this, "startTime", 0);
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
    (n = P()) == null || n.webContents.send("kernel-updater-status-change", e);
  }
  async download(e, n) {
    var r;
    try {
      this.abortController = new AbortController(), this.startTime = Date.now(), S.mkdirSync(F.dirname(n), { recursive: !0 });
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
      const u = P();
      return u && u.webContents.send("backend-download-completed", n), n;
    } catch (o) {
      throw o instanceof Error && o.name === "AbortError" ? lt.info("download canceled") : lt.error("download failed:", o), o;
    }
  }
  cancel() {
    this.abortController && (this.abortController.abort(), this.abortController = null);
  }
};
const ut = L.scope("[main] kernel extractor"), _o = zt(Wt);
let Vi = class {
  async cleanDestination(e) {
    S.existsSync(e) && await S.promises.rm(e, { recursive: !0, force: !0 });
  }
  async setExecutablePermission(e) {
    try {
      if (process.platform === "win32")
        return;
      const n = F.basename(e), r = F.dirname(e);
      (n === "main" || r.includes("_internal") || n.endsWith(".dylib") || n.endsWith(".so") || n.endsWith(".node") || !F.extname(n)) && (await Lo(e, 493), ut.info(`Set executable permission: ${e}`));
    } catch (n) {
      ut.warn(`Failed to set file permission: ${e}`, n);
    }
  }
  async extract(e, n, r) {
    try {
      if (S.mkdirSync(n, { recursive: !0 }), process.platform === "darwin")
        await _o(`ditto -x -k "${e}" "${n}"`), ut.info("ditto command completed");
      else if (process.platform === "win32") {
        const o = `powershell.exe -Command "Expand-Archive -Path '${e.replace(
          /'/g,
          "''"
        )}' -DestinationPath '${n.replace(/'/g, "''")}' -Force"`;
        await _o(o), ut.info("Expand-Archive command completed");
      } else
        throw new Error("Unsupported operating system platform");
      if (process.platform === "darwin") {
        const o = async (i) => {
          const a = await S.promises.readdir(i, { withFileTypes: !0 });
          for (const c of a) {
            const f = F.join(i, c.name);
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
const U = L.scope("[main] kernel updater"), Hn = zt(Wt), ep = "1.0.1", Hi = process.env.KERNEL_DOWNLOAD_URL_WIN, Gi = process.env.KERNEL_DOWNLOAD_URL_MAC;
U.info("Environment variables:", {
  KERNEL_DOWNLOAD_URL_WIN: process.env.KERNEL_DOWNLOAD_URL_WIN,
  KERNEL_DOWNLOAD_URL_MAC: process.env.KERNEL_DOWNLOAD_URL_MAC
});
if (!Hi || !Gi)
  throw new Error(
    "Kernel download URLs are not configured. Please set KERNEL_DOWNLOAD_URL_WIN and KERNEL_DOWNLOAD_URL_MAC in your .env file."
  );
const tp = process.platform === "darwin" ? Gi : Hi;
async function Ki(t) {
  try {
    await To(t, No.W_OK);
  } catch {
    if (U.info(`try to fix directory permission: ${t}`), process.platform === "darwin" || process.platform === "linux")
      try {
        const n = process.env.USER || process.env.USERNAME;
        await Hn(`chmod -R 755 "${t}"`), await Hn(`chown -R ${n} "${t}"`), U.info(`fix directory permission: ${t}`);
      } catch (n) {
        U.error("execute command failed", n);
        try {
          await S.promises.rm(t, { recursive: !0, force: !0 }), U.info(`force remove success: ${t}`);
        } catch (r) {
          throw U.error(`force remove failed: ${t}`, r), new Error(`cannot access or delete file/directory: ${t}`);
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
async function Yi(t) {
  try {
    try {
      await S.promises.rm(t, { recursive: !0, force: !0 }), U.info(`success delete directory: ${t}`);
      return;
    } catch {
      U.warn(`direct remove failed, try to delete item by item: ${t}`);
    }
    const e = await S.promises.readdir(t, { withFileTypes: !0 });
    for (const n of e) {
      const r = F.join(t, n.name);
      try {
        await Ki(r), n.isDirectory() ? await Yi(r) : await S.promises.unlink(r);
      } catch (o) {
        U.warn(`handle path failed: ${r}`, o);
      }
    }
    try {
      await S.promises.rmdir(t);
    } catch (n) {
      U.warn(`delete directory failed: ${t}`, n);
    }
  } catch (e) {
    throw U.error(`recursive cleanup failed: ${t}`, e), e;
  }
}
function np(t, e) {
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
const rp = new Vi();
function op() {
  try {
    const t = S.readFileSync(Zo, "utf-8");
    return t === "" ? "0.0.0" : t;
  } catch (t) {
    return U.error("read local version failed", t), "0.0.0";
  }
}
async function Qi() {
  return {
    version: ep,
    download_url: tp
  };
}
const ip = new Zd();
async function sp(t, e) {
  try {
    const n = `main(${e}).zip`, r = F.join(Qo, n);
    U.info(`start download file: ${t}`), U.info(`download target path: ${r}`);
    const o = await ip.download(t, r);
    return U.info(`download completed: ${o}`), o;
  } catch (n) {
    throw U.error("download service failed", n), n;
  }
}
async function ap(t) {
  const e = fn;
  U.info(`extract target path: ${e}`);
  try {
    if (S.existsSync(dn))
      try {
        await Ki(dn), await Yi(dn);
      } catch (r) {
        throw U.error("clean target directory failed", r), new Error(
          `cannot clean target directory: ${r instanceof Error ? r.message : String(r)}`
        );
      }
    U.info(`start extract file: ${t} -> ${fn}`);
    const n = await rp.extract(t, fn, (r) => {
      var o;
      (o = P()) == null || o.webContents.send("kernel-updater-status-change", r);
    });
    try {
      await S.promises.unlink(t), U.info(`delete zip file: ${t}`);
    } catch (r) {
      U.warn(`delete zip file failed: ${t}`, r);
    }
    return n;
  } catch (n) {
    throw U.error("extract service failed", n), n;
  }
}
async function cp() {
  try {
    U.info("start check update service");
    const t = op(), e = await Qi();
    if (!e)
      return !1;
    U.info(`local version: ${t}, cloud version: ${e.version}`);
    const n = e.version;
    return np(t, n);
  } catch (t) {
    return U.error("check update service failed", t), !1;
  }
}
async function lp() {
  const t = await Qi();
  if (!t)
    return null;
  const e = t.download_url;
  return await sp(e, t.version);
}
const up = gt;
async function fp() {
  var t, e, n, r;
  try {
    if ((t = P()) == null || t.webContents.send("kernel-updater-status-change", {
      status: "checking"
    }), !up) {
      if (await cp()) {
        const i = await lp();
        if (!i)
          return;
        (e = P()) == null || e.webContents.send("kernel-updater-status-change", {
          status: "extracting"
        }), await ap(i);
      }
      await Vd();
    }
    (n = P()) == null || n.webContents.send("kernel-updater-status-change", {
      status: "completed"
    });
  } catch (o) {
    U.error("check update service failed", o), (r = P()) == null || r.webContents.send("kernel-updater-status-change", {
      status: "error",
      error: o
    });
  }
}
const Xi = L.scope("[main] files");
async function dp(t, e) {
  try {
    return (await Jt.readdir(e, { withFileTypes: !0 })).map((o) => ({
      id: o.name,
      name: o.name,
      isDirectory: o.isDirectory(),
      path: F.join(e, o.name)
    }));
  } catch (n) {
    return Xi.error("read directory failed", n), [];
  }
}
async function pp(t, e = "Documents", n = !0, r = !1) {
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
async function hp(t, e) {
  const { canceled: n, filePaths: r } = await Oo.showOpenDialog({
    properties: ["openDirectory"],
    defaultPath: e
  });
  return n ? [] : r;
}
async function mp(t) {
  try {
    const e = F.join(Pn, t);
    return {
      status: "completed",
      message: "completed",
      data: {
        stats: await Jt.stat(e),
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
  const e = P();
  e && (e.webContents.send("open-url", t), Xi.log("[main]: open url", t));
}
class yp extends Error {
}
const gp = (t, e) => {
  const n = Ba.mime(e);
  return n.length !== 1 ? t : `${t}.${n[0].ext}`;
};
function wp(t, e, n = () => {
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
      const O = d.getFilename(), T = $.extname(O) ? O : gp(O, d.getMimeType());
      v = e.overwrite ? $.join(x, T) : Ua($.join(x, T));
    }
    const A = e.errorMessage ?? "The download of {filename} was interrupted";
    e.saveAs ? d.setSaveDialogOptions({ defaultPath: v, ...e.dialogOptions }) : d.setSavePath(v), d.on("updated", () => {
      o = i;
      for (const O of r)
        o += O.getReceivedBytes();
      if (e.showBadge && ["darwin", "linux"].includes(Un.platform) && (E.badgeCount = c()), !m.isDestroyed() && e.showProgressBar && m.setProgressBar(f()), typeof e.onProgress == "function") {
        const O = d.getReceivedBytes(), T = d.getTotalBytes();
        e.onProgress(d, {
          percent: T ? O / T : 0,
          transferredBytes: O,
          totalBytes: T
        });
      }
      typeof e.onTotalProgress == "function" && e.onTotalProgress({
        percent: f(),
        transferredBytes: o,
        totalBytes: a
      });
    }), d.on("done", (O, T) => {
      if (i += d.getTotalBytes(), r.delete(d), e.showBadge && ["darwin", "linux"].includes(Un.platform) && (E.badgeCount = c()), !m.isDestroyed() && !c() && (m.setProgressBar(-1), o = 0, i = 0, a = 0), e.unregisterWhenDone && t.removeListener("will-download", h), T === "cancelled")
        typeof e.onCancel == "function" && e.onCancel(d), n(new yp());
      else if (T === "interrupted") {
        const ge = Wa(A, { filename: $.basename(v) });
        n(new Error(ge));
      } else if (T === "completed") {
        const ge = d.getSavePath();
        Un.platform === "darwin" && E.dock.downloadFinished(ge), e.openFolderWhenDone && Qn.showItemInFolder(ge), typeof e.onCompleted == "function" && e.onCompleted(d), n(null, d);
      }
    }), typeof e.onStarted == "function" && e.onStarted(d);
  };
  t.on("will-download", h);
}
async function Zi(t, e, n) {
  return new Promise((r, o) => {
    n = {
      ...n,
      unregisterWhenDone: !0
    }, wp(t.webContents.session, n, (i, a) => {
      i ? o(i) : r(a);
    }), t.webContents.downloadURL(e);
  });
}
const or = L.scope("[main] electron-downloader"), et = /* @__PURE__ */ new Map(), nt = /* @__PURE__ */ new Map(), es = {
  overwrite: !0,
  directory: Pn,
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
    }, r = P();
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
    }, n = P();
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
    }, n = P();
    n == null || n.webContents.send("downloader::event::progress", e), nt.delete(t.getURL());
  }
}, vp = async (t, { url: e }) => {
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
    }, o = P();
    o == null || o.webContents.send("downloader::event::progress", r);
  }
}, Sp = async (t, { url: e }) => {
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
    }, i = P();
    i == null || i.webContents.send("downloader::event::progress", o);
  } else {
    const o = P();
    if (!o)
      return;
    const i = e.split("/").pop() || "";
    await ts(i), Zi(o, e, es);
  }
}, Ep = async (t, { url: e }) => {
  if (nt.get(e))
    return;
  nt.set(e, !0);
  const r = P();
  r && Zi(r, e, es);
};
async function ts(t) {
  try {
    const e = F.join(Pn, t);
    await Jt.rm(e), et.delete(t), nt.delete(t);
  } catch {
  }
}
const xt = L.scope("[main] Commons downloader");
class ns {
  constructor() {
    _(this, "abortController", null);
    _(this, "downloadedBytes", 0);
    _(this, "startTime", 0);
  }
  async getFileSize(e) {
    try {
      const n = await fetch(e, { method: "HEAD" });
      return parseInt(n.headers.get("content-length") || "0");
    } catch (n) {
      throw xt.error("get file size failed:", n), n;
    }
  }
  calculateSpeed(e) {
    const r = (Date.now() - this.startTime) / 1e3;
    return r > 0 ? e / r : 0;
  }
  async download(e, n, r) {
    var o;
    try {
      this.abortController = new AbortController(), this.startTime = Date.now(), S.mkdirSync(F.dirname(n), { recursive: !0 });
      const i = await this.getFileSize(e);
      xt.info(`file total size: ${i} bytes`);
      let a = !1;
      try {
        const y = await S.promises.stat(n);
        a = y.size > 0, this.downloadedBytes = y.size;
      } catch {
        this.downloadedBytes = 0;
      }
      if (a && this.downloadedBytes >= i)
        return xt.info("file is fully downloaded"), n;
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
            c.write(m, (A) => {
              A ? v(A) : x();
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
      const d = P();
      return d && d.webContents.send("backend-download-completed", n), n;
    } catch (i) {
      throw i instanceof Error && i.name === "AbortError" ? xt.info("download canceled") : xt.error("download failed:", i), i;
    }
  }
  cancel() {
    this.abortController && (this.abortController.abort(), this.abortController = null);
  }
}
const oe = L.scope("[main] ollama executor");
let se = null;
const $p = !1;
async function cn(t) {
  var e, n;
  try {
    if (se) {
      oe.info("child process already exists, skip");
      return;
    }
    oe.info("Preparing to start program"), oe.info("Current environment:", gt ? "development" : "production");
    const r = process.platform;
    if (oe.info(`current platform: ${r}`), !$p) {
      await rs(), oe.info("start program"), oe.info(`child process path: ${t}`);
      const o = await Jt.stat(t);
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
async function bp() {
  se == null || se.kill("SIGTERM"), setTimeout(() => {
    se && (se == null || se.kill("SIGKILL"), oe.info("force terminate child process"));
  }, 5e3);
}
async function rs() {
  try {
    oe.info("Process cleanup started"), se ? (oe.info("Using childProcess to exit normally"), await bp()) : oe.info("user use self-host ollama, don't need to cleanup");
  } catch (t) {
    L.error("Process cleanup failed:", t);
  } finally {
    L.info("Process cleanup completed"), se = null;
  }
}
const He = L.scope("[main] ollama extractor"), Kn = zt(Wt);
class _p {
  async cleanDestination(e) {
    S.existsSync(e) && await S.promises.rm(e, { recursive: !0, force: !0 });
  }
  async setExecutablePermission(e) {
    try {
      if (process.platform === "win32")
        return;
      const n = F.basename(e), r = F.dirname(e);
      (n === "main" || r.includes("_internal") || n.endsWith(".dylib") || n.endsWith(".so") || n.endsWith(".node") || !F.extname(n)) && (await Lo(e, 493), He.info(`Set executable permission: ${e}`));
    } catch (n) {
      He.warn(`Failed to set file permissions: ${e}`, n);
    }
  }
  async extract(e, n, r) {
    try {
      if (S.mkdirSync(n, { recursive: !0 }), process.platform === "darwin") {
        const o = F.extname(e).toLowerCase();
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
            const f = F.join(i, c.name);
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
const k = L.scope("[main] ollama"), Yn = zt(Wt), Fp = new _p(), Pp = new ns(), os = "https://dvnr1hi9fanyr.cloudfront.net/ollama/ollama-darwin.tgz", is = "https://dvnr1hi9fanyr.cloudfront.net/ollama/ollama-windows-amd64.zip", Fo = "https://dvnr1hi9fanyr.cloudfront.net/ollama/version.yml", xp = process.platform === "darwin" ? os : is;
async function Dp() {
  try {
    k.info(`Checking remote version from: ${Fo}`);
    const t = await fetch(Fo);
    if (!t.ok)
      return k.error(`Failed to fetch version info: ${t.status} ${t.statusText}`), null;
    const e = await t.text(), n = za.load(e);
    return k.info(`Remote version info: ${JSON.stringify(n)}`), n;
  } catch (t) {
    return k.error("Failed to get remote version info", t), null;
  }
}
async function Op() {
  try {
    if (!S.existsSync(dt))
      return k.info(`Local version file not found: ${dt}`), null;
    const t = await S.promises.readFile(dt, "utf-8"), e = JSON.parse(t);
    return k.info(`Local version info: ${JSON.stringify(e)}`), e;
  } catch (t) {
    return k.error("Failed to get local version info", t), null;
  }
}
async function kp(t) {
  try {
    const e = F.dirname(dt);
    S.existsSync(e) || await S.promises.mkdir(e, { recursive: !0 }), await S.promises.writeFile(dt, JSON.stringify(t, null, 2), "utf-8"), k.info(`Saved local version info: ${JSON.stringify(t)}`);
  } catch (e) {
    throw k.error("Failed to save local version info", e), e;
  }
}
async function Ap() {
  const t = await Dp(), e = await Op();
  if (!t)
    return k.info("No remote version info available, skipping update check"), { needUpdate: !1, remoteVersion: null };
  if (!e)
    return k.info("No local version info available, update required"), { needUpdate: !0, remoteVersion: t };
  const n = t.version !== e.version;
  return k.info(`Update check: local=${e.version}, remote=${t.version}, needUpdate=${n}`), { needUpdate: n, remoteVersion: t };
}
async function Cp(t) {
  return process.platform === "darwin" && t.darwin_url ? t.darwin_url : process.platform === "win32" && t.windows_url ? t.windows_url : process.platform === "darwin" ? os : is;
}
async function Po(t) {
  try {
    k.info(`start download file: ${t}`), k.info(`download target path: ${Xn}`);
    const e = await Pp.download(t, Xn, (n) => {
      var r;
      (r = P()) == null || r.webContents.send("ollama-updater-status-change", n);
    });
    return k.info(`download completed: ${e}`), e;
  } catch (e) {
    throw k.error("download service failed", e), e;
  }
}
async function ss(t) {
  try {
    await To(t, No.W_OK);
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
async function as(t) {
  try {
    try {
      await S.promises.rm(t, { recursive: !0, force: !0 }), k.info(`success delete directory: ${t}`);
      return;
    } catch {
      k.warn(`direct remove failed, try to delete item by item: ${t}`);
    }
    const e = await S.promises.readdir(t, { withFileTypes: !0 });
    for (const n of e) {
      const r = F.join(t, n.name);
      try {
        await ss(r), n.isDirectory() ? await as(r) : await S.promises.unlink(r);
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
        await ss(e), await as(e);
      } catch (r) {
        throw k.error("clean target directory failed", r), new Error(
          `cannot clean target directory: ${r instanceof Error ? r.message : String(r)}`
        );
      }
    k.info(`start extract file: ${t} -> ${e}`);
    const n = await Fp.extract(t, e, (r) => {
      var o;
      (o = P()) == null || o.webContents.send("ollama-updater-status-change", r);
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
function cs() {
  if (yn)
    return yn;
  const e = (process.env.PATH || "").split(F.delimiter);
  for (const n of e) {
    const r = F.join(n, process.platform === "win32" ? "ollama.exe" : "ollama");
    if (S.existsSync(r))
      return yn = r, r;
  }
}
const Lp = "http://localhost:11434";
async function ls() {
  try {
    return await fetch(`${Lp}/api/tags`), k.info("use ollama service directly"), 3;
  } catch {
  }
  if (S.existsSync(gn))
    return k.info("use local ollama service", gn), 1;
  const t = cs();
  return t ? (k.info("use global ollama service", t), 2) : (k.info("need to update ollama"), 0);
}
async function Tp() {
  var t, e, n, r, o, i, a, c, f, h, u, d, y, m, w, x;
  try {
    (t = P()) == null || t.webContents.send("ollama-updater-status-change", {
      status: "checking",
      message: "Checking Ollama installation and version..."
    });
    const v = await ls();
    if (k.info("ollama updater available", v), v === 0 || v === 1) {
      (e = P()) == null || e.webContents.send("ollama-updater-status-change", {
        status: "checking",
        message: "Checking for Ollama updates..."
      });
      const { needUpdate: A, remoteVersion: O } = await Ap();
      if (O && ((n = P()) == null || n.webContents.send("ollama-updater-status-change", {
        status: "checking",
        message: `Found remote version: ${O.version}${A ? " (update available)" : " (up to date)"}`
      })), v === 1 && !A)
        (r = P()) == null || r.webContents.send("ollama-updater-status-change", {
          status: "running",
          message: "Running local Ollama"
        }), await cn(un);
      else if (A || v === 0)
        if (O) {
          (o = P()) == null || o.webContents.send("ollama-updater-status-change", {
            status: "downloading",
            message: `Downloading Ollama version ${O.version}`
          });
          const T = await Cp(O), ge = await Po(T);
          (i = P()) == null || i.webContents.send("ollama-updater-status-change", {
            status: "extracting",
            message: `Extracting Ollama version ${O.version}`
          }), await xo(ge), await kp(O), (a = P()) == null || a.webContents.send("ollama-updater-status-change", {
            status: "running",
            message: `Running Ollama version ${O.version}`
          }), await cn(un);
        } else {
          (c = P()) == null || c.webContents.send("ollama-updater-status-change", {
            status: "downloading",
            message: "Downloading Ollama (no version info available)"
          });
          const T = await Po(xp);
          (f = P()) == null || f.webContents.send("ollama-updater-status-change", {
            status: "extracting",
            message: "Extracting Ollama"
          }), await xo(T), (h = P()) == null || h.webContents.send("ollama-updater-status-change", {
            status: "running",
            message: "Running Ollama"
          }), await cn(un);
        }
    } else if (v === 2) {
      (u = P()) == null || u.webContents.send("ollama-updater-status-change", {
        status: "checking",
        message: "Found global Ollama installation"
      }), (d = P()) == null || d.webContents.send("ollama-updater-status-change", {
        status: "running",
        message: "Running global Ollama"
      });
      const A = cs();
      if (k.info("use global ollama service and try to run", A, v, yn), A)
        await cn(A);
      else
        throw new Error("global ollama path not found");
    } else if (v === 3) {
      (y = P()) == null || y.webContents.send("ollama-updater-status-change", {
        status: "checking",
        message: "Ollama service is already running"
      }), (m = P()) == null || m.webContents.send("ollama-updater-status-change", {
        status: "completed",
        message: "Using existing Ollama service"
      });
      return;
    }
    (w = P()) == null || w.webContents.send("ollama-updater-status-change", {
      status: "completed",
      message: "Ollama setup completed"
    });
  } catch (v) {
    k.error("check update service failed", v), (x = P()) == null || x.webContents.send("ollama-updater-status-change", {
      status: "error",
      error: v,
      message: `Ollama setup failed: ${v instanceof Error ? v.message : String(v)}`
    });
  }
}
const us = /* @__PURE__ */ new Map();
async function Np(t) {
  const e = (r) => {
    const o = P();
    o && o.webContents.send("ollama:pull-progress", r);
  }, n = await Io.pull({
    model: t,
    stream: !0
  });
  us.set(t, n);
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
async function Ip(t) {
  const e = us.get(t);
  e && e.abort();
}
async function Rp(t) {
  await Io.delete({
    model: t
  });
}
const jp = "https://xltwffswqvowersvchkj.supabase.co", Mp = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdHdmZnN3cXZvd2Vyc3ZjaGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxMzQ0MzEsImV4cCI6MjA0NDcxMDQzMX0.FNG_uZzjK_uSC1j8ur5dgtkIyU7O8qLvhzVQAGgHsT0";
function Up(t, e) {
  return Ja(t, e, {
    auth: {
      flowType: "implicit"
    }
  });
}
const $n = Up(jp, Mp), Wp = "all-MiniLM-L6-v2", ne = L.scope("[main] embedModel"), Bp = new Vi(), Nt = {
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
async function zp(t) {
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
async function Jp() {
  if (!$n)
    return [Nt];
  const { data: t, error: e } = await $n.from("embed_models").select("*");
  return e ? (ne.error("[EmbedModel] => fetch embed model list failed", e), [Nt]) : t || [Nt];
}
async function qp(t) {
  if (!$n)
    return Nt;
  const { data: e, error: n } = await $n.from("embed_models").select("*").eq("name", t).order("weight", { ascending: !1 });
  return n && ne.error("[EmbedModel] => fetch model info failed", n), !e || e.length === 0 ? (ne.error("[EmbedModel] => model info not found", t), Nt) : e[0];
}
async function Vp(t, e) {
  try {
    ne.info("[EmbedModel] => start download embed model:", t.name);
    const n = F.join(ei, `${t.name}.zip`);
    return await new ns().download(t.download_url, n, (o) => {
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
async function Hp(t) {
  S.existsSync(Re) || (await S.promises.mkdir(Re, { recursive: !0 }), ne.info("[EmbedModel] => create embed model folder:", Re)), await Bp.extract(t, Re, (e) => {
    ne.info("[EmbedModel] => unzip progress:", e);
  });
  try {
    await S.promises.unlink(t), ne.info("[EmbedModel] => delete zip file:", t);
  } catch (e) {
    ne.error("[EmbedModel] => delete zip file failed:", e);
  }
}
async function Gp() {
  const t = P();
  try {
    ht(t, {
      status: "checking",
      message: "Checking embed model..."
    }), ne.info("[EmbedModel] => start fetch embed model list");
    const e = await Jp();
    ne.info("[EmbedModel] => fetch embed model list completed", e), ne.info("[EmbedModel] => start check if model exists");
    const n = await zp(e);
    if (ne.info("[EmbedModel] => check if model exists completed", n), n) {
      ht(t, {
        status: "completed",
        message: "Embed model already exists"
      });
      return;
    }
    const r = await qp(Wp);
    if (!r)
      throw new Error("Default embed model not found");
    const o = await Vp(r, t);
    await Hp(o);
  } catch (e) {
    const n = e instanceof Error ? e : new Error("Unknown error occurred");
    ne.error("[EmbedModel] => update failed:", n), ht(t, {
      status: "error",
      message: "Update failed",
      error: n
    });
  }
}
const Do = L.scope("[main] ipc"), Kp = () => {
  Do.info("======== registerIpcMain START ========"), K.handle("check-for-updates", async () => {
    const t = P();
    return t == null || t.show(), Yd();
  }), K.handle("download-update", async () => Qd()), K.handle("quit-and-install", async () => Gd()), K.handle("get-app-version", () => E.getVersion()), K.handle("fetch-kernel-updater-status", async () => fp()), K.handle("fetch-embed-model-updater-status", async () => Gp()), K.handle("fetch-ollama-update-status", async () => Tp()), K.handle("ollama:pull", async (t, e) => Np(e)), K.handle("ollama:pause", async (t, e) => Ip(e)), K.handle("ollama:delete", async (t, e) => Rp(e)), K.handle("ollama:get-status", async () => ls()), K.handle("fs:readDirectory", dp), K.handle("dialog:openFile", pp), K.handle("dialog:openDirectory", hp), K.handle("stat:file:llm", (t, e) => mp(e)), K.handle("delete:file:llm", (t, e) => ts(e)), K.handle("get-platform", () => process.platform), K.handle("open-win", (t, e) => {
    const n = new ir({
      titleBarStyle: "hidden",
      webPreferences: {
        preload: Go
      }
    });
    Qe ? n.loadURL(`${Qe}/#${e}`) : n.loadFile(Ko, { hash: e });
  }), K.handle("downloader:start", Ep), K.handle("downloader:pause", vp), K.handle("downloader:resume", Sp), Do.info("======== registerIpcMain END ========");
}, we = L.scope("[main] lifecycle"), bn = [];
async function fs(t) {
  bn.includes(t) || bn.push(t);
}
fs(vr);
fs(rs);
async function Dt() {
  for (; bn.length > 0; ) {
    const t = bn.shift();
    t && await t();
  }
}
const Yp = () => {
  we.info("======== registerLifecycle START ========"), E.on("will-quit", () => {
    we.info("Application will quit"), Dt();
  }), E.on("before-quit", () => {
    we.info("Application before quit"), Dt();
  }), process.on("SIGINT", () => {
    we.info("Received SIGINT signal"), Dt(), E.quit();
  }), process.on("SIGTERM", () => {
    we.info("Received SIGTERM signal"), Dt(), E.quit();
  }), process.on("uncaughtException", (t) => {
    we.info("uncaught exception:", t), Dt(), E.quit();
  }), E.on("open-url", (t, e) => {
    Gn(e);
  }), E.on("second-instance", (t, e) => {
    const n = P();
    n && (n.isMinimized() && n.restore(), n.focus());
    const r = e.pop();
    r && Gn(r);
  }), E.on("window-all-closed", () => {
    we.info("window-all-closed"), process.platform !== "darwin" && E.quit();
  }), E.on("activate", () => {
    we.info("activate");
    const t = nu();
    t ? (we.info("mainWindow focus"), t.focus()) : (we.info("createWindow"), er());
  }), E.whenReady().then(er), E.disableHardwareAcceleration(), Bt.release().startsWith("6.1") && E.disableHardwareAcceleration(), process.defaultApp ? process.argv.length >= 2 && E.setAsDefaultProtocolClient("klee", process.execPath, [F.resolve(process.argv[1])]) : E.setAsDefaultProtocolClient("klee"), process.env.NODE_ENV === "development" && process.platform === "darwin" && E.dock.setIcon(F.join(E.getAppPath(), "./build/icons/512x512.png")), process.platform === "win32" && E.setAppUserModelId(E.getName()), process.platform === "win32" && (we.info("start to requestSingleInstanceLock"), E.requestSingleInstanceLock() || (E.quit(), process.exit(0)), we.info("requestSingleInstanceLock completed")), process.platform === "win32" && E.requestSingleInstanceLock() && E.on("second-instance", (e, n) => {
    for (const o of n)
      we.info(`second-instance opening app -> :${o}`), o.includes("klee://") && Gn(o);
    const r = P();
    r && (r.isMinimized() && r.restore(), r.focus());
  }), we.info("======== registerLifecycle END ========");
};
function Qp() {
  L.info("======== registerLogger START ========"), L.initialize(), L.transports.file.resolvePathFn = () => Yo, L.transports.file.level = "info", L.transports.console.level = "info", L.transports.ipc.level = "info", L.transports.file.setAppName("com.signerlabs.klee"), L.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}", L.transports.file.maxSize = 10 * 1024 * 1024, L.transports.file.sync = !0, L.info("[main] Logger initialized, path is:", L.transports.file.getFile().path), L.info("======== registerLogger END ========");
}
Oa.config({ path: F.join(__dirname, "../../.env") });
const Xp = async () => {
  Qp(), Yl(), Xd(), Kp(), Yp();
};
Xp();
