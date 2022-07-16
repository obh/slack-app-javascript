
export class APIAlertCommand {
    eventId = "api-alert"
    constructor(
        public readonly merchantId: Number, 
        public readonly payload: Object
    ){
        this.merchantId = merchantId;
        this.payload = payload;
    }
}