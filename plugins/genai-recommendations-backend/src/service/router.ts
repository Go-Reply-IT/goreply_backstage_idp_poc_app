import { UrlReader, errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { CatalogApi } from '@backstage/catalog-client';
import express from 'express';
import Router from 'express-promise-router';
import { Git } from '@backstage/backend-common';
import fs from 'fs/promises';
import path from 'path';
import {
  IdentityApi,
  IdentityApiGetIdentityRequest,
} from '@backstage/plugin-auth-node';
import { Logger } from 'winston';
import { Octokit } from "@octokit/rest"

export interface RouterOptions {
  logger: Logger;
  config?: Config;
  reader?: UrlReader;
  catalogClient?: CatalogApi;
  identity: IdentityApi;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, catalogClient, identity } = options;

  const router = Router();
  router.use(express.json());
  router.post('/pushTests', async (req, res) => {
    const {body} = req
    // const userIdentity = await identity.getIdentity({ request: req });
    console.log(body)
    console.log(body.entityRef)
    const entity = await catalogClient?.getEntityByRef(body.entityRef)
    console.log(entity)
    // config?.getConfigArray("integrations.github")[0].getString("token")
    const githubToken = config?.getConfigArray("integrations.github")[0].getString("token")
    const octokit = new Octokit({ auth: githubToken });
    console.log(githubToken)
    const git = Git.fromAuth({password: githubToken, token: githubToken, logger})
    const repoUrl = `https://${githubToken}@github.com/${entity?.metadata.annotations!["github.com/project-slug"]}`
    const dir = entity?.metadata.annotations!["github.com/project-slug"]!
    const testPath = body.path.replace("repo/backstage/", "./").replace(".ts", ".test.ts")
    console.log(path.join(dir, testPath))
    console.log(repoUrl)
    console.log(dir)
    await git.clone({url: repoUrl, dir: dir})
    await git.branch({
      dir: dir,
      ref: "test/addTests"
    })
    await git.checkout({
      dir: dir,
      ref: "test/addTests"
    })
    await fs.writeFile(path.join(dir, testPath), body.code);
    await git.add({
      dir: dir,
      filepath: testPath.replace("./", "")
    })
    const commit = await git.commit({
      dir: dir,
      message: "test: add test file",
      author: {
        name: "Salvatore Fasano",
        email: "fasanosalvatore@hotmail.it",
      },
      committer: {
        name: "Salvatore Fasano",
        email: "fasanosalvatore@hotmail.it",
      }
    })
    console.log(commit)
    const push = await git.push({
      dir: dir,
      remote: "origin"
    })
    console.log(push)
    await fs.rm(dir, {recursive: true, force: true})
    await octokit.rest.pulls.create({
      owner: dir.split('/')[0],
      repo: dir.split('/')[1],
      head: "test/addTests",
      base: "main",
      title: "test: add test file"
    });
    res.json({ status: 'ok', push});
  })

  router.get('/health', async (req, res) => {
    logger.info('PONG!');
    res.json({ status: 'ok'});
  });

  router.use(errorHandler());
  return router;
}
