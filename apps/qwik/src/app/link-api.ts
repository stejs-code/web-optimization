import { RequestEventBase } from "@builder.io/qwik-city";
import { randomShortCode } from "~/app/utils";

export class LinkApi {
    token: string;
    url: string;
    ctx: RequestEventBase

    constructor(ctx: RequestEventBase) {
        this.ctx = ctx;
        this.token = this.getToken()


        this.url = ctx.env.get("API_URL") || "";

        if (this.url.endsWith("/")) {
            this.url = this.url.substring(0, this.url.length - 1);
        }

        this.url += "/_api"
    }

    isAuthenticated() {
        return !!this.token;
    }

    async fetch(method: string, path: string, body?: object) {
        try {
            const response = await fetch(this.url + path, {
                method: method,
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "Content-Type": "application/json"
                },
                body: body ? JSON.stringify(body) : undefined
            });

            return await response.json();
        } catch (error: any) {
            console.log(error);
            return error;
        }
    }

    getLinks(): ApiRes<{ links: Link[] }> {
        return this.fetch("GET", "/links")
    }

    deleteLink(link: string): ApiRes<{ error: false }> {
        return this.fetch("DELETE", `/links/${link}`)
    }

    linkExists(link: string): ApiRes<{ exists: boolean }> {
        return this.fetch("GET", `/links/${link}/exists`)
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

        return this.fetch("POST", `/links`, body)
    }

    private getToken() {
        let token = this.ctx.cookie.get('token')?.value;
        if (!token) {
            token = randomShortCode(20)
            this.ctx.cookie.set('token', token, {
                expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            })
        }

        return token;
    }
}

export type ApiRes<T> = Promise<
    T & { error: false } |
    ApiError
>

export type Link = {
    shortCode: string
    url: string,
    visits?: number,
}

export type ApiError = {
    error: true,
    message: string,
}
