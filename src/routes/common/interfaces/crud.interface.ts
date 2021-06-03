export interface CRUD {
  list: (limit: number, page: number) => Promise<Array<any>>;
  create: (resource: any) => Promise<any>;
  putById: (id: string, resource: any) => Promise<string>;
  readById: (id: string) => Promise<any>;
  patchById: (id: string, resource: any) => Promise<any>;
  removeById: (id: string) => Promise<string>;
}
