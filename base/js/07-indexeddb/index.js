// Create needed constants
const list = document.querySelector('ul');
const titleInput = document.querySelector('#title');
const bodyInput = document.querySelector('#body');
const form = document.querySelector('form');
const submitBtn = document.querySelector('form button');

let db;

window.onload = () => {
  // 打开指定名称和版本的数据库
  let request = window.indexedDB.open("notes", 1);
  request.onerror = () => {
      console.log('Database failed to open');
  }

  request.onsuccess = () => {
    console.log('Database opened successfully');
    db = request.result;

    displayData();
  }

  request.onupgradeneeded = (e) => {
    let db = e.target.result;
    let objectStore  = db.createObjectStore("notes", {
        keyPath: "id",
        autoIncrement:true
    });

    objectStore.createIndex("title", "title", {unique: false});
    objectStore.createIndex("body", "body", {unique: false});

    console.log('Database setup complete');
  }
}

// 阻止表单默认操作
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 创建要存储的数据项
    let newItem = {title: titleInput.value, body: bodyInput.value};
    // 开启数据库写入事务
    let transaction = db.transaction(['notes'], 'readwrite');
    // 存储数据
    let objectStore = transaction.objectStore("notes");
    var request = objectStore.add(newItem);
    request.onsuccess = () => {
        titleInput.value = '';
        bodyInput.value = '';
    }

    transaction.oncomplete = function() {
        console.log('Transaction completed: database modification finished.');

        displayData();
    }

    transaction.onerror = function() {
        console.log('Transaction not opened due to error');
    }
});

function displayData() {
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }

    let objectStore = db.transaction("notes").objectStore("notes");
    objectStore.openCursor().onsuccess = (e) => {
        let cursor = e.target.result;

        if (cursor) {
            let listItem = document.createElement("li");
            let h3 = document.createElement("h3");
            let para = document.createElement("p");

            listItem.appendChild(h3);
            listItem.appendChild(para);
            list.appendChild(listItem);

            h3.textContent = cursor.value.title;
            para.textContent = cursor.value.body;

            listItem.setAttribute('data-note-id', cursor.value.id);

            let deleteBtn = document.createElement("button");
            listItem.appendChild(deleteBtn);
            deleteBtn.textContent = "Delete";

            deleteBtn.onclick = deleteItem;

            cursor.continue();
        } else {
            if (!list.firstChild) {
                let listItem = document.createElement("li");
                listItem.textContent = 'No notes stored';
                list.appendChild(listItem);
            }
            console.log('Notes all displayed');
        }
    }
}

function deleteItem(e) {
    let noteId = Number(e.target.parentNode.getAttribute('data-note-id'));

    let transaction = db.transaction(['notes'], "readwrite");
    let objectStore = transaction.objectStore('notes');
    let request = objectStore.delete(noteId);

    transaction.oncomplete = () => {
        e.target.parentNode.parentNode.removeChild(e.target.parentNode);
        console.log("Note " + noteId + ' deleted.');
    }

    if (!list.firstChild) {
        let listItem = document.createElement('li');
        listItem.textContent =  "No notes stored.";
        list.appendChild(listItem);
    }
}