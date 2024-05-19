export function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

export function isArrayOfObjects(result: any) {
  return (
    Array.isArray(result) && result.length && typeof result[0] === "object"
  );
}

export function isEmptyArray(result: any) {
  return Array.isArray(result) && !result.length;
}

export async function filterAsync(
  array: Array<any>,
  callback: (v: any, i: number) => {},
) {
  const results = await Promise.all(array.map((v, i) => callback(v, i)));
  return array.filter((_, i) => results[i]);
}
