/* 2.1 */

export const MISSING_KEY = '___MISSING___'

type PromisedStore<K, V> = {
    get(key: K): Promise<V>,
    set(key: K, value: V): Promise<void>,
    delete(key: K): Promise<void>
}


export function makePromisedStore<K, V>(): PromisedStore<K, V> {
    const myMap= new Map()
    return {
        get(key: K) {
            return new Promise<V>((resolve, reject) => {
                if(myMap.has(key)){
                    resolve(myMap.get(key))
                }
                else{
                    reject(MISSING_KEY)
                }    
            })
        },
        set(key: K, value: V) {                                
            return new Promise<void>((resolve, reject) => {
                    myMap.set(key,value)
                    resolve()
            })
        },
        delete(key: K) {
            return new Promise<void>((resolve, reject) => {
                if(myMap.has(key)){
                    myMap.delete(key)
                    resolve()
                }
                else{
                    reject(MISSING_KEY)
                }
            })
        },
    }
}

export function getAll<K, V>(store: PromisedStore<K, V>, keys: K[]): Promise<V[]> {
    return Promise.all(keys.map(s=>store.get(s)))
}



/* 2.2 */

// ??? (you may want to add helper functions here)
//
export function asycMemo<T, R>(f: (param: T) => R): (param: T) => Promise<R> {
    const store=makePromisedStore<T,R>()
    return async function (params:T):Promise<R> {
        try{
            await store.get(params)
        }
        catch{
            await store.set(params,f(params))
        }
        return store.get(params)
    }
}

/* 2.3 */

export function lazyFilter<T>(genFn: () => Generator<T>, filterFn: (v: T) => boolean): () => Generator<T> {
    const generatorF = function* (genFn: () => Generator<T>, filter: (v: T) => boolean) : Generator<T>{
        for (let i of genFn()) {
            if (filter(i)) {
                yield i;
            }
        }
    };
    return () => generatorF(genFn, filterFn);
}

export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn: (v: T) => R): () => Generator<R> {
    const mapGenerator = function* (genFn: () => Generator<T>, map: (v: T) => R) : Generator<R> {
        for (let i of genFn()) {
            yield map(i);
        }
    };
    return () => mapGenerator(genFn, mapFn);
}

/* 2.4 */
// you can use 'any' in this question

export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...((param: any) => Promise<any>)[]]): Promise<any> {
    let delay = async (): Promise<void> => new Promise((res: VoidFunction) => setTimeout(res, 2000));
    let output = undefined;
    for (let currentFun of fns) {
        try {
            output = await currentFun(output);
        } catch {
            await delay();
            try {
                output = await currentFun(output);
            } catch {
                await delay();
                try {
                    output = await currentFun(output);
                } catch (err) {
                    output = err;
                }
            }
        }
    }
    return output;
}