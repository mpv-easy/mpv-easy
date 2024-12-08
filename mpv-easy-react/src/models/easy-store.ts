import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector"

type StoreOption<
  S,
  A extends Record<string, (state: S, ...payload: any) => S>,
> = {
  state: S
  reducers: {
    [k in keyof A]: A[k] extends (state: S, ...payload: infer P) => any
      ? (state: S, ...payload: P) => S
      : A[k]
  }
}

type ReducersToDispatch<
  R extends Record<string, (state: S, ...payload: any) => S>,
  S,
> = {
  [k in keyof R]: R[k] extends (state: S, ...payload: infer P) => S
    ? (...payload: P) => S
    : any
}

type Notify = () => void
type StoreListener<S> = (state: S) => void

export function defineStore<
  R extends Record<string, (state: S, ...payload: any) => S>,
  S,
>(store: StoreOption<S, R>) {
  let state = store.state
  const notifyListeners = new Set<Notify>()
  const subscribeListener = (notify: Notify) => {
    notifyListeners.add(notify)
    return () => {
      notifyListeners.delete(notify)
    }
  }

  const storeListeners = new Set<StoreListener<S>>()

  const notify = () => {
    for (const i of notifyListeners) {
      i()
    }
    for (const i of storeListeners) {
      i(state)
    }
  }

  const subscribe = (cb: StoreListener<S>) => {
    storeListeners.add(cb)
  }
  const unsubscribe = (cb: StoreListener<S>) => {
    storeListeners.delete(cb)
  }

  const getSnapshot = () => {
    return state
  }

  const dispatch = {} as ReducersToDispatch<R, S>
  for (const i in store.reducers) {
    // @ts-ignore
    dispatch[i] = (...payload: any[]) => {
      state = store.reducers[i](state, ...payload)
      notify()
    }
  }

  function useSelector<R>(selector: (s: S) => R): R {
    return useSyncExternalStoreWithSelector(
      subscribeListener,
      getSnapshot,
      getSnapshot,
      selector,
    )
  }

  function setStore(s: S) {
    state = s
  }
  return {
    dispatch,
    getSnapshot,
    subscribe,
    useSelector,
    setStore,
    unsubscribe,
  }
}
