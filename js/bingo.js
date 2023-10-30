const elements = {
  cells: document.querySelectorAll(".bingo-cell"),
  toastContainer: document.getElementById("toastContainer"),
  twitchEmbed: document.getElementById("twitchEmbed"),
  nextStream: document.getElementById("nextStream"),
};

window.onload = async function () {
  for (let index = 0; index < elements.cells.length; index++) {
    elements.cells[index].onclick = (event) => {
      event.target.classList.toggle("filled");
    };
  }
}; //onload
