import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Todo extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;
    
    @Field(() => [Int])
    @Column("simple-array")
    todo: number[];

    @Field(() => [Int])
    @Column("simple-array")
    current: number[];

    @Field(() => [Int])
    @Column("simple-array")
    done: number[];
}