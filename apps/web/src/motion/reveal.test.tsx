import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Reveal, RevealGroup, RevealItem, Settle } from './reveal';

// The server's HTML is always fully visible: a reveal hides nothing until it's running in the browser.
describe('Reveal on the server', () => {
  it('renders no opacity or transform styles', () => {
    const html = renderToString(
      <>
        <Reveal as="section" aria-labelledby="intro">
          <h2 id="intro">Intro</h2>
          <Settle className="overflow-hidden">
            <img src="/photo.jpg" alt="" />
          </Settle>
        </Reveal>
        <RevealGroup as="section">
          <RevealItem index={0}>
            <h2>Products</h2>
          </RevealItem>
          <RevealItem as="article" index={1}>
            A card
          </RevealItem>
        </RevealGroup>
      </>,
    );
    expect(html.match(/data-reveal="shown"/g)).toHaveLength(3);
    expect(html).not.toMatch(/opacity|transform|style=|data-revealing/);
  });
});
