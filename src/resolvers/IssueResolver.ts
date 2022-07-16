import { Arg, Field, InputType, Int, Mutation, Query, Resolver } from "type-graphql";
import { Issue } from "../entity/Issue";
import { Project } from "../entity/Project";

@InputType()
class CreateIssueInput {
    @Field(() => Int)
    projectId: number

    @Field(() => String)
    name: string

    @Field(() => String)
    body: string
}

@Resolver()
export class IssueResolver {
    @Mutation(() => Int!, {nullable: true})
    async createIssue(@Arg("input", () => CreateIssueInput) input: CreateIssueInput) {
        const project = await Project.findOne({
            where: {
                id: input.projectId
            }
        });
        if(project) {
            const issue = await Issue.create({
                title: input.name,
                description: input.body
            }).save()
            const id = issue.id;
            const cur_issues = project.issues;
            cur_issues.push(id);
            await Project.update({
                id: project.id,
            }, {
                issues: cur_issues
            });
            return id;
        } else {
            return null;
        }
    }

    @Query(() => [Issue], {nullable: true})
    async projectIssues(@Arg("id") id: number) {
        const project = await Project.findOne({
            where: {
                id
            }
        });
        if(project) {
            const issues = [];
            const issue_id = project.issues;
            for(let i = 0; i < issue_id.length; i++) {
                const cur_issue = await Issue.findOne({
                    where: {
                        id: issue_id[i]
                    }
                });
                if(cur_issue) {
                    issues.push(cur_issue);
                }
            }
            return issues;
        } else {
            return null;
        }
    }

    @Query(() => Issue!, {nullable: true})
    async getIssue(@Arg('id') id: number) {
        return await Issue.findOne({
            where: {
                id
            }
        });
    }
}