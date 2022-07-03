import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  private async wrapperFunc() {
    try {
        let r1 = 1
        let r2 = 2
        // now process r2
        return 4;     // this will be the resolved value of the returned promise
    } catch(e) {
        console.log(e);
        throw e;      // let caller know the promise was rejected with this reason
    }
  }
}
