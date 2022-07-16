export class APIErrorEvent {
    constructor(
      public readonly merchantId: Number,
      public readonly payload: object,
    ) {}
  }