//const items = [...10000000]; // your list of items
const information = document.getElementById('info')
const items = Array.from({length: 1000}, (_, i) => i + 1);

//const items = [...1000]
const listContainer = document.getElementById("list-container");
const list = document.getElementById("list");
//const list_item = document.getElementById("list-item");
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = Math.ceil(listContainer.clientHeight / 40); // the number of items that can be visible at a time
information.innerText = `Files System3 ${VISIBLE_ITEMS}`
let startIndex = 0; // the index of the first visible item
let endIndex = VISIBLE_ITEMS; // the index of the last visible item
let extraBottomRows = 10;//to kick in th scroll
function renderItems() {
  
    let html = "";
    for (let i = startIndex; i < endIndex+extraBottomRows; i++) {
        html += `<div class="list-item">${items[i]}</div>`;
    }
    list.innerHTML = html;
}

// initially render the first set of visible items
renderItems();

listContainer.addEventListener("scroll", () => {
     information.innerText = `scroll detected`
    // calculate the new start and end indices based on the scroll position
    startIndex = Math.floor(listContainer.scrollTop / ITEM_HEIGHT);
    endIndex = startIndex + VISIBLE_ITEMS;//Math.floor(listContainer.scrollTop / ITEM_HEIGHT);
    information.innerText = `${startIndex}, 'to', ${endIndex}, ${listContainer.scrollTop,Math.floor(listContainer.scrollTop / ITEM_HEIGHT)},${listContainer.scrollTop}`
    renderItems();
});

