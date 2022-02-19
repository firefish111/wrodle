const f = require("fs");
const rl = require("readline-sync").question;
const cp = require("clipboardy");

const list = f.readFileSync("wlist").toString().split("\n");
const dict = f.readFileSync("dict").toString().split("\n");

const now = new Date().setHours(0, 0, 0, 0);
const epoch = new Date(2021, 5, 19, 0, 0, 0, 0);
let time = now - epoch;
time /= 24*60*60*1000;
time = Math.round(time);

const wordle = list[time % list.length];
let tries = [];
let grids = []; 

let mk = cd => `\x1b[48;5;${cd};38;5;0m`
let c = mk(76); // correct colour
let p = mk(220); // present colour
let a = "\x1b[0m"; // absent colour
const colours = [a, p, c];
const emojis = ["⬛", "🟨", "🟩"]

let win = false;

for (let i = 0; i < 6; i++) {
  tries[i] = rl(`\x1b[2KTry ${i+1}: `);

  if (tries[i].length !== 5) {
    console.log(`\x1b[2KWord ${tries[i]} has ${tries[i].length < 5 ? "not enough" : "too many"} letters.`);
    process.stdout.write("\x1b[F\x1b[F");
    i--; continue;
  }

  if (!dict.includes(tries[i]) && !list.includes(tries[i])) {
    console.log(`\x1b[2KWord ${tries[i]} not in word list.`);
    process.stdout.write("\x1b[F\x1b[F");
    i--; continue;
  }

  let str = "";
  let grid = Array(5).fill(0);

  let usedIndeces = [];

  let n = tries[i].split("");
  n.forEach((itm, ix) => {
    if (itm === wordle[ix]) {
      grid[ix] = 2;
      usedIndeces.push(ix);
    }
  });
  n.forEach((itm, ix) => {
    let existg = wordle.split("").findIndex((sitm, six) => sitm === itm && ix !== six);
    if (existg >= 0 && grid[ix] === 0 && !usedIndeces.includes(existg)) {
      grid[ix] = 1;
      usedIndeces.push(existg);
    }
  });
  
  grid.forEach((uh, uix) => {
    str += colours[uh] + " " + n[uix] + " ";
  });
  console.log(`\x1b[F\x1b[2K${str}${colours[0]}`);
  grids[i] = grid;
  
  if (grid.every(ool => ool === 2)) {
    console.log("\x1b[2KCongratulations! You got the word in 6 tries or less.");
    win = true;
    break;
  } else {
    console.log(`\x1b[2KUnfortunately, you have lost. Today's answer, was ${wordle}!`);
}

let emojigrid = `Wordle ${time} ${win ? tries.length : "X"}/6\n\n`
grids.forEach((grid, number) => {
  grid.forEach(letter => {
    emojigrid += emojis[letter];
  });
  emojigrid += "\n";
});

cp.writeSync(emojigrid);
console.log("Your emoji grid has been copied to the clipboard.");
