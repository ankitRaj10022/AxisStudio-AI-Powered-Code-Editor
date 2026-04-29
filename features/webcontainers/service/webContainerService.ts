import { WebContainer } from "@webcontainer/api";

interface WebContainerStore {
  bootPromise: Promise<WebContainer> | null;
  instance: WebContainer | null;
}

declare global {
  var __axisStudioWebContainerStore__: WebContainerStore | undefined;
}

function getStore(): WebContainerStore {
  if (!globalThis.__axisStudioWebContainerStore__) {
    globalThis.__axisStudioWebContainerStore__ = {
      bootPromise: null,
      instance: null,
    };
  }

  return globalThis.__axisStudioWebContainerStore__;
}

class WebContainerService {
  public async getWebContainer(): Promise<WebContainer> {
    const store = getStore();

    if (store.instance) {
      return store.instance;
    }

    if (!store.bootPromise) {
      store.bootPromise = WebContainer.boot()
        .then((instance) => {
          store.instance = instance;
          return instance;
        })
        .catch((error) => {
          store.bootPromise = null;
          throw error;
        });
    }

    return store.bootPromise;
  }

  public hasInstance(): boolean {
    return Boolean(getStore().instance);
  }

  public teardown(): void {
    const store = getStore();

    if (store.instance) {
      store.instance.teardown();
    }

    store.instance = null;
    store.bootPromise = null;
  }
}

export default new WebContainerService();
