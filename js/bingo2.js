const elements = {
  cells: document.querySelectorAll(".bingo-cell"),
};

window.onload = async function () {
  for (let index = 0; index < elements.cells.length; index++) {
    elements.cells[index].onclick = (event) => {
      event.target.classList.toggle("filled");
    };
  }
}; //onload
