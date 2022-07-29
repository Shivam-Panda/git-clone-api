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

    @Field(() => [Int], {nullable: true})
    @Column("simple-array", {nullable: true})
    commits: number[]

    @Field(() => [Int])
    @Column("simple-array")
    issues: number[]

    @Field(() => Int, { nullable: true })
    @Column("int", {nullable: true})
    todo?: number | null;

    @Field(() => [String], { nullable: true })
    @Column("simple-array", { nullable: true })
    collaborators: string[];
}