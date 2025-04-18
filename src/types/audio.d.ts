// Allow importing MP3 files in TypeScript
declare module "*.mp3" {
  const src: string;
  export default src;
}
