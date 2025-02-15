import { Router } from "express";
import { RedisController } from "../controller/redis.controller";

const redisRouter = Router();

redisRouter.post("/:key", (req, res, next) => {
	RedisController.setKey(req, res, next).catch(next);
});

redisRouter.get("/:key", (req, res, next) => {
	RedisController.getKey(req, res, next).catch(next);
});

redisRouter.delete("/:key", (req, res, next) => {
	RedisController.deleteKey(req, res, next).catch(next);
});

redisRouter.get("/", (req, res, next) => {
	RedisController.getAllKeys(req, res, next).catch(next);
});

export default redisRouter;
