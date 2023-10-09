import qwikCityPlan from '@qwik-city-plan';
import { createQwikCity } from '@builder.io/qwik-city/middleware/node';

import render from './entry.ssr';

export default createQwikCity({ render, qwikCityPlan });
