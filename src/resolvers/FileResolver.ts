import { Arg, Field, InputType, Int, Mutation, Query, Resolver } from "type-graphql";
import { Commit } from "../entity/Commit";
import { File } from "../entity/File";
import { Folder } from "../entity/Folder";
import { Project } from "../entity/Project";

@InputType()
class GetFileInput {
    @Field(() => String, {nullable:true})
    name?: string;

    @Field(() => Int, {nullable:true})
    id?: number;

    @Field(() => Int)
    projectId: number;
}

@Resolver()
export class FileResolver {
    @Mutation(() => Boolean, { nullable: true })
    async commit(@Arg("input") input: string, @Arg("projectId") projectId: number, @Arg("name") name: string) {
        const project = await Project.findOne({
            where: {
                id: projectId
            }
        });
        if(project) {
            for(let i = 0; i < project.commits.length; i++) {
                const c = await Commit.findOne({
                    where: {
                        id: project.commits[i]
                    }
                });
                if(c && c.name == name) {
                    return null;
                }
            }
            const project_files = [];
            const project_folder = [];
            const file_to_folder: any = {};
            const input_json = JSON.parse(input)
            for(const key in input_json) {
                if(key.includes('.')) {
                    // File
                    // Do Nothing
                } else {
                    // Folder
                    const folder_vals = input_json[key]
                    for(let i = 0; i < folder_vals.length; i++) {
                        if(folder_vals[i].includes('.')) {
                            const f = await File.create({
                                fileName: folder_vals[i],
                                body: input_json[folder_vals[i]],
                                folder: key,
                                projectId
                            }).save()
                            project_files.push(f.id);
                        } else {
                            file_to_folder[folder_vals[i]] = key
                        }
                    }
                }
            }

            for(const key in file_to_folder) {
                const f = await Folder.create({
                    files: input_json[key],
                    parentFolder: file_to_folder[key],
                    name: key,
                    projectId: projectId
                }).save()
                project_folder.push(f.id);
            }

            const com = await Commit.create({
                files: project_files,
                folders: project_folder, 
                name, 
                projectId: project.id
            }).save()

            let proj_coms = project.commits;

            proj_coms.push(com.id);
            
            await Project.update({
                id: projectId
            }, {
                commits: proj_coms
            });
            return true;
        } else {
            return null;
        }
    }

    @Query(() => String, {nullable: true})
    async pullRequest(@Arg('projectId') projectId: number) {
        const project = await Project.findOne({
            where: {
                id: projectId
            }
        });
        if(project) {
            const coms = project.commits;
            if(coms.length == 0) return null;
            const cur_com_id = coms[coms.length - 1];
            const cur_com = await Commit.findOne({
                where: {
                    id: cur_com_id
                }
            });
            if(!cur_com) return null;
            const sender: any = {};
            const proj_folders: Folder[] = [];
            const proj_files: File[] = [];
            for(let i = 0; i < cur_com.files.length; i++) {
                const cur_file = await File.findOne({
                    where: {
                        id: cur_com.files[i]
                    }
                });
                if(cur_file) {
                    proj_files.push(cur_file)
                }
            }
            for(let i = 0; i < cur_com.folders.length; i++) {
                const cur_file = await Folder.findOne({
                    where: {
                        id: cur_com.folders[i]
                    }
                });
                if(cur_file) {
                    proj_folders.push(cur_file)
                }
            }
            proj_files.forEach((file, _) => {
                sender[file.fileName] = file.body;
            });
            proj_folders.forEach((folder, _) => {
                let dir: string[] = [];
                proj_files.forEach((file, _) => {
                    if(file.folder == folder.name) {
                        dir.push(file.fileName);
                    }
                })
                proj_folders.forEach((childFolder, _) => {
                    if(childFolder.parentFolder == folder.name) {
                        dir.push(childFolder.name);
                    }
                })
                sender[folder.name] = dir;
            })
            return JSON.stringify(sender);
        } else {
            return null;
        }
    }

    @Query(() => File!, {nullable: true})
    async getFile(@Arg("input") input: GetFileInput) {
        const project = await Project.findOne({
            where: {
                id: input.projectId
            }
        }) ;
        if(project && input.id) {
            return await File.findOne({
                where: {
                    projectId: input.projectId,
                    id: input.id
                }
            });
        } else if(project && input.name) {
            return await File.findOne({
                where: {
                    projectId: input.projectId,
                    fileName: input.name
                }
            });
        }
        return null;
    }

    @Query(() => [String]!, {nullable: true})
    async getFolder(@Arg("input") input: GetFileInput) {
        const project = await Project.findOne({
            where: {
                id: input.projectId
            }
        })
        if(project) {
            if(project.commits.length == 0) return null
            const c = await Commit.findOne({
                where: {
                    id: project.commits[project.commits.length - 1]
                }
            })
            if(!c) return null;
            const files = [];
            for(let i = 0; i < c.files.length; i++) {
                const cur_file = await File.findOne({
                    where: {
                        id: c.files[i]
                    }
                });
                if(cur_file && cur_file.folder == input.name) {
                    files.push(cur_file.fileName);
                }
            }
            for(let i = 0; i < c.folders.length; i++) {
                const cur_file = await Folder.findOne({
                    where: {
                        id: c.folders[i]
                    }
                });
                if(cur_file && cur_file.parentFolder == input.name) {
                    files.push(cur_file.name);
                }
            }
            return files;
        } else {
            return null;
        }
    }
}