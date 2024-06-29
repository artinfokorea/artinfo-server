export class MajorGroupPayload {
  nameKo: string;
  nameEn: string;

  constructor({ nameKo, nameEn }: { nameKo: string; nameEn: string }) {
    this.nameKo = nameKo;
    this.nameEn = nameEn;
  }
}
