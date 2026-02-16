{
  description = "Nix auto update bot (Deno + TS)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            deno
            neovim
            git
            gh
            lazygit
            nix
          ];

          shellHook = ''
            echo "🚀 Deno Nix Bot Dev Environment"
            deno --version
          '';
        };
      }
    );
}

