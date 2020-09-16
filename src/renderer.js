const { remote, ipcRenderer } = require("electron");
const mainProcess = remote.require("./index");

const app = document.querySelector(".app");
const heading = document.querySelector("h1");
const okayBtn = document.querySelector(".okay-btn");

const getDraggedFiles = event => event.dataTransfer.items;
const getDroppedFiles = event => event.dataTransfer.files;

document.addEventListener("dragstart", event => event.preventDefault());
document.addEventListener("dragover", event => event.preventDefault());
document.addEventListener("dragleave", event => event.preventDefault());
document.addEventListener("drop", event => event.preventDefault());

document.addEventListener("dragover", e => {
  const files = getDraggedFiles(e);

  app.style.backgroundColor = "rgb(44,44,46)";
});

document.addEventListener("dragleave", () => {
  app.style.backgroundColor = "rgb(28,28,30)";
});

okayBtn.addEventListener("click", () => {
  heading.innerText = `Drop an image to optimize it`;

  okayBtn.style.visibility = "hidden";
});

app.addEventListener("drop", event => {
  app.style.backgroundColor = "rgb(28,28,30)";
  const filesArr = getDroppedFiles(event);

  const numFiles = filesArr.length;

  heading.innerText = `Compressing ${numFiles} image(s)...`;
  mainProcess.compressImage(filesArr);
});

ipcRenderer.on("compressed", (event, data) => {
  heading.innerText = `Done! you saved ${data} mb`;
  okayBtn.style.visibility = "visible";
});
