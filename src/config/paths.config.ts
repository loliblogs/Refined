// Collection 路径配置
const COLLECTION_PATHS = {
  post: 'post',
  oi: 'oi/post',
  page: '',
  oiPage: 'oi',
} as const;

const BASE_PATHS = {
  post: '',
  oi: 'oi',
} as const;

export function getCollectionPath(collection: string): string {
  if (!(collection in COLLECTION_PATHS)) {
    throw new Error(`Invalid collection: ${collection}`);
  }
  return COLLECTION_PATHS[collection as keyof typeof COLLECTION_PATHS];
}

export function getBasePath(collection: string): string {
  if (!(collection in BASE_PATHS)) {
    throw new Error(`Invalid collection: ${collection}`);
  }
  return BASE_PATHS[collection as keyof typeof BASE_PATHS];
}
