// 获取控件
const nameInput = document.querySelector("#entername");
const rememberSubmit = document.querySelector("#submitname");
const forgetSubmit = document.querySelector("#forgetname");
const rememberDiv = document.querySelector(".remember");
const forgetDiv = document.querySelector(".forget");
const form = document.querySelector("form");
// 展示部分
const h1 = document.querySelector("h1");
const greeting = document.querySelector(".personal-greeting");

form.addEventListener('submit', (e) => {
  e.preventDefault();
}); 

rememberSubmit.addEventListener('click', () => {
  // 存储到本地
  localStorage.setItem("name", nameInput.value);

  nameDisplayCheck();
});

forgetSubmit.addEventListener('click', () => {
  // 从本地移除
  localStorage.removeItem("name");

  nameDisplayCheck();
});

function nameDisplayCheck() {
  if (localStorage.getItem("name")) {
    let name = localStorage.getItem("name");
    h1.textContent = "Welcome, " + name;
    greeting.textContent = "Welcome to our website, " + name + "! We hope you have fun while you are here.";

    forgetDiv.style.display = "block";
    rememberDiv.style.display = "none";
  } else {
    h1.textContent = "Welcome to our website";
    greeting.textContent = "Welcome to our website, We hope you have fun while you are here.";

    forgetDiv.style.display = "none";
    rememberDiv.style.display = "block";
  }
}

document.body.onload = nameDisplayCheck;