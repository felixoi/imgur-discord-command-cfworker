import * as handlers from "./handlers/index.ts";
import { factory } from "./init.ts";

export default factory.discord().loader(Object.values(handlers));
