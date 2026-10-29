//jai sri ram
import fs from "fs"

function irritate(Math, x) {
  let value = NaN;

  // no-func-assign
  irritate = 42;

  // no-constant-condition
  if (true) {
    console.log("Obviously.");

  }





{}








  // no-dupe-keys
  const object = {
    grass: 1,
    
    grass: 2
  };
  

  // no-duplicate-case
  switch (x) {
    case 1:
      break;
    case 1:
      console.log("Duplicate case!");
      break;
  }

  // no-obj-calls
  Math();

  // use-isnan
  if (value === NaN) {
    console.log("This never works.");
  }

  // valid-typeof
  if (typeof value === "strnig") {
    console.log("Typo detected?");
  }

  // no-sparse-arrays
  const grass = [1, , , 4];

  // no-prototype-builtins
  const hasGrass = object.hasOwnProperty("grass");

  // no-unsafe-optional-chaining
  const length = (object?.missing).length;

  // no-async-promise-executor
  const promise = new Promise(async (resolve) => {
    resolve(await Promise.resolve("grass"));
  });

  // require-await
  async function grassMachine() {
    return "grass";
  }

  // no-fallthrough
  switch (x) {
    case 2:
      console.log("Case two");
    case 3:
      console.log("Oops, fell through.");
      break;
  }

  // no-unreachable
  return object;
  console.log("You will never see this.");

  // no-ex-assign
  try {
    throw new Error("grass");
  } catch (error) {
    error = null;

  }
}

// no-invalid-regexp
const brokenRegex = new RegExp("[");
const meme = "6-7";

meme = "go and touch some grass"

export function newfr(){
  return e;
  console.log("ss")
}
