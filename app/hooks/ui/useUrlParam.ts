"use client";

import { usePathname, useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { useCallback } from "react";

export interface UrlParamConfig<T extends string = string> {
  defaultValue?: T;
  validValues?: readonly T[];
}

type WithDefault<T extends string> = UrlParamConfig<T> & { defaultValue: T };
type ValueOf<C> = C extends WithDefault<infer T> ? T : C extends UrlParamConfig<infer T> ? T | undefined : never;

type Setter<T extends string> = (next: T | null) => void;

interface ParamWrite {
  key: string;
  value: string | null;
  defaultValue?: string;
}

function parseValue<T extends string>(raw: string | null, config: UrlParamConfig<T>): T | undefined {
  if (raw === null) return config.defaultValue;
  if (config.validValues && !(config.validValues as readonly string[]).includes(raw)) return config.defaultValue;
  return raw as T;
}

function applyWrites(base: ReadonlyURLSearchParams, writes: ParamWrite[]): string {
  const params = new URLSearchParams(base.toString());
  for (const write of writes) {
    const isDefault = write.defaultValue !== undefined && write.value === write.defaultValue;
    if (write.value === null || isDefault) {
      params.delete(write.key);
    } else {
      params.set(write.key, write.value);
    }
  }
  return params.toString();
}

export function useUrlParam<T extends string>(key: string, options: WithDefault<T>): [T, Setter<T>];
export function useUrlParam<T extends string = string>(
  key: string,
  options?: UrlParamConfig<T>
): [T | undefined, Setter<T>];
export function useUrlParam<T extends string>(
  key: string,
  options: UrlParamConfig<T> = {}
): [T | undefined, Setter<T>] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = parseValue(searchParams.get(key), options);

  const setValue = useCallback<Setter<T>>(
    (next) => {
      const query = applyWrites(searchParams, [{ key, value: next, defaultValue: options.defaultValue }]);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams, key, options.defaultValue]
  );

  return [value, setValue];
}

export function useUrlParams<S extends Record<string, UrlParamConfig<string>>>(
  schema: S
): {
  values: { [K in keyof S]: ValueOf<S[K]> };
  set: <K extends keyof S>(key: K, value: ValueOf<S[K]> | null) => void;
  setMany: (changes: { [K in keyof S]?: ValueOf<S[K]> | null }) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = {} as { [K in keyof S]: ValueOf<S[K]> };
  for (const key in schema) {
    values[key] = parseValue(searchParams.get(key), schema[key]) as ValueOf<S[typeof key]>;
  }

  const replaceWith = useCallback(
    (writes: ParamWrite[]) => {
      const query = applyWrites(searchParams, writes);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const set = useCallback(
    <K extends keyof S>(key: K, value: ValueOf<S[K]> | null) => {
      replaceWith([{ key: String(key), value: value as string | null, defaultValue: schema[key].defaultValue }]);
    },
    [replaceWith, schema]
  );

  const setMany = useCallback(
    (changes: { [K in keyof S]?: ValueOf<S[K]> | null }) => {
      const writes: ParamWrite[] = [];
      for (const key in changes) {
        writes.push({
          key,
          value: changes[key] as string | null,
          defaultValue: schema[key].defaultValue,
        });
      }
      replaceWith(writes);
    },
    [replaceWith, schema]
  );

  return { values, set, setMany };
}
