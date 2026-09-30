import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1790263896025 implements MigrationInterface {
    name = 'Initial1790263896025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstName"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "firstName" character varying DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "user" ADD "lastName" character varying DEFAULT ''`);
    }

}
