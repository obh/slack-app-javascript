import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { APIAlertCommand } from "../api-alert.command";
import axios from "axios";

@CommandHandler(APIAlertCommand)
export class APIAlertCommandHandler implements ICommandHandler<APIAlertCommand> {
  constructor(
    // private readonly repository: HeroRepository,
    // private readonly publisher: EventPublisher,
  ) {}

  async execute(command: APIAlertCommand) {
    console.log("API alert command", command);
    console.log("This is where we will send the message to slack")
    const data =await this.fetch();
    console.log("data fetched in command --> ", data)
    console.log("*****Command executed*****")
    return data
    // const { heroId, dragonId } = command;
    // const hero = this.publisher.mergeObjectContext(
    //   await this.repository.findOneById(+heroId),
    // );
    // hero.killEnemy(dragonId);
    // hero.commit();
  }

  async fetch(){
    try {
        const data = await axios.get("https://random-data-api.com/api/stripe/random_stripe");
        return data;
      } catch(err) {
        console.log("error: ", err);
      }
}
}