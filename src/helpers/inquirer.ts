import inquirer, { QuestionCollection, Answers } from "inquirer";
import colors from "colors";
import figlet from "figlet";
interface ResponseInquirer {
  option: number;
}
colors.enable();
const questions: QuestionCollection<Answers> = [
  {
    type: "list",
    name: "option",
    message: "¿Qué desea hacer?",
    choices: [
      {
        value: 1,
        name: `${"1.".green} Buscar ciudad`,
      },
      {
        value: 2,
        name: `${"2.".green} Historial`,
      },
      {
        value: 0,
        name: `${"3.".green} Salir`,
      },
    ],
  },
];
const inquirerMenu = async () => {
  console.clear();
  console.log(
    colors.green(
      figlet.textSync("CNL", {
        font: "3D-ASCII",
        horizontalLayout: "full",
        verticalLayout: "full",
        width: 80,
        whitespaceBreak: true,
      })
    )
  );
  console.log("======================================".green);
  console.log("           Choice an option".white);
  console.log("======================================\n".green);

  const { option } = await inquirer.prompt<ResponseInquirer>(questions);
  console.log(option);
  return option;
};
const pause = async () => {
  const question = [
    {
      type: "input",
      name: "enter",
      message: `Press ${"enter".green} for continue`,
    },
  ];

  console.log("\n");
  await inquirer.prompt(question);
};

export { inquirerMenu, pause };
