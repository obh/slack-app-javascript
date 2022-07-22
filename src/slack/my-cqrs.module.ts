import { Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';

@Module({
  imports: [CqrsModule],
  providers: [ExplorerService],
  exports: [CqrsModule],
})
export class MyCqrsModule implements OnModuleInit {
  constructor(
    private readonly explorer: ExplorerService,
    private moduleRef: ModuleRef,
  ) {}
  onModuleInit() {
    const { events, commands } = this.explorer.explore();
    // events.forEach(this.wrapWithTryCatch.bind(this));
    console.log(events);
    console.log(commands);
    events.forEach(this.wrapWithTryCatch.bind(this));
    commands.forEach(this.wrapCmdWithTryCatch.bind(this));
  }

  //THis wraps the command in a try-catch
  private wrapCmdWithTryCatch(execute): void {
    console.log("IN wrapwithTryCatch");
    const instance = this.moduleRef.get(execute, { strict: false });
    console.log(instance)
    const methodRef = instance.execute
    console.log(methodRef);
    const newMethod = async (command) => {
      console.log("method called")
      try {
        await methodRef.call(execute, command);
      } catch (e) {
        console.error('yo');
      }
    };
    instance.execute = newMethod;
  }

 // This wraps an event in a try-catch
  private wrapWithTryCatch(handler): void {
    const instance = this.moduleRef.get(handler, { strict: false });
    console.log(instance)
    const methodRef = instance.handle;

    const newMethod = async (event) => {
      console.log('hello world')
      try {
        await methodRef.call(handler, event);
      } catch (e) {
        console.error('yo');
      }
    };

    instance.handle = newMethod;
  }
}