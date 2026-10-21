import { Api, Data, Post } from '@modern-js/plugin-bff/server';
import { underwritingRequestSchema } from '../_lib/mulesoft-contract';
import { simulateUpstream } from './_simulate';
import { underwrite } from './_underwriting';

export const post = Api(
  Post('/mock-mulesoft/underwriting'),
  Data(underwritingRequestSchema),
  async ({ data }) => (await simulateUpstream()) ?? underwrite(data),
);
