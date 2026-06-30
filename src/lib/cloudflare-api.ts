// src/lib/cloudflare-api.ts
// Client-side API wrapper to communicate with the Cloudflare Worker D1 backend

const API_BASE_URL = import.meta.env.VITE_CLOUDFLARE_WORKER_API_URL || "http://localhost:8787";
const APP_SECRET = import.meta.env.VITE_CLOUDFLARE_WORKER_SECRET || "";

/**
 * Custom fetch wrapper that implements timeout and abort functionality
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

export const cloudflareApi = {
  /**
   * Helper to construct request headers
   */
  getHeaders(includeSecret = false): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (includeSecret && APP_SECRET) {
      headers["X-App-Secret"] = APP_SECRET;
    }
    return headers;
  },

  /**
   * Fetch core invitation data by slug (Public Read)
   */
  async getInvitationBySlug(slug: string): Promise<any> {
    if (import.meta.env.DEV) {
      console.log(`[Cloudflare API] Fetching public invitation for slug: ${slug}`);
    }

    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/invitations/${slug}`,
        {
          method: "GET",
          headers: this.getHeaders(false),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          if (import.meta.env.DEV) {
            console.log(`[Cloudflare API] Invitation slug "${slug}" not found (404).`);
          }
          return null;
        }
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error(
        `[Cloudflare API] Failed to fetch invitation for slug "${slug}":`,
        error.message || error
      );
      throw new Error("Gagal mengambil data undangan dari server Cloudflare.");
    }
  },

  /**
   * Submit RSVP confirmation (Public Write)
   */
  async submitRsvp(payload: {
    invitation_id: string;
    guest_id: string | null;
    guest_name: string;
    attendance_status: "attending" | "declined";
    total_guest: number;
    message: string | null;
  }): Promise<any> {
    if (import.meta.env.DEV) {
      console.log(`[Cloudflare API] Submitting RSVP for invitation ID: ${payload.invitation_id}`);
    }

    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/rsvp`,
        {
          method: "POST",
          headers: this.getHeaders(false),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("[Cloudflare API] Failed to submit RSVP:", error.message || error);
      throw new Error("Gagal menyimpan konfirmasi kehadiran RSVP Anda.");
    }
  },

  /**
   * Upload file to Cloudflare R2 via Worker API
   */
  async uploadFile(file: File, path: string): Promise<string> {
    if (import.meta.env.DEV) {
      console.log(`[Cloudflare API] Uploading file to path: ${path}`);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", path);

      const headers: Record<string, string> = {};
      if (APP_SECRET) {
        headers["X-App-Secret"] = APP_SECRET;
      }

      // We do not specify Content-Type in headers so fetch will automatically set multipart/form-data boundary
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/media/upload`,
        {
          method: "POST",
          headers: headers,
          body: formData,
          credentials: "include", // Send session cookie
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error: any) {
      console.error("[Cloudflare API] Failed to upload file:", error.message || error);
      throw new Error(error.message || "Gagal mengunggah berkas ke server Cloudflare.");
    }
  },

  /**
   * Delete file from Cloudflare R2 via Worker API
   */
  async deleteFile(path: string): Promise<boolean> {
    if (import.meta.env.DEV) {
      console.log(`[Cloudflare API] Deleting file at path: ${path}`);
    }

    try {
      const headers = this.getHeaders(true); // Requires authentication secret or cookie

      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/media/delete`,
        {
          method: "DELETE",
          headers: headers,
          body: JSON.stringify({ path }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return true;
    } catch (error: any) {
      console.error("[Cloudflare API] Failed to delete file:", error.message || error);
      return false;
    }
  },
};
