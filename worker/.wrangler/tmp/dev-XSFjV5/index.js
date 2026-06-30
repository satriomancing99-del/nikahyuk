var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// .wrangler/tmp/bundle-aPfAmK/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-aPfAmK/checked-fetch.js"() {
    "use strict";
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_checked_fetch();
    init_modules_watch_stub();
  }
});

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// src/db/repositories.ts
var repositories_exports = {};
__export(repositories_exports, {
  GuestRepository: () => GuestRepository,
  InvitationRepository: () => InvitationRepository,
  RsvpRepository: () => RsvpRepository,
  UserRepository: () => UserRepository
});
function validateEmail(email) {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function validateSlug(slug) {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug);
}
var UserRepository, InvitationRepository, GuestRepository, RsvpRepository;
var init_repositories = __esm({
  "src/db/repositories.ts"() {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    __name(validateEmail, "validateEmail");
    __name(validateSlug, "validateSlug");
    UserRepository = class {
      constructor(db) {
        this.db = db;
      }
      db;
      static {
        __name(this, "UserRepository");
      }
      async findUserByEmail(email) {
        if (!validateEmail(email)) throw new Error("Format email tidak valid");
        return this.db.prepare("SELECT * FROM profiles WHERE email = ?").bind(email).first();
      }
      async findUserById(id) {
        if (!id || id.trim() === "") throw new Error("ID user tidak boleh kosong");
        return this.db.prepare("SELECT * FROM profiles WHERE id = ?").bind(id).first();
      }
      async createUser(data) {
        if (!data.id || data.id.trim() === "") throw new Error("ID user tidak boleh kosong");
        if (data.email && !validateEmail(data.email)) throw new Error("Format email tidak valid");
        const name = data.name || null;
        const email = data.email || null;
        const phone = data.phone || null;
        const role = data.role || "customer";
        const result = await this.db.prepare(
          "INSERT INTO profiles (id, name, email, phone, role) VALUES (?, ?, ?, ?, ?) RETURNING *"
        ).bind(data.id, name, email, phone, role).first();
        if (!result) throw new Error("Gagal membuat user");
        return result;
      }
    };
    InvitationRepository = class {
      constructor(db) {
        this.db = db;
      }
      db;
      static {
        __name(this, "InvitationRepository");
      }
      async createInvitation(data) {
        if (!data.user_id) throw new Error("User ID wajib diisi");
        if (!data.slug || !validateSlug(data.slug)) throw new Error("Slug tidak valid (hanya huruf, angka, dan strip)");
        const id = data.id || crypto.randomUUID();
        const template_id = data.template_id || null;
        const groom_name = data.groom_name || null;
        const bride_name = data.bride_name || null;
        const groom_parent = data.groom_parent || null;
        const bride_parent = data.bride_parent || null;
        const quote = data.quote || null;
        const love_story = data.love_story || null;
        const music_url = data.music_url || null;
        const thumbnail_url = data.thumbnail_url || null;
        const status = data.status || "draft";
        const expired_at = data.expired_at || null;
        const greeting_text = data.greeting_text || null;
        const result = await this.db.prepare(`
        INSERT INTO invitations (
          id, user_id, template_id, slug, groom_name, bride_name, 
          groom_parent, bride_parent, quote, love_story, music_url, 
          thumbnail_url, status, expired_at, greeting_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `).bind(
          id,
          data.user_id,
          template_id,
          data.slug,
          groom_name,
          bride_name,
          groom_parent,
          bride_parent,
          quote,
          love_story,
          music_url,
          thumbnail_url,
          status,
          expired_at,
          greeting_text
        ).first();
        if (!result) throw new Error("Gagal membuat undangan");
        return result;
      }
      async findInvitationBySlug(slug) {
        if (!slug || !validateSlug(slug)) throw new Error("Slug pencarian tidak valid");
        return this.db.prepare("SELECT * FROM invitations WHERE slug = ?").bind(slug).first();
      }
      async findInvitationsByUserId(userId) {
        if (!userId) throw new Error("User ID wajib diisi");
        const { results } = await this.db.prepare("SELECT * FROM invitations WHERE user_id = ? ORDER BY created_at DESC").bind(userId).all();
        return results;
      }
    };
    GuestRepository = class {
      constructor(db) {
        this.db = db;
      }
      db;
      static {
        __name(this, "GuestRepository");
      }
      async createGuest(data) {
        if (!data.invitation_id) throw new Error("Invitation ID wajib diisi");
        if (!data.name || data.name.trim() === "") throw new Error("Nama tamu wajib diisi");
        if (!data.guest_code) throw new Error("Kode tamu wajib diisi");
        const id = data.id || crypto.randomUUID();
        const phone = data.phone || null;
        const personal_link = data.personal_link || null;
        const qr_code_value = data.qr_code_value || null;
        const sent_status = data.sent_status || "not_sent";
        const rsvp_status = data.rsvp_status || "not_confirmed";
        const checkin_status = data.checkin_status || "not_checked_in";
        const result = await this.db.prepare(`
        INSERT INTO guests (
          id, invitation_id, name, phone, guest_code, 
          personal_link, qr_code_value, sent_status, rsvp_status, checkin_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `).bind(
          id,
          data.invitation_id,
          data.name,
          phone,
          data.guest_code,
          personal_link,
          qr_code_value,
          sent_status,
          rsvp_status,
          checkin_status
        ).first();
        if (!result) throw new Error("Gagal membuat tamu");
        return result;
      }
      async listGuestsByInvitationId(invitationId) {
        if (!invitationId) throw new Error("Invitation ID wajib diisi");
        const { results } = await this.db.prepare("SELECT * FROM guests WHERE invitation_id = ? ORDER BY name ASC").bind(invitationId).all();
        return results;
      }
    };
    RsvpRepository = class {
      constructor(db) {
        this.db = db;
      }
      db;
      static {
        __name(this, "RsvpRepository");
      }
      async createRsvp(data) {
        if (!data.invitation_id) throw new Error("Invitation ID wajib diisi");
        if (!data.guest_name || data.guest_name.trim() === "") throw new Error("Nama pengirim RSVP wajib diisi");
        const id = data.id || crypto.randomUUID();
        const guest_id = data.guest_id || null;
        const total_guest = data.total_guest || 1;
        const message = data.message || null;
        const result = await this.db.prepare(`
        INSERT INTO rsvps (
          id, invitation_id, guest_id, guest_name, attendance_status, total_guest, message
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `).bind(
          id,
          data.invitation_id,
          guest_id,
          data.guest_name,
          data.attendance_status,
          total_guest,
          message
        ).first();
        if (!result) throw new Error("Gagal menyimpan RSVP");
        return result;
      }
      async listRsvpsByInvitationId(invitationId) {
        if (!invitationId) throw new Error("Invitation ID wajib diisi");
        const { results } = await this.db.prepare("SELECT * FROM rsvps WHERE invitation_id = ? ORDER BY created_at DESC").bind(invitationId).all();
        return results;
      }
    };
  }
});

// .wrangler/tmp/bundle-aPfAmK/middleware-loader.entry.ts
init_checked_fetch();
init_modules_watch_stub();

// .wrangler/tmp/bundle-aPfAmK/middleware-insertion-facade.js
init_checked_fetch();
init_modules_watch_stub();

// src/index.ts
init_checked_fetch();
init_modules_watch_stub();
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    if (request.method === "GET" && url.pathname === "/api/health") {
      try {
        const stmt = env.DB.prepare("SELECT datetime('now') AS now");
        const result = await stmt.first();
        if (!result) {
          throw new Error("No data returned from D1");
        }
        return new Response(
          JSON.stringify({
            status: "ok",
            database: "connected",
            now: result.now
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            status: "error",
            database: "disconnected",
            error: error.message || "Failed to query D1 database"
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }
    }
    if (request.method === "GET" && url.pathname === "/api/test-repositories") {
      try {
        const { UserRepository: UserRepository2, InvitationRepository: InvitationRepository2, GuestRepository: GuestRepository2, RsvpRepository: RsvpRepository2 } = await Promise.resolve().then(() => (init_repositories(), repositories_exports));
        const userRepo = new UserRepository2(env.DB);
        const invRepo = new InvitationRepository2(env.DB);
        const guestRepo = new GuestRepository2(env.DB);
        const rsvpRepo = new RsvpRepository2(env.DB);
        const user = await userRepo.findUserById("user_dummy_1");
        const invitation = await invRepo.findInvitationBySlug("budi-ani");
        const guests = await guestRepo.listGuestsByInvitationId("invitation_dummy_1");
        const testGuestId = crypto.randomUUID();
        const newGuest = await guestRepo.createGuest({
          id: testGuestId,
          invitation_id: "invitation_dummy_1",
          name: "Test Guest Repositories",
          guest_code: `TEST-${Date.now()}`
        });
        const newRsvp = await rsvpRepo.createRsvp({
          invitation_id: "invitation_dummy_1",
          guest_id: testGuestId,
          guest_name: "Test Guest Repositories",
          attendance_status: "attending",
          total_guest: 2,
          message: "Congrats from repository tests!"
        });
        return new Response(
          JSON.stringify({
            status: "success",
            message: "Repository integration tests passed successfully",
            tests: {
              findUserById: user ? "passed" : "failed",
              findInvitationBySlug: invitation ? "passed" : "failed",
              listGuestsByInvitationId: guests.length > 0 ? "passed" : "failed",
              createGuest: newGuest ? "passed" : "failed",
              createRsvp: newRsvp ? "passed" : "failed"
            },
            data: {
              user,
              invitation,
              guestsCount: guests.length,
              newGuest,
              newRsvp
            }
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            status: "error",
            message: "Repository integration tests failed",
            error: error.message || error
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }
    }
    return new Response(
      JSON.stringify({
        error: "Not Found"
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
};

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-aPfAmK/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-aPfAmK/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
