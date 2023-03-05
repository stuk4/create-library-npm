import colors from "colors";
import figlet from "figlet";

colors.enable();

import inquirer, { Answers, Question, QuestionCollection } from "inquirer";

export class CliManager {
  public async start(): Promise<void> {
    // Aquí puede agregar la lógica necesaria para iniciar su CLI
    // Por ejemplo, puede mostrar un mensaje de bienvenida o una lista de comandos disponibles
    this.projectName();
  }

  public async ask(
    questions: QuestionCollection
  ): Promise<Record<string, any>> {
    const answers = await inquirer.prompt(questions);

    return answers;
  }
  private async projectName() {
    const question: Question = {
      type: "input",
      name: "projectName",
      message: "Project Name:",
    };
    const answer = await this.ask([question]);

    return answer[question.name as string];
  }

  // Aquí puede agregar más funciones según sea necesario para su CLI
}
// const questions: Question = [
//   {
//     type: "input",
//     name: "projectName",
//   },
// ];
// const inquirerMenu = async () => {
//   console.clear();
//   console.log(
//     colors.green(
//       figlet.textSync("CNL", {
//         font: "3D-ASCII",
//         horizontalLayout: "full",
//         verticalLayout: "full",
//         width: 80,
//         whitespaceBreak: true,
//       })
//     )
//   );
//   console.log("======================================".green);
//   console.log("           Choice an option".white);
//   console.log("======================================\n".green);

//   const projectName = leerInput("Project Name:");
//   return projectName;
// };

//   const prompt = await inquirer.prompt(question);
//   return prompt;
// };
// const pause = async () => {
//   const question = [
//     {
//       type: "input",
//       name: "enter",
//       message: `Press ${"enter".green} for continue`,
//     },
//   ];

//   console.log("\n");
//   await inquirer.prompt(question);
// };

// export { inquirerMenu, pause };
