import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class File extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @Column()
    folder: string;

    @Field(() => String)
    @Column()
    body: string;

    @Field(() => Int)
    @Column("int")
    projectId: number;

    @Field(() => String)
    @Column()
    fileName: string;
}