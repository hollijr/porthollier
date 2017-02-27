import { PorthollierPage } from './app.po';

describe('porthollier App', () => {
  let page: PorthollierPage;

  beforeEach(() => {
    page = new PorthollierPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
