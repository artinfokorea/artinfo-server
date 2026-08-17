import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OngiPerson } from '@/ongi/person/domain/entity/ongi-person.entity';
import { ONGI_PERSON_REPOSITORY } from '@/ongi/person/domain/repository/ongi-person.repository.interface';
import { OngiPersonRepository } from '@/ongi/person/infrastructure/repository/ongi-person.repository';
import { OngiPersonController } from '@/ongi/person/presentation/controller/ongi-person.controller';
import { OngiCreatePersonUseCase, OngiScanPeopleUseCase } from '@/ongi/person/application/usecase/ongi-person.usecase';
import { OngiGroupModule } from '@/ongi/group/ongi-group.module';

@Module({
  imports: [TypeOrmModule.forFeature([OngiPerson]), OngiGroupModule],
  controllers: [OngiPersonController],
  providers: [{ provide: ONGI_PERSON_REPOSITORY, useClass: OngiPersonRepository }, OngiScanPeopleUseCase, OngiCreatePersonUseCase],
  exports: [ONGI_PERSON_REPOSITORY],
})
export class OngiPersonModule {}
