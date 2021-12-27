import { Injectable } from "@nestjs/common";
import aws from "aws-sdk";

@Injectable()
export class B2Service {
  public readonly endpoint: aws.Endpoint;
  public readonly s3: aws.S3;

  constructor() {
    const credentials = new aws.Credentials({
      accessKeyId: process.env.B2_KEY_ID!,
      secretAccessKey: process.env.B2_KEY_KEY!
    });
    aws.config.credentials = credentials;
    this.endpoint = new aws.Endpoint(process.env.B2_S3_ENDPOINT!);
    this.s3 = new aws.S3({
      endpoint: this.endpoint
    });
  }
}
