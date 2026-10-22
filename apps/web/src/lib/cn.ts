import { createCn } from 'cn/config';

// Teaches class merging the type sizes and corners in globals.css. Without this it reads
// text-h-44 as a colour and drops it whenever a text colour such as text-white comes later.
export const cn = createCn({
  extend: {
    theme: {
      text: ['h-60', 'h-48', 'h-44', 'h-36', 'h-32', 'h-24', 'b-20', 'b-18'],
      radius: ['input', 'card', 'promo'],
    },
  },
});
