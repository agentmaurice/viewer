export function isVersionConflict(clientVersion: number, serverVersion: number): boolean {
  return clientVersion !== serverVersion
}

export function canRetryAfterConflict(clientVersion: number, serverVersion: number): boolean {
  return serverVersion > clientVersion
}
