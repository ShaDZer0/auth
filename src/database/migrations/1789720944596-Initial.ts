import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1789720944596 implements MigrationInterface {
    name = 'Initial1789720944596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "status" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
    }

}
