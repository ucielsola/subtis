import { lazy } from "react";

export const NeverResolve = lazy(() => new Promise(() => {}));
