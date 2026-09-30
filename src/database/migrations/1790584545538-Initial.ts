import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1790584545538 implements MigrationInterface {
    name = 'Initial1790584545538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'paid', 'expired')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "productId" character varying NOT NULL, "productName" character varying NOT NULL, "amount" integer NOT NULL, "currency" character varying(3) NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "stripeSessionId" character varying, "stripePaymentIntentId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "paidAt" TIMESTAMP, CONSTRAINT "UQ_178e0a88de0a59d8afc1d093db1" UNIQUE ("stripeSessionId"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    }

}
