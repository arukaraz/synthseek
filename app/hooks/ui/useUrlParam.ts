"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export interface UrlParamConfig<T extends string = string> {
  defaultValue?: T;
  validValues?: readonly T[];
}

type WithDefault<T extends string> = UrlParamConfig<T> & { defaultValue: T };
type ValueOf<C> = C extends WithDefault<infer T> ? T : C extends UrlParamConfig<infer T> ? T | undefined : never;

type Setter<T extends string> = (next: T | null) => void;

function parseValue<T extends string>(raw: string | null, config: UrlParamConfig<T>): T | undefined {
  if (raw === null) return config.defaultValue;
  if (config.validValues && !(config.validValues as readonly string[]).includes(raw)) return config.defaultValue;
  return raw as T;
}

function buildQuery(key: string, next: string | null, defaultValue?: string): string {
  const params = new URLSearchParams(window.location.search);
  if (next === null || (defaultValue !== undefined && next === defaultValue)) {
    params.delete(key);
  } else {
    params.set(key, next);
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
      const query = buildQuery(key, next, options.defaultValue);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, key, options.defaultValue]
  );

  return [value, setValue];
}

export function useUrlParams<S extends Record<string, UrlParamConfig<string>>>(
  schema: S
): {
  values: { [K in keyof S]: ValueOf<S[K]> };
  set: <K extends keyof S>(key: K, value: ValueOf<S[K]> | null) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = {} as { [K in keyof S]: ValueOf<S[K]> };
  for (const key in schema) {
    values[key] = parseValue(searchParams.get(key), schema[key]) as ValueOf<S[typeof key]>;
  }

  const set = <K extends keyof S>(key: K, value: ValueOf<S[K]> | null) => {
    const config = schema[key];
    const query = buildQuery(key as string, value as string | null, config.defaultValue);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return { values, set };
}
