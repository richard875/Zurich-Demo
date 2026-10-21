import { Api, Data, Post } from '@modern-js/plugin-bff/server';
import { ratingRequestSchema } from '../_lib/mulesoft-contract';
import { rate } from './_rating';
import { simulateUpstream } from './_simulate';

export const post = Api(
  Post('/mock-mulesoft/rating'),
  Data(ratingRequestSchema),
  async ({ data }) => (await simulateUpstream()) ?? rate(data),
);
