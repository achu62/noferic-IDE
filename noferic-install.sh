#!/bin/sh

#jai sri ram

set -eu

echo "Welcome to noferic-IDE installer"

printf "Do you want to install Noferic-IDE  \n 0-do not install \n 1-Install \n Enter your choice: "
read answer

# Fixed spaces inside brackets and changed '==' to '=' for standard sh compatibility
if [ "$answer" = "0" ]; then
    echo "quitting installation...."
    exit 0
elif [ "$answer" = "1" ]; then
    echo "continuing installation"
    echo "Installing Noferic IDE..."

    mkdir -p "$HOME/.local/bin"

    curl -fL "https://github.com/achu62/noferic-IDE/releases/download/v2.2.2/Noferic.IDE-2.2.2.AppImage" \
    -o "$HOME/.local/bin/noferic"

    chmod +x "$HOME/.local/bin/noferic"

echo "Noferic IDE installed successfully!"
else
    echo "invalid option"
    exit 1
fi
