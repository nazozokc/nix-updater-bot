import consola from "npm:consola";
const LOCK_FILE = ".nix-bot.lock"

export async function acquirelock() {
 try {
   await Deno.writeTextFile(LOCK_FILE, Date.now().toString(), {
     createNew: true,
   });
 }  catch {
   consola.error("Bot already running.");
   Deno.exit(1);
 }
}

export async function releaselock() {
 try {
   await Deno.remove(LOCK_FILE);
 } catch {}
}
