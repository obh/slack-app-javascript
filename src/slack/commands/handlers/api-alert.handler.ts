import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { APIAlertCommand } from "../interface/api-alert.command";

@CommandHandler(APIAlertCommand)
export class KillDragonHandler implements ICommandHandler<APIAlertCommand> {
  constructor(
    // private readonly repository: HeroRepository,
    // private readonly publisher: EventPublisher,
  ) {}

  async execute(command: APIAlertCommand) {
    console.log("API alert command", command);
    console.log("This is where we will send the message to slack")
    console.log("*****Command executed*****")
    // const { heroId, dragonId } = command;
    // const hero = this.publisher.mergeObjectContext(
    //   await this.repository.findOneById(+heroId),
    // );
    // hero.killEnemy(dragonId);
    // hero.commit();
  }
}