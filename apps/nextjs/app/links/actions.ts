"use server";

import { cookies } from "next/headers";
import { LinkApi, type Link } from "@/lib/link-api";
import { revalidatePath } from "next/cache";
import { generateRandomCode } from "@/lib/utils";

async function getToken() {
  const cookieStore = await cookies();
  let token = cookieStore.get("token")?.value;

  if (!token) {
    token = generateRandomCode() + generateRandomCode() + "abcd"; // 20 chars
    cookieStore.set("token", token, {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return token;
}

export async function getLinks() {
  try {
    const token = await getToken();
    const api = new LinkApi(token);
    const result = await api.getLinks();

    if ("error" in result && result.error) {
      return { error: true as const, message: result.message, links: [] };
    }

    return { error: false as const, links: result.links || [] };
  } catch (error) {
    console.error("Error fetching links:", error);
    return { error: true as const, message: "Failed to fetch links", links: [] };
  }
}

export async function createLink(shortCode: string, url: string) {
  try {
    const token = await getToken();
    const api = new LinkApi(token);

    const link: Link = {
      shortCode,
      url,
    };

    console.log("Creating link:", link);
    console.log("API URL:", process.env.API_URL);

    const result = await api.createLink(link);

    console.log("Create link result:", result);

    if ("error" in result && result.error) {
      return { error: true, message: result.message };
    }

    revalidatePath("/links");
    return { error: false };
  } catch (error) {
    console.error("Error creating link:", error);
    return { error: true, message: error instanceof Error ? error.message : "Failed to create link" };
  }
}

export async function deleteLink(shortCode: string) {
  const token = await getToken();
  const api = new LinkApi(token);
  const result = await api.deleteLink(shortCode);

  if ("error" in result && result.error) {
    return { error: true, message: result.message };
  }

  revalidatePath("/links");
  return { error: false };
}

export async function checkLinkExists(shortCode: string) {
  const token = await getToken();
  const api = new LinkApi(token);
  const result = await api.linkExists(shortCode);

  if ("error" in result && result.error) {
    return { error: true, message: result.message, exists: false };
  }

  return { error: false, exists: result.exists };
}
