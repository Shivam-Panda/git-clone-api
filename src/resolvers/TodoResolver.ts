import { Arg, Field, InputType, Int, Mutation, Query, Resolver } from "type-graphql";
import { Item } from "../entity/Item";
import { Project } from "../entity/Project";
import { Todo } from "../entity/Todo";

@InputType()
class NewTodoInput {
    @Field(() => String)
    title: string;

    @Field(() => String)
    description: string;

    @Field(() => String)
    category: string;

    @Field(() => Int)
    todoId: number
};

@InputType()
class UpdatePositionInput {
    @Field(() => String)
    current: string;

    @Field(() => String)
    next: string;

    @Field(() => Int)
    todoId: number;

    @Field(() => Int)
    id: number;
}

@Resolver()
export class TodoResolver {
    @Mutation(() => Int, { nullable: true })
    async newTodo(@Arg("input") input: NewTodoInput) {
        const todo = await Todo.findOne({
            where: {
                id: input.todoId
            }
        });
        if(!todo) return null;
        const i = await Item.create({
            title: input.title,
            description: input.description
        }).save()
        switch(input.category) {
            case "todo":
                const ts = todo.todo;
                ts.push(i.id);
                await Todo.update(
                {
                    id: todo.id
                },
                {
                    todo: ts
                });
                break;
            case "current":
                const curs = todo.current;
                curs.push(i.id);
                await Todo.update(
                    {
                        id: todo.id
                    },{
                        current: curs
                    }
                );
                break;
            case "done":
                const done = todo.done;
                done.push(i.id);
                await Todo.update(
                    {
                        id: todo.id
                    },
                    {
                        done
                    }
                )
                break;
        }
        return i.id;
    }

    @Query(() => [Int], { nullable: true })
    async getItems(@Arg("category") category: string, @Arg("id") id: number) {
        const todo = await Todo.findOne({
            where: {
                id
            }
        });
        if(todo) {
            if(category == 'todo') {
                return todo.todo;
            } else if (category == 'current') {
                return todo.current;
            } else {
                return todo.done;
            }
        } 
        return null;
    }

    @Query(() => Item, { nullable: true })
    async getItem(@Arg("id") id: number) {
        return await Item.findOne({
            where: {
                id
            }
        });
    }

    @Mutation(() => Boolean)
    async updatePosition(@Arg("input") input: UpdatePositionInput) {
        const todo = await Todo.findOne({
            where: {
                id: input.todoId
            }
        });
        const item = await Item.findOne({
            where: {
                id: input.id
            }
        })

        if(!todo) return false;
        if(!item) return false;

        if(input.current == 'todo') {
            let t = []
            let found = false;
            for(let i = 0; i < todo.todo.length; i++) {
                if(todo.todo[i] == input.id) {
                    found = true;
                } else {
                    t.push(todo.todo[i])
                }
            }
            if(found == false) return false;
            await Todo.update({
                id: input.todoId
            }, {
                todo: t
            });
        } else if(input.current == 'current') {
            let t = [];
            let found = false;
            for(let i = 0; i < todo.current.length; i++) {
                if(todo.current[i] == input.id) {
                    found = true;
                } else {
                    t.push(todo.current[i])
                }
            }
            if(found == false) return false;
            await Todo.update({
                id: input.todoId
            }, {
                current: t
            });
        } else {
            let found = false;
            let t = [];
            for(let i = 0; i < todo.done.length; i++) {
                if(todo.done[i] == input.id) {
                    found = true;
                } else {
                    t.push(todo.done[i])
                }
            }
            if(found == false) {
                return false;
            }
            await Todo.update({
                id: input.todoId
            }, {
                done: t
            });
        }

        if(input.next == 'todo') {
            let t = [...todo.todo, input.id];
            await Todo.update({
                id: input.todoId
            }, {
                todo: t
            });
        } else if(input.next == 'current') {
            let t = [...todo.current, input.id]
            await Todo.update({
                id: input.todoId
            }, {
                current: t
            });
        } else {
            let t = [...todo.done, input.id]
            await Todo.update({
                id: input.todoId
            }, {
                done: t
            });
        }
        
        return true;
    }

    @Mutation(() => Boolean)
    async initTodo(@Arg("id") id: number) {
        const t = await Todo.create({
            todo: [],
            current: [],
            done: []
        }).save();
        await Project.update({ id }, {
            todo: t.id
        });
        return true;
    }

    @Mutation(() => Boolean)
    async deleteItem(@Arg("id") id: number, @Arg("todoId") todoId: number) {
        const i = await Item.findOne({
            where: {
                id
            }
        })
        const todo = await Todo.findOne({
            where: {
                id: todoId 
            }
        });
        if(!todo) return false;
        if(!i) return false;
        await Item.delete({
            id
        });

        let ts: any[] = [];
        let c: any[] = [];
        let d: any[] = [];

        for(let i = 0; i < todo.todo.length; i++) {
            if(todo.todo[i] == id) {

            } else {
                ts.push(todo.todo[i])
            }
        }

        for(let i = 0; i < todo.current.length; i++) {
            if(todo.current[i] == id) {

            } else {
                ts.push(todo.current[i])
            }
        }

        for(let i = 0; i < todo.done.length; i++) {
            if(todo.done[i] == id) {

            } else {
                ts.push(todo.done[i])
            }
        }

        await Todo.update({
            id: todoId
        }, {
            current: c,
            done: d,
            todo: ts
        });
        return true;
    }

    @Mutation(() => Boolean)
    async deleteTodo(@Arg("id") id: number, @Arg("projectId") projectId: number) {
        const t = await Todo.findOne({
            where: {
                id
            }
        });
        const p = await Project.findOne({
            where: {
                id: projectId
            }
        });
        if(!t || !p) return false;
        await Project.update({
            id: projectId
        }, {
            todo: null
        })
        await Todo.delete({
            id
        })
        
        return true;
    }
}
