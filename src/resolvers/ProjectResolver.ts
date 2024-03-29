import { Arg, Field, InputType, Int, Mutation, Query, Resolver } from "type-graphql";
import { Commit } from "../entity/Commit";
import { Project } from "../entity/Project";
import { Todo } from "../entity/Todo";
import { User } from "../entity/User";
@InputType()
class FindProjectInput {
    @Field(() => Int, { nullable: true })
    id?: number;

    @Field(() => String, { nullable: true })
    name?: string;

    @Field(() => String, { nullable: true })
    owner?: string;
}

@InputType()
class CreateProjectInput {
    @Field(() => String)
    key: string
    
    @Field(() => String)
    name: string;
}

@InputType()
class FindCommitInput {
    @Field(() => String, { nullable: true })
    name?: string;

    @Field(() => Int, { nullable: true })
    id?: number;
}

@Resolver()
export class ProjectResolver {
    @Query(() => [Project]!, {nullable: true})
    async allProjects() {
        return Project.find();
    }
    
    @Query(() => Commit, { nullable: true }) 
    async currentCommit(@Arg("projectId") projectId: number) {
        const p = await Project.findOne({
            where: {
                id: projectId
            }
        })
        if(p) {
            if(p.commits.length == 0) return null
            return await Commit.findOne({
                where: {
                    id: p.commits[p.commits.length - 1]
                }
            });
        } else return null;
    }

    @Query(() => [String], { nullable: true })
    async getAllCommits(@Arg("projectId") projectId: number) {
        const project = await Project.findOne({
            where: {
                id: projectId
            }
        })
        if(project) {
            const ret_strings: string[] = []
            for(let i = 0; i < project.commits.length; i++) {
                const c = await Commit.findOne({
                    where: {
                        id: project.commits[i]
                    }
                })
                if(c) {
                    ret_strings.push(c.name);
                }
            }
            return ret_strings;
        } else {
            return null;
        }
    }

    @Query(() => Commit, { nullable: true })
    async getCommit(@Arg("projectId") projectId: number, @Arg("input") input: FindCommitInput) {
        const project = await Project.findOne({
            where: {
                id: projectId
            }
        });
        if(project) {
            if(input.id) {
                return await Commit.findOne({
                    where: {
                        id: input.id,
                        projectId
                    }
                });
            } else if(input.name) {
                return await Commit.findOne({
                    where: {
                        name: input.name,
                        projectId
                    }
                });
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    @Query(() => Project!, {nullable: true})
    async findProject(@Arg("input") input: FindProjectInput) {
        if(input.id) {
            return await Project.findOne({
                where: {
                    id: input.id
                }
            })
        } else {
            const owner = await User.findOne({
                where:{
                    username: input.owner
                }
            });
            if(owner) {
                const projects = await owner.projects;
                for(let i = 0; i < projects.length; i++) {
                    const p = await Project.findOne({
                        where: {
                            id: projects[i]
                        }
                    });
                    if(p && p.name == input.name) {
                        return p;
                    }
                }
                return null;
            } else {
                return null;
            }
        }
    }

    @Mutation(() => Int!, {nullable: true})
    async createProject(@Arg("input") input: CreateProjectInput) {
        const user = await User.findOne({
            where: {
                key: input.key
            }
        });
        if(user) {
            const projects_made = await Project.find({
                where: {
                    name: input.name,
                }
            })
            if(projects_made.length > 0) {
                return null;
            }
            const t = await Todo.create({
                todo: [],
                current: [],
                done: []
            }).save()
            const project = await Project.create({
                name: input.name,
                issues: [],
                commits: [],
                todo: t.id,
                collaborators: [user.key]
            }).save()
            if(project) {
                const user_projects = user.projects;
                user_projects.push(project.id);
                await User.update({
                    id: user.id
                }, {
                    projects: user_projects
                });
                return project.id;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    @Mutation(() => Boolean, { nullable: true })
    async shareProject(@Arg("projectId") projectId: number, @Arg("userId") userId: number) {
        const user = await User.findOne({
            where: {
                id: userId
            }
        });
        const project = await Project.findOne({
            where: {
                id: projectId
            }
        })

        if(project && user) {
            await User.update({
                id: userId
            }, {
                projects: [...user.projects, project.id]
            })
            await Project.update({
                id: projectId
            }, {
                collaborators: [...project.collaborators, user.key]
            })
            return true;
        } else {
            return null;
        }
    }

    @Mutation(() => Boolean)
    async deleteProject(@Arg("id") id: number) {
        await Project.delete({
            id
        });
        return true;
    }

    @Query(() => [Project]!, { nullable: true })
    async userProjects(
        @Arg("key", () => String) key: string
    ) {
        const user = await User.findOne({
            where: {
                key
            }
        });
        if(user) {
            const projects = await user.projects;
            const ps = [];
            for(let i = 0; i< projects.length; i++) {
                const p = await Project.findOne({
                    where: {
                        id: projects[i]
                    }
                });
                ps.push(p)
            }
            return ps;
        } else {
            return null;
        }
    }
}