// TODO guaranteed first click empty
// TODO styling 

let startTime;
let timeOutId;
let started = false;
let finished = false;
let columns = defaultColumns = 20;
let rows = defaultRows = 12;
let size;
let width;
let height;
let maxWidth;
let boxes;
let bombs;
let flags;
let grid;
let timer;

window.onload = () => {
    grid = document.getElementById('grid');
    timer = document.getElementById('time');

    document.getElementById('new-game').addEventListener('click', newGame);
    document.getElementById('cols').value = defaultColumns;
    document.getElementById('rows').value = defaultRows;

    newGame();
};

function resizeGrid() {
    columns = parseInt(document.getElementById('cols').value);
    rows = parseInt(document.getElementById('rows').value);
    size = Math.min(Math.ceil(960 / columns), 50);
    width = size * columns;
    height = size * rows;
    grid.style.width = width + 'px';
    grid.style.height = height + 'px';
}

function newGame() {
    boxes = [];
    bombs = [];
    flags = 0;    
    started = false;
    finished = false;
    if (timeOutId) clearTimeout(timeOutId);
    clearGrid();
    timer.innerHTML = '0';
    resizeGrid();

    for (let i = 0; i < columns * rows; i += 1) {
        let box = document.createElement('div')
        
        box.classList.add('box');
        box.style.width = size + 'px';
        box.style.height = size + 'px';
        box.style.paddingTop = String(parseInt(size / 4)) + 'px';
        box.setAttribute('index', i);

        if (Math.random() * 17 > 13) {
            box.classList.add('bomb');
            bombs.push(box);
        }        
        box.addEventListener('contextmenu', event => {
            event.preventDefault();
        });
        box.addEventListener('mousedown', event =>  {
            if (!started) startTimer();
            if (!finished) {
                let box = event.target;
                if (box.classList.contains('open')) {
                    clearNeighbours(box);
                } else {
                    if (event.button === 2) {
                        flagBox(box);
                    } else {
                        openBox(box);
                    }
                }
                update();
            }
        });
        boxes.push(box);
        grid.appendChild(box);
    }
    update();
}

function clearGrid() {
    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }
}  

function startTimer() {
    startTime = new Date().valueOf();
    timeOutId = setInterval(() => {
        let d = new Date().valueOf();
        timer.innerHTML = Math.floor((d - startTime) / 1000);
    }, 1000); 
    started = true;        
}

function endTimer() {
    let now = new Date().valueOf();
    clearTimeout(timeOutId);
    timeOutId = 0;
    finished = true;
    timer.innerHTML = (now - startTime) / 1000;
}

function update() {
    let openBoxes = boxes.filter(box => box.classList.contains('open')).length;
    if (openBoxes + bombs.length === boxes.length) {
        endTimer(); // game won
        bombs.forEach(bomb => bomb.classList.add('flag'));    
        document.getElementById('total').innerHTML = `0 (${bombs.length})`;    
    } else {
        document.getElementById('total').innerHTML = bombs.length - flags;
    }
}

function flagBox(box) {
    if (!box.classList.contains('open')) {
        box.classList.toggle('flag');
        flags += (box.classList.contains('flag')) ? 1 : -1;
    }
}

function openBox(box) {
    if (box.classList.contains('flag')) {
        return; // can't open flagged box
    }
    if (box.classList.contains('bomb')) {
        endTimer(); // game lost
        boxes.forEach(box => box.classList.add('open'));
        return;
    }
    if (box.classList.contains('open')) {
        return; // already open
    }
    box.classList.add('open');

    let neighbours = getSurroundingBoxes(box);
    let bombs = neighbours.filter(neighbour => neighbour.classList.contains('bomb'));
    if (bombs.length) {
        box.innerHTML = bombs.length;
    } 
    else {
        neighbours.forEach(neighbour => {
            openBox(neighbour);
        });
    }  
}

function clearNeighbours(box) {
    let neighbours = getSurroundingBoxes(box);
    let bombs = [];
    let flags = [];
    let closed = [];
    neighbours.forEach(neighbour => {
        let classes = neighbour.classList;
        if (classes.contains('bomb')) { 
            bombs.push(neighbour);
        }
        if (classes.contains('flag')) { 
            flags.push(neighbour);
        } else if (!classes.contains('open')) {                
            closed.push(neighbour);
        }
    });
    if (flags.length && flags.length === bombs.length) {
        closed.forEach(box => openBox(box));
    }
}

function getSurroundingBoxes(box) {
    let i = parseInt(box.getAttribute('index'));
    let neighbours = [];
    let neighbourIndices = [
            i - 1, i + 1,    // left & right 
            i - columns - 1, // above left
            i - columns,     // above
            i - columns + 1, // above right
            i + columns - 1, // below left
            i + columns,     // below
            i + columns + 1  // below right
        ];
    neighbourIndices.forEach(index => {
        let validIndex = 
            index >= 0 && 
            index < boxes.length && 
            Math.abs(i % columns - index % columns) <= 1; // <- left and right edge cases

        if (validIndex) {
            neighbours.push(boxes[index]);
        }
    });
    return neighbours;
}
