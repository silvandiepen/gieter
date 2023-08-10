export async function asyncForEach<T>(
    array: Array<T>,
    callback: (item: T, index: number, og: T[]) => void
  ): Promise<void> {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
  
  export const hello = async (args: unknown = {}): Promise<unknown> => {
    return args;
  };
  
  export const promisify = async (func: any) => {
    await Promise.resolve(func).then(function () {
      return;
    });
  };
  
  export const asyncFilter = async (arr: any[], predicate: any) => {
    const results = await Promise.all(arr.map(predicate));
    return arr.filter((_v, index) => results[index]);
  };
  export const asyncSome = async (arr: any[], predicate: any) =>
    (await asyncFilter(arr, predicate)).length > 0;
  export const asyncEvery = async (arr: any[], predicate: any) =>
    (await asyncFilter(arr, predicate)).length === arr.length;
  