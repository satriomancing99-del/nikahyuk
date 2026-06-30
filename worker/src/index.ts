import {
  UserRepository,
  InvitationRepository,
  GuestRepository,
  RsvpRepository,
  AuthUserRepository,
  SessionRepository,
} from "./db/repositories";
import bcrypt from "bcryptjs";

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  BUCKET: R2Bucket;
  APP_SECRET: string;
}

// Allowed origins for CORS validation
const ALLOWED_ORIGINS = [
  "https://nikah-yuk.com",
  "https://www.nikah-yuk.com",
  "http://localhost:3000",
  "http://localhost:3005",
  "http://localhost:5173",
];

// Helper to determine CORS headers dynamically based on request Origin
function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") || "";
  let isAllowed = ALLOWED_ORIGINS.includes(origin);

  // Allow Vercel preview deployments (*.vercel.app)
  if (!isAllowed && origin.endsWith(".vercel.app")) {
    isAllowed = true;
  }

  if (isAllowed) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-App-Secret, Cookie",
      "Access-Control-Allow-Credentials": "true",
    };
  }

  // Fallback default
  return {
    "Access-Control-Allow-Origin": "https://nikah-yuk.com",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-App-Secret, Cookie",
  };
}

// Helper to validate APP_SECRET header for write/admin operations
function checkAppSecret(request: Request, env: Env): boolean {
  const clientSecret = request.headers.get("X-App-Secret");
  const serverSecret = env.APP_SECRET;

  if (!serverSecret || serverSecret.trim() === "") {
    return false;
  }

  return clientSecret === serverSecret;
}

// Helper to generate JSON response
function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

// Helper to parse cookies
function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === name) {
      return value;
    }
  }
  return null;
}

// Helper to construct Set-Cookie header
function getCookieHeader(name: string, value: string, expires?: Date): string {
  let cookie = `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/`;
  if (expires) {
    cookie += `; Expires=${expires.toUTCString()}`;
  } else if (value === "") {
    cookie += "; Max-Age=0";
  }
  return cookie;
}

// Helper to hash session tokens using SHA-256
async function hashToken(token: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getAuthUserId(request: Request, sessionRepo: SessionRepository): Promise<string | null> {
  const rawToken = getCookie(request, "session_token");
  if (!rawToken) return null;
  const hashedToken = await hashToken(rawToken);
  const session = await sessionRepo.findSessionById(hashedToken);
  if (!session) return null;
  
  const now = new Date();
  const expiredAt = new Date(session.expired_at);
  if (now > expiredAt) return null;
  
  return session.user_id;
}

// Simple KV Rate Limiter for Login Endpoint
async function checkLoginRateLimit(env: Env, ip: string): Promise<boolean> {
  const key = `ratelimit:login:${ip}`;
  const current = await env.KV.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= 5) {
    return false; // Limit exceeded (max 5 requests per minute)
  }

  // Increment and set expiry (60 seconds)
  await env.KV.put(key, (count + 1).toString(), { expirationTtl: 60 });
  return true;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const corsHeaders = getCorsHeaders(request);

    // 1. Handle OPTIONS preflight requests
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Initialize Repositories
    const userRepo = new UserRepository(env.DB);
    const invRepo = new InvitationRepository(env.DB);
    const guestRepo = new GuestRepository(env.DB);
    const rsvpRepo = new RsvpRepository(env.DB);
    const authRepo = new AuthUserRepository(env.DB);
    const sessionRepo = new SessionRepository(env.DB);

    // 2. Routing Definition
    try {
      // Route: GET /api/health (Public)
      if (method === "GET" && path === "/api/health") {
        const stmt = env.DB.prepare("SELECT datetime('now') AS now");
        const result = await stmt.first<{ now: string }>();
        return jsonResponse(
          { status: "ok", database: "connected", now: result?.now || "unknown" },
          200,
          corsHeaders
        );
      }

      // --- AUTHENTICATION ENDPOINTS ---

      // Route: POST /api/auth/register (Public)
      if (method === "POST" && path === "/api/auth/register") {
        const body = await request.json<any>();
        const { email, password, name, phone } = body;

        // Validation
        if (!email || typeof email !== "string" || !email.includes("@")) {
          return jsonResponse({ error: "Email tidak valid" }, 400, corsHeaders);
        }
        if (!password || typeof password !== "string" || password.length < 6) {
          return jsonResponse({ error: "Password minimal 6 karakter" }, 400, corsHeaders);
        }

        // Check if user already exists
        const existingUser = await authRepo.findByEmail(email);
        if (existingUser) {
          return jsonResponse({ error: "Email sudah terdaftar" }, 400, corsHeaders);
        }

        // Hash password securely via bcryptjs (10 salt rounds)
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);
        const userId = crypto.randomUUID();

        // Create Auth user credentials and Profile record (sequential)
        await authRepo.createAuthUser(userId, email, passwordHash);
        const profile = await userRepo.createUser({
          id: userId,
          email,
          name: name || email.split("@")[0],
          phone: phone || undefined,
          role: "customer"
        });

        // Do not return password hash
        return jsonResponse(profile, 201, corsHeaders);
      }

      // Route: POST /api/auth/login (Public / Rate-limited)
      if (method === "POST" && path === "/api/auth/login") {
        const ip = request.headers.get("CF-Connecting-IP") || "local";
        
        // Check rate limits
        const isRateLimitOk = await checkLoginRateLimit(env, ip);
        if (!isRateLimitOk) {
          return jsonResponse({ error: "Terlalu banyak percobaan login. Silakan tunggu 1 menit." }, 429, corsHeaders);
        }

        const body = await request.json<any>();
        const { email, password } = body;

        if (!email || !password) {
          return jsonResponse({ error: "Email dan password wajib diisi" }, 400, corsHeaders);
        }

        // Fetch auth user record
        const authUser = await authRepo.findByEmail(email);

        // Timing attack countermeasure: always run bcrypt check even if user doesn't exist
        const dummyHash = "$2a$10$dummyhashdummyhashdummyhashdummyhashdummy";
        const hashToCompare = authUser ? authUser.password_hash : dummyHash;
        const isPasswordCorrect = bcrypt.compareSync(password, hashToCompare);

        // Generic error message: do not disclose whether email exists or not
        if (!authUser || !isPasswordCorrect) {
          return jsonResponse({ error: "Email atau password salah" }, 401, corsHeaders);
        }

        // Fetch corresponding profile
        const profile = await userRepo.findUserById(authUser.id);
        if (!profile) {
          return jsonResponse({ error: "Profil tidak ditemukan" }, 404, corsHeaders);
        }

        // Generate session token (64-character long secure token)
        const rawToken = crypto.randomUUID() + "-" + crypto.randomUUID();
        const hashedToken = await hashToken(rawToken);

        // Set session expiry (30 days)
        const durationDays = 30;
        const expiredAt = new Date();
        expiredAt.setDate(expiredAt.getDate() + durationDays);

        const userAgent = request.headers.get("User-Agent") || null;

        // Store session record in D1 DDB
        await sessionRepo.createSession(hashedToken, authUser.id, expiredAt.toISOString(), userAgent, ip);

        // Build Secure HttpOnly Cookie
        const cookie = getCookieHeader("session_token", rawToken, expiredAt);
        const headers = new Headers(corsHeaders);
        headers.append("Set-Cookie", cookie);

        return new Response(
          JSON.stringify({ authenticated: true, user: profile }),
          { status: 200, headers }
        );
      }

      // Route: POST /api/auth/logout (Public)
      if (method === "POST" && path === "/api/auth/logout") {
        const rawToken = getCookie(request, "session_token");

        if (rawToken) {
          const hashedToken = await hashToken(rawToken);
          await sessionRepo.deleteSession(hashedToken);
        }

        // Clear session cookie
        const cookie = getCookieHeader("session_token", "");
        const headers = new Headers(corsHeaders);
        headers.append("Set-Cookie", cookie);

        return new Response(
          JSON.stringify({ success: true, message: "Logged out successfully" }),
          { status: 200, headers }
        );
      }

      // Route: GET /api/auth/me (Public check)
      if (method === "GET" && path === "/api/auth/me") {
        const rawToken = getCookie(request, "session_token");

        if (!rawToken) {
          return jsonResponse({ authenticated: false }, 200, corsHeaders);
        }

        const hashedToken = await hashToken(rawToken);
        const session = await sessionRepo.findSessionById(hashedToken);

        if (!session) {
          // Clear invalid cookie
          const cookie = getCookieHeader("session_token", "");
          const headers = new Headers(corsHeaders);
          headers.append("Set-Cookie", cookie);
          return new Response(JSON.stringify({ authenticated: false }), { status: 200, headers });
        }

        // Check expiration
        const now = new Date();
        const expiredAt = new Date(session.expired_at);
        if (now > expiredAt) {
          await sessionRepo.deleteSession(hashedToken);
          const cookie = getCookieHeader("session_token", "");
          const headers = new Headers(corsHeaders);
          headers.append("Set-Cookie", cookie);
          return new Response(JSON.stringify({ authenticated: false }), { status: 200, headers });
        }

        // Load profile data
        const profile = await userRepo.findUserById(session.user_id);
        if (!profile) {
          return jsonResponse({ authenticated: false }, 200, corsHeaders);
        }

        return jsonResponse({ authenticated: true, user: profile }, 200, corsHeaders);
      }

      // --- DATA ENDPOINTS ---

      // Route: GET /api/invitations/:slug (Public Read)
      const invSlugMatch = path.match(/^\/api\/invitations\/([a-z0-9-]+)$/);
      if (method === "GET" && invSlugMatch) {
        const slug = invSlugMatch[1];
        const invitation = await invRepo.findInvitationBySlug(slug);
        
        if (!invitation) {
          return jsonResponse({ error: "Undangan tidak ditemukan" }, 404, corsHeaders);
        }
        
        return jsonResponse(invitation, 200, corsHeaders);
      }

      // Route: GET /api/users/:userId/invitations (Protected Read)
      const userInvMatch = path.match(/^\/api\/users\/([^/]+)\/invitations$/);
      if (method === "GET" && userInvMatch) {
        if (!checkAppSecret(request, env)) {
          return jsonResponse({ error: "Unauthorized: Invalid or missing X-App-Secret header" }, 401, corsHeaders);
        }

        const userId = userInvMatch[1];
        const invitations = await invRepo.findInvitationsByUserId(userId);
        return jsonResponse(invitations, 200, corsHeaders);
      }

      // Route: POST /api/invitations (Protected Write)
      if (method === "POST" && path === "/api/invitations") {
        if (!checkAppSecret(request, env)) {
          return jsonResponse({ error: "Unauthorized: Invalid or missing X-App-Secret header" }, 401, corsHeaders);
        }

        const body = await request.json<any>();
        if (!body.user_id || typeof body.user_id !== "string") {
          return jsonResponse({ error: "user_id wajib diisi dengan tipe string" }, 400, corsHeaders);
        }
        if (!body.slug || typeof body.slug !== "string") {
          return jsonResponse({ error: "slug wajib diisi dengan tipe string" }, 400, corsHeaders);
        }

        const invitation = await invRepo.createInvitation(body);
        return jsonResponse(invitation, 201, corsHeaders);
      }

      // Route: GET /api/invitations/:invitationId/guests (Protected Read)
      const guestListMatch = path.match(/^\/api\/invitations\/([^/]+)\/guests$/);
      if (method === "GET" && guestListMatch) {
        if (!checkAppSecret(request, env)) {
          return jsonResponse({ error: "Unauthorized: Invalid or missing X-App-Secret header" }, 401, corsHeaders);
        }

        const invitationId = guestListMatch[1];
        const guests = await guestRepo.listGuestsByInvitationId(invitationId);
        return jsonResponse(guests, 200, corsHeaders);
      }

      // Route: POST /api/invitations/:invitationId/guests (Protected Write)
      if (method === "POST" && guestListMatch) {
        if (!checkAppSecret(request, env)) {
          return jsonResponse({ error: "Unauthorized: Invalid or missing X-App-Secret header" }, 401, corsHeaders);
        }

        const invitationId = guestListMatch[1];
        const body = await request.json<any>();

        if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
          return jsonResponse({ error: "name wajib diisi" }, 400, corsHeaders);
        }
        if (!body.guest_code || typeof body.guest_code !== "string") {
          return jsonResponse({ error: "guest_code wajib diisi" }, 400, corsHeaders);
        }

        const guestPayload = { ...body, invitation_id: invitationId };
        const guest = await guestRepo.createGuest(guestPayload);
        return jsonResponse(guest, 201, corsHeaders);
      }

      // Route: POST /api/rsvp (Public Write)
      if (method === "POST" && path === "/api/rsvp") {
        const body = await request.json<any>();

        if (!body.invitation_id || typeof body.invitation_id !== "string") {
          return jsonResponse({ error: "invitation_id wajib diisi" }, 400, corsHeaders);
        }
        if (!body.guest_name || typeof body.guest_name !== "string" || body.guest_name.trim() === "") {
          return jsonResponse({ error: "guest_name wajib diisi" }, 400, corsHeaders);
        }
        if (!body.attendance_status || !["attending", "declined"].includes(body.attendance_status)) {
          return jsonResponse({ error: "attendance_status wajib diisi ('attending' atau 'declined')" }, 400, corsHeaders);
        }

        const rsvp = await rsvpRepo.createRsvp(body);
        return jsonResponse(rsvp, 201, corsHeaders);
      }

      // Route: GET /api/test-repositories (Internal test helper, protected)
      if (method === "GET" && path === "/api/test-repositories") {
        if (!checkAppSecret(request, env)) {
          return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
        }

        const user = await userRepo.findUserById("user_dummy_1");
        const invitation = await invRepo.findInvitationBySlug("budi-ani");
        const guests = await guestRepo.listGuestsByInvitationId("invitation_dummy_1");

        return jsonResponse({
          status: "success",
          tests: {
            findUserById: user ? "passed" : "failed",
            findInvitationBySlug: invitation ? "passed" : "failed",
            listGuests: guests.length > 0 ? "passed" : "failed",
          },
          data: { user, invitation, guestsCount: guests.length }
        }, 200, corsHeaders);
      }

      // Route: GET /api/media/file/* (Public R2 File Server/Proxy)
      const mediaFileMatch = path.match(/^\/api\/media\/file\/(.+)$/);
      if (method === "GET" && mediaFileMatch) {
        const key = decodeURIComponent(mediaFileMatch[1]);
        const object = await env.BUCKET.get(key);
        if (!object) {
          return jsonResponse({ error: "File tidak ditemukan" }, 404, corsHeaders);
        }

        const headers = new Headers(corsHeaders);
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("Cache-Control", "public, max-age=31536000"); // 1 year caching
        
        return new Response(object.body, { headers });
      }

      // Route: POST /api/media/upload (Protected Upload)
      if (method === "POST" && path === "/api/media/upload") {
        // Authenticate request (via X-App-Secret or Cookie session)
        const hasSecret = checkAppSecret(request, env);
        const userId = await getAuthUserId(request, sessionRepo);
        
        if (!hasSecret && !userId) {
          return jsonResponse({ error: "Unauthorized: Silakan login terlebih dahulu" }, 401, corsHeaders);
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const targetPath = formData.get("path") as string; // e.g. "userId/invitations/invId/gallery/file.png"

        if (!file) {
          return jsonResponse({ error: "File 'file' wajib dikirimkan" }, 400, corsHeaders);
        }
        if (!targetPath) {
          return jsonResponse({ error: "Parameter 'path' wajib diisi" }, 400, corsHeaders);
        }

        // Simple validation
        const fileExt = file.name.split('.').pop()?.toLowerCase() || "";
        const allowedExts = ["jpg", "jpeg", "png", "webp", "mp3"];
        if (!allowedExts.includes(fileExt)) {
          return jsonResponse({ error: "Tipe file tidak didukung" }, 400, corsHeaders);
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          return jsonResponse({ error: "Ukuran file terlalu besar (maksimal 10MB)" }, 400, corsHeaders);
        }

        // Upload to R2 Bucket
        const contentType = file.type || "application/octet-stream";
        const fileBuffer = await file.arrayBuffer();
        
        await env.BUCKET.put(targetPath, fileBuffer, {
          httpMetadata: { contentType: contentType }
        });

        // Determine public URL
        // If there's a custom R2 public domain configured in wrangler.toml or vars, use it
        // Otherwise fallback to our Worker R2 proxy path
        const originUrl = url.origin;
        const fileUrl = `${originUrl}/api/media/file/${encodeURIComponent(targetPath)}`;

        return jsonResponse({
          success: true,
          url: fileUrl,
          path: targetPath
        }, 201, corsHeaders);
      }

      // Route: DELETE /api/media/delete (Protected Delete)
      if (method === "DELETE" && path === "/api/media/delete") {
        const hasSecret = checkAppSecret(request, env);
        const userId = await getAuthUserId(request, sessionRepo);
        
        if (!hasSecret && !userId) {
          return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders);
        }

        const body = await request.json<any>();
        const targetPath = body.path;

        if (!targetPath) {
          return jsonResponse({ error: "Parameter 'path' wajib diisi" }, 400, corsHeaders);
        }

        await env.BUCKET.delete(targetPath);
        return jsonResponse({ success: true, message: "File deleted successfully" }, 200, corsHeaders);
      }

      // Route not matched
      return jsonResponse({ error: "Endpoint tidak ditemukan" }, 404, corsHeaders);

    } catch (error: any) {
      console.error("API error:", error.message || error);
      return jsonResponse({
        error: "Internal Server Error",
        message: error.message || "Terjadi kesalahan sistem"
      }, 500, corsHeaders);
    }
  },
};
