
# Noferic IDE

 Noferic IDE is a integrated development environment for the built with web technologies.

## Download

### Linux 

You can download the AppImage for Linux here:

[noferic-IDE.AppImage](https://github.com/achu62/noferic-IDE/releases/download/beta/noferic-IDE.AppImage)

[noferic-IDE.deb]()
## Build from source

### Dependencies

- Node.js (LTS recommended)
- npm (included with Node.js)
- git (optional, if you prefer to clone the repository)
- node-pty and its native dependencies
- Python 3.10+ and PyInstaller (for packaging)

### Clone and install

```bash
mkdir noferic-ide
cd noferic-ide
gh repo clone achu62/noferic-IDE
# or download and extract the ZIP
npm install
```

### Build

On Linux:

```bash
npm run build -- --linux
```

On Windows:

```bash
npm run build -- --win
```

The built executable or AppImage will be placed in the `appoutput` folder.

## Editor and assets

- **Code editor:** Monaco — license: [MIT](monacohtml/monaco-editor/package/LICENSE)
- **Font:** JetBrains Mono — license: [OFL](monacohtml/fonts/JetBrainsMono/OFL.txt)
- **Icons:** Material Icons — license: [materialuiiconslicense.txt](materialuiiconslicense.txt) and tabler icons - license : [tablericonslicense.txt](tablericonslicense.txt)
- **Other third-party notices:** [THIRD_PARTY_LICENSES.txt](THIRD_PARTY_LICENSES.txt)

## Contributing

We welcome contributions — thank you for helping improve Noferic IDE. Please follow these simple steps:

- **Report issues:** Open an issue to describe bugs or feature requests.
- **Work on changes:** Fork the repository and create a branch named like `feature/short-description` or `fix/short-description`.
- **Run and test:** Install dependencies with `npm install` and run any tests or build steps locally before submitting changes.
- **Pull requests:** Open a clear pull request that references related issues and describes your changes.
- **Commit style:** Keep commits focused and descriptive. Rebase or squash as appropriate before merging.

If you have questions or need guidance, please open an issue and we'll be happy to help.

Thank you for trying Noferic IDE. If you encounter any issues or have questions, please open an issue on the repository.
