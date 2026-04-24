//jai sri ram
import { getfileiconbytype } from "./getfileicon.js"
import { initiateterminal } from './initialiseterminal.js'
import { resizeexplorer } from "./resizeexplorer.js"
import { syncEditorBottom } from "./syncEditorbottom.js"
import { recursiveid } from "./idcounter.js"
import { resizeterminal } from "./resizeterminal.js"
//
const save = document.getElementById('save')
const openfile = document.getElementById("open_file")
const file = document.getElementById(`file`);
const exit = document.getElementById('exit');
const iframe = document.querySelector('iframe#editor');
const saveas = document.getElementById('save_as');
////////////////////////
let isopen = false;
let path;
////////////////////////
window.onload = function () {
  // dialogclicker(this.document.getElementById("settingsdialog"), document.getElementById("settings"))
  document.getElementById('file_on').style.display = 'none'
  document.getElementById('viewon').style.display = 'none';
  ////////////////
  exit.onclick = () => {
    window.close();
  }
  const editorEl = this.document.getElementById('editor');
  const terminalEl = this.document.getElementById('terminalelement');
  //////////////////


  // initial sync (onload only)
  syncEditorBottom(editorEl, terminalEl);
  file.onclick = function () {

    if (isopen === false) {
      document.getElementById('file_on').style.display = 'block'
      isopen = true;
    }
    else {
      document.getElementById('file_on').style.display = 'none'
      isopen = false;
    }
    openfile.addEventListener('click', async () => {
      document.getElementById('file_on').style.display = 'none'
      document.getElementById('topbarforeditor').replaceChildren()

      path = await window.ipc.invoke('openfile')
      const lang = path.split(`/`).pop().split(`.`).pop();
      if(!path){return}
      else{
      const filecontent = await window.ipc.invoke('read', path);
      //iframe.contentWindow.postMessage(["set", filecontent, false, path], '*');
      iframe.contentWindow.postMessage(
        {
          action: "set",
          content: filecontent,
          isdir: false,
          path: path,
          language:lang
        }, '*'
      )
      document.getElementById('file_on').style.display = 'none'}
    }, { once: true });
   
  };
   save.addEventListener('click', async () => {

      iframe.contentWindow.postMessage({
        action: "get"
      }, '*');
      window.addEventListener('message', (e) => {
        const message = e.data;
        const isgettingfolderfile = message.isfolder;
        if (!isgettingfolderfile) {
          if (!path) {
            (async () => {
              path = await
                window.ipc.invoke('save')
              await window.ipc.invoke('append', path);
              await window.ipc.invoke('write', path, message.content);
            })();
          }
          else {
            (async () => {
              await window.ipc.invoke('write', path, message.content);
            })();
          }
        }
        else {
          (async () => {
            await window.ipc.invoke('write', message.path, message.content)
          })();
        }
        document.getElementById('file_on').style.display = 'none'
      }, { once: true })
    })
  saveas.addEventListener('click', async () => {
    iframe.contentWindow.postMessage({
      action: "get"
    }, '*');
    window.addEventListener('message', async (e) => {
      const contenttosave = e.data.content;

      const pathtosaveas = await window.ipc.invoke('saveas');
      await window.ipc.invoke('append', pathtosaveas);
      await window.ipc.invoke('write', pathtosaveas, contenttosave);
      document.getElementById('file_on').style.display = 'none';
    }, { once: true });
  })
  initiateterminal(document.getElementById("terminal"));
  resizeterminal(document.getElementById('terminalelement'), document.getElementById('editor'))
  resizeexplorer(this.document.getElementById('explorer'))
  // resizepreview(this.document.getElementById('preview'))
  const observerforterminal = new ResizeObserver(() => {
    syncEditorBottom(editorEl, terminalEl);
    //fitaddon.fit();
  })
  observerforterminal.observe(terminalEl)
  const observerforpreview = new ResizeObserver(() => {
    const editor = this.document.getElementById('middleeditor');
    const explorer = this.document.getElementById('explorer');
    const preview = this.document.getElementById('preview');
    editor.style.right = preview.offsetWidth + 'px';
    editor.style.left = explorer.offsetWidth + 'px';
    editor.style.width = `${this.document.getElementById('workspace').offsetWidth - (preview.offsetWidth + explorer.offsetWidth)}px`
  })
  const observerforexplorer = new ResizeObserver(() => {
    const editor = this.document.getElementById('middleeditor');
    const explorer = this.document.getElementById('explorer');
    const preview = this.document.getElementById('preview');
    editor.style.right = preview.offsetWidth + 'px';
    editor.style.left = explorer.offsetWidth + 'px';
    editor.style.width = `${this.document.getElementById('workspace').offsetWidth - (preview.offsetWidth + explorer.offsetWidth)}px`
  });
  observerforexplorer.observe(this.document.getElementById('explorer'))

  observerforpreview.observe(this.document.getElementById('preview'))






  const fileexplorerarea = document.getElementById("explorerelement");
  function recursiveloop(filearray, space) {
    let depth = 17;

    depth = depth + 5;
    for (const file of filearray) {
      if (file.isdirectory && file.haschildren) {
        const filebutton = document.createElement("button");
        filebutton.id = `${file.id}`
        filebutton.textContent = `${file.name}`
        filebutton.classList.add("files")
        filebutton.classList.add("folder")
        filebutton.style.paddingLeft = depth + 'px';
        const statebtn = document.createElement('div');
        statebtn.id = `statebuttonfor${file.id}`;
        statebtn.style.position = "absolute";
        statebtn.style.top = "0.5px"
        statebtn.style.right = "0.5px"
        statebtn.style.bottom = "0.5px"
        statebtn.style.height = "16px"
        statebtn.style.width = `16px`
        statebtn.style.backgroundImage = "url(images/keyarrowdown.svg)";
        statebtn.style.backgroundRepeat = "no-repeat"
        statebtn.style.backgroundSize = "cover"
        const icon = document.createElement('div');
        icon.id = `iconfor${file.id}`;
        icon.style.position = "absolute";
        icon.style.backgroundImage = "url(images/folder.svg)";
        icon.style.backgroundRepeat = "no-repeat"
        icon.style.backgroundSize = "cover"
        icon.style.top = "0.5px";
        icon.style.bottom = "0.5px"
        icon.style.height = "16px"
        icon.style.width = `16px`
        icon.style.left = `${depth - 19}px`
        filebutton.appendChild(icon);


        filebutton.appendChild(statebtn)
        let isopen = false;
        filebutton.addEventListener('click', (e) => {
          if (!isopen) {
            if (filebutton.classList.contains("folder")) {
              recursiveloop(file.children, document.getElementById(`${file.id}`));
              e.stopPropagation();
              e.stopImmediatePropagation();
              isopen = true;
            }
            else { return }
          }
          else {
            filebutton.replaceChildren(file.name, statebtn, icon)
            isopen = false;

            e.stopPropagation();
          }


        }

        )
        space.appendChild(filebutton)
      }
      else if (!file.haschildren && file.isdirectory) {
        const filebutton = document.createElement("button");

        filebutton.id = `${file.id}`
        filebutton.textContent = `${file.name}`
        filebutton.classList.add("files")
        filebutton.style.paddingLeft = depth + 'px';
        const icon = document.createElement('div');
        icon.id = `iconfor${file.id}`;
        icon.style.position = "absolute";
        icon.style.backgroundImage = `url(images/folder.svg)`;
        icon.style.backgroundRepeat = "no-repeat"
        icon.style.backgroundSize = "cover"
        icon.style.top = "0.5px";
        icon.style.bottom = "0.5px"
        icon.style.height = "16px"
        icon.style.width = `16px`
        icon.style.left = `${depth - 19}px`
        space.appendChild(filebutton)
        filebutton.appendChild(icon)
      }
      else {
        const filebutton = document.createElement("button");
        filebutton.id = `${file.id}`
        filebutton.textContent = `${file.name}`
        filebutton.classList.add("files")
        filebutton.style.paddingLeft = depth + 'px';
        space.appendChild(filebutton)
        filebutton.addEventListener('click', async (e) => {
          e.stopPropagation();
          e.stopImmediatePropagation();
          const filepathonclick = file.path;
          const content = await
            window.ipc.invoke('read', (filepathonclick));

          const isexisting = document.getElementById(`topbarelementfor${file.id}`);

          if (!isexisting) {
            const topbarelement = document.createElement('button');
            topbarelement.classList.add('class__topelements')
            topbarelement.id = `topbarelementfor${file.id}`;
            topbarelement.textContent = `${file.name}`
            const lang = filepathonclick.split('/').pop().split('.').pop();
            topbarelement.addEventListener('click', (e) => {
              e.stopPropagation();
              iframe.contentWindow.postMessage({
                action: 'set',
                content: content,
                isdir: true,
                language: lang,
                path: filepathonclick
              }, '*');
              iframe.contentWindow.postMessage(['layout'], '*')
            });
            document.getElementById('topbarforeditor').appendChild(topbarelement);
            topbarelement.click();

          }
          else {
            isexisting.click();
          }
        });
        const extension = file.name.split(".").pop();

        let logopath = getfileiconbytype[extension];
        if (!logopath) {
          logopath = `images/unknown.svg`
        }
        const icon = document.createElement('div');
        icon.id = `iconfor${file.id}`;
        icon.style.position = "absolute";
        icon.style.backgroundImage = `url(${logopath})`;
        icon.style.backgroundRepeat = "no-repeat"
        icon.style.backgroundSize = "cover"
        icon.style.top = "0.5px";
        icon.style.bottom = "0.5px"
        icon.style.height = "16px"
        icon.style.width = `16px`
        icon.style.left = `${depth - 19}px`
        filebutton.appendChild(icon)


      }
    }
  }
  this.document.getElementById('open_folder').addEventListener('click', async () => {
    document.getElementById('file_on').style.display = 'none'
    const folderjson = await
      window.ipc.invoke('openfolder');
    let counter = 1;
    fileexplorerarea.replaceChildren();
    this.document.getElementById('topbarforeditor').replaceChildren();

    recursiveid(counter, folderjson)
    recursiveloop(folderjson, fileexplorerarea)
  })
  let isviewopen = false;
  this.document.getElementById('view').addEventListener('click', (e) => {
    e.stopPropagation();

    if (!isviewopen) {
      isviewopen = true;
      this.document.getElementById('viewon').style.display = "block";
    }
    else {
      this.document.getElementById('viewon').style.display = "none";
      isviewopen = false;

    }

  }
  )

  document.body.addEventListener('click', (e) => {
    if (!document.getElementById('viewon').contains(e.target) && e.target !== document.getElementById('view')) {
      document.getElementById('viewon').style.display = "none";
      isviewopen = false;

    }
    if (!document.getElementById('file_on').contains(e.target) && e.target !== document.getElementById('file')) {
      document.getElementById('file_on').style.display = "none";
      isopen = false;
    }
  })
  let isterminalopen = true;
  let isexploreropen = true;
  const checkboxforterminal =
    document.getElementById('terminalcheck');
  const checkboxforexplorer =
    this.document.getElementById("explorercheck")
  checkboxforterminal.addEventListener('change', (e) => {
    if (checkboxforterminal.checked) {
      document.getElementById('terminalelement').style.display = "block";
      isterminalopen = true;
      syncEditorBottom(editorEl, terminalEl);

    }
    else {
      document.getElementById('terminalelement').style.display = 'none';
      isterminalopen = false;
      syncEditorBottom(editorEl, terminalEl);
    }
  }
  );
  document.getElementById('term').addEventListener('click', (e) => {
    if (isexploreropen) {
      document.getElementById('terminalelement').style.display = 'none';
      isterminalopen = false;
      syncEditorBottom(editorEl, terminalEl);
      checkboxforterminal.checked = false;
    }
    else {
      document.getElementById('terminalelement').style.display = "block";
      isterminalopen = true;
      syncEditorBottom(editorEl, terminalEl);
      checkboxforterminal.checked = true;
    }
  })
  checkboxforexplorer.addEventListener('change', (e) => {
    if (checkboxforexplorer.checked) {
      document.getElementById('explorer').style.display = "block";
      isexploreropen = true;
      syncEditorBottom(editorEl, terminalEl);

    }
    else {
      document.getElementById('explorer').style.display = 'none';
      isexploreropen = false;
      syncEditorBottom(editorEl, terminalEl);
    }
  }
  );
  document.getElementById('expl').addEventListener('click', (e) => {
    if (isexploreropen) {
      document.getElementById('explorer').style.display = 'none';
      isexploreropen = false;
      checkboxforexplorer.checked = false;
    }
    else {
      document.getElementById('explorer').style.display = "block";
      isexploreropen = true;
      checkboxforexplorer.checked = true;
    }
  })
  this.document.getElementById('format').addEventListener('click' , async() => {
       iframe.contentWindow.postMessage({
        action:'formatget'
    } , '*')
    window.addEventListener("message" , async (e)=>{
        let object = e.data;
        console.log(object.code , object)

        const formattedcode = await
        window.ipc.invoke("format" ,(object))
        console.log(formattedcode)
        iframe.contentWindow.postMessage(
          {
            action:"formatset",
            formattedcode:formattedcode,
          } , '*'
        )
        
    })

  })
  document.addEventListener("keypress" , (e)=>
  {
    if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==="f"){
      e.preventDefault();
      alert('shotcutactivated')
      document.getElementById('format').click();
    }
  })
}