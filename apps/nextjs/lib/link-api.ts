import { generateRandomCode } from "./utils";

export class LinkApi {
  token: string;
  url: string;

  constructor(token: string) {
    this.token = token;

    this.url = process.env.API_URL || "";

    if (this.url.endsWith("/")) {
      this.url = this.url.substring(0, this.url.length - 1);
    }

    this.url += "/_api";
  }

  isAuthenticated() {
    return !!this.token;
  }

  async fetch(method: string, path: string, body?: object) {
    try {
      const fullUrl = this.url + path;
      console.log(`Fetching ${method} ${fullUrl}`, body);

      const response = await fetch(fullUrl, {
        method: method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      console.log(`Response status: ${response.status}`);
      const data = await response.json();
      console.log("Response data:", data);

      return data;
    } catch (error: any) {
      console.error("Fetch error:", error);
      return { error: true, message: error.message || "Network error" };
    }
  }

  getLinks(): ApiRes<{ links: Link[] }> {
    return this.fetch("GET", "/links");
  }

  deleteLink(link: string): ApiRes<{ error: false }> {
    return this.fetch("DELETE", `/links/${link}`);
  }

  linkExists(link: string): ApiRes<{ exists: boolean }> {
    return this.fetch("GET", `/links/${link}/exists`);
  }

  createLink(body?: Link): ApiRes<{ error: false }> {
    if (!body?.shortCode) {
      throw new Error("No shortCode provided");
    }

    if (!body?.url) {
      throw new Error("No destination provided");
    }

    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }

    return this.fetch("POST", `/links`, body);
  }
}

export type ApiRes<T> = Promise<T & { error: false } | ApiError>;

export type Link = {
  shortCode: string;
  url: string;
  visits?: number;
};

export type ApiError = {
  error: true;
  message: string;
};
