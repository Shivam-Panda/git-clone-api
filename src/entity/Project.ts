import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Project extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @Column()
    name: string

    @Field(() => [Int])
    @Column("simple-array")
    files: number[]

    @Field(() => [Int])
    @Column("simple-array")
    folders: number[]

    @Field(() => [Int])
    @Column("simple-array")
    issues: number[]
}