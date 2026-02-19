export default ({ env }: { env: { (key: string, defaultValue?: string): string; int(key: string, defaultValue?: number): number; array(key: string): string[] } }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
});