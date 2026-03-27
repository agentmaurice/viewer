import { ViewerError } from "./bootstrap-types";
import type { ViewerBootstrapResponse } from "./bootstrap-types";

export interface BootstrapFetchOptions {
  deploymentId?: string;
  slug?: string;
  apiBaseUrl: string;
  fetch?: typeof globalThis.fetch;
  headers?: HeadersInit;
}

export async function fetchBootstrapConfig(
  options: BootstrapFetchOptions & { deploymentId: string },
): Promise<ViewerBootstrapResponse> {
  return doFetch(
    `${options.apiBaseUrl}/viewer/${options.deploymentId}`,
    options.fetch,
    options.headers,
  );
}

export async function resolveSlug(
  options: BootstrapFetchOptions & { slug: string },
): Promise<ViewerBootstrapResponse> {
  return doFetch(
    `${options.apiBaseUrl}/viewer/s/${options.slug}`,
    options.fetch,
    options.headers,
  );
}

async function doFetch(
  url: string,
  fetchFn: typeof globalThis.fetch = globalThis.fetch.bind(globalThis),
  headers?: HeadersInit,
): Promise<ViewerBootstrapResponse> {
  let response: Response;
  try {
    response = await fetchFn(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(headers ?? {}),
      },
    });
  } catch (error) {
    throw new ViewerError(
      "network_error",
      error instanceof Error ? error.message : "Network error",
      { originalError: String(error) },
    );
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { code?: string; message?: string };
    };
    throw new ViewerError(
      body.error?.code ?? "http_error",
      body.error?.message ?? `HTTP ${response.status}`,
      { status: response.status },
    );
  }

  return response.json() as Promise<ViewerBootstrapResponse>;
}
