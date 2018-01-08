import {
  CoolerArticleResource,
  PaginatedArticleResource,
} from '../../__tests__/common';
import { normalize } from 'normalizr';

const { select } = CoolerArticleResource.singleRequest();
const { select: listSelect } = CoolerArticleResource.listRequest();
describe('selectors', () => {
  describe('Single', () => {
    const params = { id: 5, title: 'bob', content: 'head' };
    const article = CoolerArticleResource.fromJS(params);
    it('should be null when state is empty', async () => {
      const state = { entities: {}, results: {}, meta: {} };
      const article = select(state, { id: 5 });

      expect(article).toBe(null);
    });
    it('should find value when state exists', async () => {
      const state = {
        entities: {
          [CoolerArticleResource.getKey()]: {
            [params.id]: article,
          },
        },
        results: {
          [CoolerArticleResource.url(params)]: params.id,
        },
        meta: {},
      };
      const selected = select(state, params);

      expect(selected).toBe(article);
    });
    it('should find value when no result exists but primary key is used', async () => {
      const state = {
        entities: {
          [CoolerArticleResource.getKey()]: {
            [params.id]: article,
          },
        },
        results: {},
        meta: {},
      };
      const selected = select(state, params);

      expect(selected).toBe(article);
    });
    it('should find value when not using primary key as param', async () => {
      const urlParams = { title: 'bob' };
      const state = {
        entities: {
          [CoolerArticleResource.getKey()]: {
            [params.id]: article,
          },
        },
        results: { [CoolerArticleResource.url(urlParams)]: params.id },
        meta: {},
      };
      expect(
        CoolerArticleResource.singleRequest().select(state, urlParams),
      ).toBe(article);
    });
    it('should throw when results are Array', async () => {
      const params = { title: 'bob' };
      const state = {
        entities: {},
        results: { [CoolerArticleResource.url(params)]: [5, 6, 7] },
        meta: {},
      };
      expect(() =>
        CoolerArticleResource.singleRequest().select(state, params),
      ).toThrow();
    });
    it('should throw when results are Object', async () => {
      const params = { title: 'bob' };
      const state = {
        entities: {},
        results: {
          [CoolerArticleResource.url(params)]: { results: [5, 6, 7] },
        },
        meta: {},
      };
      expect(() =>
        CoolerArticleResource.singleRequest().select(state, params),
      ).toThrow();
    });
    it('should throw when entity does not extend Resource', async () => {
      const state = {
        entities: { [CoolerArticleResource.getKey()]: { [`${CoolerArticleResource.pk(params)}`]: params as any } },
        results: {},
        meta: {},
      };
      expect(() =>
        CoolerArticleResource.singleRequest().select(state, params),
      ).toThrow();
    });
  });
  describe('List', () => {
    const params = { things: 5 };
    const articles = [
      CoolerArticleResource.fromJS({ id: 5 }),
      CoolerArticleResource.fromJS({ id: 6 }),
    ];
    it('should be null when state is empty', async () => {
      const state = { entities: {}, results: {}, meta: {} };
      const article = listSelect(state, {});

      expect(article).toBe(null);
    });
    it('should be null when state is partial', async () => {
      const { entities } = normalize(
        articles,
        CoolerArticleResource.listRequest().schema,
      );
      const state = { entities, results: {}, meta: {} };
      const article = listSelect(state, {});

      expect(article).toBe(null);
    });
    it('should throw when results are not a list', async () => {
      const { entities } = normalize(
        articles,
        CoolerArticleResource.listRequest().schema,
      );
      const state = {
        entities,
        results: { [CoolerArticleResource.listUrl(params)]: 5 },
        meta: {},
      };
      expect(() => listSelect(state, params)).toThrow();
    });
    it('should find value when state exists', async () => {
      const { entities, result } = normalize(
        articles,
        CoolerArticleResource.listRequest().schema,
      );
      const state = {
        entities,
        results: {
          [CoolerArticleResource.listUrl(params)]: result,
        },
        meta: {},
      };
      const selected = listSelect(state, params);

      expect(selected).toEqual(articles);
    });
    it('should work with paginated results', async () => {
      const { entities, result } = normalize(
        { results: articles },
        PaginatedArticleResource.listRequest().schema,
      );
      const state = {
        entities,
        results: {
          [PaginatedArticleResource.listUrl(params)]: result,
        },
        meta: {},
      };
      const selected = PaginatedArticleResource.listRequest().select(
        state,
        params,
      );

      expect(selected).toEqual(articles);
    });
  });
});