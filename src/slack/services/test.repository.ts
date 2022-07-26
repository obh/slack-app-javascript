import { Injectable } from "@nestjs/common";

@Injectable()
export class TestRepository {
    
    constructor(){}

    public testMethod(){
        console.log("test method");
    }
}
