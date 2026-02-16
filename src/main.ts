import consola from "npm:consola";
import { acquirelock, releaselock } from "./lock.ts";

async function run(cmd: string[]) {
  consola.debug(`Running: ${cmd.join(" ")}`);

  const p = Deno.run({
    cmd,
    stdout: "piped",
    stderr: "piped",
  });

  const status = await p.status()
  const stdout = new TextDecoder().decode(await p.output());
  const stderr = new TextDecoder().decode(await p.stderrOutput());

  p.close();

  if (!status.success) {
    consola.error(stderr);
    throw new Error(`Command failed: ${cmd.join(" ")}`);
  }

  return stdout;
}

async function hasFlakeChanged(): Promise<boolean> {
  const output = await run ([
    "git",
    "status",
    "--porcelain",
    "flake.lock",
  ]);

  return output.trim().length > 0;
}

async function main() {
 consola.info("Nix update bot started");

 await acquirelock();

  consola.start("Running nix flake update...");
  await run(["nix", "flake", "update"]);
  consola.success("Nix update finished");

  if (await hasFlakeChanged()) {
    consola.info("Changes detected in flake.lock");

     await run(["git", "add", "flake.lock"]);
     await run(["git", "commit", "-m", "update to flake.lock"]);
     await run(["git", "push"]);

     consola.success("Changes pushed successfully");
  } else {
    consola.info("No Changes detected");
  }

  await releaselock();
  consola.info("Bot finished");
}

main().catch((err) => {
  consola.fatal(err);
  Deno.exit(1);
});
