import { inquirerMenu, pause } from "./helpers/inquirer";

const main = async () => {
  let opt = undefined;
  do {
    opt = await inquirerMenu();
    if (opt !== 0) await pause();
  } while (opt !== 0);
};

main();
