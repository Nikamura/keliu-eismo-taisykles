export interface IConfiguration {
  CACHING_PATH: string | null;
}

export const config: IConfiguration = {
  CACHING_PATH: process.env["CACHING_PATH"] ?? null,
};
