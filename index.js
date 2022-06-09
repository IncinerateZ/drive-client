const API = 'https://drive-api.incin.net/';
// const API = 'http://localhost:8080/';

var fileselector_btn;
var folderselector_btn;
var newfolderselector_btn;
var filesContent;
var filesDir = '';

function getFiles(dir = '') {
    return axios.get(`${API}files/${dir}`);
}

function clearFiles() {
    filesContent.innerHTML = '';
}

function updateDir(newDir) {
    filesDir = newDir;
    getFiles(filesDir).then((res) => {
        displayFiles(res.data.struct);
    });
}

function makeFile(file) {
    let file_container = document.createElement('div');
    file_container.style.display = 'flex';

    let file_div = document.createElement('div');
    file_div.style.width = '25vw';
    file_div.style.display = 'flex';
    file_div.className = 'file';

    let fileName = document.createElement('div');
    fileName.className = 'file-name';
    fileName.innerText = file.name;
    fileName.style.fontWeight = '400';

    let fileSize = document.createElement('div');
    fileSize.className = 'file-size';
    fileSize.innerText = file.size;
    fileSize.style.fontWeight = '400';
    fileSize.style.marginLeft = 'auto';

    let delFile = document.createElement('img');
    delFile.src = './img/del.svg';
    delFile.className = 'del';
    delFile.style.fontWeight = '600';
    delFile.style.cursor = 'pointer';
    delFile.style.marginTop = 'auto';
    delFile.style.marginBottom = 'auto';
    delFile.style.marginLeft = '0.3rem';
    delFile.style.height = '15px';

    delFile.onclick = function () {
        axios.get(`${API}delete/file/${filesDir + file.name}`);
        updateDir(filesDir);
    };

    file_div.appendChild(fileName);
    file_div.appendChild(fileSize);

    file_container.appendChild(file_div);
    file_container.appendChild(delFile);

    file_div.onclick = function () {
        let link = document.createElement('a');
        link.target = '_blank';
        link.href = `${API}file/${filesDir + file.name}`;
        link.click();
    };

    return file_container;
}

function makeFolder(folder, newFolder = false) {
    let folder_container = document.createElement('div');
    folder_container.style.display = 'flex';

    let folder_div = document.createElement('div');
    folder_div.className = 'file';
    folder_div.style.width = '25vw';

    let folderName = document.createElement('div');
    folderName.className = 'folder-name';
    folderName.innerText = folder.name + (newFolder ? '' : '/');
    folderName.style.fontWeight = '400';
    folderName.style.width = '100%';
    if (newFolder) {
        folderName.contentEditable = 'true';

        folderName.onkeydown = function (e) {
            if (e.target.innerText.length === 0)
                return filesContent.removeChild(folder_container);
            if (e.key === 'Enter') {
                e.preventDefault();
                filesContent.focus();
                axios
                    .get(API + 'newFolder/' + filesDir + e.target.innerText)
                    .then(() => {
                        updateDir(filesDir);
                    });
            }
        };

        folderName.addEventListener('focusout', () => {
            filesContent.removeChild(folder_container);
        });
    }

    let empty = document.createElement('div');
    empty.style.width = '1px';
    empty.style.height = '1px';
    empty.style.marginRight = 'auto';

    let downloadFolder = document.createElement('img');
    let delFolder = document.createElement('img');
    if (!newFolder) {
        downloadFolder.src = './img/download.svg';
        downloadFolder.className = 'download';
        downloadFolder.style.fontWeight = '600';
        downloadFolder.style.cursor = 'pointer';
        downloadFolder.style.marginTop = 'auto';
        downloadFolder.style.marginBottom = 'auto';
        downloadFolder.style.marginLeft = '0.3rem';
        downloadFolder.style.height = '15px';

        downloadFolder.onclick = function () {
            let link = document.createElement('a');
            link.href = `${API}file/${filesDir + folder.name}`;
            link.click();
        };

        delFolder.src = './img/del.svg';
        delFolder.className = 'del';
        delFolder.style.fontWeight = '600';
        delFolder.style.cursor = 'pointer';
        delFolder.style.marginTop = 'auto';
        delFolder.style.marginBottom = 'auto';
        delFolder.style.marginLeft = '0.3rem';
        delFolder.style.height = '15px';

        delFolder.onclick = function () {
            axios
                .get(`${API}delete/folder/${filesDir + folder.name}`)
                .then(() => {
                    updateDir(filesDir);
                });
        };
    }

    folder_div.appendChild(folderName);
    folder_div.appendChild(empty);

    folder_container.appendChild(folder_div);
    if (!newFolder) {
        folder_container.appendChild(downloadFolder);
        folder_container.appendChild(delFolder);
        folder_div.onclick = function () {
            updateDir(filesDir + folder.name + '/');
        };
    }

    return folder_container;
}

function displayFiles(struct = []) {
    clearFiles();

    let dirloc = document.createElement('div');
    let totaldir = './' + filesDir;
    let dirs = totaldir.split('/');
    let p = '';
    for (let dir of dirs) {
        if (dir === '') continue;
        let dir_div = document.createElement('div');
        dir_div.className = 'dir-loc';
        dir_div.innerText = dir + '/';
        dir_div.style.fontWeight = '400';
        dir_div.style.cursor = 'pointer';

        dir_div.onclick = function () {
            updateDir(dir_div.p);
        };

        p += dir + '/';
        dir_div.p = p.substring(2);

        dirloc.appendChild(dir_div);
    }

    dirloc.style.marginBottom = '1rem';
    dirloc.style.fontSize = '1.2rem';
    dirloc.style.display = 'flex';

    filesContent.appendChild(dirloc);

    let files = [];

    for (let f of struct) {
        if (f.type === 'file') files.push(f);
        else filesContent.appendChild(makeFolder(f));
    }

    for (let f of files) {
        filesContent.appendChild(makeFile(f));
    }
}

function makeNewFolderPrompt() {
    return makeFolder({ name: 'New Folder' }, true);
}

function newFolderHandler() {
    let newFolderPrompt = makeNewFolderPrompt();
    filesContent.insertBefore(
        newFolderPrompt,
        filesContent.firstChild.nextSibling,
    );

    //focus on the new folder name
    let folderName = newFolderPrompt.firstChild.firstChild;
    (s = window.getSelection()), (r = document.createRange());
    r.selectNodeContents(folderName);
    s.removeAllRanges();
    s.addRange(r);
}

function create_file_input({
    webkitdirectory = false,
    directory = false,
    multiple = false,
}) {
    let input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = webkitdirectory;
    input.directory = directory;
    input.multiple = multiple;

    input.onchange = async function (e) {
        console.log(filesDir);
        let struct = {};
        if (this.files.length > 0) {
            for (let file of this.files) {
                let fullpath =
                    file.webkitRelativePath.length === 0
                        ? filesDir
                        : file.webkitRelativePath;
                let paths = fullpath.split('/');
                paths.pop();

                let s = struct;

                for (let p of paths) {
                    if (!s.hasOwnProperty(p)) s[p] = {};
                    s = s[p];
                }
                if (!s.hasOwnProperty('__files__')) s.__files__ = [];
                s.__files__.push(file.name);
            }
            console.log(struct);
            const formData = new FormData();

            for (let file of this.files) {
                formData.append('files', file);
            }

            formData.append('struct', JSON.stringify(struct));

            await axios.post(API + 'upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    console.log(
                        'Upload Progress: ' +
                            Math.round(
                                (progressEvent.loaded * 100) /
                                    progressEvent.total,
                            ) +
                            '%',
                    );
                },
            });

            updateDir(filesDir);
        }
    };

    return input;
}

function load() {
    fileselector_btn = document.getElementById('file-selector');
    folderselector_btn = document.getElementById('folder-selector');
    newfolderselector_btn = document.getElementById('newfolder-selector');
    selectedfiles_txt = document.getElementById('selected-files');
    filesContent = document.getElementById('files-content');

    folderselector_btn.onclick = function () {
        let input = create_file_input({
            webkitdirectory: true,
            directory: true,
            multiple: true,
        });

        input.click();
    };

    fileselector_btn.onclick = function () {
        let input = create_file_input({ multiple: true });

        input.click();
    };

    newfolderselector_btn.onclick = function () {
        newFolderHandler();
    };

    getFiles().then((res) => {
        displayFiles(res.data.struct);
    });

    document.getElementById('logout').onclick = function () {
        axios
            .get(API + 'logout', {
                withCredentials: true,
            })
            .then(() => {
                window.location = '/';
            });
    };
}

window.onload = function () {
    axios
        .get(API + 'auth/', {
            withCredentials: true,
        })
        .then((res) => {
            console.log(res.data);
            if (res.data.r) window.location = res.data.r;
            else load();
        });
};
