import { Response } from "express";
import { error, success } from "../../utils/ResponseApi";

export abstract class ApiController {
  public success(res: Response, obj: any, message: string = "") {
    return res.status(201).json(success(obj, message));
  }
  public fail(res: Response, err: Error | string) {
    return res.status(401).json(error(err.toString()));
  }
}
