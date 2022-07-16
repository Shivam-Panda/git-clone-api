import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Folder extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => Int)
    @Column("int")
    projectId: number;

    @Field(() => String)
    @Column()
    name: string;

    @Field(() => [String])
    @Column("simple-array")
    files: Array<string>;

    @Field(() => String)
    @Column()
    parentFolder: string
}