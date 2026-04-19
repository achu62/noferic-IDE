//jai sri ram
export function dialogclicker(dialog, clicker) {
    let isopen = false;
    clicker.addEventListener('click', () => {
        if (!isopen) {
            dialog.show();
            isopen = true;
        }
        else {
            dialog.close();
            isopen = false;
        }
    })
}