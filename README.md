# Push to Release Action

This GitHub Action creates a release with the current version from package.json and optionally uploads a file as a release asset.

## Inputs

### `github-token` (required)

GitHub token to authenticate with GitHub API. Used for creating releases and uploading assets.

### `binary-path` (optional)

Path to the binary file to upload as a release asset. If not provided, no file will be uploaded.

## Example Usage

```yaml
name: Test Push to Release

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Run Push to Release
        uses: TheAhmedGad/push-to-release@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          binary-path: ./path/to/binary
