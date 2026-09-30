import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGame1790066243549 implements MigrationInterface {
    name = 'AddGame1790066243549'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "game" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game_result" ("id" SERIAL NOT NULL, "score" integer NOT NULL, "userId" integer NOT NULL, "gameId" integer NOT NULL, CONSTRAINT "PK_0f05afdea1542af63c3027f7534" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "game_result" ADD CONSTRAINT "FK_942f4ae6957d9ae2495d278f626" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_result" ADD CONSTRAINT "FK_52bde66db56be3188de670ff5c3" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_result" DROP CONSTRAINT "FK_52bde66db56be3188de670ff5c3"`);
        await queryRunner.query(`ALTER TABLE "game_result" DROP CONSTRAINT "FK_942f4ae6957d9ae2495d278f626"`);
        await queryRunner.query(`DROP TABLE "game_result"`);
        await queryRunner.query(`DROP TABLE "game"`);
    }

}
