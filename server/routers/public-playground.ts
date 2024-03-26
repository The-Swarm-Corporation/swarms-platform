import { publicProcedure, router } from '@/app/api/trpc/trpc-router';
import OpenAI from 'openai';
import { z } from 'zod';

const publicPlaygroundRouter = router({
  vlmMessageCompletion: publicProcedure
    .input(
      z.object({
        model: z.string(),
        content: z.string(),
        image_url: z.string(),
        temperature: z.number().optional(),
        top_p: z.number().optional(),
        max_tokens: z.number().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx?.session?.data?.session?.user;

      if (false) {
        // if its login, we use with their playground api key
        // todo: complete this
      } else {
        // free

        // todo: check for rate limits

        //
        const openAi = new OpenAI({
          apiKey:
            'sk-22a52e4fc117dcbc1e938bc464853dd8309987aab967f28db48996360e019a22',
          baseURL: 'https://api.swarms.world/v1/'
        });
        const res = await openAi.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: input.content
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: input.image_url
                  }
                }
              ]
            }
          ],
          model: 'cogvlm-chat-17b'
        });
        if (res) {
          return res.choices[0].message.content;
        }
      }
    })
});

export default publicPlaygroundRouter;
