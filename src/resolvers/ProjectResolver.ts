import { Arg, Field, InputType, Int, Mutation, Query, Resolver } from "type-graphql";
import { Commit } from "../entity/Commit";
import { Project } from "../entity/Project";
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
            const project = await Project.create({
                name: input.name,
                issues: [],
                commits: []
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

    @Mutation(() => Boolean)
    async deleteProject(@Arg("id") id: number) {
        await Project.delete({
            id
        });
        return true;
    }
}