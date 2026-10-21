import { OnchurchSiteDesignError, normalizeSiteDesign } from '@/onchurch/church/application/service/onchurch-site-design';

describe('normalizeSiteDesign', () => {
  it('색과 섹션 디자인을 소문자·trim 해서 저장한다', () => {
    expect(normalizeSiteDesign({ colors: { main: ' #1F3A5F ', point: '#3B82C4' }, sections: { worship: ' Modern ', banner: 'default' } })).toEqual({
      colors: { main: '#1f3a5f', point: '#3b82c4' },
      sections: { worship: 'modern', banner: 'default' },
    });
  });

  it('null 또는 빈 설정은 null(미설정)', () => {
    expect(normalizeSiteDesign(null)).toBeNull();
    expect(normalizeSiteDesign(undefined)).toBeNull();
    expect(normalizeSiteDesign({})).toBeNull();
    expect(normalizeSiteDesign({ colors: null, sections: {} })).toBeNull();
    expect(normalizeSiteDesign({ sections: { worship: '' } })).toBeNull();
  });

  it('색 없이 섹션만 저장할 수 있다', () => {
    expect(normalizeSiteDesign({ sections: { pastor: 'modern' } })).toEqual({ colors: null, sections: { pastor: 'modern' } });
  });

  it('#rrggbb 가 아닌 색은 거부한다', () => {
    expect(() => normalizeSiteDesign({ colors: { main: 'red', point: '#3b82c4' } })).toThrow(OnchurchSiteDesignError);
    expect(() => normalizeSiteDesign({ colors: { main: '#fff', point: '#3b82c4' } })).toThrow(OnchurchSiteDesignError);
    expect(() => normalizeSiteDesign({ colors: { main: '#1f3a5f' } })).toThrow(OnchurchSiteDesignError);
  });

  it('섹션 키·값이 식별자 형식이 아니면 거부한다', () => {
    expect(() => normalizeSiteDesign({ sections: { 'bad key': 'modern' } })).toThrow(OnchurchSiteDesignError);
    expect(() => normalizeSiteDesign({ sections: { worship: 'mod ern' } })).toThrow(OnchurchSiteDesignError);
    expect(() => normalizeSiteDesign({ sections: { worship: 1 } })).toThrow(OnchurchSiteDesignError);
    expect(() => normalizeSiteDesign({ sections: ['modern'] })).toThrow(OnchurchSiteDesignError);
  });
});
