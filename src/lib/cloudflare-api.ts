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

  /**
   * Fetch invitations for a specific user (Protected Read)
   */
  async getInvitationsByUserId(userId: string): Promise<any[]> {
    if (import.meta.env.DEV) {
      console.log(`[Cloudflare API] Fetching invitations for user ID: ${userId}`);
    }

    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/users/${userId}/invitations`,
        {
          method: "GET",
          headers: this.getHeaders(true),
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("[Cloudflare API] Failed to fetch user invitations:", error.message || error);
      return [];
    }
  },

  /**
   * Fetch guest list for a specific invitation (Protected Read)
   */
  async getGuestsByInvitationId(invitationId: string): Promise<any[]> {
    if (import.meta.env.DEV) {
      console.log(`[Cloudflare API] Fetching guests for invitation ID: ${invitationId}`);
    }

    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/invitations/${invitationId}/guests`,
        {
          method: "GET",
          headers: this.getHeaders(true),
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("[Cloudflare API] Failed to fetch guests:", error.message || error);
      return [];
    }
  },

  /**
   * Fetch recent RSVPs for a specific invitation (Protected Read)
   */
  async getRecentRsvps(invitationId: string, limit = 6): Promise<any[]> {
    if (import.meta.env.DEV) {
      console.log(`[Cloudflare API] Fetching recent RSVPs for invitation ID: ${invitationId} (limit: ${limit})`);
    }

    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/invitations/${invitationId}/rsvps?limit=${limit}`,
        {
          method: "GET",
          headers: this.getHeaders(true),
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("[Cloudflare API] Failed to fetch recent RSVPs:", error.message || error);
      return [];
    }
  },

  /**
   * Generic Fetch rows from any table (Protected Read)
   */
  async getTableRows<T>(tableName: string, filter?: Record<string, string>): Promise<T[]> {
    try {
      const queryParams = filter ? '?' + new URLSearchParams(filter).toString() : '';
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/tables/${tableName}${queryParams}`,
        {
          method: "GET",
          headers: this.getHeaders(true),
          credentials: "include"
        }
      );
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`[Cloudflare API] Failed to fetch table ${tableName}:`, error);
      return [];
    }
  },

  /**
   * Generic Fetch row by ID from any table (Protected Read)
   */
  async getTableRowById<T>(tableName: string, id: string): Promise<T> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/tables/${tableName}?id=${id}`,
        {
          method: "GET",
          headers: this.getHeaders(true),
          credentials: "include"
        }
      );
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const list = await response.json();
      if (list.length === 0) throw new Error("Row not found");
      return list[0] as T;
    } catch (error) {
      console.error(`[Cloudflare API] Failed to fetch table ${tableName} by ID:`, error);
      throw error;
    }
  },

  /**
   * Generic Insert row into any table (Protected Write)
   */
  async createTableRow<T>(tableName: string, payload: any): Promise<T> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/tables/${tableName}`,
        {
          method: "POST",
          headers: this.getHeaders(true),
          body: JSON.stringify(payload),
          credentials: "include"
        }
      );
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`[Cloudflare API] Failed to create in table ${tableName}:`, error);
      throw error;
    }
  },

  /**
   * Generic Update row in any table (Protected Write)
   */
  async updateTableRow<T>(tableName: string, id: string, payload: any): Promise<T> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/tables/${tableName}/${id}`,
        {
          method: "PUT",
          headers: this.getHeaders(true),
          body: JSON.stringify(payload),
          credentials: "include"
        }
      );
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`[Cloudflare API] Failed to update table ${tableName}:`, error);
      throw error;
    }
  },

  /**
   * Generic Delete row from any table (Protected Write)
   */
  async deleteTableRow(tableName: string, id: string): Promise<boolean> {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/tables/${tableName}/${id}`,
        {
          method: "DELETE",
          headers: this.getHeaders(true),
          credentials: "include"
        }
      );
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return true;
    } catch (error) {
      console.error(`[Cloudflare API] Failed to delete in table ${tableName}:`, error);
      return false;
    }
  },
};
