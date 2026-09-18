-- site_template 값 'classic' → 'modern' 개명
-- 해당 템플릿이 카드형 디자인으로 개편되면서 'classic'(전통형)이라는 이름이 실제와 어긋났다.
-- 프론트가 구 값 'classic'을 읽는 시점에 'modern'으로 흡수하므로(components/templates/meta.ts
-- resolveTemplateId) 이 SQL을 실행하지 않아도 화면은 동일하다. 값 정리 목적이다.
-- synchronize:false 이므로 운영 DB에 직접 실행한다.
UPDATE onchurch_churches
  SET site_template = 'modern'
  WHERE site_template = 'classic';
