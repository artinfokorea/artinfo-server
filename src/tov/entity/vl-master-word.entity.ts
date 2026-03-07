import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('vl_master_words')
export class VlMasterWord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_name', length: 50 })
  serviceName: string;

  @Column({ name: 'english_word', length: 100 })
  englishWord: string;
}
