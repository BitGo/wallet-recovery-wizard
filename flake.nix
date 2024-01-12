{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }: (
    flake-utils.lib.eachDefaultSystem (
      system: (
        let
          pkgs = import nixpkgs {
            inherit system;
          };
        in {
          devShells.default = pkgs.mkShell {
            packages = with pkgs; [
              nodejs_20
            ];

            shellHook = ''
              export PATH="$(pwd)/node_modules/.bin:${pkgs.nodejs_20}/bin/:$PATH"
            '';
          };
        }
      )
    )
  );
}
