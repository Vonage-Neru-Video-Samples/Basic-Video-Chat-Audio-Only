function Ie() {
  return new Promise((t, e) => {
    typeof MediaStreamTrackProcessor > "u" || typeof MediaStreamTrackGenerator > "u" ? e(
      "Your browser does not support the MediaStreamTrack API for Insertable Streams of Media."
    ) : t();
  });
}
class l {
}
l.updates = {
  transformer_new: "New transformer",
  transformer_null: "Null transformer"
};
l.errors = {
  transformer_none: "No transformers provided",
  transformer_start: "Cannot start transformer",
  transformer_transform: "Cannot transform frame",
  transformer_flush: "Cannot flush transformer",
  readable_null: "Readable is null",
  writable_null: "Writable is null"
};
function j(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
const f = /* @__PURE__ */ new WeakMap(), T = /* @__PURE__ */ new WeakMap(), g = /* @__PURE__ */ new WeakMap(), C = Symbol("anyProducer"), U = Promise.resolve(), S = Symbol("listenerAdded"), R = Symbol("listenerRemoved");
let A = !1;
function p(t) {
  if (typeof t != "string" && typeof t != "symbol")
    throw new TypeError("eventName must be a string or a symbol");
}
function b(t) {
  if (typeof t != "function")
    throw new TypeError("listener must be a function");
}
function m(t, e) {
  const r = T.get(t);
  return r.has(e) || r.set(e, /* @__PURE__ */ new Set()), r.get(e);
}
function _(t, e) {
  const r = typeof e == "string" || typeof e == "symbol" ? e : C, s = g.get(t);
  return s.has(r) || s.set(r, /* @__PURE__ */ new Set()), s.get(r);
}
function B(t, e, r) {
  const s = g.get(t);
  if (s.has(e))
    for (const i of s.get(e))
      i.enqueue(r);
  if (s.has(C)) {
    const i = Promise.all([e, r]);
    for (const n of s.get(C))
      n.enqueue(i);
  }
}
function D(t, e) {
  e = Array.isArray(e) ? e : [e];
  let r = !1, s = () => {
  }, i = [];
  const n = {
    enqueue(o) {
      i.push(o), s();
    },
    finish() {
      r = !0, s();
    }
  };
  for (const o of e)
    _(t, o).add(n);
  return {
    async next() {
      return i ? i.length === 0 ? r ? (i = void 0, this.next()) : (await new Promise((o) => {
        s = o;
      }), this.next()) : {
        done: !1,
        value: await i.shift()
      } : { done: !0 };
    },
    async return(o) {
      i = void 0;
      for (const a of e)
        _(t, a).delete(n);
      return s(), arguments.length > 0 ? { done: !0, value: await o } : { done: !0 };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
function $(t) {
  if (t === void 0)
    return G;
  if (!Array.isArray(t))
    throw new TypeError("`methodNames` must be an array of strings");
  for (const e of t)
    if (!G.includes(e))
      throw typeof e != "string" ? new TypeError("`methodNames` element must be a string") : new Error(`${e} is not Emittery method`);
  return t;
}
const M = (t) => t === S || t === R;
class d {
  static mixin(e, r) {
    return r = $(r), (s) => {
      if (typeof s != "function")
        throw new TypeError("`target` must be function");
      for (const o of r)
        if (s.prototype[o] !== void 0)
          throw new Error(`The property \`${o}\` already exists on \`target\``);
      function i() {
        return Object.defineProperty(this, e, {
          enumerable: !1,
          value: new d()
        }), this[e];
      }
      Object.defineProperty(s.prototype, e, {
        enumerable: !1,
        get: i
      });
      const n = (o) => function(...a) {
        return this[e][o](...a);
      };
      for (const o of r)
        Object.defineProperty(s.prototype, o, {
          enumerable: !1,
          value: n(o)
        });
      return s;
    };
  }
  static get isDebugEnabled() {
    if (typeof process != "object")
      return A;
    const { env: e } = process || { env: {} };
    return e.DEBUG === "emittery" || e.DEBUG === "*" || A;
  }
  static set isDebugEnabled(e) {
    A = e;
  }
  constructor(e = {}) {
    f.set(this, /* @__PURE__ */ new Set()), T.set(this, /* @__PURE__ */ new Map()), g.set(this, /* @__PURE__ */ new Map()), this.debug = e.debug || {}, this.debug.enabled === void 0 && (this.debug.enabled = !1), this.debug.logger || (this.debug.logger = (r, s, i, n) => {
      try {
        n = JSON.stringify(n);
      } catch {
        n = `Object with the following keys failed to stringify: ${Object.keys(n).join(",")}`;
      }
      typeof i == "symbol" && (i = i.toString());
      const o = /* @__PURE__ */ new Date(), a = `${o.getHours()}:${o.getMinutes()}:${o.getSeconds()}.${o.getMilliseconds()}`;
      console.log(`[${a}][emittery:${r}][${s}] Event Name: ${i}
	data: ${n}`);
    });
  }
  logIfDebugEnabled(e, r, s) {
    (d.isDebugEnabled || this.debug.enabled) && this.debug.logger(e, this.debug.name, r, s);
  }
  on(e, r) {
    b(r), e = Array.isArray(e) ? e : [e];
    for (const s of e)
      p(s), m(this, s).add(r), this.logIfDebugEnabled("subscribe", s, void 0), M(s) || this.emit(S, { eventName: s, listener: r });
    return this.off.bind(this, e, r);
  }
  off(e, r) {
    b(r), e = Array.isArray(e) ? e : [e];
    for (const s of e)
      p(s), m(this, s).delete(r), this.logIfDebugEnabled("unsubscribe", s, void 0), M(s) || this.emit(R, { eventName: s, listener: r });
  }
  once(e) {
    return new Promise((r) => {
      const s = this.on(e, (i) => {
        s(), r(i);
      });
    });
  }
  events(e) {
    e = Array.isArray(e) ? e : [e];
    for (const r of e)
      p(r);
    return D(this, e);
  }
  async emit(e, r) {
    p(e), this.logIfDebugEnabled("emit", e, r), B(this, e, r);
    const s = m(this, e), i = f.get(this), n = [...s], o = M(e) ? [] : [...i];
    await U, await Promise.all([
      ...n.map(async (a) => {
        if (s.has(a))
          return a(r);
      }),
      ...o.map(async (a) => {
        if (i.has(a))
          return a(e, r);
      })
    ]);
  }
  async emitSerial(e, r) {
    p(e), this.logIfDebugEnabled("emitSerial", e, r);
    const s = m(this, e), i = f.get(this), n = [...s], o = [...i];
    await U;
    for (const a of n)
      s.has(a) && await a(r);
    for (const a of o)
      i.has(a) && await a(e, r);
  }
  onAny(e) {
    return b(e), this.logIfDebugEnabled("subscribeAny", void 0, void 0), f.get(this).add(e), this.emit(S, { listener: e }), this.offAny.bind(this, e);
  }
  anyEvent() {
    return D(this);
  }
  offAny(e) {
    b(e), this.logIfDebugEnabled("unsubscribeAny", void 0, void 0), this.emit(R, { listener: e }), f.get(this).delete(e);
  }
  clearListeners(e) {
    e = Array.isArray(e) ? e : [e];
    for (const r of e)
      if (this.logIfDebugEnabled("clear", r, void 0), typeof r == "string" || typeof r == "symbol") {
        m(this, r).clear();
        const s = _(this, r);
        for (const i of s)
          i.finish();
        s.clear();
      } else {
        f.get(this).clear();
        for (const s of T.get(this).values())
          s.clear();
        for (const s of g.get(this).values()) {
          for (const i of s)
            i.finish();
          s.clear();
        }
      }
  }
  listenerCount(e) {
    e = Array.isArray(e) ? e : [e];
    let r = 0;
    for (const s of e) {
      if (typeof s == "string") {
        r += f.get(this).size + m(this, s).size + _(this, s).size + _(this).size;
        continue;
      }
      typeof s < "u" && p(s), r += f.get(this).size;
      for (const i of T.get(this).values())
        r += i.size;
      for (const i of g.get(this).values())
        r += i.size;
    }
    return r;
  }
  bindMethods(e, r) {
    if (typeof e != "object" || e === null)
      throw new TypeError("`target` must be an object");
    r = $(r);
    for (const s of r) {
      if (e[s] !== void 0)
        throw new Error(`The property \`${s}\` already exists on \`target\``);
      Object.defineProperty(e, s, {
        enumerable: !1,
        value: this[s].bind(this)
      });
    }
  }
}
const G = Object.getOwnPropertyNames(d.prototype).filter((t) => t !== "constructor");
Object.defineProperty(d, "listenerAdded", {
  value: S,
  writable: !1,
  enumerable: !0,
  configurable: !1
});
Object.defineProperty(d, "listenerRemoved", {
  value: R,
  writable: !1,
  enumerable: !0,
  configurable: !1
});
var Y = d;
const v = /* @__PURE__ */ j(Y);
function q(t) {
  return typeof t == "object" && t !== null && "message" in t && typeof t.message == "string";
}
function J(t) {
  if (q(t))
    return t;
  try {
    return new Error(JSON.stringify(t));
  } catch {
    return new Error(String(t));
  }
}
function I(t) {
  return J(t).message;
}
var K = Object.defineProperty, X = (t, e, r) => e in t ? K(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r, Z = (t, e, r) => (X(t, typeof e != "symbol" ? e + "" : e, r), r), N = /* @__PURE__ */ ((t) => (t.automation = "automation", t.test = "test", t.vbc = "vbc", t.video = "video", t.voice = "voice", t))(N || {});
const ee = "hlg.tokbox.com/prod/logging/vcp_webrtc", re = "https://", te = 1e4;
let w;
const se = new Uint8Array(16);
function ie() {
  if (!w && (w = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !w))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return w(se);
}
const c = [];
for (let t = 0; t < 256; ++t)
  c.push((t + 256).toString(16).slice(1));
function ne(t, e = 0) {
  return (c[t[e + 0]] + c[t[e + 1]] + c[t[e + 2]] + c[t[e + 3]] + "-" + c[t[e + 4]] + c[t[e + 5]] + "-" + c[t[e + 6]] + c[t[e + 7]] + "-" + c[t[e + 8]] + c[t[e + 9]] + "-" + c[t[e + 10]] + c[t[e + 11]] + c[t[e + 12]] + c[t[e + 13]] + c[t[e + 14]] + c[t[e + 15]]).toLowerCase();
}
const oe = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto), H = {
  randomUUID: oe
};
function ae(t, e, r) {
  if (H.randomUUID && !e && !t)
    return H.randomUUID();
  t = t || {};
  const s = t.random || (t.rng || ie)();
  if (s[6] = s[6] & 15 | 64, s[8] = s[8] & 63 | 128, e) {
    r = r || 0;
    for (let i = 0; i < 16; ++i)
      e[r + i] = s[i];
    return e;
  }
  return ne(s);
}
function F(t, e) {
  globalThis.vonage || (globalThis.vonage = {}), globalThis.vonage.workerizer || (globalThis.vonage.workerizer = {});
  let r = globalThis.vonage.workerizer;
  return r[t] || (r[t] = e), r[t];
}
const h = F(
  "globals",
  {}
);
var u = /* @__PURE__ */ ((t) => (t.INIT = "INIT", t.FORWARD = "FORWARD", t.TERMINATE = "TERMINATE", t.GLOBALS_SYNC = "GLOBALS_SYNC", t))(u || {});
function z(t) {
  return [ImageBitmap, ReadableStream, WritableStream].some((r) => t instanceof r);
}
let ce = 0;
function le(t, e, r, s, i) {
  const n = ce++;
  return t.postMessage(
    {
      id: n,
      type: e,
      functionName: r,
      args: s
    },
    s.filter((a) => z(a))
  ), new Promise((a) => {
    i == null || i.set(n, a);
  });
}
function y(t, e) {
  const { id: r, type: s } = t, i = Array.isArray(e) ? e : [e];
  postMessage(
    {
      id: r,
      type: s,
      result: e
    },
    i.filter((n) => z(n))
  );
}
const Q = F("workerized", {});
function V() {
  return typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope;
}
async function fe() {
  if (V())
    y({ type: u.GLOBALS_SYNC }, h);
  else {
    const t = [];
    for (const e in Q) {
      const { worker: r, resolvers: s } = Q[e].workerContext;
      r && t.push(
        le(
          r,
          u.GLOBALS_SYNC,
          "",
          [h],
          s
        )
      );
    }
    await Promise.all(t);
  }
}
function P(t, e) {
  if (Array.isArray(e))
    e.splice(0, e.length);
  else if (typeof e == "object")
    for (const r in e)
      delete e[r];
  for (const r in t)
    Array.isArray(t[r]) ? (e[r] = [], P(t[r], e[r])) : typeof t[r] == "object" ? (e[r] = {}, P(t[r], e[r])) : e[r] = t[r];
}
async function he(t, e) {
  const { functionName: r, args: s } = t;
  if (!e.instance)
    throw "instance not initialized";
  if (!r)
    throw "missing function name to call";
  if (!e.instance[r])
    throw `undefined function [${r}] in class ${e.instance.constructor.workerId}`;
  y(t, await e.instance[r](...s ?? []));
}
const ue = F("registeredWorkers", {});
function de(t, e) {
  if (!t.args)
    throw "Missing className while initializing worker";
  const [r, s] = t.args, i = ue[r];
  if (i)
    e.instance = new i(t.args.slice(1));
  else
    throw `unknown worker class ${r}`;
  P(s, h), y(t, typeof e.instance !== void 0);
}
async function pe(t, e) {
  const { args: r } = t;
  if (!e.instance)
    throw "instance not initialized";
  let s;
  e.instance.terminate && (s = await e.instance.terminate(...r ?? [])), y(t, s);
}
function me(t) {
  if (!t.args)
    throw "Missing globals while syncing";
  P(t.args[0], h), y(t, {});
}
function ge() {
  const t = {};
  onmessage = async (e) => {
    const r = e.data;
    switch (r.type) {
      case u.INIT:
        de(r, t);
        break;
      case u.FORWARD:
        he(r, t);
        break;
      case u.TERMINATE:
        pe(r, t);
        break;
      case u.GLOBALS_SYNC:
        me(r);
        break;
    }
  };
}
V() && ge();
function _e(t, e) {
  return h[t] || (h[t] = e), [
    () => h[t],
    async (r) => {
      h[t] = r, await fe();
    }
  ];
}
function ye(t, e) {
  return _e(t, e);
}
const [be, we] = ye("metadata");
function xe(t) {
  we(t);
}
function x() {
  return be();
}
class L {
  constructor(e, r) {
    Z(this, "uuid"), this.config = e, this.uuid = r ?? ae();
  }
  async send(e) {
    var r, s, i;
    const { appId: n, sourceType: o } = (r = x()) != null ? r : {};
    if (!n || !o)
      return "metadata missing";
    const a = new AbortController(), k = setTimeout(() => a.abort(), te);
    return await ((i = (s = this.config) == null ? void 0 : s.fetch) != null ? i : fetch)(this.getUrl(), {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(this.buildReport(e)),
      signal: a.signal
    }), clearTimeout(k), "success";
  }
  getUrl() {
    var e;
    let r = (e = x().proxyUrl) != null ? e : re;
    return r += (r.at(-1) === "/" ? "" : "/") + ee, r;
  }
  getHeaders() {
    return {
      "Content-Type": "application/json"
    };
  }
  buildReport(e) {
    const r = x();
    return {
      guid: this.uuid,
      ...e,
      applicationId: r.appId,
      timestamp: Date.now(),
      proxyUrl: r.proxyUrl,
      source: r.sourceType
    };
  }
}
const E = "2.0.4";
class Te {
  constructor(e, r) {
    this.config = e, this.frameTransformedCount = 0, this.frameFromSourceCount = 0, this.startAt = 0, this.reporter = new L(e, r);
  }
  async onFrameFromSource() {
    this.frameFromSourceCount++;
  }
  get fps() {
    const { startAt: e, frameFromSourceCount: r } = this, i = (Date.now() - e) / 1e3;
    return r / i;
  }
  async onFrameTransformed(e = {}, r = !1) {
    this.startAt === 0 && (this.startAt = Date.now()), this.frameTransformedCount++;
    const { startAt: s, frameTransformedCount: i, frameFromSourceCount: n } = this, o = Date.now(), a = (o - s) / 1e3, k = i / a, W = n / a;
    return r || this.frameTransformedCount >= this.config.loggingIntervalFrameCount ? (this.frameFromSourceCount = 0, this.frameTransformedCount = 0, this.startAt = o, this.reporter.config = this.config, this.reporter.send({
      ...this.config.report,
      variation: "QoS",
      fps: W,
      transformedFps: k,
      framesTransformed: i,
      ...e
    })) : "success";
  }
}
var Ee = /* @__PURE__ */ ((t) => (t.FPS_DROP = "fps_drop", t))(Ee || {}), Se = /* @__PURE__ */ ((t) => (t.start = "start", t.transform = "transform", t.flush = "flush", t))(Se || {}), O = /* @__PURE__ */ ((t) => (t.pipeline_ended = "pipeline_ended", t.pipeline_ended_with_error = "pipeline_ended_with_error", t.pipeline_started = "pipeline_started", t.pipeline_started_with_error = "pipeline_started_with_error", t.pipeline_restarted = "pipeline_restarted", t.pipeline_restarted_with_error = "pipeline_restarted_with_error", t))(O || {});
const Re = 500, Pe = 0.8;
class ke extends v {
  constructor(e, r) {
    super(), this.reporter_ = new L(), this.reporterQos_ = new Te({
      loggingIntervalFrameCount: Re,
      report: {
        version: E
      }
    }), this.index_ = r, this.transformer_ = e, this.shouldStop_ = !1, this.isFlashed_ = !1, this.mediaTransformerQosReportStartTimestamp_ = 0, this.videoHeight_ = 0, this.videoWidth_ = 0, this.trackExpectedRate_ = -1, this.transformerType_ = "Custom", "getTransformerType" in e && (this.transformerType_ = e.getTransformerType()), this.report({
      variation: "Create"
    });
  }
  setTrackExpectedRate(e) {
    this.trackExpectedRate_ = e;
  }
  async start(e) {
    if (this.controller_ = e, this.transformer_ && typeof this.transformer_.start == "function")
      try {
        await this.transformer_.start(e);
      } catch (r) {
        this.report({
          message: l.errors.transformer_start,
          variation: "Error",
          error: I(r)
        });
        const s = {
          eventMetaData: { transformerIndex: this.index_ },
          error: r,
          function: "start"
          /* start */
        };
        this.emit("error", s);
      }
  }
  async transform(e, r) {
    var s, i;
    if (this.mediaTransformerQosReportStartTimestamp_ === 0 && (this.mediaTransformerQosReportStartTimestamp_ = Date.now()), e instanceof VideoFrame && (this.videoHeight_ = (e == null ? void 0 : e.displayHeight) ?? 0, this.videoWidth_ = (e == null ? void 0 : e.displayWidth) ?? 0), this.reporterQos_.onFrameFromSource(), this.transformer_)
      if (this.shouldStop_)
        console.warn("[Pipeline] flush from transform"), e.close(), this.flush(r), r.terminate();
      else {
        try {
          await ((i = (s = this.transformer_).transform) == null ? void 0 : i.call(s, e, r)), this.reportQos();
        } catch (n) {
          this.report({
            message: l.errors.transformer_transform,
            variation: "Error",
            error: I(n)
          });
          const o = {
            eventMetaData: { transformerIndex: this.index_ },
            error: n,
            function: "transform"
            /* transform */
          };
          this.emit("error", o);
        }
        if (this.trackExpectedRate_ != -1 && this.trackExpectedRate_ * Pe > this.reporterQos_.fps) {
          const n = {
            eventMetaData: {
              transformerIndex: this.index_
            },
            warningType: "fps_drop",
            dropInfo: {
              requested: this.trackExpectedRate_,
              current: this.reporterQos_.fps
            }
          };
          this.emit("warn", n);
        }
      }
  }
  async flush(e) {
    if (this.transformer_ && typeof this.transformer_.flush == "function" && !this.isFlashed_) {
      this.isFlashed_ = !0;
      try {
        await this.transformer_.flush(e);
      } catch (r) {
        this.report({
          message: l.errors.transformer_flush,
          variation: "Error",
          error: I(r)
        });
        const s = {
          eventMetaData: { transformerIndex: this.index_ },
          error: r,
          function: "flush"
          /* flush */
        };
        this.emit("error", s);
      }
    }
    this.reportQos(!0), this.report({
      variation: "Delete"
    });
  }
  stop() {
    console.log("[Pipeline] Stop stream."), this.controller_ && (this.flush(this.controller_), this.controller_.terminate()), this.shouldStop_ = !0;
  }
  report(e) {
    this.reporter_.send({
      version: E,
      action: "MediaTransformer",
      transformerType: this.transformerType_,
      ...e
    });
  }
  reportQos(e = !1) {
    this.reporterQos_.config = {
      ...this.reporterQos_.config
    }, this.reporterQos_.onFrameTransformed(
      {
        version: E,
        action: "MediaTransformer",
        transformerType: this.transformerType_,
        videoWidth: this.videoWidth_,
        videoHeight: this.videoHeight_
      },
      e
    );
  }
}
class Ae extends v {
  constructor(e) {
    super(), this.transformers_ = [], this.trackExpectedRate_ = -1;
    for (let r = 0; r < e.length; r++) {
      let s = new ke(e[r], r);
      s.on("error", (i) => {
        this.emit("error", i);
      }), s.on("warn", (i) => {
        this.emit("warn", i);
      }), this.transformers_.push(s);
    }
  }
  setTrackExpectedRate(e) {
    this.trackExpectedRate_ = e;
    for (let r of this.transformers_)
      r.setTrackExpectedRate(this.trackExpectedRate_);
  }
  async start(e, r) {
    if (!this.transformers_ || this.transformers_.length === 0) {
      console.log("[Pipeline] No transformers.");
      return;
    }
    try {
      let s = e;
      for (let i of this.transformers_)
        e = e.pipeThrough(
          new TransformStream(i)
        );
      e.pipeTo(r).then(async () => {
        console.log("[Pipeline] Setup."), await r.abort(), await s.cancel(), this.emit(
          "pipelineInfo",
          "pipeline_ended"
          /* pipeline_ended */
        );
      }).catch(async (i) => {
        e.cancel().then(() => {
          console.log(
            "[Pipeline] Shutting down streams after abort."
          );
        }).catch((n) => {
          console.error(
            "[Pipeline] Error from stream transform:",
            n
          );
        }), await r.abort(i), await s.cancel(i), this.emit(
          "pipelineInfo",
          "pipeline_ended_with_error"
          /* pipeline_ended_with_error */
        );
      });
    } catch {
      this.emit(
        "pipelineInfo",
        "pipeline_started_with_error"
        /* pipeline_started_with_error */
      ), this.destroy();
      return;
    }
    this.emit(
      "pipelineInfo",
      "pipeline_started"
      /* pipeline_started */
    ), console.log("[Pipeline] Pipeline started.");
  }
  async destroy() {
    console.log("[Pipeline] Destroying Pipeline.");
    for (let e of this.transformers_)
      e.stop();
  }
}
class Ce extends v {
  constructor() {
    super(), this.reporter_ = new L(), this.trackExpectedRate_ = -1, this.report({
      variation: "Create"
    });
  }
  /**
   * Sets the expected rate of the track per second.
   * The media processor will use this number for calculating drops in the rate.
   * This could happen when the transformation will take more time than expected.
   * This will not cause an error, just warning to the client.
   * Mostly:
   * Video: 30 frames per second
   * Audio: 50 audio data per second for OPUS
   * In case of increased frame dropping rate a warning will be emitted according to info [here](/docs/intro#errors-and-warnings-listener).
   * ***This is an optional method.***
   * @param trackExpectedRate - number holds the predicted track rate.
   */
  setTrackExpectedRate(e) {
    this.trackExpectedRate_ = e, this.pipeline_ && this.pipeline_.setTrackExpectedRate(this.trackExpectedRate_);
  }
  /**
   * Starts running the tranformation logic performed by the media processor instance.
   * When running an instance of this class on a Web worker thread the call for this function should be made by the user. See example [here](/docs/intro#webworker-code).
   * When running an instance of this class on the application main thread there is no need to call this method given it will be called by the `MediaProcessorConnector` instance.
   *
   * @param readable Readable stream associated to the media source being processed.
   * @param writable Writable stream associated to the resulting media once processed.
   *
   * @returns
   */
  transform(e, r) {
    return this.readable_ = e, this.writable_ = r, this.transformInternal();
  }
  /**
   * @private
   */
  transformInternal() {
    return new Promise(async (e, r) => {
      if (!this.transformers_ || this.transformers_.length === 0) {
        this.report({
          message: l.errors.transformer_none,
          variation: "Error"
        }), r("[MediaProcessor] Need to set transformers.");
        return;
      }
      if (!this.readable_) {
        this.report({
          variation: "Error",
          message: l.errors.readable_null
        }), r("[MediaProcessor] Readable is null.");
        return;
      }
      if (!this.writable_) {
        this.report({
          variation: "Error",
          message: l.errors.writable_null
        }), r("[MediaProcessor] Writable is null.");
        return;
      }
      let s = !1;
      this.pipeline_ && (s = !0, this.pipeline_.clearListeners(), this.pipeline_.destroy()), this.pipeline_ = new Ae(this.transformers_), this.pipeline_.on("warn", (i) => {
        this.emit("warn", i);
      }), this.pipeline_.on("error", (i) => {
        this.emit("error", i);
      }), this.pipeline_.on("pipelineInfo", (i) => {
        s && (i === "pipeline_started" ? i = O.pipeline_restarted : i === "pipeline_started_with_error" && (i = O.pipeline_restarted_with_error)), this.emit("pipelineInfo", i);
      }), this.trackExpectedRate_ != -1 && this.pipeline_.setTrackExpectedRate(this.trackExpectedRate_), this.pipeline_.start(this.readable_, this.writable_).then(() => {
        e();
      }).catch((i) => {
        r(i);
      });
    });
  }
  /**
   * Sets an array of transfromer instances that will be hold and ran by the media processor instance.
   * See example [here](/docs/intro#main-code)
   *
   * @param transformers An array of transformer instances.
   *
   * @returns
   */
  setTransformers(e) {
    return this.report({
      variation: "Update",
      message: l.updates.transformer_new
    }), this.transformers_ = e, this.readable_ && this.writable_ ? this.transformInternal() : Promise.resolve();
  }
  /**
   * Stops running the tranformation logic performed by the media processor instance.
   * @returns
   */
  destroy() {
    return new Promise(async (e) => {
      this.pipeline_ && this.pipeline_.destroy(), this.report({ variation: "Delete" }), e();
    });
  }
  report(e) {
    this.reporter_.send({
      version: E,
      action: "MediaProcessor",
      ...e
    });
  }
}
class Me {
  constructor() {
    this.processor_ = null, this.generator_ = null;
  }
  init(e) {
    return new Promise((r, s) => {
      try {
        this.processor_ = new MediaStreamTrackProcessor(e);
      } catch (i) {
        console.log(
          `[InsertableStreamHelper] MediaStreamTrackProcessor failed: ${i}`
        ), s(i);
      }
      try {
        e.kind === "audio" ? this.generator_ = new MediaStreamTrackGenerator({
          kind: "audio"
        }) : e.kind === "video" ? this.generator_ = new MediaStreamTrackGenerator({
          kind: "video"
        }) : s("kind not supported");
      } catch (i) {
        console.log(
          `[InsertableStreamHelper] MediaStreamTrackGenerator failed: ${i}`
        ), s(i);
      }
      r();
    });
  }
  getReadable() {
    return this.processor_.readable;
  }
  getWriteable() {
    return this.generator_.writable;
  }
  getProccesorTrack() {
    return this.generator_;
  }
}
class Oe {
  /**
   * - When running insertable streams on the main `MediaProcessorInterface` should be instance of `MediaProcessor` class.
   * - When running insertable streams on WebWorker `MediaProcessorInterface` should be instance of bridge calss created by the user. Example can be found [here](/docs/intro.md#using-the-transformer-on-webworker)
   * @param vonageMediaProcessor - MediaProcessorInterface.
   */
  constructor(e) {
    this.insertableStreamHelper_ = new Me(), this.mediaProcessor_ = e;
  }
  /**
   * @private
   * Sets the media stream track instance to be processed.
   *
   * @param track MediaStreamTrack (audio or video) to be processed.
   *
   * @returns New track to be used.
   */
  setTrack(e) {
    return new Promise((r, s) => {
      this.insertableStreamHelper_.init(e).then(() => {
        this.mediaProcessor_.transform(
          this.insertableStreamHelper_.getReadable(),
          this.insertableStreamHelper_.getWriteable()
        ).then(() => {
          r(
            this.insertableStreamHelper_.getProccesorTrack()
          );
        }).catch((i) => {
          s(i);
        });
      }).catch((i) => {
        s(i);
      });
    });
  }
  /**
   * @private
   * Stops the media processing being performed.
   */
  destroy() {
    return new Promise((e, r) => {
      this.mediaProcessor_ ? this.mediaProcessor_.destroy().then(() => {
        e();
      }).catch((s) => {
        r(s);
      }) : r("no processor");
    });
  }
}
export {
  Se as ErrorFunction,
  Ce as MediaProcessor,
  Oe as MediaProcessorConnector,
  O as PipelineInfoData,
  N as VonageSourceType,
  Ee as WarningType,
  x as getVonageMetadata,
  Ie as isSupported,
  xe as setVonageMetadata
};
