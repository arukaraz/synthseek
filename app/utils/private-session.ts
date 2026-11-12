export interface PrivateSessionFields {
  privateSessionUntil: Date | null;
  privateSessionOpen: boolean;
}

export function privateSessionActive(session: PrivateSessionFields | null | undefined, now: number): boolean {
  if (session === null || session === undefined) return false;
  if (session.privateSessionOpen) return true;
  return session.privateSessionUntil !== null && session.privateSessionUntil.getTime() > now;
}
