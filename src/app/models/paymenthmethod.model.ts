export class PaymentMethod{
    constructor(
  
          public user: string,
          public username: string,
          public bankAccountType: string,
          public bankName: string,
          public bankAccount: number,
          public ciorif: string,
          public phone: string,
          public tipo: string,
          public status: string,
          public email: string,
          public createdAt: Date,
          public updatedAt: Date,
          public _id?: string
  
    ){}
  
  }

  
  